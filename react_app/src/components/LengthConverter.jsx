import React, { useState, useEffect } from 'react';

const LENGTH_UNITS = [
    { code: 'm', name: 'Meter' },
    { code: 'km', name: 'Kilometer' },
    { code: 'cm', name: 'Centimeter' },
    { code: 'mm', name: 'Millimeter' },
    { code: 'mi', name: 'Mile' },
    { code: 'yd', name: 'Yard' },
    { code: 'ft', name: 'Foot' },
    { code: 'in', name: 'Inch' },
    { code: 'nmi', name: 'Nautical Mile' }
];

// Conversion factors to Meter (Base Unit)
const TO_METER = {
    'm': 1,
    'km': 1000,
    'cm': 0.01,
    'mm': 0.001,
    'mi': 1609.344,
    'yd': 0.9144,
    'ft': 0.3048,
    'in': 0.0254,
    'nmi': 1852
};

const LengthConverter = ({ onClose }) => {
    const [amount, setAmount] = useState('1');
    const [fromUnit, setFromUnit] = useState('m');
    const [toUnit, setToUnit] = useState('ft');
    const [convertedAmount, setConvertedAmount] = useState(null);

    // Calculate conversion
    useEffect(() => {
        if (amount !== '') {
            const val = parseFloat(amount);
            if (!isNaN(val)) {
                // Convert From -> Meter -> To
                const valueInMeters = val * TO_METER[fromUnit];
                const result = valueInMeters / TO_METER[toUnit];

                // Format nicely: up to 6 decimal places, remove trailing zeros
                const formatted = parseFloat(result.toFixed(6));
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
                <h2 style={{ fontSize: '1.4rem' }}>Length Converter</h2>
            </div>

            <div className="currency-card"> {/* Reusing currency CSS classes for identical look */}
                <div className="currency-input-group">
                    <label>Length</label>
                    <input
                        className="currency-input"
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Enter length"
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
                                {LENGTH_UNITS.map(u => (
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
                                {LENGTH_UNITS.map(u => (
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
                                {amount} {LENGTH_UNITS.find(u => u.code === fromUnit)?.name} =
                            </div>
                            <div className="currency-result-to">
                                {convertedAmount} <span>{LENGTH_UNITS.find(u => u.code === toUnit)?.name}</span>
                            </div>
                            <div className="currency-rate-info">
                                Formula: Multiply by {TO_METER[fromUnit] / TO_METER[toUnit]}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LengthConverter;
