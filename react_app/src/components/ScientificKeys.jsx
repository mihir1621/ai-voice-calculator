import React from 'react';

const ScientificKeys = ({ onAction, visible }) => {
    return (
        <div className={`sci-keys ${visible ? 'visible' : ''}`}>
            <button className="btn sci" onClick={() => onAction('sin')}>sin</button>
            <button className="btn sci" onClick={() => onAction('cos')}>cos</button>
            <button className="btn sci" onClick={() => onAction('tan')}>tan</button>

            <button className="btn sci" onClick={() => onAction('asin')}>sin⁻¹</button>
            <button className="btn sci" onClick={() => onAction('acos')}>cos⁻¹</button>
            <button className="btn sci" onClick={() => onAction('atan')}>tan⁻¹</button>

            <button className="btn sci" onClick={() => onAction('ln')}>ln</button>
            <button className="btn sci" onClick={() => onAction('log')}>log</button>
            <button className="btn sci" onClick={() => onAction('exp')}>e^x</button>

            <button className="btn sci" onClick={() => onAction('pi')}>π</button>
            <button className="btn sci" onClick={() => onAction('^')}>x^y</button>
            <button className="btn" id="ceBtn" onClick={() => onAction('ce')}>CE</button>
        </div>
    );
};

export default ScientificKeys;
