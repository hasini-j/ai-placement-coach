const { GoogleAuth } = require('google-auth-library');

/**
 * Helper function to get Access Token for REST API calls
 */
async function getAccessToken() {
    const auth = new GoogleAuth({
        keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
        scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
    const client = await auth.getClient();
    const token = await client.getAccessToken();
    return token.token;
}

/**
 * Similarity Function (Cosine Similarity)
 */
function getSimilarity(vecA, vecB) {
    if (!vecA || !vecB) return 0;
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

module.exports = { getAccessToken, getSimilarity };