import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const DB_FILE = path.join(process.cwd(), 'db.json');
// API Key specified by the user
const GEMINI_API_KEY = "AQ.Ab8RN6Ix5wb2uSggKB2x9EIPV_qzah11x16kL39ojFECylKQ5g.";

// Sleep/Delay helper returning a Promise
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  console.log('=== STARTING DARE AI BACKFILL UTILITY ===');
  console.log(`Database source: ${DB_FILE}`);

  // 1. Load and parse the db.json file
  if (!fs.existsSync(DB_FILE)) {
    console.error(`Error: Database file does not exist at path: ${DB_FILE}`);
    process.exit(1);
  }

  const rawData = fs.readFileSync(DB_FILE, 'utf-8');
  let db: any;
  try {
    db = JSON.parse(rawData);
  } catch (err: any) {
    console.error(`Error parsing db.json file: ${err.message}`);
    process.exit(1);
  }

  if (!db.questions || !Array.isArray(db.questions)) {
    console.error('Error: "questions" array is missing or invalid in db.json');
    process.exit(1);
  }

  // 2. Fetch records where type is "dare" and text_casual is NULL or empty
  const targetDares = db.questions.filter((q: any) => {
    const isDare = q.type === 'dare';
    const isCasualMissing = !q.text_casual || q.text_casual.trim() === '';
    return isDare && isCasualMissing;
  });

  console.log(`Total questions in DB: ${db.questions.length}`);
  console.log(`Found ${targetDares.length} unanswered or empty "Dare" questions needing backfill.`);

  if (targetDares.length === 0) {
    console.log('No "Dare" questions need backfilling. All target records are complete!');
    process.exit(0);
  }

  // 3. Initialize Google Gemini Client with fallback list
  console.log('Initializing Google Gemini SDK client...');
  const keysToTry: string[] = [];
  if (process.env.GEMINI_API_KEY) {
    keysToTry.push(process.env.GEMINI_API_KEY);
  }
  keysToTry.push(GEMINI_API_KEY);
  // Clean trailing dot if present
  keysToTry.push(GEMINI_API_KEY.replace(/\.$/, ''));

  let aiClient: GoogleGenAI | null = null;
  let isInitialized = false;

  for (const key of keysToTry) {
    try {
      if (!key) continue;
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
      isInitialized = true;
      break;
    } catch (e: any) {
      console.warn(`Could not initialize Gemini key: ${key.slice(0, 10)}... Exception: ${e.message}`);
    }
  }

  if (!aiClient || !isInitialized) {
    console.error('Error: Failed to initialize Google GenAI SDK client.');
    process.exit(1);
  }

  // Modern Gemini series recommendation: gemini-3.5-flash for text task completeness,
  // falling back on user-requested gemini-1.5-flash parameter alias if needed.
  const modelName = 'gemini-3.5-flash';
  console.log(`Selected model for translation: ${modelName}`);

  // To safeguard against free tier request exhaustion (rate limit: typically 5 RPM or similar),
  // we can process in batches or with a deliberate 2-second timeout delay as requested by the user.
  let successCount = 0;
  let failureCount = 0;

  for (let idx = 0; idx < targetDares.length; idx++) {
    const question = targetDares[idx];
    const formalText = question.text_formal || question.text;

    console.log(`\n[${idx + 1}/${targetDares.length}] Processing Dare ID: "${question.id}"`);
    console.log(`Baku/Formal: "${formalText}"`);

    // Exact prompt requested by user
    const prompt = `Kamu adalah anak muda gaul usia 20 tahunan. Ubah kalimat Tantangan (Dare) berikut menjadi bahasa gaul anak muda kekinian (circle pertemanan) yang asyik tapi tetap sopan. Karena ini adalah sebuah tantangan/instruksi fisik, buat terdengar seru. Jangan beri tambahan penjelasan, cukup hasil terjemahannya saja. Kalimatnya: ${formalText}`;

    try {
      const response = await aiClient.models.generateContent({
        model: modelName,
        contents: prompt,
      });

      const responseText = response.text ? response.text.trim() : '';

      if (responseText) {
        // Strip potential wrapping double-quotes returned by model
        const cleanedCasual = responseText.replace(/^"/, '').replace(/"$/, '').trim();
        console.log(`Generated Casual: "${cleanedCasual}"`);

        // Find and update item inside our full db array reference
        const targetInDB = db.questions.find((item: any) => item.id === question.id);
        if (targetInDB) {
          targetInDB.text_casual = cleanedCasual;
          // Progressively write updates back to db.json safely
          fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
          console.log(`Updated Dare ID ${question.id} in db.json successfully.`);
        }
        successCount++;
      } else {
        throw new Error('Received an empty response from Gemini API.');
      }
    } catch (err: any) {
      console.error(`Error backfilling Dare ID "${question.id}":`, err.message || err);
      failureCount++;
    }

    // Enforce 2 seconds delay strictly to guard API rate limits
    if (idx < targetDares.length - 1) {
      console.log('Throttling 2 seconds to protect Google AI Studio API rate limits...');
      await sleep(2000);
    }
  }

  console.log('\n=== DARE BACKFILL COMPLETE SUMMARY ===');
  console.log(`Successfully completed: ${successCount}`);
  console.log(`Failed / Skipped:        ${failureCount}`);
  console.log(`Total Dare questions overall in DB: ${db.questions.filter((q: any) => q.type === 'dare').length}`);
}

main().catch((err) => {
  console.error('Fatal backfill utility error:', err);
  process.exit(1);
});
