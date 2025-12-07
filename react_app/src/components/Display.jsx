import React from 'react';

const Display = ({ value }) => {
    return (
        <input
            id="display"
            type="text"
            placeholder="0"
            readOnly
            value={value}
        />
    );
};

export default Display;
