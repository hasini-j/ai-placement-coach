require('dotenv').config();
const express = require('express');
const fs = require('fs');
const cors = require('cors');
const { VertexAI } = require('@google-cloud/vertexai');
const { GoogleAuth } = require('google-auth-library');

// Use dynamic import for node-fetch to match your seed.js style
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
app.use(express.json());
app.use(cors());

// --- AUTHENTICATION SETUP ---
process.env.GOOGLE_APPLICATION_CREDENTIALS = './credentials/google-cloud-key.json';

const vertex_ai = new VertexAI({
    project: process.env.GOOGLE_CLOUD_PROJECT_ID,
    location: 'us-central1' 
});

// Load Database
const VECTOR_DB = JSON.parse(fs.readFileSync('./data/questions_with_vectors.json', 'utf8'));

// Initialize Judge Model
const generativeModel = vertex_ai.getGenerativeModel({
    model: 'gemini-2.5-flash',
});

// Helper function to get Access Token (Matching your seed.js)
async function getAccessToken() {
    const auth = new GoogleAuth({
        keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
        scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
    const client = await auth.getClient();
    const token = await client.getAccessToken();
    return token.token;
}

// Similarity Function
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

app.get("/filters", (req, res) => {
    const companies = new Set();
    const difficulties = new Set();
    const topics = new Set();

    VECTOR_DB.forEach(q => {
        if(q.metadata.companies) q.metadata.companies.forEach(c => companies.add(c));
        if(q.metadata.difficulty) difficulties.add(q.metadata.difficulty);
        if(q.metadata.topics) q.metadata.topics.forEach(t => topics.add(t));
    });

    res.json({
        companies: Array.from(companies).sort(),
        difficulties: Array.from(difficulties).sort(),
        topics: Array.from(topics).sort()
    });
});

// --- UPDATED SEARCH ROUTE (RANDOM QUESTION) ---
app.post('/search', async (req, res) => {
    try {
        const { query, companyFilter, difficultyFilter, topicFilter } = req.body;
        let candidates = VECTOR_DB;
        
        if (companyFilter && companyFilter !== "All") {
            candidates = candidates.filter(q => q.metadata.companies.includes(companyFilter));
        }
        if (difficultyFilter && difficultyFilter !== "All") {
            candidates = candidates.filter(q => q.metadata.difficulty === difficultyFilter);
        }
        if (topicFilter && topicFilter !== "All") {
            candidates = candidates.filter(q => q.metadata.topics.includes(topicFilter));
        }

        if (candidates.length === 0) {
            return res.status(404).json({ error: "No matching questions found." });
        }

        // 1. Get Token and Setup Vertex REST Call
        const token = await getAccessToken();
        const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
        const location = 'us-central1';
        const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/text-embedding-004:predict`;

        // 2. Generate Query Embedding via REST (to match seed.js)
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
        
        // Extract vector correctly from REST response
        if (!result.predictions || !result.predictions[0]) {
            throw new Error("Embedding API failed to return a vector.");
        }
        const queryVector = result.predictions[0].embeddings.values;

        // 3. Perform Similarity Search
        const rankedResults = candidates.map(q => ({
            ...q,
            similarity: getSimilarity(queryVector, q.embedding)
        })).sort((a, b) => b.similarity - a.similarity);

        // 🎲 PICK A RANDOM QUESTION FROM TOP 10 RESULTS (or less if fewer available)
        const topCount = Math.min(10, rankedResults.length);
        const randomIndex = Math.floor(Math.random() * topCount);
        const selectedQuestion = { ...rankedResults[randomIndex] };
        
        delete selectedQuestion.embedding; 
        res.json(selectedQuestion);

    } catch (error) {
        console.error("Search Error:", error);
        res.status(500).json({ error: "Search failed", details: error.message });
    }
});

// --- NEW ROUTE: GET ALL MATCHING QUESTIONS ---
app.post('/search-all', async (req, res) => {
    try {
        const { query, companyFilter, difficultyFilter, topicFilter } = req.body;
        let candidates = VECTOR_DB;
        
        if (companyFilter && companyFilter !== "All") {
            candidates = candidates.filter(q => q.metadata.companies.includes(companyFilter));
        }
        if (difficultyFilter && difficultyFilter !== "All") {
            candidates = candidates.filter(q => q.metadata.difficulty === difficultyFilter);
        }
        if (topicFilter && topicFilter !== "All") {
            candidates = candidates.filter(q => q.metadata.topics.includes(topicFilter));
        }

        if (candidates.length === 0) {
            return res.status(404).json({ error: "No matching questions found." });
        }

        // 1. Get Token and Setup Vertex REST Call
        const token = await getAccessToken();
        const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
        const location = 'us-central1';
        const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/text-embedding-004:predict`;

        // 2. Generate Query Embedding via REST
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

        // 3. Perform Similarity Search and return ALL results (sorted)
        const rankedResults = candidates.map(q => ({
            id: q.id,
            title: q.title,
            difficulty: q.metadata.difficulty,
            topics: q.metadata.topics,
            companies: q.metadata.companies,
            similarity: getSimilarity(queryVector, q.embedding)
        })).sort((a, b) => b.similarity - a.similarity);

        res.json(rankedResults);

    } catch (error) {
        console.error("Search All Error:", error);
        res.status(500).json({ error: "Search failed", details: error.message });
    }
});

// --- NEW ROUTE: GET QUESTION BY ID ---
app.get('/question/:id', (req, res) => {
    const questionId = req.params.id;
    const question = VECTOR_DB.find(q => q.id === questionId);
    
    if (!question) {
        return res.status(404).json({ error: "Question not found" });
    }
    
    const questionCopy = { ...question };
    delete questionCopy.embedding;
    res.json(questionCopy);
});

// --- VERTEX AI JUDGE ROUTE ---
app.post('/analyze', async (req, res) => {
    try {
        const { code, transcript, questionTitle, judgeContext } = req.body;
        console.log("--- SUBMISSION RECEIVED (VERTEX AI) ---");

        const prompt = 
        {
            contents: [{
                role: 'user',
                parts: [{
                    text: `You are an expert technical interview judge evaluating a candidate's coding solution.
                    
                    Question: ${questionTitle}
                    Expected Solution/Logic: ${JSON.stringify(judgeContext)}
                    
                    Candidate's Code:
                    ${code}
                    
                    Candidate's Verbal Explanation:
                    ${transcript}
                    
                    Analyze and evaluate comprehensively. Return ONLY a valid JSON object with this exact structure:
                    {
                        "score": <number 0-100>,
                        "breakdown": {
                            "correctness": <number 0-100>,
                            "efficiency": <number 0-100>,
                            "communication": <number 0-100>
                        },
                        "complexity": {
                            "time": "<Big O notation with brief explanation>",
                            "space": "<Big O notation with brief explanation>",
                            "optimal": <boolean - true if optimal, false otherwise>
                        },
                        "improvements": {
                            "code": ["<specific code improvement 1>", "<specific code improvement 2>"],
                            "communication": ["<specific communication improvement 1>", "<specific communication improvement 2>"],
                            "approach": "<alternative approach if applicable, or 'Current approach is optimal'>"
                        },
                        "feedback": "<Detailed constructive advice covering correctness, efficiency, and communication>",
                        "report": "<A concise 2-3 sentence summary of overall performance>"
                    }
                    
                    Evaluation Guidelines:
                    - Correctness: Does the code solve the problem? Are edge cases handled?
                    - Efficiency: Time and space complexity analysis. Compare to optimal solution.
                    - Communication: Was the explanation clear, structured, and technically accurate?
                    - Be specific in improvements - mention exact lines or concepts to address
                    - If complexity can be improved, suggest how in the improvements section
                    `
                }]
            }],
            generationConfig: {
                responseMimeType: "application/json",
            }
        };
        
        const result = await generativeModel.generateContent(prompt);
        const response = await result.response;
        const text = response.candidates[0].content.parts[0].text;

        console.log("AI Evaluation Complete.");
        const evaluation = JSON.parse(text);
        
        // Optional: Add validation to ensure all fields are present
        if (!evaluation.complexity || !evaluation.improvements) {
            console.warn("Incomplete evaluation received, using defaults");
            evaluation.complexity = evaluation.complexity || { time: "N/A", space: "N/A", optimal: false };
            evaluation.improvements = evaluation.improvements || { code: [], communication: [], approach: "N/A" };
        }
        
        res.json(evaluation);

    } catch (error) {
        console.error("VERTEX ANALYSIS ERROR:", error.message);
        res.status(500).json({ error: "Analysis failed", details: error.message });
    }
});

app.listen(3000, () => console.log("🚀 Vertex AI Server running on port 3000"));