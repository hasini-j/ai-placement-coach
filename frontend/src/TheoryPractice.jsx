import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

function TheoryPractice({ subject, onBackToHome }) {
    const [question, setQuestion] = useState(null);
    const [textAnswer, setTextAnswer] = useState('');
    const [transcript, setTranscript] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [status, setStatus] = useState('');
    const [analysisResult, setAnalysisResult] = useState(null);

    // Filters
    const [topic, setTopic] = useState('All');
    const [difficulty, setDifficulty] = useState('All');
    const [topics, setTopics] = useState([]);
    const [difficulties, setDifficulties] = useState([]);

    // Audio recording
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [audioChunks, setAudioChunks] = useState([]);

    const subjectNames = {
        dbms: 'Database Management Systems',
        os: 'Operating Systems',
        oops: 'Object-Oriented Programming'
    };

    // Load filters
    useEffect(() => {
        axios.get(`http://localhost:3000/filters/${subject}`)
            .then(res => {
                setTopics(res.data.topics);
                setDifficulties(res.data.difficulties);
            })
            .catch(err => console.error('Failed to load filters', err));
    }, [subject]);

    // Fetch random question
    const fetchQuestion = async () => {
        setStatus('Loading question...');
        try {
            const res = await axios.post(`http://localhost:3000/search/${subject}`, {
                query: 'technical interview question',
                difficultyFilter: difficulty,
                topicFilter: topic
            });
            setQuestion(res.data);
            setTextAnswer('');
            setTranscript('');
            setAnalysisResult(null);
            setStatus('Question loaded');
        } catch (err) {
            alert('No question found for these filters!');
            setStatus('Error');
        }
    };

    // Start recording audio
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });

            const chunks = [];
            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunks.push(e.data);
                }
            };

            recorder.onstop = async () => {
                const audioBlob = new Blob(chunks, { type: 'audio/webm' });
                await transcribeAudio(audioBlob);
                stream.getTracks().forEach(track => track.stop());
            };

            setAudioChunks(chunks);
            setMediaRecorder(recorder);
            recorder.start();
            setIsRecording(true);
            setStatus('Recording...');
        } catch (err) {
            console.error('Microphone error:', err);
            alert('Could not access microphone. Please check permissions.');
        }
    };

    // Stop recording
    const stopRecording = () => {
        if (mediaRecorder && isRecording) {
            mediaRecorder.stop();
            setIsRecording(false);
            setStatus('Transcribing...');
        }
    };

    // Transcribe audio using backend STT
    const transcribeAudio = async (audioBlob) => {
        try {
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = async () => {
                const base64Audio = reader.result.split(',')[1];

                const response = await axios.post('http://localhost:3000/transcribe', {
                    audio: base64Audio
                });

                setTranscript(response.data.transcription);
                setStatus('Transcription complete');
            };
        } catch (err) {
            console.error('Transcription error:', err);
            setStatus('Transcription failed');
            alert('Failed to transcribe audio. Please try again.');
        }
    };

    // Submit for AI evaluation
    const submitAnalysis = async () => {
        if (!question) return alert('Please load a question first!');
        if (!textAnswer && !transcript) {
            return alert('Please provide an answer (text or speech)!');
        }

        setStatus('AI is analyzing...');

        try {
            const response = await axios.post('http://localhost:3000/analyze', {
                isTheory: true,
                answer: textAnswer,
                transcript: transcript,
                questionTitle: question.question,
                judgeContext: {
                    expected_points: question.expected_points,
                    keywords: question.keywords,
                    reference_answer: question.reference_answer
                }
            });

            setAnalysisResult(response.data);
            setStatus('Analysis complete!');
        } catch (err) {
            console.error(err);
            setStatus('Analysis failed');
            alert('Analysis failed. Please try again.');
        }
    };

    // Load next question
    const nextQuestion = () => {
        fetchQuestion();
    };

    // End session
    const endSession = () => {
        onBackToHome();
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'Segoe UI, sans-serif' }}>

            {/* Header */}
            <header style={{
                padding: '15px 20px',
                background: '#34a853',
                color: 'white',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <h1 style={{ margin: 0, fontSize: '1.5rem' }}>
                    📚 {subjectNames[subject]}
                </h1>

                <div>
                    <select
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        style={{ marginRight: '10px', padding: '5px' }}
                    >
                        <option value="All">All Topics</option>
                        {topics.map(t => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>

                    <select
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value)}
                        style={{ marginRight: '10px', padding: '5px' }}
                    >
                        <option value="All">All Levels</option>
                        {difficulties.map(d => (
                            <option key={d} value={d}>{d}</option>
                        ))}
                    </select>

                    <button
                        onClick={fetchQuestion}
                        style={{
                            padding: '5px 15px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            marginRight: '10px',
                            background: 'white',
                            color: '#34a853',
                            border: 'none',
                            borderRadius: '4px'
                        }}
                    >
                        Get Question
                    </button>

                    <button
                        onClick={endSession}
                        style={{
                            padding: '5px 15px',
                            cursor: 'pointer',
                            background: '#d93025',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontWeight: 'bold'
                        }}
                    >
                        End Session
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

                {/* Question and Input Panel */}
                <div style={{ width: '50%', padding: '20px', overflowY: 'auto', backgroundColor: '#f8f9fa' }}>

                    {question ? (
                        <>
                            <h2 style={{ color: '#34a853', marginTop: 0 }}>{question.question}</h2>

                            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                                <span style={{
                                    background: question.difficulty === 'Easy' ? '#d4edda' :
                                        question.difficulty === 'Medium' ? '#fff3cd' : '#f8d7da',
                                    color: question.difficulty === 'Easy' ? '#155724' :
                                        question.difficulty === 'Medium' ? '#856404' : '#721c24',
                                    padding: '5px 12px',
                                    borderRadius: '4px',
                                    fontSize: '0.85rem',
                                    fontWeight: 'bold'
                                }}>
                                    {question.difficulty}
                                </span>
                                <span style={{
                                    background: '#e8f0fe',
                                    color: '#1967d2',
                                    padding: '5px 12px',
                                    borderRadius: '4px',
                                    fontSize: '0.85rem'
                                }}>
                                    {question.topic}
                                </span>
                            </div>

                            <hr style={{ margin: '20px 0' }} />

                            <h3 style={{ color: '#666' }}>Your Answer</h3>

                            <textarea
                                value={textAnswer}
                                onChange={(e) => setTextAnswer(e.target.value)}
                                placeholder="Type your answer here..."
                                style={{
                                    width: '100%',
                                    minHeight: '150px',
                                    padding: '15px',
                                    border: '1px solid #ddd',
                                    borderRadius: '5px',
                                    fontSize: '1rem',
                                    fontFamily: 'inherit',
                                    resize: 'vertical'
                                }}
                            />

                            <h3 style={{ color: '#666', marginTop: '30px' }}>Or Explain Verbally</h3>

                            <button
                                onClick={isRecording ? stopRecording : startRecording}
                                style={{
                                    padding: '12px',
                                    width: '100%',
                                    background: isRecording ? '#d93025' : '#34a853',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    fontSize: '1rem'
                                }}
                            >
                                {isRecording ? '🛑 Stop Recording' : '🎤 Start Recording'}
                            </button>

                            {transcript && (
                                <div style={{
                                    marginTop: '15px',
                                    padding: '15px',
                                    background: 'white',
                                    border: '1px solid #ddd',
                                    borderRadius: '5px'
                                }}>
                                    <strong style={{ color: '#333' }}>Transcription:</strong>
                                    <p style={{ margin: '10px 0 0 0', lineHeight: '1.6', color: '#333' }}>{transcript}</p>
                                </div>
                            )}

                            <div style={{ color: '#34a853', fontWeight: 'bold', margin: '15px 0' }}>
                                {status}
                            </div>

                            <button
                                onClick={submitAnalysis}
                                style={{
                                    marginTop: '10px',
                                    width: '100%',
                                    padding: '15px',
                                    background: '#1a73e8',
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
                                <button
                                    onClick={nextQuestion}
                                    style={{
                                        marginTop: '10px',
                                        width: '100%',
                                        padding: '15px',
                                        background: '#fbbc04',
                                        color: 'white',
                                        border: 'none',
                                        fontWeight: 'bold',
                                        fontSize: '1rem',
                                        cursor: 'pointer',
                                        borderRadius: '5px'
                                    }}
                                >
                                    Next Question →
                                </button>
                            )}
                        </>
                    ) : (
                        <div style={{ textAlign: 'center', marginTop: '100px', color: '#666' }}>
                            <h3>Ready to practice?</h3>
                            <p>Select your filters and click "Get Question" to start.</p>
                            <p style={{ color: '#999' }}>{status}</p>
                        </div>
                    )}
                </div>

                {/* Feedback Panel */}
                <div style={{ width: '50%', padding: '20px', overflowY: 'auto', backgroundColor: '#fff' }}>

                    {analysisResult ? (
                        <div>
                            <h2 style={{ color: '#188038', marginTop: 0 }}>AI Evaluation</h2>

                            <div style={{
                                padding: '20px',
                                background: '#f8f9fa',
                                borderRadius: '8px',
                                marginBottom: '20px'
                            }}>
                                <h3 style={{ margin: '0 0 15px 0', color: '#000' }}>
                                    Score: {analysisResult.score}/100
                                </h3>

                                <ul style={{ lineHeight: '2', color: '#000' }}>
                                    <li>✅ Correctness: {analysisResult.breakdown?.correctness || 0}%</li>
                                    <li>📋 Completeness: {analysisResult.breakdown?.completeness || 0}%</li>
                                    <li>🗣️ Communication: {analysisResult.breakdown?.communication || 0}%</li>
                                </ul>
                            </div>

                            {analysisResult.improvements && (
                                <div style={{
                                    padding: '15px',
                                    background: '#fff4e5',
                                    borderRadius: '6px',
                                    border: '1px solid #ffd666',
                                    marginBottom: '20px'
                                }}>
                                    <h4 style={{ marginTop: 0, color: '#f57c00' }}>🔧 Areas for Improvement</h4>

                                    {analysisResult.improvements.content && analysisResult.improvements.content.length > 0 && (
                                        <div style={{ marginBottom: '12px' }}>
                                            <strong style={{ color: '#000' }}>Content:</strong>
                                            <ul style={{ marginTop: '5px', color: '#000' }}>
                                                {analysisResult.improvements.content.map((item, idx) => (
                                                    <li key={idx}>{item}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {analysisResult.improvements.missing_points && analysisResult.improvements.missing_points.length > 0 && (
                                        <div style={{ marginBottom: '12px' }}>
                                            <strong style={{ color: '#000' }}>Missing Points:</strong>
                                            <ul style={{ marginTop: '5px', color: '#000' }}>
                                                {analysisResult.improvements.missing_points.map((item, idx) => (
                                                    <li key={idx}>{item}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {analysisResult.improvements.communication && analysisResult.improvements.communication.length > 0 && (
                                        <div>
                                            <strong style={{ color: '#000' }}>Communication:</strong>
                                            <ul style={{ marginTop: '5px', color: '#000' }}>
                                                {analysisResult.improvements.communication.map((item, idx) => (
                                                    <li key={idx}>{item}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}

                            {analysisResult.report && (
                                <div style={{ marginBottom: '20px' }}>
                                    <h4 style={{ color: '#000' }}>📊 AI Summary</h4>
                                    <div style={{
                                        background: '#e8f5e9',
                                        padding: '12px',
                                        borderRadius: '6px',
                                        borderLeft: '4px solid #188038',
                                        color: '#000'
                                    }}>
                                        <ReactMarkdown>{analysisResult.report}</ReactMarkdown>
                                    </div>
                                </div>
                            )}

                            <div>
                                <h4 style={{ color: '#000' }}>💡 Detailed Feedback</h4>
                                <p style={{ lineHeight: '1.6', color: '#000' }}>{analysisResult.feedback}</p>
                            </div>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', marginTop: '100px', color: '#999' }}>
                            <h3>AI Feedback</h3>
                            <p>Submit your answer to receive AI-powered feedback and evaluation.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default TheoryPractice;
