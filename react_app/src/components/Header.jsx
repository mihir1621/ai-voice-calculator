import React from 'react';

const Header = ({ isScientific, onToggleMode, isDark, onToggleTheme, onToggleSidebar, isDateMode, onClose }) => {
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
                <h2>{isDateMode ? 'Date Calculator' : 'AI Voice Calculator'}</h2>
                {!isDateMode && !isScientific && (
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

            {!isDateMode && isScientific && (
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

            {isDateMode && (
                <div className="toggles">
                    <button
                        className="icon-btn"
                        onClick={onClose}
                        title="Close Date Calculator"
                        style={{ fontSize: '1.5rem', padding: '0 10px' }}
                    >
                        ✕
                    </button>
                </div>
            )}
        </div>
    );
};

export default Header;
