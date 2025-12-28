import React, { useState, useEffect, useMemo } from 'react';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

function App() {
  const [code, setCode] = useState("// Write your solution here");
  const [question, setQuestion] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState(""); 
  const [analysisResult, setAnalysisResult] = useState(null);

  // Filters
  const [company, setCompany] = useState("All");
  const [difficulty, setDifficulty] = useState("All");
  const [topic, setTopic] = useState("All");
  const [topics, setTopics] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [difficulties, setDifficulties] = useState([]);

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

  const fetchProblem = async () => {
    setStatus("Loading...");
    try {
      const res = await axios.post('http://localhost:3000/search', {
        query: "technical interview question",
        companyFilter: company,
        difficultyFilter: difficulty,
        topicFilter: topic
      });
      setQuestion(res.data);
      setStatus("Question Loaded");
    } catch (err) {
      alert("No question found for these filters!");
      setStatus("Error");
    }
  };

  // --- CHANGED PART: SUBMIT ANALYSIS FOR VERTEX AI ---
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
      
      // VERTEX AI REPORT POPUP
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
          
          <button onClick={fetchProblem} style={{ padding: '5px 15px', cursor: 'pointer', fontWeight: 'bold' }}>Load Question</button>
        </div>
      </header>

       <div style={{ display: 'flex', flex: 1, overflow: 'hidden', height: '100%' }}>
        <div style={{ height:'100%', width: '60%', borderRight: '1px solid #0b0a0aff' }}>
          <Editor height="100%" width="100%" defaultLanguage="javascript" theme="vs-dark" value={code} onChange={(v) => setCode(v)} />
        </div>

        <div style={{ width: '40%', padding: '20px', overflowY: 'auto', backgroundColor: '#f8f9fa' }}>
          {question ? (
            <>
              <h2 style={{ color: '#1a73e8' }}>{question.title}</h2>
              <span style={{ background: '#e8f0fe', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', color:'grey' }}>{question.metadata.difficulty}</span>
      
              <div style={{ marginTop: '20px', color: 'black' }}>
                <ReactMarkdown>
                  {question.display_markdown}
                </ReactMarkdown>
              </div>
              
              <hr style={{ margin: '30px 0' }} />
              
              <h3 style={{ color:'grey' }}>Explain your approach</h3>
              <button 
                onClick={toggleRecording} 
                style={{ padding: '10px', width: '100%', background: isRecording ? '#d93025' : '#1a73e8', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
              >
                {isRecording ? "🛑 Stop Recording" : "🎤 Start Explaining"}
              </button>
              
              <div style={{ marginTop: '15px', padding: '15px', background: 'white', border: '1px solid #ddd', minHeight: '100px', borderRadius: '5px' }}>
                <em style={{ color: '#666' }}>{transcript || "Your speech will appear here..."}</em>
              </div>

              <div style={{ color: '#1a73e8', fontWeight: 'bold', margin: '10px 0' }}>{status}</div>

              <button 
                onClick={submitAnalysis} 
                style={{ marginTop: '10px', width: '100%', padding: '15px', background: '#188038', color: 'white', border: 'none', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', borderRadius: '5px' }}
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

    {/* Complexity Analysis Section */}
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
          <p>
            <strong>Time Complexity:</strong> {analysisResult.complexity.time}
          </p>
          <p>
            <strong>Space Complexity:</strong> {analysisResult.complexity.space}
          </p>
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

    {/* Improvements Section */}
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

    {/* Report Summary */}
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

    {/* Detailed Feedback */}
    <div style={{ marginTop: '15px' }}>
      <h4>💡 Detailed Feedback</h4>
      <p style={{ lineHeight: '1.6' }}>{analysisResult.feedback}</p>
    </div>

  </div>
)}


            </>
          ) : (
            <div style={{ textAlign: 'center', marginTop: '100px' ,  color: '#333' }}>
              <h3>Ready to practice?</h3>
              <p>Select your filters above and click "Load Question".</p>
              <p style={{ color: '#666' }}>{status}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default App;