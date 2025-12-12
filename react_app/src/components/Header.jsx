import React from 'react';

const Header = ({ isScientific, onToggleMode, isDark, onToggleTheme, onToggleSidebar, isDateMode, isHistoryMode, isCurrencyMode, isLengthMode, isVolumeMode, isTemperatureMode, isAreaMode, isTimeMode, isAboutMode, isGraphingMode, onClose, onDownloadPDF, isListening, onStartVoice, onStopVoice }) => {
    const isSpecialMode = isDateMode || isHistoryMode || isCurrencyMode || isLengthMode || isVolumeMode || isTemperatureMode || isAreaMode || isTimeMode || isAboutMode || isGraphingMode;
    const title = isDateMode ? 'Date Calculator' : isHistoryMode ? 'History' : isCurrencyMode ? 'Currency Converter' : isLengthMode ? 'Length Converter' : isVolumeMode ? 'Volume Converter' : isTemperatureMode ? 'Temperature Converter' : isAreaMode ? 'Area Converter' : isTimeMode ? 'Time Converter' : isAboutMode ? 'About Us' : isGraphingMode ? 'Graphing Calculator' : 'AI Voice Calculator';

    return (
        <div className="header">
            <div className="header-left">
                <button
                    id="menuBtn"
                    className="icon-btn"
                    onClick={onToggleSidebar}
                    title="Menu"
                >
                    ☰
                </button>
                <h2>{title}</h2>
                {!isSpecialMode && !isScientific && (
                    <div className="toggles" style={{ marginLeft: '15px' }}>
                        {/* Standard/Scientific Toggle */}
                        <label className="theme-switch" title="Toggle Standard/Scientific mode">
                            <input
                                type="checkbox"
                                id="modeToggle"
                                checked={isScientific}
                                onChange={onToggleMode}
                            />
                            <span className="slider mode-slider">
                                <span className="toggle-text"></span>
                            </span>
                        </label>
                        {/* Dark/Light Toggle */}
                        <label className="theme-switch" title="Toggle dark/light mode">
                            <input
                                type="checkbox"
                                id="themeToggle"
                                checked={!isDark}
                                onChange={onToggleTheme}
                            />
                            <span className="slider"></span>
                        </label>
                    </div>
                )}
            </div>

            {!isSpecialMode && isScientific && (
                <div className="toggles">
                    {/* Standard/Scientific Toggle */}
                    <label className="theme-switch" title="Toggle Standard/Scientific mode">
                        <input
                            type="checkbox"
                            id="modeToggle"
                            checked={isScientific}
                            onChange={onToggleMode}
                        />
                        <span className="slider mode-slider">
                            <span className="toggle-text"></span>
                        </span>
                    </label>
                    {/* Dark/Light Toggle */}
                    <label className="theme-switch" title="Toggle dark/light mode">
                        <input
                            type="checkbox"
                            id="themeToggle"
                            checked={!isDark}
                            onChange={onToggleTheme}
                        />
                        <span className="slider"></span>
                    </label>
                </div>
            )}

            {isSpecialMode && (
                <div className="toggles">
                    {isHistoryMode && (
                        <>
                            <button
                                className="icon-btn"
                                onClick={isListening ? onStopVoice : onStartVoice}
                                title={isListening ? "Stop Voice Command" : "Start Voice Command"}
                                style={{
                                    fontSize: '1.1rem',
                                    padding: '0 8px',
                                    color: isListening ? '#ff4444' : 'inherit'
                                }}
                            >
                                {isListening ? '⏹️' : '🎤'}
                            </button>
                            <button
                                className="icon-btn"
                                onClick={onDownloadPDF}
                                title="Download PDF"
                                style={{ fontSize: '1.1rem', padding: '0 8px' }}
                            >
                                ⬇️
                            </button>
                        </>
                    )}
                    <button
                        className="icon-btn"
                        onClick={onClose}
                        title={`Close ${title}`}
                        style={{ fontSize: '1.1rem', padding: '0 8px' }}
                    >
                        ✕
                    </button>
                </div>
            )}
        </div>
    );
};

export default Header;
