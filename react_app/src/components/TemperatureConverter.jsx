import React, { useState, useEffect } from 'react';

const TEMP_UNITS = [
    { code: 'C', name: 'Celsius' },
    { code: 'F', name: 'Fahrenheit' },
    { code: 'K', name: 'Kelvin' }
];

const TemperatureConverter = ({ onClose }) => {
    const [amount, setAmount] = useState('0'); // Default to 0 for temp
    const [fromUnit, setFromUnit] = useState('C');
    const [toUnit, setToUnit] = useState('F');
    const [convertedAmount, setConvertedAmount] = useState(null);

    // Calculate conversion
    useEffect(() => {
        if (amount !== '' && amount !== '-') {
            const val = parseFloat(amount);
            if (!isNaN(val)) {
                let result;

                // Convert to Celsius first (Intermediate)
                let valInC;
                if (fromUnit === 'C') valInC = val;
                else if (fromUnit === 'F') valInC = (val - 32) * 5 / 9;
                else if (fromUnit === 'K') valInC = val - 273.15;

                // Convert from Celsius to Target
                if (toUnit === 'C') result = valInC;
                else if (toUnit === 'F') result = (valInC * 9 / 5) + 32;
                else if (toUnit === 'K') result = valInC + 273.15;

                // Format nicely: up to 2 decimal places for temp usually suffices, but we'll use up to 4
                // Avoid -0.00
                if (Math.abs(result) < 0.0001) result = 0;

                const formatted = parseFloat(result.toFixed(4));
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

    const getFormula = () => {
        if (fromUnit === 'C' && toUnit === 'F') return '(°C × 9/5) + 32 = °F';
        if (fromUnit === 'F' && toUnit === 'C') return '(°F - 32) × 5/9 = °C';
        if (fromUnit === 'C' && toUnit === 'K') return '°C + 273.15 = K';
        if (fromUnit === 'K' && toUnit === 'C') return 'K - 273.15 = °C';
        if (fromUnit === 'F' && toUnit === 'K') return '(°F - 32) × 5/9 + 273.15 = K';
        if (fromUnit === 'K' && toUnit === 'F') return '(K - 273.15) × 9/5 + 32 = °F';
        return 'Same unit';
    };

    return (
        <div className="currency-converter-container fade-in-slide">
            {/* Reusing currency-converter-container for consistent layout */}
            <div className="header" style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '1.4rem' }}>Temperature Converter</h2>
            </div>

            <div className="currency-card"> {/* Reusing currency CSS classes for identical look */}
                <div className="currency-input-group">
                    <label>Temperature</label>
                    <input
                        className="currency-input"
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Enter temperature"
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
                                {TEMP_UNITS.map(u => (
                                    <option key={u.code} value={u.code}>{u.name} (°{u.code})</option>
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
                                {TEMP_UNITS.map(u => (
                                    <option key={u.code} value={u.code}>{u.name} (°{u.code})</option>
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
                                {amount}°{fromUnit} =
                            </div>
                            <div className="currency-result-to">
                                {convertedAmount} <span>°{toUnit}</span>
                            </div>
                            <div className="currency-rate-info">
                                Formula: {getFormula()}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TemperatureConverter;
