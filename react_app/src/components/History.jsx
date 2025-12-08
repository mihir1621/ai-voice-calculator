import React from 'react';

const History = ({ history, onClose, onSelect }) => {
    return (
        <div className="history-container fade-in-slide" style={{ width: '100%', height: '100%' }}>


            <div className="history-list" style={{
                maxHeight: '400px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                paddingRight: '5px'
            }}>
                {history.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        color: 'var(--text-color)',
                        opacity: 0.6,
                        padding: '20px'
                    }}>
                        No history yet.
                    </div>
                ) : (
                    history.map((item, index) => (
                        <div key={index}
                            className="history-item"
                            onClick={() => onSelect && onSelect(item.result)}
                        >
                            <span style={{
                                fontSize: '0.9rem',
                                color: 'var(--text-color)',
                                opacity: 0.7
                            }}>
                                {item.expression} =
                            </span>
                            <span style={{
                                fontSize: '1.2rem',
                                fontWeight: 'bold',
                                color: 'var(--text-color)'
                            }}>
                                {item.result}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default History;
