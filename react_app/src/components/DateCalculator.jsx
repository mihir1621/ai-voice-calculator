import React, { useState, useMemo } from 'react';

const DateCalculator = ({ onClose }) => {
    // Initialize dates to today
    const getToday = () => {
        const now = new Date();
        const d = String(now.getDate()).padStart(2, '0');
        const m = String(now.getMonth() + 1).padStart(2, '0');
        const y = now.getFullYear();
        return `${d}-${m}-${y}`;
    };

    const [dateFrom, setDateFrom] = useState(getToday);
    const [dateTo, setDateTo] = useState(getToday);

    const results = useMemo(() => {
        if (!dateFrom || !dateTo || dateFrom.length < 8 || dateTo.length < 8) {
            return {
                exact: 'Invalid dates',
                days: '-',
                weeks: '-',
                months: '-',
                business: '-'
            };
        }

        // Parse dates (DD-MM-YYYY)
        const [d1_val, m1, y1] = dateFrom.split('-').map(Number);
        const [d2_val, m2, y2] = dateTo.split('-').map(Number);

        const d1 = new Date(y1, m1 - 1, d1_val);
        const d2 = new Date(y2, m2 - 1, d2_val);

        if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
            return {
                exact: 'Invalid dates',
                days: '-',
                weeks: '-',
                months: '-',
                business: '-'
            };
        }

        const start = d1 < d2 ? d1 : d2;
        const end = d1 < d2 ? d2 : d1;

        const totalTime = Math.abs(d2 - d1);
        const totalDays = Math.round(totalTime / (1000 * 60 * 60 * 24));

        let years = end.getFullYear() - start.getFullYear();
        let months = end.getMonth() - start.getMonth();
        let days = end.getDate() - start.getDate();

        if (days < 0) {
            months--;
            const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0);
            days += prevMonth.getDate();
        }
        if (months < 0) {
            years--;
            months += 12;
        }

        const weeks = Math.floor(days / 7);
        const remainingDays = days % 7;

        let businessDays = 0;
        let current = new Date(start);
        while (current < end) {
            current.setDate(current.getDate() + 1);
            const day = current.getDay();
            if (day !== 0 && day !== 6) {
                businessDays++;
            }
        }

        const totalWeeks = Math.floor(totalDays / 7);
        const totalWeeksDays = totalDays % 7;
        const totalMonths = (years * 12) + months;

        return {
            exact: `${years} years, ${months} months, ${weeks} weeks, ${remainingDays} days`,
            days: `${totalDays} days`,
            weeks: `${totalWeeks} weeks, ${totalWeeksDays} days`,
            months: `${totalMonths} months, ${days} days`,
            business: `${businessDays} days`
        };
    }, [dateFrom, dateTo]);

    const handleDateChange = (value, setter) => {
        // Allow only numbers and hyphens
        if (!/^[0-9-]*$/.test(value)) return;

        // Enforce max length
        if (value.length > 10) return;

        setter(value);
    };

    const handleCalendarChange = (e, setter) => {
        const val = e.target.value; // YYYY-MM-DD
        if (!val) return;
        const [y, m, d] = val.split('-');
        setter(`${d}-${m}-${y}`);
    };

    return (
        <div id="date-calculator" className="fade-in-slide">
            {onClose && (
                <button
                    className="close-btn-mobile"
                    onClick={onClose}
                    style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', fontSize: '1.5rem', color: 'var(--text-color)', cursor: 'pointer', display: 'none' }}
                >
                    ✕
                </button>
            )}
            <div className="date-inputs">
                <div className="date-group">
                    <label>From (DD-MM-YYYY)</label>
                    <div className="input-wrapper">
                        <input
                            type="text"
                            placeholder="DD-MM-YYYY"
                            value={dateFrom}
                            onChange={(e) => handleDateChange(e.target.value, setDateFrom)}
                            maxLength="10"
                        />
                        <button className="calendar-btn" onClick={() => document.getElementById('pickerFrom').showPicker()}>📅</button>
                        <input
                            type="date"
                            id="pickerFrom"
                            className="hidden-picker"
                            onChange={(e) => handleCalendarChange(e, setDateFrom)}
                            style={{ position: 'absolute', visibility: 'hidden', width: 0 }}
                        />
                    </div>
                </div>
                <div className="date-group">
                    <label>To (DD-MM-YYYY)</label>
                    <div className="input-wrapper">
                        <input
                            type="text"
                            placeholder="DD-MM-YYYY"
                            value={dateTo}
                            onChange={(e) => handleDateChange(e.target.value, setDateTo)}
                            maxLength="10"
                        />
                        <button className="calendar-btn" onClick={() => document.getElementById('pickerTo').showPicker()}>📅</button>
                        <input
                            type="date"
                            id="pickerTo"
                            className="hidden-picker"
                            onChange={(e) => handleCalendarChange(e, setDateTo)}
                            style={{ position: 'absolute', visibility: 'hidden', width: 0 }}
                        />
                    </div>
                </div>
            </div>


            <div className="date-results">
                <div className="result-item">
                    <span className="label">Difference</span>
                    <span className="value">{results.exact || '-'}</span>
                </div>
                <div className="result-item">
                    <span className="label">Total Days</span>
                    <span className="value">{results.days || '-'}</span>
                </div>
                <div className="result-item">
                    <span className="label">Weeks</span>
                    <span className="value">{results.weeks || '-'}</span>
                </div>
                <div className="result-item">
                    <span className="label">Months</span>
                    <span className="value">{results.months || '-'}</span>
                </div>
                <div className="result-item">
                    <span className="label">Business Days</span>
                    <span className="value">{results.business || '-'}</span>
                </div>
            </div>
        </div>
    );
};

export default DateCalculator;
