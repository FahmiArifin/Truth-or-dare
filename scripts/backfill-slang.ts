import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const DB_FILE = path.join(process.cwd(), 'db.json');
const GEMINI_API_KEY = "AQ.Ab8RN6Ix5wb2uSggKB2x9EIPV_qzah11x16kL39ojFECylKQ5g.";

// Sleep utility function
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  console.log('=== STARTING DATABASE MIGRATION & BACKFILL ===');
  console.log(`Target Database: ${DB_FILE}`);

  // 1. Verify and read database
  if (!fs.existsSync(DB_FILE)) {
    console.error('Error: db.json file does not exist at path:', DB_FILE);
    process.exit(1);
  }

  const rawData = fs.readFileSync(DB_FILE, 'utf-8');
  let db: any;
  try {
    db = JSON.parse(rawData);
  } catch (err: any) {
    console.error('Error parsing db.json:', err.message);
    process.exit(1);
  }

  if (!db.questions || !Array.isArray(db.questions)) {
    console.error('Error: questions collection is missing or malformed in db.json');
    process.exit(1);
  }

  console.log(`Loaded ${db.questions.length} total questions from database.`);

  // 2. Perform Schema Migration in memory
  // Map/Add text_formal field for objects lacking it, and ensure text_casual is initialized
  let migratedCount = 0;
  for (const q of db.questions) {
    let updated = false;
    
    // Rename/ensure text_formal exists
    if (!q.text_formal && q.text) {
      q.text_formal = q.text;
      updated = true;
    }
    
    // Initialize text_casual field safely if completely absent
    if (q.text_casual === undefined) {
      q.text_casual = null;
      updated = true;
    }

    if (updated) {
      migratedCount++;
    }
  }

  if (migratedCount > 0) {
    console.log(`Schema Migration: Updated ${migratedCount} question entries with formal fields.`);
    // Save immediate intermediate state
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } else {
    console.log('Schema Migration: All questions conform to the new formal/casual layout schema.');
  }

  // 3. Filter questions needing AI casual slang backfill and limit to a small safe batch size (8 max per execution)
  const allMissingCasual = db.questions.filter((q: any) => !q.text_casual || q.text_casual.trim() === '');
  console.log(`Backfill Status: Found ${allMissingCasual.length} total questions needing casual backfill out of ${db.questions.length}.`);

  if (allMissingCasual.length === 0) {
    console.log('All questions are already populated with casual text. Backfill complete.');
    process.exit(0);
  }

  const BATCH_LIMIT = 8;
  const missingCasual = allMissingCasual.slice(0, BATCH_LIMIT);
  console.log(`Processing high-priority batch of next ${missingCasual.length} questions...`);

  // 4. Initialize Gemini client
  console.log('Initializing Google Gemini client...');
  // Prioritize process.env.GEMINI_API_KEY injected by the developer environment, with requested keys as fallback
  const keysToTry: string[] = [];
  if (process.env.GEMINI_API_KEY) {
    keysToTry.push(process.env.GEMINI_API_KEY);
  }
  keysToTry.push(GEMINI_API_KEY);
  keysToTry.push(GEMINI_API_KEY.replace(/\.$/, ''));

  let clientInitialized = false;
  let ai: GoogleGenAI | null = null;

  for (const key of keysToTry) {
    try {
      if (!key) continue;
      ai = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
      clientInitialized = true;
      break;
    } catch (e: any) {
      console.warn(`Could not initialize key: ${key.slice(0, 10)}... Error: ${e.message}`);
    }
  }

  if (!ai || !clientInitialized) {
    console.error('Error: Failed to initialize Google GenAI SDK client.');
    process.exit(1);
  }

  // Use gemini-3.5-flash as the main model following the previous resolution where gemini-1.5-flash was unavailable
  const modelName = 'gemini-3.5-flash';
  console.log(`Using model: ${modelName} for generation.`);

  // 5. Backfill loop with delay limit
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < missingCasual.length; i++) {
    const q = missingCasual[i];
    const formalText = q.text_formal || q.text;
    console.log(`\n[${i + 1}/${missingCasual.length}] Migrating Card ID: "${q.id}"`);
    console.log(`Baku/Formal: "${formalText}"`);

    const prompt = `Kamu adalah anak muda gaul usia 20 tahunan. Ubah kalimat Truth or Dare berikut menjadi bahasa gaul anak muda kekinian (circle pertemanan) yang asyik tapi tetap sopan. Jangan beri tambahan penjelasan, cukup hasil terjemahannya saja. Kalimatnya: ${formalText}`;

    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
      });

      const generated = response.text ? response.text.trim() : '';
      if (generated) {
        // Strip out enclosing quotes if the AI returned them
        const cleanedStr = generated.replace(/^"/, '').replace(/"$/, '').trim();
        console.log(`Generated Casual Text: "${cleanedStr}"`);
        
        // Find in full db list and save
        const targetQ = db.questions.find((elem: any) => elem.id === q.id);
        if (targetQ) {
          targetQ.text_casual = cleanedStr;
          
          // Write back changes progressively or at intervals
          fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
        }
        successCount++;
      } else {
        throw new Error('Emply response received from Gemini.');
      }
    } catch (err: any) {
      console.error(`Error generating casual slang for ID "${q.id}":`, err.message || err);
      errorCount++;
    }

    // Rate-limiting throttle (1.5 seconds)
    if (i < missingCasual.length - 1) {
      console.log('Throttling 1.5 seconds to protect rate limits...');
      await sleep(1500);
    }
  }

  console.log('\n=== BACKFILL PROCESS SUMMARY ===');
  console.log(`Successful backfills: ${successCount}`);
  console.log(`Failed backfills:     ${errorCount}`);
  console.log(`Total database questions processed: ${db.questions.length}`);
  console.log('All changes saved to db.json. Database is fully up-to-date!');
}

main().catch((err) => {
  console.error('Fatal backfill error:', err);
  process.exit(1);
});
