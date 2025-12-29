import React, { useState, useEffect, useMemo } from 'react';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

function App() {
  const [code, setCode] = useState("// Write your solution here");
  const [language, setLanguage] = useState("javascript"); // NEW: Language selector
  const [question, setQuestion] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState(""); 
  const [analysisResult, setAnalysisResult] = useState(null);

  // NEW: Browse all questions tab
  const [showBrowse, setShowBrowse] = useState(false);
  const [allQuestions, setAllQuestions] = useState([]);

  // Filters
  const [company, setCompany] = useState("All");
  const [difficulty, setDifficulty] = useState("All");
  const [topic, setTopic] = useState("All");
  const [topics, setTopics] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [difficulties, setDifficulties] = useState([]);

  // Language configurations
  const languageConfig = {
    javascript: { name: "javascript", comment: "// Write your solution here" },
    python: { name: "python", comment: "# Write your solution here" },
    cpp: { name: "cpp", comment: "// Write your solution here" },
    c: { name: "c", comment: "// Write your solution here" }
  };

  // --- WEB SPEECH API LOGIC ---
  const recognition = useMemo(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;
    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    return rec;
  }, []);

  useEffect(() => {
    if (!recognition) return;

    recognition.onresult = (event) => {
      const current = Array.from(event.results)
        .map(result => result[0].transcript)
        .join("");
      setTranscript(current);
    };

    recognition.onerror = (event) => {
      console.error("Speech error:", event.error);
      setIsRecording(false);
    };
  }, [recognition]);

  const toggleRecording = () => {
    if (!recognition) return alert("Speech recognition not supported in this browser.");
    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
    } else {
      setTranscript("");
      recognition.start();
      setIsRecording(true);
    }
  };

  // Change language handler
  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    setCode(languageConfig[newLang].comment);
  };

  // Fetch a random question
  const fetchProblem = async () => {
    setStatus("Loading...");
    setShowBrowse(false);
    try {
      const res = await axios.post('http://localhost:3000/search', {
        query: "technical interview question",
        companyFilter: company,
        difficultyFilter: difficulty,
        topicFilter: topic
      });
      setQuestion(res.data);
      setAnalysisResult(null); // Clear previous analysis
      setStatus("Question Loaded");
    } catch (err) {
      alert("No question found for these filters!");
      setStatus("Error");
    }
  };

  // NEW: Fetch all matching questions
  const fetchAllQuestions = async () => {
    setStatus("Loading all questions...");
    setShowBrowse(true);
    try {
      const res = await axios.post('http://localhost:3000/search-all', {
        query: "technical interview question",
        companyFilter: company,
        difficultyFilter: difficulty,
        topicFilter: topic
      });
      setAllQuestions(res.data);
      setStatus(`Found ${res.data.length} questions`);
    } catch (err) {
      alert("Failed to load questions!");
      setStatus("Error");
    }
  };

  // NEW: Load specific question by ID
  const loadQuestionById = async (questionId) => {
    setStatus("Loading question...");
    try {
      const res = await axios.get(`http://localhost:3000/question/${questionId}`);
      setQuestion(res.data);
      setAnalysisResult(null); // Clear previous analysis
      setShowBrowse(false); // Go back to main view
      setStatus("Question Loaded");
    } catch (err) {
      alert("Failed to load question!");
      setStatus("Error");
    }
  };

  const submitAnalysis = async () => {
    if (!question) return alert("Please load a question first!");
    
    setStatus("AI is analyzing ..."); 
    
    try {
      const response = await axios.post('http://localhost:3000/analyze', {
        code: code,
        transcript: transcript,
        questionTitle: question.title,
        judgeContext: question.judge_context
      });

      const result = response.data;
      setAnalysisResult(result);
      setStatus("Analysis Complete!");
    } catch (err) {
      console.error(err);
      setStatus("Analysis failed.");
      alert(
        err.response?.data?.details ||
        "Analysis failed due to Vertex AI response error"
      );
    }
  };

  useEffect(() => {
    axios.get("http://localhost:3000/filters")
      .then(res => {
        setCompanies(res.data.companies);
        setDifficulties(res.data.difficulties);
        setTopics(res.data.topics);
      })
      .catch(err => {
        console.error("Failed to load topics", err);
      });
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'Segoe UI, sans-serif' }}>
      
      <header style={{ padding: '10px 20px', background: '#1a73e8', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>🤖 AI Placement Coach</h1>
        
        <div>
          {/* Language Selector */}
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            style={{ marginRight: '10px', padding: '5px', fontWeight: 'bold' }}
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="cpp">C++</option>
            <option value="c">C</option>
          </select>

          <select
            onChange={(e) => setTopic(e.target.value)}
            style={{ marginRight: '10px', padding: '5px' }}
          >
            <option value="All">All Topics</option>
            {topics.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <select onChange={(e) => setCompany(e.target.value)} style={{ marginRight: '10px', padding: '5px' }}>
            <option value="All">All Companies</option>
            {companies.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          
          <select onChange={(e) => setDifficulty(e.target.value)} style={{ marginRight: '10px', padding: '5px' }}>
            <option value="All">All Levels</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
          
          <button onClick={fetchProblem} style={{ padding: '5px 15px', cursor: 'pointer', fontWeight: 'bold', marginRight: '5px' }}>
            Load Random Question
          </button>
          
          <button onClick={fetchAllQuestions} style={{ padding: '5px 15px', cursor: 'pointer', fontWeight: 'bold', background: '#34a853', color: 'white', border: 'none', borderRadius: '3px' }}>
            Browse All
          </button>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', height: '100%' }}>
        <div style={{ height:'100%', width: '60%', borderRight: '1px solid #0b0a0aff' }}>
          <Editor 
            height="100%" 
            width="100%" 
            defaultLanguage={language} 
            language={language}
            theme="vs-dark" 
            value={code} 
            onChange={(v) => setCode(v)} 
          />
        </div>

        <div style={{ width: '40%', padding: '20px', overflowY: 'auto', backgroundColor: '#f8f9fa' }}>
          
          {/* BROWSE ALL QUESTIONS VIEW */}
          {showBrowse ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h2 style={{ color: '#1a73e8', margin: 0 }}>📚 Browse Questions</h2>
                <button 
                  onClick={() => setShowBrowse(false)} 
                  style={{ padding: '8px 15px', cursor: 'pointer', background: '#d93025', color: 'white', border: 'none', borderRadius: '5px' }}
                >
                  ← Back
                </button>
              </div>
              
              <p style={{ color: '#666', marginBottom: '20px' }}>{status}</p>
              
              {allQuestions.length === 0 ? (
                <p>No questions found. Try different filters.</p>
              ) : (
                <div>
                  {allQuestions.map((q, idx) => (
                    <div 
                      key={q.id}
                      onClick={() => loadQuestionById(q.id)}
                      style={{
                        padding: '15px',
                        marginBottom: '10px',
                        background: 'white',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'}
                      onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ margin: '0 0 8px 0', color: '#1a73e8' }}>
                            {idx + 1}. {q.title}
                          </h4>
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                            <span style={{ 
                              background: q.difficulty === 'Easy' ? '#d4edda' : q.difficulty === 'Medium' ? '#fff3cd' : '#f8d7da',
                              color: q.difficulty === 'Easy' ? '#155724' : q.difficulty === 'Medium' ? '#856404' : '#721c24',
                              padding: '3px 8px', 
                              borderRadius: '4px', 
                              fontSize: '0.75rem',
                              fontWeight: 'bold'
                            }}>
                              {q.difficulty}
                            </span>
                            {q.topics && q.topics.slice(0, 2).map(topic => (
                              <span key={topic} style={{ 
                                background: '#e8f0fe', 
                                color: '#1967d2', 
                                padding: '3px 8px', 
                                borderRadius: '4px', 
                                fontSize: '0.75rem' 
                              }}>
                                {topic}
                              </span>
                            ))}
                          </div>
                          {q.companies && q.companies.length > 0 && (
                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>
                              💼 {q.companies.slice(0, 3).join(', ')}
                              {q.companies.length > 3 && ` +${q.companies.length - 3} more`}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* MAIN QUESTION VIEW */
            question ? (
              <>
                <h2 style={{ color: '#1a73e8' }}>{question.title}</h2>
                <span style={{ background: '#e8f0fe', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', color:'grey' }}>
                  {question.metadata.difficulty}
                </span>
        
                <div style={{ marginTop: '20px', color: 'black' }}>
                  <ReactMarkdown>
                    {question.display_markdown}
                  </ReactMarkdown>
                </div>
                
                <hr style={{ margin: '30px 0' }} />
                
                <h3 style={{ color:'grey' }}>Explain your approach</h3>
                <button 
                  onClick={toggleRecording} 
                  style={{ 
                    padding: '10px', 
                    width: '100%', 
                    background: isRecording ? '#d93025' : '#1a73e8', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '5px', 
                    cursor: 'pointer' 
                  }}
                >
                  {isRecording ? "🛑 Stop Recording" : "🎤 Start Explaining"}
                </button>
                
                <div style={{ 
                  marginTop: '15px', 
                  padding: '15px', 
                  background: 'white', 
                  border: '1px solid #ddd', 
                  minHeight: '100px', 
                  borderRadius: '5px' 
                }}>
                  <em style={{ color: '#666' }}>{transcript || "Your speech will appear here..."}</em>
                </div>

                <div style={{ color: '#1a73e8', fontWeight: 'bold', margin: '10px 0' }}>{status}</div>

                <button 
                  onClick={submitAnalysis} 
                  style={{ 
                    marginTop: '10px', 
                    width: '100%', 
                    padding: '15px', 
                    background: '#188038', 
                    color: 'white', 
                    border: 'none', 
                    fontWeight: 'bold', 
                    fontSize: '1rem', 
                    cursor: 'pointer', 
                    borderRadius: '5px' 
                  }}
                >
                  Submit for AI Review
                </button>

                {analysisResult && (
                  <div style={{
                    marginTop: '20px',
                    color: 'black',
                    padding: '20px',
                    background: '#ffffff',
                    border: '1px solid #ddd',
                    borderRadius: '8px'
                  }}>
                    <h3 style={{ color: '#188038' }}>Interview Evaluation</h3>

                    <p><strong>Overall Score:</strong> {analysisResult.score}/100</p>

                    <ul>
                      <li>✅ Correctness: {analysisResult.breakdown?.correctness || 0}%</li>
                      <li>⚡ Efficiency: {analysisResult.breakdown?.efficiency || 0}%</li>
                      <li>🗣️ Communication: {analysisResult.breakdown?.communication || 0}%</li>
                    </ul>

                    {analysisResult.complexity && (
                      <div style={{
                        marginTop: '15px',
                        padding: '15px',
                        background: '#f8f9fa',
                        borderRadius: '6px',
                        border: '1px solid #e0e0e0'
                      }}>
                        <h4 style={{ marginTop: 0, color: '#1967d2' }}>⏱️ Complexity Analysis</h4>
                        <div style={{ marginLeft: '10px' }}>
                          <p><strong>Time Complexity:</strong> {analysisResult.complexity.time}</p>
                          <p><strong>Space Complexity:</strong> {analysisResult.complexity.space}</p>
                          {analysisResult.complexity.optimal !== undefined && (
                            <p>
                              <strong>Solution Status:</strong>{' '}
                              <span style={{
                                color: analysisResult.complexity.optimal ? '#188038' : '#d93025',
                                fontWeight: 'bold'
                              }}>
                                {analysisResult.complexity.optimal ? '✓ Optimal' : '⚠ Can be optimized'}
                              </span>
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {analysisResult.improvements && (
                      <div style={{
                        marginTop: '15px',
                        padding: '15px',
                        background: '#fff4e5',
                        borderRadius: '6px',
                        border: '1px solid #ffd666'
                      }}>
                        <h4 style={{ marginTop: 0, color: '#f57c00' }}>🔧 Areas for Improvement</h4>
                        
                        {analysisResult.improvements.code && analysisResult.improvements.code.length > 0 && (
                          <div style={{ marginBottom: '12px' }}>
                            <strong>Code Improvements:</strong>
                            <ul style={{ marginTop: '5px', marginBottom: '5px' }}>
                              {analysisResult.improvements.code.map((improvement, index) => (
                                <li key={index}>{improvement}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {analysisResult.improvements.communication && analysisResult.improvements.communication.length > 0 && (
                          <div style={{ marginBottom: '12px' }}>
                            <strong>Communication Improvements:</strong>
                            <ul style={{ marginTop: '5px', marginBottom: '5px' }}>
                              {analysisResult.improvements.communication.map((improvement, index) => (
                                <li key={index}>{improvement}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {analysisResult.improvements.approach && 
                         analysisResult.improvements.approach !== 'Current approach is optimal' && (
                          <div>
                            <strong>Alternative Approach:</strong>
                            <p style={{ marginTop: '5px', marginLeft: '10px', fontStyle: 'italic' }}>
                              {analysisResult.improvements.approach}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {analysisResult.report && (
                      <div style={{ marginTop: '15px' }}>
                        <h4>📊 AI Summary</h4>
                        <p style={{ 
                          background: '#e8f5e9', 
                          padding: '12px', 
                          borderRadius: '6px',
                          borderLeft: '4px solid #188038'
                        }}>
                          {analysisResult.report}
                        </p>
                      </div>
                    )}

                    <div style={{ marginTop: '15px' }}>
                      <h4>💡 Detailed Feedback</h4>
                      <p style={{ lineHeight: '1.6' }}>{analysisResult.feedback}</p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div style={{ textAlign: 'center', marginTop: '100px', color: '#333' }}>
                <h3>Ready to practice?</h3>
                <p>Select your filters above and click "Load Random Question" or "Browse All".</p>
                <p style={{ color: '#666' }}>{status}</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default App;