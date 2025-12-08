import { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import Display from './components/Display';
import VoiceControl from './components/VoiceControl';
import Keypad from './components/Keypad';
import DateCalculator from './components/DateCalculator';
import History from './components/History';
import { useCalculator } from './hooks/useCalculator';
import { useVoice } from './hooks/useVoice';
import './App.css'; // Ensure we import specific app styles if needed

function App() {
  const [isDark, setIsDark] = useState(true);
  const [isScientific, setIsScientific] = useState(false);
  const [isDateMode, setIsDateMode] = useState(false);
  const [isHistoryMode, setIsHistoryMode] = useState(false);

  // Load background from localStorage (lazy initialization)
  const [bgMedia, setBgMedia] = useState(() => {
    const savedBg = localStorage.getItem('bgMedia');
    if (savedBg) {
      try {
        return JSON.parse(savedBg);
      } catch (e) {
        console.error('Failed to load background:', e);
      }
    }
    return null;
  });

  const fileInputRef = useRef(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const {
    display,
    append,
    clear,
    deleteLast,
    calculate,
    handleAction,
    handleVoiceInput,
    history
  } = useCalculator();

  const {
    statusText,
    startListening,
    stopListening,
    isListening
  } = useVoice((spoken) => {
    const cmd = spoken.toLowerCase().trim();

    if (cmd.includes('download')) {
      // Handle download
      if (cmd.includes('last')) {
        const match = cmd.match(/last\s+(\d+)/);
        if (match) {
          const n = parseInt(match[1]);
          // Correct logic: slice last n
          const subset = history.slice(Math.max(0, history.length - n));
          downloadHistoryPDF(subset);
        } else {
          downloadHistoryPDF();
        }
      } else if (cmd.includes('calculation') || cmd.includes('item')) {
        const match = cmd.match(/(\d+)/);
        if (match) {
          const n = parseInt(match[1]);
          if (n > 0 && n <= history.length) {
            // history is chronological presumably? 
            // If UI shows 1..N, item 1 is history[0].
            downloadHistoryPDF([history[n - 1]]);
          } else {
            downloadHistoryPDF();
          }
        } else {
          downloadHistoryPDF();
        }
      } else {
        downloadHistoryPDF();
      }
    } else if (cmd.includes('open history') || cmd.includes('show history')) {
      switchMode('history');
    } else if (cmd.includes('date calculator') || cmd.includes('open date')) {
      switchMode('date');
    } else if (cmd.includes('change background') || cmd.includes('change wallpaper')) {
      fileInputRef.current?.click();
    } else if (
      cmd.includes('scientific') ||
      cmd.includes('science') ||
      cmd.includes('sci mode') ||
      cmd.includes('sci calculator')
    ) {
      triggerTransition(() => {
        setIsScientific(true);
        setIsHistoryMode(false);
        setIsDateMode(false);
        setIsSidebarOpen(false);
      });
    } else if (
      cmd.includes('standard') ||
      cmd.includes('normal') ||
      cmd.includes('basic')
    ) {
      triggerTransition(() => {
        setIsScientific(false);
        setIsHistoryMode(false);
        setIsDateMode(false);
        setIsSidebarOpen(false);
      });
    } else if (cmd.includes('dark mode')) {
      setIsDark(true);
    } else if (cmd.includes('light mode')) {
      setIsDark(false);
    } else if (cmd.includes('close history')) {
      if (isHistoryMode) switchMode('std');
    } else if (cmd.includes('close date')) {
      if (isDateMode) switchMode('std');
    } else if (cmd.includes('close scientific')) {
      if (isScientific) handleToggleScientific();
    } else if (cmd === 'close' || cmd === 'go back' || cmd.includes('close menu')) {
      if (isSidebarOpen) {
        setIsSidebarOpen(false);
      } else if (isHistoryMode || isDateMode) {
        switchMode('std');
      } else if (isScientific) {
        handleToggleScientific();
      }
    } else if (
      cmd.includes('open menu') ||
      cmd.includes('show menu') ||
      cmd.includes('menu') ||
      cmd.includes('toggle menu')
    ) {
      if (cmd.includes('toggle')) toggleSidebar();
      else setIsSidebarOpen(true);
    } else {
      handleVoiceInput(spoken);
    }
  });

  // ... (rest of hook calls)

  // ...

  const downloadHistoryPDF = (subset = null) => {
    import('jspdf').then(jsPDF => {
      const doc = new jsPDF.default();

      const title = "Calculator History";
      const timestamp = new Date().toLocaleString();

      doc.setFontSize(22);
      doc.text(title, 20, 20);

      doc.setFontSize(10);
      doc.text(`Generated on: ${timestamp}`, 20, 30);

      doc.setFontSize(12);
      let y = 50;

      const dataToPrint = subset || history;

      dataToPrint.forEach((item, index) => {
        if (y > 280) { // New page if near bottom
          doc.addPage();
          y = 20;
        }
        // If it's a subset, we might want to preserve original indices or just re-index 1..N
        // For simplicity, re-index 1..N of the downloaded set
        const text = `${index + 1}. ${item.expression} = ${item.result}`;
        doc.text(text, 20, y);
        y += 10;
      });

      doc.save("start_calculator_history.pdf");
    });
  };

  useEffect(() => {
    // Apply theme class to body
    if (isDark) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [isDark]);

  // Save background to localStorage when it changes
  useEffect(() => {
    if (bgMedia) {
      localStorage.setItem('bgMedia', JSON.stringify(bgMedia));
    } else {
      localStorage.removeItem('bgMedia');
    }
  }, [bgMedia]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isDateMode || isHistoryMode) return; // Disable calculator shortcuts in date/history mode

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
  }, [calculate, deleteLast, clear, append, isDateMode, isHistoryMode]);

  const handleBgChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileURL = URL.createObjectURL(file);
    if (file.type.startsWith('image/')) {
      setBgMedia({ type: 'image', src: fileURL });
    } else if (file.type.startsWith('video/')) {
      setBgMedia({ type: 'video', src: fileURL });
    }
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
    if ((mode === 'date' && isDateMode) || (mode === 'history' && isHistoryMode) || (mode === 'std' && !isDateMode && !isHistoryMode)) {
      setIsSidebarOpen(false);
      return;
    }

    triggerTransition(() => {
      if (mode === 'date') {
        setIsDateMode(true);
        setIsHistoryMode(false);
      } else if (mode === 'history') {
        setIsHistoryMode(true);
        setIsDateMode(false);
      } else {
        setIsDateMode(false);
        setIsHistoryMode(false);
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
      <div className={`container ${isScientific && !isDateMode && !isHistoryMode ? 'scientific-mode' : ''}`}>
        <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <h3>Menu</h3>
            <button className="icon-btn" onClick={toggleSidebar}>&times;</button>
          </div>
          <div className="sidebar-content">
            <button className="menu-item" onClick={() => switchMode('history')}>
              <img src="/history_icon.jpg" alt="History" style={{ width: '20px', height: '20px', marginRight: '10px', verticalAlign: 'middle', borderRadius: '4px' }} /> History
            </button>
            <button className="menu-item" onClick={() => switchMode('date')}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{ width: '20px', height: '20px', marginRight: '10px', verticalAlign: 'middle' }}>
                <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2zm-7 5h5v5h-5v-5z" />
              </svg>
              Date Calculator
            </button>
            <button
              className="menu-item"
              onClick={() => {
                fileInputRef.current?.click();
                toggleSidebar();
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{ width: '20px', height: '20px', marginRight: '10px', verticalAlign: 'middle' }}>
                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
              </svg>
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
          isHistoryMode={isHistoryMode}
          onClose={() => switchMode('std')}
          onDownloadPDF={() => downloadHistoryPDF()}
          isListening={isListening}
          onStartVoice={startListening}
          onStopVoice={stopListening}
        />

        <div className={`view-transition ${transitionClass}`}>
          {isDateMode ? (
            <DateCalculator onClose={() => switchMode('std')} />
          ) : isHistoryMode ? (
            <History history={history} onClose={() => switchMode('std')} />
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
