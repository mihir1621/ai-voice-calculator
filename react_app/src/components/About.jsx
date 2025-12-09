import React from 'react';

const About = ({ onClose }) => {
    return (
        <div className="currency-converter-container fade-in-slide" style={{ overflowY: 'auto', maxHeight: '70vh' }}>
            <div className="header" style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '1.4rem' }}>About Us</h2>
            </div>

            <div className="currency-card" style={{ textAlign: 'left', padding: '20px', lineHeight: '1.6' }}>
                <h3 style={{ marginTop: 0, color: 'var(--accent-bg)', textAlign: 'center' }}>Not Just A Calculator</h3>
                <p style={{ fontStyle: 'italic', textAlign: 'center', opacity: 0.8, marginBottom: '20px' }}>
                    "Experience the future of computation where your voice drives the math."
                </p>

                <p>
                    Ordinary calculators force you to type. We believe you should just <strong>ask</strong>. The <strong>AI Voice Calculator</strong> bridges the gap between human thought and digital processing, offering an experience that static calculators simply cannot match.
                </p>

                <h4 style={{ color: 'var(--text-color)', marginTop: '20px', borderBottom: '1px solid var(--display-border)', paddingBottom: '5px' }}>🚀 What Makes Us Different?</h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
                    <div>
                        <strong>🗣️ True Voice Intelligence</strong>
                        <div style={{ fontSize: '0.9rem', opacity: 0.85 }}>
                            Unlike traditional apps where you peck at keys, here you command. Say <em>"50 plus 20 percent"</em> or <em>"Convert 100 dollars to rupees"</em> and watch it happen instantly. It understands <strong>English, Hindi, and Marathi</strong> context.
                        </div>
                    </div>

                    <div>
                        <strong>🧠 Contextual Awareness</strong>
                        <div style={{ fontSize: '0.9rem', opacity: 0.85 }}>
                            It doesn't just calculate; it listens. Open tools like the <strong>Scientific Mode</strong>, <strong>Age Calculator</strong>, or <strong>Unit Converters</strong> purely with your voice. No digging through complex menus.
                        </div>
                    </div>

                    <div>
                        <strong>⚡ All-in-One Powerhouse</strong>
                        <div style={{ fontSize: '0.9rem', opacity: 0.85 }}>
                            Why download 5 apps when one does it all?
                            <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                                <li><strong>Advanced Converters:</strong> Currency (Real-time), Area, Length, Volume, Temperature, Time.</li>
                                <li><strong>Date Engine:</strong> Calculate age or days between dates instantly.</li>
                                <li><strong>Scientific Suite:</strong> Trigonometry, Logarithms, and Powers at your fingertips.</li>
                            </ul>
                        </div>
                    </div>

                    <div>
                        <strong>🎨 Your Personal Workspace</strong>
                        <div style={{ fontSize: '0.9rem', opacity: 0.85 }}>
                            Bored of grey screens? Customize your experience with <strong>Video Backgrounds</strong> and dynamic <strong>Dark/Light themes</strong>. Your calculator should look as good as it works.
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: '25px', padding: '15px', background: 'var(--btn-action-bg)', borderRadius: '8px', borderLeft: '4px solid var(--accent-bg)' }}>
                    <strong style={{ color: 'var(--accent-text-color)' }}>💡 The AI Promise</strong>
                    <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem' }}>
                        We are building more than a tool; we are building an assistant. Whether you are a student solving algebra or a professional calculating invoices, let AI handle the heavy lifting while you focus on the results.
                    </p>
                </div>

                <button
                    onClick={onClose}
                    className="currency-swap-btn"
                    style={{ width: '100%', marginTop: '20px', padding: '10px', borderRadius: '8px' }}
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default About;
