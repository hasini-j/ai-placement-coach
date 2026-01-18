import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { generateEmbedding } from './embedding_utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const CONFIG = {
  PROJECT_ID: process.env.GOOGLE_CLOUD_PROJECT_ID,
  LOCATION: process.env.GOOGLE_CLOUD_LOCATION || 'us-central1',
  EMBEDDING_MODEL: 'text-embedding-004',
  INPUT_PATH: path.join(__dirname, './OS_questionbank.json'),
  OUTPUT_PATH: path.join(__dirname, './os_questions_with_vectors.json'),
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000
};

function buildSearchText(q) {
  return `
Question: ${q.question}
Topic: ${q.topic}
Difficulty: ${q.difficulty}
Key Concepts: ${q.expected_points.join(', ')}
`;
}

async function main() {
  const raw = await fs.readFile(CONFIG.INPUT_PATH, 'utf8');
  const questions = JSON.parse(raw);

  const out = [];
  for (const q of questions) {
    console.log(`🔹 DBMS → ${q.id}`);
    const embedding = await generateEmbedding(buildSearchText(q), CONFIG);
    out.push({
      ...q,
      embedding,
      _metadata: {
        embedding_model: CONFIG.EMBEDDING_MODEL,
        generated_at: new Date().toISOString()
      }
    });
  }

  await fs.writeFile(CONFIG.OUTPUT_PATH, JSON.stringify(out, null, 2));
  console.log(`✅ DBMS vector DB ready: ${CONFIG.OUTPUT_PATH}`);
}

main().catch(console.error);
