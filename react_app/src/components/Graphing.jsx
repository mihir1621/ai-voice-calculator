import React, { useEffect, useRef, useState } from 'react';
import functionPlot from 'function-plot';

const Graphing = ({ onClose, isDark }) => {
    const [expression, setExpression] = useState('x^2');
    const [error, setError] = useState(null);
    const [showTips, setShowTips] = useState(false);
    const rootEl = useRef(null);

    const [result, setResult] = useState(null);
    const [width, setWidth] = useState(600); // Default robust width

    useEffect(() => {
        if (!rootEl.current) return;
        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                if (entry.contentRect) {
                    setWidth(entry.contentRect.width);
                }
            }
        });
        resizeObserver.observe(rootEl.current);
        return () => resizeObserver.disconnect();
    }, []);

    useEffect(() => {
        try {
            // ... strict mode plotting logic ...
            if (rootEl.current && width > 0) {
                const height = 350;
                const color = isDark ? '#ccc' : '#333';

                functionPlot({
                    target: rootEl.current,
                    width: width,
                    height: height,
                    yAxis: { domain: [-10, 10] },
                    xAxis: { domain: [-10, 10] },
                    grid: true,
                    data: [{
                        fn: expression,
                        color: 'var(--accent-bg)',
                        graphType: 'polyline'
                    }],
                    title: 'Interactive Graph',
                    style: {}
                });
                setError(null);

                // --- Evaluation Logic ---
                // Simple parser to calculate value
                let evalExpr = expression.toLowerCase();

                // Replace standard math functions with JS Math equivalents
                // Use word boundaries (\b) to avoid replacing parts of other words (e.g. 'asin' containing 'sin')
                evalExpr = evalExpr.replace(/\^/g, '**');
                evalExpr = evalExpr.replace(/\basin\b/g, 'Math.asin');
                evalExpr = evalExpr.replace(/\bacos\b/g, 'Math.acos');
                evalExpr = evalExpr.replace(/\batan\b/g, 'Math.atan');
                evalExpr = evalExpr.replace(/\bsin\b/g, 'Math.sin');
                evalExpr = evalExpr.replace(/\bcos\b/g, 'Math.cos');
                evalExpr = evalExpr.replace(/\btan\b/g, 'Math.tan');
                evalExpr = evalExpr.replace(/\bsqrt\b/g, 'Math.sqrt');
                evalExpr = evalExpr.replace(/\blog\b/g, 'Math.log10');
                evalExpr = evalExpr.replace(/\bln\b/g, 'Math.log');
                evalExpr = evalExpr.replace(/\bpi\b/g, 'Math.PI');
                evalExpr = evalExpr.replace(/\be\b/g, 'Math.E');
                evalExpr = evalExpr.replace(/\babs\b/g, 'Math.abs');

                // If expression has 'x', evaluate at x=0
                let isVariable = false;
                if (evalExpr.includes('x')) {
                    evalExpr = evalExpr.replace(/x/g, '(0)');
                    isVariable = true;
                }

                try {
                    // Safe-ish evaluation for this context
                    // eslint-disable-next-line no-new-func
                    const val = new Function('return ' + evalExpr)();
                    if (isFinite(val)) {
                        setResult(parseFloat(val.toFixed(6)));
                    } else {
                        setResult('Undefined');
                    }
                } catch (err) {
                    setResult(null); // likely incomplete expression
                }
            }
        } catch (e) {
            setError('Invalid Function Syntax');
            setResult(null);
        }
    }, [expression, isDark, width]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (showTips && !e.target.closest('.tips-container')) {
                setShowTips(false);
            }
        };

        if (showTips) {
            document.addEventListener('click', handleClickOutside);
        }

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [showTips]);

    return (
        <div className="graphing-container fade-in-slide">
            {onClose && (
                <button
                    className="close-btn-mobile"
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: 'none',
                        border: 'none',
                        fontSize: '1.5rem',
                        color: 'var(--text-color)',
                        cursor: 'pointer',
                        zIndex: 10
                    }}
                >
                    ✕
                </button>
            )}



            <div className="currency-card">
                <div className="currency-input-group">
                    <label>Function f(x) =</label>
                    <input
                        className="currency-input"
                        type="text"
                        value={expression}
                        onChange={(e) => setExpression(e.target.value)}
                        placeholder="e.g. x^2 or sin(x)"
                        style={{ fontFamily: 'monospace' }}
                    />
                </div>

                {error && <div style={{ color: 'var(--accent-bg)', marginBottom: '10px' }}>{error}</div>}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    {!error && result !== null ? (
                        <div style={{
                            color: 'var(--text-color)',
                            fontWeight: 'bold',
                            padding: '8px',
                            background: 'var(--btn-bg)',
                            borderRadius: '6px',
                            border: '1px solid var(--display-border)',
                            flex: 1
                        }}>
                            Result: {result}
                        </div>
                    ) : (
                        <div style={{ flex: 1 }}></div>
                    )}


                    <div style={{ position: 'relative' }} className="tips-container">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowTips(!showTips);
                            }}
                            style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                background: 'var(--btn-action-bg)',
                                color: 'var(--btn-action-text)',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 'bold',
                                fontSize: '0.8rem',
                                fontFamily: 'serif'
                            }}
                            title="Show Tips"
                        >
                            i
                        </button>
                        {showTips && (
                            <div style={{
                                position: 'absolute',
                                right: '0',
                                top: '30px',
                                width: '240px',
                                background: 'var(--container-bg)',
                                border: '1px solid var(--display-border)',
                                borderRadius: '8px',
                                padding: '12px',
                                boxShadow: '0 4px 12px var(--shadow-color)',
                                zIndex: 100,
                                fontSize: '0.85rem',
                                color: 'var(--text-color)',
                                textAlign: 'left'
                            }}>
                                <strong>Tips & Tricks:</strong>
                                <ul style={{ paddingLeft: '20px', margin: '8px 0 0 0', lineHeight: '1.4' }}>
                                    <li><strong>Square:</strong> x^2</li>
                                    <li><strong>Cube:</strong> x^3</li>
                                    <li><strong>Square root:</strong> sqrt(x)</li>
                                    <li><strong>Exponential:</strong> e^x</li>
                                    <li><strong>Base-10 log:</strong> log(x)</li>
                                    <li><strong>Natural log:</strong> ln(x)</li>
                                    <li><strong>Sine:</strong> sin(x)</li>
                                    <li><strong>Cosine:</strong> cos(x)</li>
                                    <li><strong>Tangent:</strong> tan(x)</li>
                                    <li><strong>Inverse Sin:</strong> asin(x)</li>
                                    <li><strong>Inverse Cos:</strong> acos(x)</li>
                                    <li><strong>Inverse Tan:</strong> atan(x)</li>
                                    <li><strong>Absolute:</strong> abs(x)</li>
                                    <li><strong>PI Constant:</strong> pi</li>
                                </ul>
                            </div>
                        )}
                    </div>
                </div>


                <div
                    ref={rootEl}
                    id="graph-target"
                    style={{
                        width: '100%',
                        marginTop: '10px',
                        background: isDark ? '#222' : '#fff',
                        borderRadius: '8px',
                        overflow: 'hidden'
                    }}
                ></div>


            </div>
        </div>
    );
};

export default Graphing;
