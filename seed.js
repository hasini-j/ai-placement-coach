/**
 * Embedding Pipeline - Generates vector embeddings for all questions
 * 
 * Usage: node scripts/seed.js
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// ESM workaround for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables FIRST
dotenv.config({ path: path.join(__dirname, './.env') });

// NOW import other modules
import fs from 'fs/promises';
import fetch from 'node-fetch';

// Configuration
const CONFIG = {
  INPUT_PATH: path.join(__dirname, './data/questions_master.json'),
  OUTPUT_PATH: path.join(__dirname, './data/questions_with_vectors.json'),
  EMBEDDING_MODEL: 'text-embedding-004',
  BATCH_SIZE: 10,
  RETRY_DELAY: 1000,
  MAX_RETRIES: 3
};

// Get access token for API calls
async function getAccessToken() {
  const { GoogleAuth } = await import('google-auth-library');
  const auth = new GoogleAuth({
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  });
  const client = await auth.getClient();
  const token = await client.getAccessToken();
  return token.token;
}

/**
 * Generate embedding for a single text string using Vertex AI REST API
 */
async function generateEmbedding(text, retries = 0) {
  try {
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
    const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';
    const accessToken = await getAccessToken();
    
    const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${CONFIG.EMBEDDING_MODEL}:predict`;
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        instances: [{ content: text }],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API error ${response.status}: ${error}`);
    }

    const result = await response.json();
    
    // Extract embedding values
    if (result.predictions && result.predictions[0]) {
      const prediction = result.predictions[0];
      
      if (prediction.embeddings && prediction.embeddings.values) {
        return prediction.embeddings.values;
      }
      
      if (prediction.values) {
        return prediction.values;
      }
    }
    
    throw new Error('Could not extract embedding values from response');
  } catch (error) {
    if (retries < CONFIG.MAX_RETRIES) {
      console.warn(`⚠️  Retry ${retries + 1}/${CONFIG.MAX_RETRIES} for text: "${text.substring(0, 50)}..."`);
      await new Promise(resolve => setTimeout(resolve, CONFIG.RETRY_DELAY));
      return generateEmbedding(text, retries + 1);
    }
    throw new Error(`Failed to generate embedding after ${CONFIG.MAX_RETRIES} retries: ${error.message}`);
  }
}

/**
 * Process questions in batches to avoid overwhelming the API
 */
async function processBatch(questions, startIdx) {
  const batch = questions.slice(startIdx, startIdx + CONFIG.BATCH_SIZE);
  const results = [];

  for (const question of batch) {
    console.log(`📝 Processing: ${question.title} (${question.id})`);
    
    try {
      const embedding = await generateEmbedding(question.search_text);
      results.push({
        ...question,
        embedding,
        _metadata: {
          embedding_model: CONFIG.EMBEDDING_MODEL,
          embedding_dim: embedding.length,
          generated_at: new Date().toISOString()
        }
      });
      
      console.log(`✅ Generated ${embedding.length}-dim vector for "${question.title}"`);
    } catch (error) {
      console.error(`❌ Failed to process "${question.title}": ${error.message}`);
      // Continue with other questions even if one fails
      results.push({
        ...question,
        embedding: null,
        _error: error.message
      });
    }
    
    // Small delay between API calls to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  return results;
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Starting Embedding Pipeline...\n');

  // Validate configuration
  if (!process.env.GOOGLE_CLOUD_PROJECT_ID) {
    throw new Error('GOOGLE_CLOUD_PROJECT_ID is not set in .env file');
  }
  
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    throw new Error('GOOGLE_APPLICATION_CREDENTIALS is not set in .env file');
  }
  
  console.log('✅ Vertex AI Configuration:');
  console.log(`   Project: ${process.env.GOOGLE_CLOUD_PROJECT_ID}`);
  console.log(`   Location: ${process.env.GOOGLE_CLOUD_LOCATION || 'us-central1'}`);
  console.log(`   Credentials: ${process.env.GOOGLE_APPLICATION_CREDENTIALS}\n`);

  // Read master questions file
  console.log(`📖 Reading: ${CONFIG.INPUT_PATH}`);
  const rawData = await fs.readFile(CONFIG.INPUT_PATH, 'utf-8');
  const questions = JSON.parse(rawData);
  console.log(`✅ Loaded ${questions.length} questions\n`);

  // Process in batches
  const processedQuestions = [];
  for (let i = 0; i < questions.length; i += CONFIG.BATCH_SIZE) {
    console.log(`\n🔄 Processing batch ${Math.floor(i / CONFIG.BATCH_SIZE) + 1}/${Math.ceil(questions.length / CONFIG.BATCH_SIZE)}`);
    const batch = await processBatch(questions, i);
    processedQuestions.push(...batch);
  }

  // Validation
  const successCount = processedQuestions.filter(q => q.embedding !== null).length;
  const failureCount = processedQuestions.length - successCount;

  console.log(`\n📊 Results:`);
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Failed: ${failureCount}`);

  if (failureCount > 0) {
    console.warn(`\n⚠️  Some questions failed to process. Check the output file for _error fields.`);
  }

  // Save to file
  console.log(`\n💾 Saving to: ${CONFIG.OUTPUT_PATH}`);
  await fs.writeFile(
    CONFIG.OUTPUT_PATH,
    JSON.stringify(processedQuestions, null, 2),
    'utf-8'
  );

  console.log(`\n✨ Pipeline complete! Vector database ready at:\n   ${CONFIG.OUTPUT_PATH}`);
  console.log(`\n📦 File size: ${(await fs.stat(CONFIG.OUTPUT_PATH)).size / 1024} KB`);
}

// Execute
main().catch(error => {
  console.error('\n💥 Pipeline failed:', error.message);
  process.exit(1);
});