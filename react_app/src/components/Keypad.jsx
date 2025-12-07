import React from 'react';
import ScientificKeys from './ScientificKeys';
import StandardKeys from './StandardKeys';

const Keypad = ({
    isScientific,
    onInput,
    onAction,
    onClear,
    onEqual,
    onDelete
}) => {
    return (
        <div className="keys-container">
            <ScientificKeys
                visible={isScientific}
                onAction={onAction}
            />
            <StandardKeys
                onInput={onInput}
                onAction={onAction}
                onClear={onClear}
                onEqual={onEqual}
                onDelete={onDelete}
            />
        </div>
    );
};

export default Keypad;
