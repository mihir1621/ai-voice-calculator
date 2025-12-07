import React from 'react';
import { jsPDF } from 'jspdf';

const History = ({ history, onSelect, onClose, onClear, isOpen }) => {

    const exportPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text("Calculation History", 10, 10);
        doc.setFontSize(12);

        let y = 20;
        history.forEach((item, index) => {
            const line = `${item.expression} = ${item.result}`;
            // Simple pagination check
            if (y > 280) {
                doc.addPage();
                y = 10;
            }
            doc.text(line, 10, y);
            y += 10;
        });

        doc.save("calculator_history.pdf");
    };

    const exportCSV = () => {
        const csvContent = "data:text/csv;charset=utf-8,"
            + "Expression,Result,Timestamp\n"
            + history.map(e => `"${e.expression}","${e.result}","${e.timestamp}"`).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "calculator_history.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className={`history-panel ${isOpen ? 'open' : ''}`}>
            <div className="history-header">
                <h3>History</h3>
                <div className="history-actions">
                    <button onClick={onClear} className="icon-btn" title="Clear History">🗑️</button>
                    <button onClick={onClose} className="icon-btn" title="Close">✕</button>
                </div>
            </div>

            <div className="history-list">
                {history.length === 0 ? (
                    <div className="no-history">No history yet</div>
                ) : (
                    history.slice().reverse().map((item, index) => (
                        <div
                            key={index}
                            className="history-item"
                            onClick={() => onSelect(item.result)}
                            title="Click to use result"
                        >
                            <div className="history-expr">{item.expression}</div>
                            <div className="history-res">= {item.result}</div>
                        </div>
                    ))
                )}
            </div>

            <div className="export-buttons">
                <button onClick={exportPDF} className="btn-small">Export PDF</button>
                <button onClick={exportCSV} className="btn-small">Export CSV</button>
            </div>
        </div>
    );
};

export default History;
