import fs from 'fs';
import path from 'path';
import { GoogleGenAI } from '@google/genai';

const DB_FILE = path.join(process.cwd(), 'db.json');
const API_KEY = 'AQ.Ab8RN6Ix5wb2uSggKB2x9EIPV_qzah11x16kL39ojFECylKQ5g';

const ai = new GoogleGenAI({
  apiKey: API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build'
    }
  }
});

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function generateWithFallback(prompt: string): Promise<string> {
  // Try newer active models (gemini-2.5-flash, gemini-3.5-flash) and fallback if deprecated
  const models = ['gemini-2.5-flash', 'gemini-3.5-flash', 'gemini-1.5-flash', 'gemini-2.5-flash-lite'];
  let lastError: any = null;
  for (const model of models) {
    try {
      const resp = await ai.models.generateContent({
        model: model,
        contents: prompt
      });
      if (resp && resp.text) {
        return resp.text;
      }
    } catch (err: any) {
      lastError = err;
    }
  }
  throw lastError || new Error('All fallback models failed.');
}

async function main() {
  console.log('=== STARTING TRUTH OR DARE PLAY MODE AUTO-TAGGER ===');
  
  if (!fs.existsSync(DB_FILE)) {
    console.error(`Error: Database file does not exist at ${DB_FILE}`);
    process.exit(1);
  }

  // Load db.json
  const rawData = fs.readFileSync(DB_FILE, 'utf-8');
  let db: any;
  try {
    db = JSON.parse(rawData);
  } catch (err: any) {
    console.error(`Error parsing JSON from ${DB_FILE}:`, err.message);
    process.exit(1);
  }

  if (!db.questions || !Array.isArray(db.questions)) {
    console.error('Error: "questions" array not found in database.');
    process.exit(1);
  }

  // Filter questions needing tag
  const targetQuestions = db.questions.filter((q: any) => {
    return q.play_mode === undefined || q.play_mode === null || q.play_mode === '';
  });

  console.log(`Total questions in database: ${db.questions.length}`);
  console.log(`Questions needing classification: ${targetQuestions.length}`);

  if (targetQuestions.length === 0) {
    console.log('No questions need classification. All records are tagged!');
    return;
  }

  // Batch to max 5 questions to prevent command timeout
  const BATCH_LIMIT = 5;
  const batchToProcess = targetQuestions.slice(0, BATCH_LIMIT);
  console.log(`Processing a safe batch of ${batchToProcess.length} questions in this run...`);

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < batchToProcess.length; i++) {
    const q = batchToProcess[i];
    const textToAnalyze = q.text_formal || q.text;
    const progressText = `[${i + 1}/${batchToProcess.length}] ID: ${q.id}`;

    console.log(`${progressText} Analyzing: "${textToAnalyze.substring(0, 50)}..."`);

    const prompt = `You are a logical data classifier for a Truth or Dare game. Analyze the following task/question.
Rule 1: If the task strictly requires physical touch, proximity, or interacting with a physical environment (e.g., holding hands, staring into eyes, touching someone), reply with exactly the word: 'offline'.
Rule 2: If the task explicitly requires digital actions highly suitable for remote/virtual play (e.g., screen sharing, sending a chat, showing search history), reply with exactly the word: 'online'.
Rule 3: If the task is purely verbal, a generic question, or an action that can be performed equally well in-person or over a Discord/Zoom video call, reply with exactly the word: 'both'.
Constraint: You MUST output ONLY one single word ('offline', 'online', or 'both'). No punctuation, no explanations. Task to analyze: ${textToAnalyze}`;

    try {
      // Call Gemini API using fallbacks
      const responseText = await generateWithFallback(prompt);
      let playMode = responseText.trim().toLowerCase().replace(/[^a-z]/g, '');

      // Fallback or validate play_mode values
      if (playMode !== 'offline' && playMode !== 'online' && playMode !== 'both') {
        console.warn(`Unexpected AI response: "${responseText}". Defaulting classification to 'both'.`);
        playMode = 'both';
      }

      // Find actual reference in db object and update
      const dbIndex = db.questions.findIndex((orig: any) => orig.id === q.id);
      if (dbIndex !== -1) {
        db.questions[dbIndex].play_mode = playMode;
        
        // Progressive Saving to prevent data loss on rate limits or interruptions
        fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
        console.log(`[Tagged] ID ${q.id} -> '${playMode}'`);
        successCount++;
      } else {
        console.error(`Could not locate question ID ${q.id} in root array.`);
        failCount++;
      }

    } catch (apiError: any) {
      console.error(`API Call failed for ID ${q.id}:`, apiError.message);
      failCount++;
    }

    // Strictly enforce throttling of 2000ms (2 seconds) to avoid rate limits (429)
    if (i < batchToProcess.length - 1) {
      console.log('Throttling connection... waiting 2000ms...');
      await sleep(2000);
    }
  }

  console.log(`\n=== AUTO-TAGGER RUN COMPLETED ===`);
  console.log(`Successfully classified: ${successCount} questions.`);
  if (failCount > 0) {
    console.log(`Failed to classify: ${failCount} questions.`);
  }
}

main().catch(err => {
  console.error('Fatal unhandled error during execution:', err);
  process.exit(1);
});
