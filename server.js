require('dotenv').config();
const express = require('express');
const fs = require('fs');
const cors = require('cors');
const { VertexAI } = require('@google-cloud/vertexai');

const { handleSearch } = require('./backend/search');
const { handleAnalysis } = require('./backend/judge');
const { transcribeAudio } = require('./backend/stt');

const app = express();
app.use(express.json({ limit: '50mb' })); // Increased limit for audio data
app.use(cors());

process.env.GOOGLE_APPLICATION_CREDENTIALS = './credentials/google-cloud-key.json';

const vertex_ai = new VertexAI({
    project: process.env.GOOGLE_CLOUD_PROJECT_ID,
    location: 'us-central1'
});

// Load all question banks
const QUESTION_BANKS = {
    dsa: JSON.parse(fs.readFileSync('./data/questions_with_vectors.json', 'utf8')),
    dbms: JSON.parse(fs.readFileSync('./data/dbms_questions_with_vectors.json', 'utf8')),
    os: JSON.parse(fs.readFileSync('./data/os_questions_with_vectors.json', 'utf8')),
    oops: JSON.parse(fs.readFileSync('./data/oops_questions_with_vectors.json', 'utf8'))
};

const generativeModel = vertex_ai.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });


// --- ROUTES ---

// Get filters for a specific subject
app.get("/filters/:subject", (req, res) => {
    const subject = req.params.subject;
    const VECTOR_DB = QUESTION_BANKS[subject] || QUESTION_BANKS.dsa;

    const companies = new Set(), difficulties = new Set(), topics = new Set();
    VECTOR_DB.forEach(q => {
        if (q.metadata?.companies) q.metadata.companies.forEach(c => companies.add(c));
        if (q.metadata?.difficulty) difficulties.add(q.metadata.difficulty);
        if (q.metadata?.topics) q.metadata.topics.forEach(t => topics.add(t));
        // For theory subjects, also check for direct properties
        if (q.difficulty) difficulties.add(q.difficulty);
        if (q.topic) topics.add(q.topic);
    });
    res.json({
        companies: Array.from(companies).sort(),
        difficulties: Array.from(difficulties).sort(),
        topics: Array.from(topics).sort()
    });
});

// Legacy route for backward compatibility
app.get("/filters", (req, res) => {
    const VECTOR_DB = QUESTION_BANKS.dsa;
    const companies = new Set(), difficulties = new Set(), topics = new Set();
    VECTOR_DB.forEach(q => {
        if (q.metadata?.companies) q.metadata.companies.forEach(c => companies.add(c));
        if (q.metadata?.difficulty) difficulties.add(q.metadata.difficulty);
        if (q.metadata?.topics) q.metadata.topics.forEach(t => topics.add(t));
    });
    res.json({
        companies: Array.from(companies).sort(),
        difficulties: Array.from(difficulties).sort(),
        topics: Array.from(topics).sort()
    });
});

// Search for a question in a specific subject
app.post('/search/:subject', async (req, res) => {
    try {
        const subject = req.params.subject;
        const VECTOR_DB = QUESTION_BANKS[subject] || QUESTION_BANKS.dsa;
        const result = await handleSearch(VECTOR_DB, req.body, false);
        result ? res.json(result) : res.status(404).json({ error: "No matches found." });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Legacy search route
app.post('/search', async (req, res) => {
    try {
        const result = await handleSearch(QUESTION_BANKS.dsa, req.body, false);
        result ? res.json(result) : res.status(404).json({ error: "No matches found." });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Search all questions in a specific subject
app.post('/search-all/:subject', async (req, res) => {
    try {
        const subject = req.params.subject;
        const VECTOR_DB = QUESTION_BANKS[subject] || QUESTION_BANKS.dsa;
        const results = await handleSearch(VECTOR_DB, req.body, true);
        results ? res.json(results) : res.status(404).json({ error: "No matches found." });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Legacy search-all route
app.post('/search-all', async (req, res) => {
    try {
        const results = await handleSearch(QUESTION_BANKS.dsa, req.body, true);
        results ? res.json(results) : res.status(404).json({ error: "No matches found." });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Get question by ID from a specific subject
app.get('/question/:subject/:id', (req, res) => {
    const subject = req.params.subject;
    const VECTOR_DB = QUESTION_BANKS[subject] || QUESTION_BANKS.dsa;
    const question = VECTOR_DB.find(q => q.id === req.params.id);
    if (!question) return res.status(404).json({ error: "Not found" });
    const { embedding, ...rest } = question;
    res.json(rest);
});

// Legacy question route
app.get('/question/:id', (req, res) => {
    const question = QUESTION_BANKS.dsa.find(q => q.id === req.params.id);
    if (!question) return res.status(404).json({ error: "Not found" });
    const { embedding, ...rest } = question;
    res.json(rest);
});

// Speech-to-Text endpoint
app.post('/transcribe', async (req, res) => {
    try {
        const { audio } = req.body; // Base64 encoded audio
        if (!audio) {
            return res.status(400).json({ error: "No audio data provided" });
        }

        const audioBuffer = Buffer.from(audio, 'base64');
        const transcription = await transcribeAudio(audioBuffer);

        res.json({ transcription });
    } catch (e) {
        console.error('Transcription error:', e);
        res.status(500).json({ error: e.message });
    }
});

// AI Analysis endpoint
app.post('/analyze', async (req, res) => {
    try {
        const evaluation = await handleAnalysis(generativeModel, req.body);
        res.json(evaluation);
    } catch (e) { res.status(500).json({ error: e.message }); }
});


app.listen(3000, () => console.log("🚀 Server running on port 3000"));
