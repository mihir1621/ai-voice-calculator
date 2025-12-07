import { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import Display from './components/Display';
import VoiceControl from './components/VoiceControl';
import Keypad from './components/Keypad';
import DateCalculator from './components/DateCalculator';
import { useCalculator } from './hooks/useCalculator';
import { useVoice } from './hooks/useVoice';
import './App.css'; // Ensure we import specific app styles if needed

function App() {
  const [isDark, setIsDark] = useState(true);
  const [isScientific, setIsScientific] = useState(false);
  const [isDateMode, setIsDateMode] = useState(false);
  const [bgMedia, setBgMedia] = useState(null); // { type: 'image' | 'video', src: string }
  const fileInputRef = useRef(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const {
    display,
    append,
    clear,
    deleteLast,
    calculate,
    handleAction,
    handleVoiceInput
  } = useCalculator();

  const {
    isListening,
    statusText,
    startListening,
    stopListening
  } = useVoice((spoken) => {
    handleVoiceInput(spoken);
  });

  useEffect(() => {
    // Apply theme class to body
    if (isDark) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [isDark]);

  // Load background from localStorage on mount
  useEffect(() => {
    const savedBg = localStorage.getItem('bgMedia');
    if (savedBg) {
      try {
        setBgMedia(JSON.parse(savedBg));
      } catch (e) {
        console.error('Failed to load background:', e);
      }
    }
  }, []);

  // Save background to localStorage when it changes
  useEffect(() => {
    try {
      if (bgMedia) {
        localStorage.setItem('bgMedia', JSON.stringify(bgMedia));
      } else {
        localStorage.removeItem('bgMedia');
      }
    } catch (error) {
      console.error('Failed to save background:', error);
      // Optional: Notify user if file is too large
    }
  }, [bgMedia]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isDateMode) return; // Disable calculator shortcuts in date mode

      const key = e.key;
      if (key === 'Enter') calculate();
      else if (key === 'Backspace') deleteLast();
      else if (key === 'Escape') clear();
      else if (!isNaN(key) || ["+", "-", "*", "/", ".", "(", ")", "%", "^"].includes(key)) {
        append(key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [calculate, deleteLast, clear, append, isDateMode]);

  const handleBgChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (file.type.startsWith('image/')) {
        setBgMedia({ type: 'image', src: reader.result });
      } else if (file.type.startsWith('video/')) {
        setBgMedia({ type: 'video', src: reader.result });
      }
    };
    reader.readAsDataURL(file);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const [transitionClass, setTransitionClass] = useState('');

  const triggerTransition = (callback) => {
    setTransitionClass('view-exit');
    setTimeout(() => {
      callback();
      setTransitionClass('view-enter-init');
      // Small delay to ensure DOM update before removing class for animation
      setTimeout(() => {
        setTransitionClass('');
      }, 50);
    }, 320);
  };

  const switchMode = (mode) => {
    if ((mode === 'date' && isDateMode) || (mode === 'std' && !isDateMode)) {
      setIsSidebarOpen(false);
      return;
    }

    triggerTransition(() => {
      if (mode === 'date') {
        setIsDateMode(true);
      } else {
        setIsDateMode(false);
      }
      setIsSidebarOpen(false);
    });
  };

  const handleToggleScientific = () => {
    triggerTransition(() => {
      setIsScientific(!isScientific);
    });
  };

  return (
    <>
      <div id="bg-container">
        {bgMedia?.type === 'image' && <img src={bgMedia.src} alt="Background" />}
        {bgMedia?.type === 'video' && (
          <video src={bgMedia.src} autoPlay loop muted playsInline />
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleBgChange}
        accept="image/*,video/*"
        hidden
      />
      <div className={`container ${isScientific && !isDateMode ? 'scientific-mode' : ''}`}>
        <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <h3>Menu</h3>
            <button className="icon-btn" onClick={toggleSidebar}>&times;</button>
          </div>
          <div className="sidebar-content">
            <button className="menu-item" onClick={() => switchMode('date')}>Date Calculator</button>
            <button
              className="menu-item"
              onClick={() => {
                fileInputRef.current?.click();
                toggleSidebar();
              }}
            >
              Change Background
            </button>
          </div>
        </div>
        <div
          className={`overlay ${isSidebarOpen ? 'visible' : ''}`}
          onClick={toggleSidebar}
        ></div>

        <Header
          isScientific={isScientific}
          onToggleMode={handleToggleScientific}
          isDark={isDark}
          onToggleTheme={() => setIsDark(!isDark)}
          onToggleSidebar={toggleSidebar}
          isDateMode={isDateMode}
          onClose={() => switchMode('std')}
        />

        <div className={`view-transition ${transitionClass}`}>
          {isDateMode ? (
            <DateCalculator onClose={() => switchMode('std')} />
          ) : (
            <>
              <Display value={display} />

              <VoiceControl
                onStart={startListening}
                onStop={stopListening}
                status={statusText}
              />

              <Keypad
                isScientific={isScientific}
                onInput={append}
                onAction={handleAction}
                onClear={clear}
                onEqual={calculate}
                onDelete={deleteLast}
              />
            </>
          )}
        </div>
      </div >
    </>
  );
}

export default App;
