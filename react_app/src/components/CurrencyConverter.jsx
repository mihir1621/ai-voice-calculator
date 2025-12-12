import React, { useState, useEffect } from 'react';

const CURRENCIES = [
    { code: 'USD', name: 'US Dollar', flag: '🇺🇸' },
    { code: 'EUR', name: 'Euro', flag: '🇪🇺' },
    { code: 'GBP', name: 'British Pound', flag: '🇬🇧' },
    { code: 'INR', name: 'Indian Rupee', flag: '🇮🇳' },
    { code: 'JPY', name: 'Japanese Yen', flag: '🇯🇵' },
    { code: 'AUD', name: 'Australian Dollar', flag: '🇦🇺' },
    { code: 'CAD', name: 'Canadian Dollar', flag: '🇨🇦' },
    { code: 'CNY', name: 'Chinese Yuan', flag: '🇨🇳' },
    { code: 'NZD', name: 'New Zealand Dollar', flag: '🇳🇿' },
    { code: 'RUB', name: 'Russian Ruble', flag: '🇷🇺' },
    { code: 'BRL', name: 'Brazilian Real', flag: '🇧🇷' },
    { code: 'ZAR', name: 'South African Rand', flag: '🇿🇦' },
];

const CurrencyConverter = ({ onClose }) => {
    const [amount, setAmount] = useState('1');
    const [fromCurrency, setFromCurrency] = useState('USD');
    const [toCurrency, setToCurrency] = useState('INR');
    const [exchangeRate, setExchangeRate] = useState(null);
    const [convertedAmount, setConvertedAmount] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);

    // Fetch exchange rates
    useEffect(() => {
        const fetchRates = async () => {
            setLoading(true);
            setError(null);

            // Check cache first to comply with "updates daily" and efficient usage
            const CACHE_KEY = `rates_${fromCurrency}`;
            const cached = localStorage.getItem(CACHE_KEY);
            const today = new Date().toDateString();

            if (cached) {
                try {
                    const parsed = JSON.parse(cached);
                    // If cache is from today, use it. 'updates automatically every day' logic.
                    if (parsed.date === today && parsed.data && parsed.data.rates) {
                        setExchangeRate(parsed.data.rates[toCurrency]);
                        setLastUpdated("Today (Cached)");
                        setLoading(false);
                        return;
                    }
                } catch (e) {
                    console.warn("Cache parsing failed", e);
                }
            }

            try {
                // Fetch fresh data from reliable API
                const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`);
                if (!response.ok) throw new Error('Failed to fetch rates');
                const data = await response.json();

                // Update cache
                localStorage.setItem(CACHE_KEY, JSON.stringify({
                    date: today,
                    data: data
                }));

                const rate = data.rates[toCurrency];
                setExchangeRate(rate);
                setLastUpdated(new Date(data.date).toLocaleDateString());
            } catch (err) {
                setError('Could not load exchange rates. Please check your internet connection.');
                console.error(err);

                // Fallback to cache if network fails, even if old
                if (cached) {
                    const parsed = JSON.parse(cached);
                    if (parsed.data && parsed.data.rates) {
                        setExchangeRate(parsed.data.rates[toCurrency]);
                        setLastUpdated(`Offline (Saved: ${parsed.date})`);
                        setError(null);
                    }
                }
            } finally {
                setLoading(false);
            }
        };

        fetchRates();
    }, [fromCurrency, toCurrency]);

    // Calculate conversion
    useEffect(() => {
        if (exchangeRate !== null && amount !== '') {
            const val = parseFloat(amount);
            if (!isNaN(val)) {
                setConvertedAmount((val * exchangeRate).toFixed(2));
            }
        } else {
            setConvertedAmount(null);
        }
    }, [amount, exchangeRate]);

    const handleSwap = () => {
        setFromCurrency(toCurrency);
        setToCurrency(fromCurrency);
    };

    return (
        <div className="currency-converter-container fade-in-slide">
            <div className="header" style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '1.4rem' }}>Currency Converter</h2>
            </div>

            <div className="currency-card">
                <div className="currency-input-group">
                    <label>Amount</label>
                    <input
                        className="currency-input"
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Enter amount"
                    />
                </div>

                <div className="currency-row">
                    <div style={{ flex: 1 }}>
                        <div className="currency-input-group">
                            <label>From</label>
                            <select
                                className="currency-select"
                                value={fromCurrency}
                                onChange={(e) => setFromCurrency(e.target.value)}
                            >
                                {CURRENCIES.map(c => (
                                    <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <button
                        className="currency-swap-btn"
                        onClick={handleSwap}
                        title="Swap Currencies"
                    >
                        ⇄
                    </button>

                    <div style={{ flex: 1 }}>
                        <div className="currency-input-group">
                            <label>To</label>
                            <select
                                className="currency-select"
                                value={toCurrency}
                                onChange={(e) => setToCurrency(e.target.value)}
                            >
                                {CURRENCIES.map(c => (
                                    <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="currency-result-area">
                    {loading ? (
                        <span style={{ color: 'var(--text-color)', opacity: 0.7 }}>Loading rates...</span>
                    ) : error ? (
                        <span style={{ color: '#ff4444', fontSize: '0.9rem' }}>{error}</span>
                    ) : (
                        <>
                            <div className="currency-result-from">
                                {amount} {fromCurrency} =
                            </div>
                            <div className="currency-result-to">
                                {convertedAmount} <span>{toCurrency}</span>
                            </div>
                            <div className="currency-rate-info">
                                1 {fromCurrency} = {exchangeRate} {toCurrency} <br />
                                Source: ExchangeRate-API (Updated Daily)
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CurrencyConverter;
