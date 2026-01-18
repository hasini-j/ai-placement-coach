# 🤖 AI Placement Coach

An end‑to‑end **AI‑powered technical interview practice platform** that simulates real placement interviews. The system dynamically selects interview questions from curated JSON datasets, records the candidate’s verbal explanation using the **Web Speech API**, evaluates both **code and explanation** using **Google Vertex AI (Gemini)**, and provides **structured scores, complexity analysis, and actionable feedback**.

This project is designed to be **interview‑realistic, explainable, and extensible** across multiple CS subjects (DSA, DBMS, OOPS, OS, CN).

---

## 🚀 Key Features

- 🔍 **Smart Question Retrieval**  
  Filters questions by **topic, difficulty, and company** from JSON‑based question banks.

- 🧠 **Vector‑Based Search**  
  Uses precomputed embeddings to find the most relevant interview questions.

- 🎙️ **Speech‑to‑Text Explanation**  
  Records the candidate’s spoken explanation using the **Web Speech API** and transcribes it in real time.

- 💻 **Live Code Editor**  
  Multi‑language Monaco Editor (JavaScript, Python, C, C++).

- 🤖 **AI‑Driven Evaluation (Vertex AI)**  
  Gemini model evaluates:
  - Correctness
  - Efficiency
  - Communication clarity
  - Time & Space complexity
  - Optimality of approach

- 📊 **Structured Interview Feedback**  
  Provides:
  - Overall score
  - Category‑wise breakdown
  - Complexity analysis
  - Areas for improvement
  - Markdown‑formatted AI summary

---

## 🏗️ Project Architecture Overview

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
- Loading vectorized questions from JSON
- Serving filters (topics, difficulty, companies)
- Handling question search & retrieval
- Sending candidate responses to Vertex AI for evaluation

**Core responsibilities:**
- Initializes Vertex AI using service‑account credentials
- Loads `questions_with_vectors.json` as an in‑memory vector DB
- Exposes REST APIs for frontend consumption

**Main Routes:**

| Method | Endpoint | Purpose |
|------|--------|--------|
| GET | `/filters` | Fetch available topics, difficulties, companies |
| POST | `/search` | Fetch a single best‑matched question |
| POST | `/search-all` | Browse all matching questions |
| GET | `/question/:id` | Load full question by ID |
| POST | `/analyze` | Send code + explanation to Vertex AI |

---

### 🔹 `search.js` – Question Retrieval Logic

- Performs **vector similarity matching** over precomputed embeddings
- Applies filters:
  - Company
  - Difficulty
  - Topic
- Supports both:
  - Best‑match search
  - Full browse results

This design ensures **fast retrieval** without repeated embedding computation.

---

### 🔹 `judge.js` – AI Evaluation Engine

This is the **core intelligence layer**.

Inputs sent to Vertex AI:
- Candidate’s **source code**
- **Speech‑to‑text transcript**
- Question context (`judge_context`)

Outputs generated:
- Overall score (0–100)
- Category breakdown:
  - Correctness
  - Efficiency
  - Communication
- Time & Space complexity analysis
- Optimality judgment
- Improvement suggestions
- Markdown‑formatted summary

The evaluation is **explainable and structured**, not just a raw score.

---

## 🎨 Frontend Architecture (React + Vite)

### 🔹 `App.jsx` – Main Application

The frontend is a **single‑page React application** built for clarity and interview realism.

#### Key UI Sections:

1. **Header & Filters**
   - Topic selector
   - Company selector
   - Difficulty selector
   - Language selector

2. **Code Editor Panel**
   - Monaco Editor
   - Supports JS / Python / C / C++

3. **Question Panel**
   - Renders markdown question description
   - Displays difficulty & metadata

4. **Speech Explanation Module**
   - Uses Web Speech API
   - Live transcript display

5. **AI Evaluation Panel**
   - Scores
   - Complexity analysis
   - Improvement suggestions
   - Markdown‑rendered AI summary

---

### 🔹 Markdown Rendering

AI summaries are returned in **Markdown format** and rendered using `react-markdown` to ensure:
- Bold headings
- Bullet points
- Clean, readable feedback

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
- Easy subject expansion
- Consistent AI judging
- Offline embedding generation

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

## 🎯 Why This Project Stands Out

- Goes beyond code correctness → evaluates **thinking & communication**
- Uses **real interview‑style feedback**, not generic scoring
- Fully **JSON‑driven & scalable**
- Clean separation of concerns
- Industry‑relevant tech stack (Vertex AI, React, Express)

---

## 🔮 Future Enhancements

- User authentication & progress tracking
- Interview session history
- Difficulty‑adaptive questioning
- Resume‑based question personalization
- Deployment on cloud (GCP / Vercel)

---

## 👩‍💻 Author

**Hasini Jaishetty**  
B.Tech – Artificial Intelligence  
NITK Surathkal

---

⭐ If you find this project useful, feel free to star the repository!

