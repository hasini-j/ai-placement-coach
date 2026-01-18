const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const { getAccessToken, getSimilarity } = require('./utils');

async function handleSearch(VECTOR_DB, body, isAll = false) {
    const { query, companyFilter, difficultyFilter, topicFilter } = body;
    let candidates = VECTOR_DB;
    
    // Applying Filters
    if (companyFilter && companyFilter !== "All") {
        candidates = candidates.filter(q => q.metadata.companies.includes(companyFilter));
    }
    if (difficultyFilter && difficultyFilter !== "All") {
        candidates = candidates.filter(q => q.metadata.difficulty === difficultyFilter);
    }
    if (topicFilter && topicFilter !== "All") {
        candidates = candidates.filter(q => q.metadata.topics.includes(topicFilter));
    }

    if (candidates.length === 0) return null;

    // Generate Query Embedding via REST
    const token = await getAccessToken();
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
    const location = 'us-central1';
    const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/text-embedding-004:predict`;

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            instances: [{ content: query || "coding question" }],
        }),
    });

    const result = await response.json();
    if (!result.predictions || !result.predictions[0]) {
        throw new Error("Embedding API failed to return a vector.");
    }
    const queryVector = result.predictions[0].embeddings.values;

    // Rank Results
    const rankedResults = candidates.map(q => ({
        ...q,
        similarity: getSimilarity(queryVector, q.embedding)
    })).sort((a, b) => b.similarity - a.similarity);

    if (isAll) {
        return rankedResults.map(q => ({
        id: q.id,
        title: q.title,
        difficulty: q.metadata.difficulty,  // Preserving metadata
        topics: q.metadata.topics,          // Preserving metadata
        companies: q.metadata.companies,    // Preserving metadata
        similarity: q.similarity
    }));
    }

    // Pick random from top 10
    const topCount = Math.min(10, rankedResults.length);
    const randomIndex = Math.floor(Math.random() * topCount);
    const selected = { ...rankedResults[randomIndex] };
    delete selected.embedding;
    return selected;
}

module.exports = { handleSearch };