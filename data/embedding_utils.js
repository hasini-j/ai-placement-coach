import fetch from 'node-fetch';
import { GoogleAuth } from 'google-auth-library';

export async function getAccessToken() {
  const auth = new GoogleAuth({
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  });
  const client = await auth.getClient();
  const token = await client.getAccessToken();
  return token.token;
}

export async function generateEmbedding(text, config, retries = 0) {
  try {
    const accessToken = await getAccessToken();
    const endpoint = `https://${config.LOCATION}-aiplatform.googleapis.com/v1/projects/${config.PROJECT_ID}/locations/${config.LOCATION}/publishers/google/models/${config.EMBEDDING_MODEL}:predict`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        instances: [{ content: text }]
      })
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    const result = await response.json();
    return result.predictions[0].embeddings.values;
  } catch (err) {
    if (retries < config.MAX_RETRIES) {
      await new Promise(r => setTimeout(r, config.RETRY_DELAY));
      return generateEmbedding(text, config, retries + 1);
    }
    throw err;
  }
}
