import React from 'react';

const StandardKeys = ({ onInput, onAction, onClear, onEqual }) => {
    return (
        <div className="std-keys">
            {/* Row 1 */}
            <button className="btn" id="percentBtn" onClick={() => onAction('%')}>%</button>
            <button className="btn" id="sqrtBtn" onClick={() => onAction('sqrt')}>√</button>
            <button className="btn" id="squareBtn" onClick={() => onAction('square')}>x²</button>
            <button className="btn operator" onClick={() => onInput('/')}>÷</button>

            {/* Row 2 */}
            <button className="btn" onClick={() => onInput('7')}>7</button>
            <button className="btn" onClick={() => onInput('8')}>8</button>
            <button className="btn" onClick={() => onInput('9')}>9</button>
            <button className="btn operator" onClick={() => onInput('*')}>×</button>

            {/* Row 3 */}
            <button className="btn" onClick={() => onInput('4')}>4</button>
            <button className="btn" onClick={() => onInput('5')}>5</button>
            <button className="btn" onClick={() => onInput('6')}>6</button>
            <button className="btn operator" onClick={() => onInput('-')}>−</button>

            {/* Row 4 */}
            <button className="btn" onClick={() => onInput('1')}>1</button>
            <button className="btn" onClick={() => onInput('2')}>2</button>
            <button className="btn" onClick={() => onInput('3')}>3</button>
            <button className="btn operator" onClick={() => onInput('+')}>+</button>

            {/* Row 5 */}
            <button className="btn" onClick={() => onInput('0')}>0</button>
            <button className="btn" onClick={() => onInput('.')}>.</button>
            <button className="btn clear" id="clearBtn" onClick={onClear}>AC</button>
            <button className="btn equal" onClick={onEqual}>=</button>
        </div>
    );
};

export default StandardKeys;
