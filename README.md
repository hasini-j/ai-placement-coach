# 🤖 AI Placement Coach

> An intelligent technical interview preparation platform powered by Google Vertex AI and Speech-to-Text, featuring multi-subject support, real-time AI feedback, and speech-based explanations.

![AI Placement Coach](https://img.shields.io/badge/AI-Powered-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![React](https://img.shields.io/badge/react-18.3.1-blue)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Components](#components)
- [Question Banks](#question-banks)
- [AI Evaluation System](#ai-evaluation-system)
- [Troubleshooting](#troubleshooting)
- [Future Enhancements](#future-enhancements)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

**AI Placement Coach** is a comprehensive technical interview preparation platform designed to help candidates practice and excel in coding and theory interviews. The application leverages Google's Vertex AI for intelligent code and answer evaluation, and Google Speech-to-Text for seamless voice-based explanations.

### Key Highlights

- 🧠 **Multi-Subject Support**: DSA, DBMS, OS, and OOPS
- 🎤 **Speech-to-Text Integration**: Explain your solutions verbally
- 🤖 **AI-Powered Evaluation**: Real-time feedback from Google Vertex AI
- 📊 **Detailed Analytics**: Complexity analysis, scores, and improvement suggestions
- 🎨 **Modern UI**: Beautiful, responsive interface with gradient themes
- 🔍 **Advanced Search**: Filter questions by topic, difficulty, and company

---

## ✨ Features

### 1. Multi-Subject Practice

#### Data Structures & Algorithms (DSA)
- Full-featured code editor with syntax highlighting
- Support for multiple programming languages (JavaScript, Python, C++, C)
- Company-specific question filtering (Google, Amazon, Microsoft, etc.)
- Real-time code evaluation
- Speech-based code explanation

#### Theory Subjects (DBMS, OS, OOPS)
- Text and speech-based answer submission
- Topic-wise question organization
- Difficulty-based filtering
- Session-based practice flow
- AI evaluation of conceptual understanding

### 2. AI-Powered Feedback

**For Coding (DSA):**
- ✅ Correctness analysis
- ⚡ Efficiency evaluation
- 🗣️ Communication assessment
- ⏱️ Time & Space complexity analysis
- 🔧 Code improvement suggestions
- 💡 Alternative approach recommendations

**For Theory (DBMS/OS/OOPS):**
- ✅ Content correctness
- 📋 Completeness check
- 🗣️ Communication clarity
- 🎯 Missing key points identification
- 💡 Detailed feedback and suggestions

### 3. Speech-to-Text Integration

- Record audio explanations for any question
- Automatic transcription using Google Cloud Speech-to-Text
- Transcriptions saved and displayed after recording
- Works seamlessly for both DSA and theory subjects

### 4. Advanced Question Management

- **Browse All**: View all questions matching your filters
- **Random Selection**: Get a random question based on criteria
- **Direct Access**: Load specific questions by ID
- **Smart Filtering**: Multiple filter combinations for targeted practice

---

## 🏗️ Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       Frontend (React)                       │
│  ┌────────────┐  ┌──────────────┐  ┌──────────────────┐    │
│  │  HomePage  │  │ DSA Practice │  │ Theory Practice  │    │
│  └────────────┘  └──────────────┘  └──────────────────┘    │
│         │                │                    │              │
│         └────────────────┴────────────────────┘              │
│                          │                                   │
│                    React Router                              │
└──────────────────────────┼──────────────────────────────────┘
                           │ HTTP/REST
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   Backend (Express.js)                       │
│  ┌──────────────┐  ┌───────────┐  ┌──────────────────┐    │
│  │   Routing    │  │  Search   │  │  STT Service     │    │
│  └──────────────┘  └───────────┘  └──────────────────┘    │
│         │                │                    │              │
│         └────────────────┴────────────────────┘              │
│                          │                                   │
│                  Question Banks (JSON)                       │
└──────────────────────────┼──────────────────────────────────┘
                           │ API Calls
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   Google Cloud Platform                      │
│  ┌────────────────────┐        ┌──────────────────────┐    │
│  │   Vertex AI        │        │  Speech-to-Text API  │    │
│  │  (Gemini Model)    │        │   (Transcription)    │    │
│  └────────────────────┘        └──────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Component Flow

#### DSA Practice Flow
```
User → HomePage → DSAPractice → Load Question
                       ↓
              Write Code + Record Explanation
                       ↓
              Submit to Backend (/analyze)
                       ↓
         Vertex AI Evaluation + Complexity Analysis
                       ↓
              Display Feedback to User
```

#### Theory Practice Flow
```
User → HomePage → TheoryPractice → Get Question
                       ↓
              Type Answer / Record Speech
                       ↓
              Submit to Backend (/analyze)
                       ↓
           Vertex AI Evaluation (Theory Mode)
                       ↓
              Display Feedback to User
```

### Data Flow

1. **Question Loading**:
   - Frontend requests questions with filters
   - Backend searches vector database
   - Returns matching questions with metadata

2. **Audio Transcription**:
   - Frontend records audio using MediaRecorder API
   - Converts to base64 and sends to `/transcribe`
   - Backend uses Google STT to transcribe
   - Returns text to frontend

3. **AI Evaluation**:
   - Frontend sends code/answer + transcript to `/analyze`
   - Backend prepares prompt for Vertex AI
   - Vertex AI analyzes and returns structured JSON
   - Frontend displays formatted feedback

---

## 🛠️ Tech Stack

### Frontend
- **React** 18.3.1 - UI framework
- **Vite** 7.3.0 - Build tool and dev server
- **@monaco-editor/react** 4.8.0 - Code editor
- **react-markdown** 10.1.0 - Markdown rendering
- **axios** 1.9.0 - HTTP client
- **MediaRecorder API** - Audio recording

### Backend
- **Node.js** (>= 18.0.0) - Runtime
- **Express** 5.2.1 - Web framework
- **@google-cloud/vertexai** 1.10.0 - AI evaluation
- **@google-cloud/speech** 6.0.0 - Speech-to-Text
- **dotenv** 17.2.3 - Environment configuration
- **cors** 2.8.5 - Cross-origin requests

### Cloud Services
- **Google Vertex AI** - Gemini 2.0 Flash model for code/answer evaluation
- **Google Cloud Speech-to-Text** - Audio transcription
- **Vector Database** - Precomputed embeddings for question search

---

## 📦 Prerequisites

Before you begin, ensure you have:

1. **Node.js** (v18.0.0 or higher)
   ```bash
   node --version
   ```

2. **npm** (comes with Node.js)
   ```bash
   npm --version
   ```

3. **Google Cloud Account** with:
   - Vertex AI API enabled
   - Speech-to-Text API enabled
   - Service account with appropriate permissions

4. **Google Cloud Credentials**
   - Download service account JSON key file
   - Save as `credentials.json` or similar

---

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/ai-placement-coach.git
cd ai-placement-coach
```

### 2. Install Backend Dependencies
```bash
npm install
```

### 3. Install Frontend Dependencies
```bash
cd frontend
npm install
cd ..
```

### 4. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
# Google Cloud Configuration
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=./path/to/credentials.json

# Server Configuration
PORT=3000

# Vertex AI Configuration
LOCATION=us-central1
MODEL_NAME=gemini-2.0-flash-exp

# Speech-to-Text Configuration
STT_LANGUAGE_CODE=en-US
STT_SAMPLE_RATE=48000
```

**Important**: Replace `your-project-id` and the credentials path with your actual values.

---

## ⚙️ Configuration

### Google Cloud Setup

1. **Create a Google Cloud Project**:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select an existing one

2. **Enable Required APIs**:
   ```bash
   gcloud services enable aiplatform.googleapis.com
   gcloud services enable speech.googleapis.com
   ```

3. **Create Service Account**:
   ```bash
   gcloud iam service-accounts create ai-placement-coach \
     --display-name="AI Placement Coach Service Account"
   ```

4. **Grant Permissions**:
   ```bash
   gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
     --member="serviceAccount:ai-placement-coach@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
     --role="roles/aiplatform.user"
   
   gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
     --member="serviceAccount:ai-placement-coach@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
     --role="roles/speech.client"
   ```

5. **Download Credentials**:
   ```bash
   gcloud iam service-accounts keys create credentials.json \
     --iam-account=ai-placement-coach@YOUR_PROJECT_ID.iam.gserviceaccount.com
   ```

### Question Bank Configuration

Question banks are stored as JSON files in the `data/` directory:

- `questions_with_vectors.json` - DSA questions with embeddings
- `dbms_questions_with_vectors.json` - DBMS questions
- `os_questions_with_vectors.json` - OS questions
- `oops_questions_with_vectors.json` - OOPS questions

**Format Example** (DSA):
```json
{
  "id": "unique-id",
  "title": "Two Sum",
  "metadata": {
    "difficulty": "Easy",
    "topics": ["Array", "Hash Table"],
    "companies": ["Google", "Amazon"]
  },
  "display_markdown": "## Problem Description...",
  "judge_context": {
    "optimal_code": "...",
    "time_complexity": "O(n)",
    "space_complexity": "O(n)"
  },
  "vector": [0.1, 0.2, ...]
}
```

**Format Example** (Theory):
```json
{
  "id": "unique-id",
  "subject": "DBMS",
  "topic": "Indexing",
  "difficulty": "Medium",
  "question": "What are indexes?",
  "expected_points": ["Definition", "Types", "Use cases"],
  "keywords": ["B-tree", "hash index", "performance"],
  "reference_answer": "..."
}
```

---

## 💻 Usage

### Starting the Application

#### Terminal 1 - Backend Server
```bash
node server.js
```
Expected output:
```
🚀 Server running on port 3000
```

#### Terminal 2 - Frontend Dev Server
```bash
cd frontend
npm run dev
```
Expected output:
```
  VITE v7.3.0  ready in XXX ms
  ➜  Local:   http://localhost:5173/
```

### Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

### Using the Application

#### 1. Homepage - Subject Selection
- Choose from 4 subjects: DSA, DBMS, OS, or OOPS
- Click on any subject card to start practicing

#### 2. DSA Practice
- **Select Language**: JavaScript, Python, C++, or C
- **Apply Filters**: Topic, Company, Difficulty
- **Load Question**: Click "Load Random Question" or "Browse All"
- **Write Code**: Use the Monaco editor
- **Explain**: Click 🎤 to record your audio explanation
- **Submit**: Click "Submit for AI Review"
- **Review Feedback**: See scores, complexity analysis, and suggestions

#### 3. Theory Practice (DBMS/OS/OOPS)
- **Apply Filters**: Topic, Difficulty
- **Get Question**: Click "Get Question"
- **Answer**: Type your answer OR click 🎤 to record
- **Submit**: Click "Submit for AI Review"
- **Review Feedback**: See scores and detailed analysis
- **Continue**: Click "Next Question" or "End Session"

---

## 📁 Project Structure

```
ai-placement-coach/
├── backend/
│   ├── judge.js              # AI evaluation logic
│   ├── search.js             # Vector search implementation
│   ├── stt.js                # Speech-to-Text service
│   └── utils.js              # Utility functions
├── data/
│   ├── questions_with_vectors.json         # DSA questions
│   ├── dbms_questions_with_vectors.json    # DBMS questions
│   ├── os_questions_with_vectors.json      # OS questions
│   └── oops_questions_with_vectors.json    # OOPS questions
├── frontend/
│   ├── src/
│   │   ├── App.jsx           # Main app with DSA practice
│   │   ├── HomePage.jsx      # Subject selection page
│   │   ├── TheoryPractice.jsx # Theory practice component
│   │   ├── main.jsx          # React entry point
│   │   └── index.css         # Global styles
│   ├── index.html            # HTML template
│   ├── package.json          # Frontend dependencies
│   └── vite.config.js        # Vite configuration
├── server.js                 # Express server
├── package.json              # Backend dependencies
├── .env                      # Environment variables (not in repo)
├── .gitignore                # Git ignore rules
└── README.md                 # This file
```

---

## 🔌 API Documentation

### Base URL
```
http://localhost:3000
```

### Endpoints

#### 1. Get Filters by Subject
```http
GET /filters/:subject
```

**Parameters:**
- `subject` (path): `dsa`, `dbms`, `os`, or `oops`

**Response:**
```json
{
  "companies": ["Google", "Amazon", ...],  // DSA only
  "difficulties": ["Easy", "Medium", "Hard"],
  "topics": ["Array", "Hash Table", ...]
}
```

#### 2. Search Questions
```http
POST /search/:subject
```

**Parameters:**
- `subject` (path): Subject identifier

**Body:**
```json
{
  "query": "technical interview question",
  "companyFilter": "Google",      // DSA only
  "difficultyFilter": "Medium",
  "topicFilter": "Array"
}
```

**Response:** Single question object

#### 3. Search All Questions
```http
POST /search-all/:subject
```

**Body:** Same as `/search/:subject`

**Response:** Array of question objects

#### 4. Get Question by ID
```http
GET /question/:subject/:id
```

**Parameters:**
- `subject` (path): Subject identifier
- `id` (path): Question ID

**Response:** Question object

#### 5. Transcribe Audio
```http
POST /transcribe
```

**Body:**
```json
{
  "audio": "base64-encoded-audio-data"
}
```

**Response:**
```json
{
  "transcription": "Your speech converted to text..."
}
```

#### 6. Analyze Code/Answer
```http
POST /analyze
```

**Body (DSA):**
```json
{
  "code": "function twoSum(nums, target) {...}",
  "transcript": "My approach uses a hash map...",
  "questionTitle": "Two Sum",
  "judgeContext": {...},
  "isTheory": false
}
```

**Body (Theory):**
```json
{
  "answer": "Indexes are data structures...",
  "transcript": "Additionally, I'd like to mention...",
  "questionTitle": "What are indexes?",
  "judgeContext": {
    "expected_points": [...],
    "keywords": [...]
  },
  "isTheory": true
}
```

**Response (DSA):**
```json
{
  "score": 85,
  "breakdown": {
    "correctness": 90,
    "efficiency": 80,
    "communication": 85
  },
  "complexity": {
    "time": "O(n)",
    "space": "O(n)",
    "optimal": true
  },
  "improvements": {
    "code": ["Consider edge cases..."],
    "communication": ["Explain the hash map choice..."],
    "approach": "Current approach is optimal"
  },
  "feedback": "Great solution! ...",
  "report": "## Analysis\n..."
}
```

---

## 🧩 Components

### Frontend Components

#### 1. HomePage.jsx
**Purpose**: Subject selection landing page

**Features**:
- 4 interactive subject cards with gradient background
- Hover effects (lift and shadow)
- Click navigation to practice pages
- Responsive 2x2 grid layout

**Props**:
- `onSelectSubject(subject)`: Callback when subject is selected

#### 2. App.jsx (DSAPractice)
**Purpose**: DSA coding practice interface

**Features**:
- Monaco code editor with multi-language support
- Question display with markdown rendering
- Audio recording with STT integration
- Filter controls (topic, company, difficulty)
- Browse all questions functionality
- AI feedback display

**State Management**:
- Code, language, question, transcript
- Analysis result, filters, recording status

#### 3. TheoryPractice.jsx
**Purpose**: Theory practice for DBMS/OS/OOPS

**Features**:
- Text answer input (textarea)
- Audio recording with STT
- Question display with tags
- Topic and difficulty filters
- Session management (next/end)
- AI feedback display

**Props**:
- `subject`: Current subject (`dbms`, `os`, or `oops`)
- `onBackToHome()`: Callback to return to homepage

### Backend Modules

#### 1. server.js
**Purpose**: Express server and routing

**Responsibilities**:
- Load question banks on startup
- Define API endpoints
- Handle CORS
- Serve static files (if needed)

#### 2. backend/judge.js
**Purpose**: AI evaluation logic

**Functions**:
- `handleAnalysis(model, body)`: Main evaluation function
- Supports both code and theory evaluation
- Constructs prompts for Vertex AI
- Parses and validates AI responses

#### 3. backend/search.js
**Purpose**: Vector search implementation

**Functions**:
- `handleSearch(db, body, returnAll)`: Search questions
- Uses cosine similarity for semantic search
- Applies filters (topic, difficulty, company)

#### 4. backend/stt.js
**Purpose**: Speech-to-Text service

**Functions**:
- `transcribeAudio(audioContent)`: Transcribe audio to text
- Uses Google Cloud Speech-to-Text API
- Handles base64 audio encoding

---

## 📚 Question Banks

### Question Bank Structure

All question banks are JSON arrays stored in the `data/` directory with precomputed vector embeddings for semantic search.

### Adding New Questions

#### DSA Questions
1. Add to `data/questions_with_vectors.json`
2. Generate embedding vector using the same model
3. Include all required fields:
   - `id`, `title`, `metadata`, `display_markdown`, `judge_context`, `vector`

#### Theory Questions
1. Add to respective file (`dbms_questions_with_vectors.json`, etc.)
2. Include:
   - `id`, `subject`, `topic`, `difficulty`
   - `question`, `expected_points`, `keywords`
   - `reference_answer`, `vector`

### Generating Embeddings

Use the Vertex AI Text Embedding API:
```javascript
const { VertexAI } = require('@google-cloud/vertexai');

async function generateEmbedding(text) {
  const vertex_ai = new VertexAI({
    project: process.env.GOOGLE_CLOUD_PROJECT_ID,
    location: process.env.LOCATION
  });
  
  const model = vertex_ai.preview.getGenerativeModel({
    model: 'text-embedding-004'
  });
  
  const result = await model.generateContent(text);
  return result.embedding.values;
}
```

---

## 🤖 AI Evaluation System

### Vertex AI Integration

The application uses **Gemini 2.0 Flash** model for intelligent evaluation.

#### Evaluation Criteria

**For DSA (Coding):**
1. **Correctness** (40%):
   - Does the code solve the problem?
   - Handles edge cases?
   - Follows requirements?

2. **Efficiency** (30%):
   - Time complexity analysis
   - Space complexity analysis
   - Optimal solution check

3. **Communication** (30%):
   - Verbal explanation clarity
   - Thought process articulation
   - Problem-solving approach

**For Theory (DBMS/OS/OOPS):**
1. **Correctness** (40%):
   - Accurate information
   - Technically sound explanation

2. **Completeness** (30%):
   - Covers expected points
   - Includes relevant keywords
   - Comprehensive answer

3. **Communication** (30%):
   - Clear articulation
   - Logical structure
   - Verbal explanation quality

### Prompt Engineering

The system uses carefully crafted prompts to ensure consistent, structured responses from Vertex AI:

- **Structured Output**: JSON format for easy parsing
- **Clear Criteria**: Specific evaluation metrics
- **Context Injection**: Question details and expected solutions
- **Few-Shot Examples**: Implicit in judge_context

---

## 🐛 Troubleshooting

### Common Issues

#### 1. "Vertex AI API Error"
**Problem**: Unable to connect to Vertex AI

**Solutions**:
- Check `.env` file has correct `GOOGLE_CLOUD_PROJECT_ID`
- Verify credentials file path in `GOOGLE_APPLICATION_CREDENTIALS`
- Ensure Vertex AI API is enabled in your project
- Check service account has `roles/aiplatform.user` role

#### 2. "Speech-to-Text Failed"
**Problem**: Audio transcription not working

**Solutions**:
- Verify Speech-to-Text API is enabled
- Check service account has `roles/speech.client` role
- Ensure microphone permissions are granted in browser
- Check audio format is supported (WebM/Opus)

#### 3. "No Questions Found"
**Problem**: Questions not loading

**Solutions**:
- Verify question bank JSON files exist in `data/` directory
- Check file names match exactly in `server.js`
- Ensure JSON is valid (use JSON validator)
- Check server console for loading errors

#### 4. "Port Already in Use"
**Problem**: Cannot start server on port 3000

**Solutions**:
```bash
# Find process using port 3000
netstat -ano | findstr :3000  # Windows
lsof -i :3000                  # Mac/Linux

# Kill the process and restart
```

#### 5. "Frontend Won't Connect to Backend"
**Problem**: CORS errors or connection refused

**Solutions**:
- Ensure backend is running on port 3000
- Check frontend is making requests to `http://localhost:3000`
- Verify CORS is enabled in `server.js`
- Check firewall settings
# 🤖 AI Interview Coach

An end‑to‑end **AI‑powered technical interview practice platform** that simulates real placement interviews. The system dynamically selects interview questions from curated JSON datasets, records the candidate’s verbal explanation using the **Web Speech API**, evaluates both **code and explanation** using **Google Vertex AI (Gemini)**, and provides **structured scores, complexity analysis, and actionable feedback**.

---

##  Key Features

*  **Smart Question Retrieval**
  Filters questions by **topic, difficulty, and company** from JSON‑based question banks.

*  **Vector‑Based Search**
  Uses precomputed embeddings to find the most relevant interview questions.

*  **Speech‑to‑Text Explanation**
  Records the candidate’s spoken explanation using the **Web Speech API** and transcribes it in real time.

*  **Live Code Editor**
  Multi‑language Monaco Editor (JavaScript, Python, C, C++).

*  **AI‑Driven Evaluation (Vertex AI)**
  Gemini model evaluates:

  * Correctness
  * Efficiency
  * Communication clarity
  * Time & Space complexity
  * Optimality of approach

* 📊 **Structured Interview Feedback**
  Provides:

  * Overall score
  * Category‑wise breakdown
  * Complexity analysis
  * Areas for improvement
  * Markdown‑formatted AI summary

---

##  Project Architecture Overview

The project follows a **clear frontend–backend separation** with JSON‑driven data and AI‑assisted evaluation.

```
AI-PLACEMENT/
│
├── backend/               # Core backend logic
│   ├── judge.js           # AI evaluation & scoring logic
│   ├── search.js          # Vector similarity & filtering
│   └── utils.js           # Helper utilities
│
├── credentials/           # Google Cloud credentials
│   └── google-cloud-key.json
│
├── data/                  # Question banks & embeddings
│   ├── DBMS_questionbank.json
│   ├── OOPS_questionbank.json
│   ├── OS_questionbank.json
│   ├── questions_master.json
│   └── questions_with_vectors.json
│
├── frontend/              # React + Vite frontend
│   ├── src/
│   │   ├── App.jsx        # Main application UI & logic
│   │   ├── main.jsx
│   │   └── assets/
│   └── index.html
│
├── server.js              # Express backend entry point
├── seed.js                # Vector DB preparation (offline)
├── .env                   # Environment variables
└── README.md
```

---

## 🧠 Backend Architecture (Node.js + Express)

### 🔹 `server.js` – Backend Entry Point

The backend is an **Express server** responsible for:

* Loading vectorized questions from JSON
* Serving filters (topics, difficulty, companies)
* Handling question search & retrieval
* Sending candidate responses to Vertex AI for evaluation

**Core responsibilities:**

* Initializes Vertex AI using service‑account credentials
* Loads `questions_with_vectors.json` as an in‑memory vector DB
* Exposes REST APIs for frontend consumption

**Main Routes:**

| Method | Endpoint        | Purpose                                         |
| ------ | --------------- | ----------------------------------------------- |
| GET    | `/filters`      | Fetch available topics, difficulties, companies |
| POST   | `/search`       | Fetch a single best‑matched question            |
| POST   | `/search-all`   | Browse all matching questions                   |
| GET    | `/question/:id` | Load full question by ID                        |
| POST   | `/analyze`      | Send code + explanation to Vertex AI            |

---

### 🔹 `search.js` – Question Retrieval Logic

* Performs **vector similarity matching** over precomputed embeddings
* Applies filters:

  * Company
  * Difficulty
  * Topic
* Supports both:

  * Best‑match search
  * Full browse results

This design ensures **fast retrieval** without repeated embedding computation.

---

### 🔹 `judge.js` – AI Evaluation Engine

This is the **core intelligence layer**.

Inputs sent to Vertex AI:

* Candidate’s **source code**
* **Speech‑to‑text transcript**
* Question context (`judge_context`)

Outputs generated:

* Overall score (0–100)
* Category breakdown:

  * Correctness
  * Efficiency
  * Communication
* Time & Space complexity analysis
* Optimality judgment
* Improvement suggestions
* Markdown‑formatted summary

The evaluation is **explainable and structured**, not just a raw score.

---

##  Frontend Architecture (React + Vite)

### 🔹 `App.jsx` – Main Application

The frontend is a **single‑page React application** built for clarity and interview realism.

#### Key UI Sections:

1. **Header & Filters**

   * Topic selector
   * Company selector
   * Difficulty selector
   * Language selector

2. **Code Editor Panel**

   * Monaco Editor
   * Supports JS / Python / C / C++

3. **Question Panel**

   * Renders markdown question description
   * Displays difficulty & metadata

4. **Speech Explanation Module**

   * Uses Web Speech API
   * Live transcript display

5. **AI Evaluation Panel**

   * Scores
   * Complexity analysis
   * Improvement suggestions
   * Markdown‑rendered AI summary

---

### 🔹 Markdown Rendering

AI summaries are returned in **Markdown format** and rendered using `react-markdown` to ensure:

* Bold headings
* Bullet points
* Clean, readable feedback

---

## 📂 Question Bank Design (JSON‑Driven)

Questions are stored in structured JSON format, making the system **dataset‑agnostic and extensible**.

Each question includes:

```json
{
  "id": "dbms_12",
  "title": "Explain ACID properties",
  "difficulty": "Medium",
  "topics": ["DBMS", "Transactions"],
  "companies": ["Amazon", "Google"],
  "display_markdown": "...",
  "judge_context": "Key points the candidate should cover",
  "embedding": [ ... ]
}
```

This allows:

* Easy subject expansion
* Consistent AI judging
* Offline embedding generation

---

## 🔐 Environment Setup

Create a `.env` file at project root:

```env
GOOGLE_CLOUD_PROJECT_ID=your-gcp-project-id
GOOGLE_APPLICATION_CREDENTIALS=./credentials/google-cloud-key.json
```

> ⚠️ The service account must have **Vertex AI User** permissions.

---

## ▶️ Running the Project

### Backend

```bash
npm install
node server.js
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Backend runs on `http://localhost:3000`
Frontend runs on `http://localhost:5173`

---

##  Why This Project Stands Out

* Goes beyond code correctness → evaluates **thinking & communication**
* Uses **real interview‑style feedback**, not generic scoring
* Fully **JSON‑driven & scalable**
* Clean separation of concerns
* Industry‑relevant tech stack (Vertex AI, React, Express)

---

##  Future Enhancements

### Planned Features

1. **User Authentication**
   - User accounts and profiles
   - Track practice history
   - Save progress and bookmarks

2. **Advanced Analytics**
   - Performance dashboards
   - Progress tracking over time
   - Strengths and weaknesses analysis
   - Comparison with peers

3. **More Subjects**
   - Computer Networks
   - System Design
   - Web Development
   - Cloud Computing

4. **Enhanced AI Features**
   - Real-time code execution
   - Test case validation
   - Hint system
   - Adaptive difficulty

5. **Collaboration Features**
   - Peer code review
   - Group practice sessions
   - Discussion forums
   - Mentor matching

6. **Mobile Application**
   - React Native apps
   - Offline practice mode
   - Push notifications

7. **Interview Simulation**
   - Timed assessments
   - Live coding interviews
   - Behavioral questions
   - Mock interviews with AI
* Interview session history
* Resume‑based question personalization
* Deployment on cloud (GCP / Vercel)

---

##  Author

Hasini Jaishetty
B.Tech – Artificial Intelligence
NITK Surathkal

---
