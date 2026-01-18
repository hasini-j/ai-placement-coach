async function handleAnalysis(generativeModel, body) {
    const { code, transcript, questionTitle, judgeContext, isTheory, answer } = body;

    // For theory questions (DBMS, OS, OOPS)
    if (isTheory) {
        const theoryPrompt = {
            contents: [{
                role: 'user',
                parts: [{
                    text: `You are an expert technical interview judge evaluating a candidate's answer to a theory question.
                    
                    Question: ${questionTitle}
                    Expected Answer Points: ${JSON.stringify(judgeContext?.expected_points || judgeContext)}
                    Keywords to look for: ${JSON.stringify(judgeContext?.keywords || [])}
                    
                    Candidate's Answer (Text):
                    ${answer || ''}
                    
                    Candidate's Verbal Explanation:
                    ${transcript || ''}
                    
                    Analyze and evaluate comprehensively. Return ONLY a valid JSON object with this exact structure:
                    {
                        "score": <number 0-100>,
                        "breakdown": {
                            "correctness": <number 0-100>,
                            "completeness": <number 0-100>,
                            "communication": <number 0-100>
                        },
                        "improvements": {
                            "content": [],
                            "communication": [],
                            "missing_points": []
                        },
                        "feedback": "",
                        "report": ""
                    }`
                }]
            }],
            generationConfig: {
                responseMimeType: "application/json",
            }
        };

        const result = await generativeModel.generateContent(theoryPrompt);
        const response = await result.response;
        const evaluation = JSON.parse(response.candidates[0].content.parts[0].text);

        return evaluation;
    }

    // For coding questions (DSA) - original logic
    const prompt = {
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
                        "optimal": <boolean>
                    },
                    "improvements": {
                        "code": [],
                        "communication": [],
                        "approach": ""
                    },
                    "feedback": "",
                    "report": ""
                }`
            }]
        }],
        generationConfig: {
            responseMimeType: "application/json",
        }
    };

    const result = await generativeModel.generateContent(prompt);
    const response = await result.response;
    const evaluation = JSON.parse(response.candidates[0].content.parts[0].text);

    // Validation
    if (!evaluation.complexity || !evaluation.improvements) {
        evaluation.complexity = evaluation.complexity || { time: "N/A", space: "N/A", optimal: false };
        evaluation.improvements = evaluation.improvements || { code: [], communication: [], approach: "N/A" };
    }

    return evaluation;
}

module.exports = { handleAnalysis };
