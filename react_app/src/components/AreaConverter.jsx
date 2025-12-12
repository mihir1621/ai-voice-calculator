import React, { useState, useEffect } from 'react';

const AREA_UNITS = [
    { code: 'm2', name: 'Square Meter' },
    { code: 'km2', name: 'Square Kilometer' },
    { code: 'ha', name: 'Hectare' },
    { code: 'mi2', name: 'Square Mile' },
    { code: 'yd2', name: 'Square Yard' },
    { code: 'ft2', name: 'Square Foot' },
    { code: 'in2', name: 'Square Inch' },
    { code: 'ac', name: 'Acre' }
];

// Conversion factors to Square Meter (Base Unit)
const TO_SQ_METER = {
    'm2': 1,
    'km2': 1000000,
    'ha': 10000,
    'mi2': 2589988.11,
    'yd2': 0.83612736,
    'ft2': 0.09290304,
    'in2': 0.00064516,
    'ac': 4046.85642
};

const AreaConverter = ({ onClose }) => {
    const [amount, setAmount] = useState('1');
    const [fromUnit, setFromUnit] = useState('m2');
    const [toUnit, setToUnit] = useState('ft2');
    const [convertedAmount, setConvertedAmount] = useState(null);

    // Calculate conversion
    useEffect(() => {
        if (amount !== '') {
            const val = parseFloat(amount);
            if (!isNaN(val)) {
                // Convert From -> Sq Meter -> To
                const valueInSqMeters = val * TO_SQ_METER[fromUnit];
                const result = valueInSqMeters / TO_SQ_METER[toUnit];

                // Format nicely: up to 10 decimal places to handle small units like sq inches vs sq km
                // But generally 6 is fine, maybe slightly more for precision
                const formatted = parseFloat(result.toFixed(8));
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
                <h2 style={{ fontSize: '1.4rem' }}>Area Converter</h2>
            </div>

            <div className="currency-card"> {/* Reusing currency CSS classes for identical look */}
                <div className="currency-input-group">
                    <label>Area</label>
                    <input
                        className="currency-input"
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Enter area"
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
                                {AREA_UNITS.map(u => (
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
                                {AREA_UNITS.map(u => (
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
                                {amount} {AREA_UNITS.find(u => u.code === fromUnit)?.name} =
                            </div>
                            <div className="currency-result-to">
                                {convertedAmount} <span>{AREA_UNITS.find(u => u.code === toUnit)?.name}</span>
                            </div>
                            <div className="currency-rate-info">
                                Formula: Multiply by {TO_SQ_METER[fromUnit] / TO_SQ_METER[toUnit]}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AreaConverter;
