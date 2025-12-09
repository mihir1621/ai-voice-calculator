import React, { useState, useEffect } from 'react';

const VOLUME_UNITS = [
    { code: 'l', name: 'Liter' },
    { code: 'ml', name: 'Milliliter' },
    { code: 'm3', name: 'Cubic Meter' },
    { code: 'cm3', name: 'Cubic Centimeter' },
    { code: 'gal', name: 'US Gallon' },
    { code: 'qt', name: 'US Quart' },
    { code: 'pt', name: 'US Pint' },
    { code: 'cup', name: 'US Cup' },
    { code: 'fl_oz', name: 'US Fluid Ounce' }
];

// Conversion factors to Liter (Base Unit)
const TO_LITER = {
    'l': 1,
    'ml': 0.001,
    'm3': 1000,
    'cm3': 0.001,
    'gal': 3.78541,
    'qt': 0.946353,
    'pt': 0.473176,
    'cup': 0.236588,
    'fl_oz': 0.0295735
};

const VolumeConverter = ({ onClose }) => {
    const [amount, setAmount] = useState('1');
    const [fromUnit, setFromUnit] = useState('l');
    const [toUnit, setToUnit] = useState('ml');
    const [convertedAmount, setConvertedAmount] = useState(null);

    // Calculate conversion
    useEffect(() => {
        if (amount !== '') {
            const val = parseFloat(amount);
            if (!isNaN(val)) {
                // Convert From -> Liter -> To
                const valueInLiters = val * TO_LITER[fromUnit];
                const result = valueInLiters / TO_LITER[toUnit];

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
                <h2 style={{ fontSize: '1.4rem' }}>Volume Converter</h2>
            </div>

            <div className="currency-card"> {/* Reusing currency CSS classes for identical look */}
                <div className="currency-input-group">
                    <label>Volume</label>
                    <input
                        className="currency-input"
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Enter volume"
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
                                {VOLUME_UNITS.map(u => (
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
                                {VOLUME_UNITS.map(u => (
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
                                {amount} {VOLUME_UNITS.find(u => u.code === fromUnit)?.name} =
                            </div>
                            <div className="currency-result-to">
                                {convertedAmount} <span>{VOLUME_UNITS.find(u => u.code === toUnit)?.name}</span>
                            </div>
                            <div className="currency-rate-info">
                                Formula: Multiply by {TO_LITER[fromUnit] / TO_LITER[toUnit]}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VolumeConverter;
