import React from 'react';

function HomePage({ onSelectSubject }) {
    const subjects = [
        {
            id: 'dsa',
            name: 'Data Structures & Algorithms',
            icon: '💻',
            description: 'Practice coding problems with AI-powered evaluation',
            color: '#1a73e8'
        },
        {
            id: 'dbms',
            name: 'Database Management Systems',
            icon: '🗄️',
            description: 'Master database concepts and SQL',
            color: '#34a853'
        },
        {
            id: 'os',
            name: 'Operating Systems',
            icon: '⚙️',
            description: 'Learn OS concepts and processes',
            color: '#ea4335'
        },
        {
            id: 'oops',
            name: 'Object-Oriented Programming',
            icon: '🎯',
            description: 'Understand OOP principles and design patterns',
            color: '#fbbc04'
        }
    ];

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }}>
            <div style={{ textAlign: 'center', marginBottom: '60px', color: 'white' }}>
                <h1 style={{ fontSize: '3rem', margin: '0 0 10px 0', fontWeight: 'bold' }}>
                    🤖 AI Placement Coach
                </h1>
                <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>
                    Choose your subject and start practicing for technical interviews
                </p>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '30px',
                maxWidth: '900px',
                width: '100%'
            }}>
                {subjects.map(subject => (
                    <div
                        key={subject.id}
                        onClick={() => onSelectSubject(subject.id)}
                        style={{
                            background: 'white',
                            borderRadius: '16px',
                            padding: '30px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                            border: `3px solid transparent`,
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-8px)';
                            e.currentTarget.style.boxShadow = '0 12px 20px rgba(0,0,0,0.15)';
                            e.currentTarget.style.borderColor = subject.color;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                            e.currentTarget.style.borderColor = 'transparent';
                        }}
                    >
                        <div style={{
                            fontSize: '4rem',
                            marginBottom: '20px',
                            textAlign: 'center'
                        }}>
                            {subject.icon}
                        </div>
                        <h2 style={{
                            fontSize: '1.5rem',
                            margin: '0 0 10px 0',
                            color: '#333',
                            textAlign: 'center'
                        }}>
                            {subject.name}
                        </h2>
                        <p style={{
                            fontSize: '0.95rem',
                            color: '#666',
                            lineHeight: '1.5',
                            textAlign: 'center',
                            margin: 0
                        }}>
                            {subject.description}
                        </p>

                        <div style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: '4px',
                            background: subject.color
                        }} />
                    </div>
                ))}
            </div>

            <div style={{
                marginTop: '60px',
                textAlign: 'center',
                color: 'white',
                opacity: 0.8,
                fontSize: '0.9rem'
            }}>
                <p>Powered by Google Vertex AI • Real-time AI Feedback • Speech-to-Text</p>
            </div>
        </div>
    );
}

export default HomePage;
