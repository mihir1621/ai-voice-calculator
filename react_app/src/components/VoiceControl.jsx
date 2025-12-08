import React from 'react';

const VoiceControl = ({ onStart, onStop, status }) => {
    return (
        <>
            <div className="voice-btn-container">
                <button id="voiceBtn" className="voice-btn" onClick={onStart}>Start Speaking</button>
                <button id="stopVoiceBtn" className="voice-btn" onClick={onStop}>Stop Listening</button>
            </div>
            {status && <div id="status">{status}</div>}
        </>
    );
};

export default VoiceControl;
