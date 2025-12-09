import React, { useState, useEffect } from 'react';

const TIME_UNITS = [
    { code: 'yr', name: 'Year' },
    { code: 'mo', name: 'Month' },
    { code: 'wk', name: 'Week' },
    { code: 'd', name: 'Day' },
    { code: 'hr', name: 'Hour' },
    { code: 'min', name: 'Minute' },
    { code: 's', name: 'Second' },
    { code: 'ms', name: 'Millisecond' },
    { code: 'us', name: 'Microsecond' }
];

// Conversion factors to Second (Base Unit)
// Using exact standards where possible, and averages for variable units (Year, Month)
const TO_SECOND = {
    'yr': 31557600,   // Julian Year (365.25 days) - Standard in physics/astronomy
    'mo': 2629800,    // Average Month (Year / 12)
    'wk': 604800,
    'd': 86400,
    'hr': 3600,
    'min': 60,
    's': 1,
    'ms': 0.001,
    'us': 0.000001
};

const TimeConverter = ({ onClose }) => {
    const [amount, setAmount] = useState('1');
    const [fromUnit, setFromUnit] = useState('hr');
    const [toUnit, setToUnit] = useState('min');
    const [convertedAmount, setConvertedAmount] = useState(null);

    // Calculate conversion
    useEffect(() => {
        if (amount !== '') {
            const val = parseFloat(amount);
            if (!isNaN(val)) {
                // Convert From -> Second -> To
                const valueInSeconds = val * TO_SECOND[fromUnit];
                const result = valueInSeconds / TO_SECOND[toUnit];

                // Format nicely: Time can have huge or tiny numbers
                // Use slightly more precision for small units
                let formatted;
                if (result % 1 !== 0) {
                    formatted = parseFloat(result.toFixed(9)); // High precision for micro/milli
                } else {
                    formatted = result;
                }
                setConvertedAmount(formatted);
            } else {
                setConvertedAmount('---');
            }
        } else {
            setConvertedAmount(null);
        }
    }, [amount, fromUnit, toUnit]);

    const handleSwap = () => {
        setFromUnit(toUnit);
        setToUnit(fromUnit);
    };

    return (
        <div className="currency-converter-container fade-in-slide">
            {/* Reusing currency-converter-container for consistent layout */}
            <div className="header" style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '1.4rem' }}>Time Converter</h2>
            </div>

            <div className="currency-card"> {/* Reusing currency CSS classes for identical look */}
                <div className="currency-input-group">
                    <label>Time</label>
                    <input
                        className="currency-input"
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Enter time"
                    />
                </div>

                <div className="currency-row">
                    <div style={{ flex: 1 }}>
                        <div className="currency-input-group">
                            <label>From</label>
                            <select
                                className="currency-select"
                                value={fromUnit}
                                onChange={(e) => setFromUnit(e.target.value)}
                            >
                                {TIME_UNITS.map(u => (
                                    <option key={u.code} value={u.code}>{u.name} ({u.code})</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <button
                        className="currency-swap-btn"
                        onClick={handleSwap}
                        title="Swap Units"
                    >
                        ⇄
                    </button>

                    <div style={{ flex: 1 }}>
                        <div className="currency-input-group">
                            <label>To</label>
                            <select
                                className="currency-select"
                                value={toUnit}
                                onChange={(e) => setToUnit(e.target.value)}
                            >
                                {TIME_UNITS.map(u => (
                                    <option key={u.code} value={u.code}>{u.name} ({u.code})</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="currency-result-area">
                    {convertedAmount === null ? (
                        <span style={{ color: 'var(--text-color)', opacity: 0.7 }}>Enter a value</span>
                    ) : (
                        <>
                            <div className="currency-result-from">
                                {amount} {TIME_UNITS.find(u => u.code === fromUnit)?.name} =
                            </div>
                            <div className="currency-result-to">
                                {convertedAmount} <span>{TIME_UNITS.find(u => u.code === toUnit)?.name}</span>
                            </div>
                            <div className="currency-rate-info">
                                Formula: Multiply by {TO_SECOND[fromUnit] / TO_SECOND[toUnit]}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TimeConverter;
