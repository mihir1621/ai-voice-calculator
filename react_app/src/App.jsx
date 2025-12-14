import { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import Display from './components/Display';
import VoiceControl from './components/VoiceControl';
import Keypad from './components/Keypad';
import DateCalculator from './components/DateCalculator';
import History from './components/History';
import CurrencyConverter from './components/CurrencyConverter';
import LengthConverter from './components/LengthConverter';
import VolumeConverter from './components/VolumeConverter';
import TemperatureConverter from './components/TemperatureConverter';
import AreaConverter from './components/AreaConverter';
import TimeConverter from './components/TimeConverter';
import Graphing from './components/Graphing';
import About from './components/About';
import { useCalculator } from './hooks/useCalculator';
import { useVoice } from './hooks/useVoice';
import './App.css'; // Ensure we import specific app styles if needed

function App() {
  const [isDark, setIsDark] = useState(true);
  const [isScientific, setIsScientific] = useState(false);
  const [isDateMode, setIsDateMode] = useState(false);
  const [isHistoryMode, setIsHistoryMode] = useState(false);
  const [isCurrencyMode, setIsCurrencyMode] = useState(false);
  const [isLengthMode, setIsLengthMode] = useState(false);
  const [isVolumeMode, setIsVolumeMode] = useState(false);
  const [isTemperatureMode, setIsTemperatureMode] = useState(false);
  const [isAreaMode, setIsAreaMode] = useState(false);
  const [isTimeMode, setIsTimeMode] = useState(false);
  const [isGraphingMode, setIsGraphingMode] = useState(false);
  const [isAboutMode, setIsAboutMode] = useState(false);

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
    setDisplay,
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
  } = useVoice(async (spoken) => {
    const cmd = spoken.toLowerCase().trim();

    // Helper for TTS
    const speak = (text) => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.speak(utterance);
      }
    };

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
    } else if (
      cmd.includes('price of') ||
      cmd.includes('rate of') ||
      cmd.includes('dollar rate') ||
      cmd.includes('how much is') ||
      cmd.includes('current rate')
    ) {
      // Currency Query Handler
      let base = 'USD';
      if (cmd.includes('euro')) base = 'EUR';
      if (cmd.includes('pound')) base = 'GBP';
      if (cmd.includes('yen')) base = 'JPY';
      if (cmd.includes('rupee')) base = 'INR';
      if (cmd.includes('bitcoin')) base = 'BTC'; // Just in case, broadly compatible

      setDisplay('Fetching Rate...');
      try {
        const res = await fetch(`https://api.exchangerate-api.com/v4/latest/${base}`);
        const data = await res.json();
        const target = base === 'INR' ? 'USD' : 'INR'; // Default target
        const rate = data.rates[target];
        const msg = `1 ${base} = ${rate} ${target}`;
        setDisplay(msg);
        speak(msg);
      } catch (e) {
        setDisplay('Rate Fetch Error');
        speak('Sorry, I definitely could not fetch the rate.');
      }
    } else if (cmd.includes('what date is it') || cmd.includes('todays date') || cmd.includes('current date')) {
      // Date Query
      const d = new Date().toDateString();
      setDisplay(d);
      speak(`Today is ${d}`);
    } else if (cmd.includes('what time is it') || cmd.includes('current time')) {
      // Time Query
      const t = new Date().toLocaleTimeString();
      setDisplay(t);
      speak(`It is currently ${t}`);
    } else if (cmd.includes('how many calculations') || cmd.includes('history count')) {
      // History Query
      const count = history.length;
      const msg = `You have ${count} calculations in history`;
      setDisplay(`${count} Records`);
      speak(msg);
    } else if (
      cmd.includes('current temperature') ||
      cmd.includes('weather') ||
      cmd.includes('temperature outside') ||
      cmd.includes('how hot is it')
    ) {
      // Weather Query
      setDisplay('Locating...');
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(async (pos) => {
          try {
            const { latitude, longitude } = pos.coords;
            const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
            const data = await res.json();
            const temp = data.current_weather.temperature;
            const units = 'Celsius'; // Open-Meteo default
            const msg = `Current temperature is ${temp} degrees ${units}`;
            setDisplay(`${temp}°C`);
            speak(msg);
          } catch (e) {
            setDisplay('Weather Error');
            speak('Sorry, I used all my powers but could not fetch the weather.');
          }
        }, (err) => {
          setDisplay('Loc Error');
          speak('I need location permission to check the weather.');
        });
      } else {
        speak('Geolocation is not supported.');
      }
    } else if (cmd.includes('history') && !cmd.includes('close') && !cmd.includes('count') && !cmd.includes('clear')) {
      switchMode('history');
    } else if (cmd.includes('date calculator') || cmd.includes('open date')) {
      switchMode('date');
    } else if (cmd.includes('currency converter') || cmd.includes('open currency')) {
      switchMode('currency');
    } else if (cmd.includes('length converter') || cmd.includes('open length')) {
      switchMode('length');
    } else if (cmd.includes('volume converter') || cmd.includes('open volume')) {
      switchMode('volume');
    } else if (cmd.includes('temperature converter') || cmd.includes('temperature')) {
      switchMode('temperature');
    } else if (cmd.includes('area converter') || cmd.includes('area')) {
      switchMode('area');
    } else if (cmd.includes('time converter') || cmd.includes('time')) {
      switchMode('time');
    } else if (cmd.includes('about') || cmd.includes('who are you')) {
      switchMode('about');
    } else if (cmd.includes('graphing') || cmd.includes('graph')) {
      switchMode('graphing');
    } else if (cmd.includes('change background') || cmd.includes('change wallpaper')) {
      fileInputRef.current?.click();
    } else if (
      cmd.includes('standard') ||
      cmd.includes('normal') ||
      cmd.includes('basic') ||
      (cmd.includes('close history') && isHistoryMode) ||
      (cmd.includes('close date') && isDateMode) ||
      (cmd.includes('close currency') && isCurrencyMode) ||
      (cmd.includes('close length') && isLengthMode) ||
      (cmd.includes('close volume') && isVolumeMode) ||
      (cmd.includes('close temperature') && isTemperatureMode) ||
      (cmd.includes('close area') && isAreaMode) ||
      (cmd.includes('close time') && isTimeMode) ||
      (cmd.includes('close graphing') && isGraphingMode) ||
      (cmd.includes('close scientific') && isScientific) ||
      (cmd.includes('close about') && isAboutMode)
    ) {
      triggerTransition(() => {
        setIsScientific(false);
        setIsHistoryMode(false);
        setIsDateMode(false);
        setIsCurrencyMode(false);
        setIsLengthMode(false);
        setIsVolumeMode(false);
        setIsTemperatureMode(false);
        setIsAreaMode(false);
        setIsTimeMode(false);
        setIsGraphingMode(false);
        setIsAboutMode(false);
        setIsSidebarOpen(false);
      });
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
        setIsCurrencyMode(false);
        setIsLengthMode(false);
        setIsVolumeMode(false);
        setIsTemperatureMode(false);
        setIsAreaMode(false);
        setIsTimeMode(false);
        setIsGraphingMode(false);
        setIsAboutMode(false);
        setIsSidebarOpen(false);
      });
    } else if (cmd.includes('dark mode')) {
      setIsDark(true);
    } else if (cmd.includes('light mode')) {
      setIsDark(false);
    } else if (cmd === 'close' || cmd === 'go back' || cmd.includes('close menu')) {
      if (isSidebarOpen) {
        setIsSidebarOpen(false);
      } else if (isHistoryMode || isDateMode || isCurrencyMode || isLengthMode || isVolumeMode || isTemperatureMode || isAreaMode || isTimeMode || isGraphingMode || isAboutMode || isScientific) {
        triggerTransition(() => {
          setIsScientific(false);
          setIsHistoryMode(false);
          setIsDateMode(false);
          setIsCurrencyMode(false);
          setIsLengthMode(false);
          setIsVolumeMode(false);
          setIsTemperatureMode(false);
          setIsAreaMode(false);
          setIsTimeMode(false);
          setIsGraphingMode(false);
          setIsAboutMode(false);
          setIsSidebarOpen(false);
        });
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
      if (isDateMode || isHistoryMode || isCurrencyMode || isLengthMode || isVolumeMode || isTemperatureMode || isAreaMode || isTimeMode || isAboutMode) return; // Disable calculator shortcuts in active modes

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
  }, [calculate, deleteLast, clear, append, isDateMode, isHistoryMode, isCurrencyMode, isLengthMode, isVolumeMode, isTemperatureMode, isAreaMode, isTimeMode, isAboutMode]);

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
    // Prevent switching to the same mode
    if (
      (mode === 'date' && isDateMode) ||
      (mode === 'history' && isHistoryMode) ||
      (mode === 'currency' && isCurrencyMode) ||
      (mode === 'length' && isLengthMode) ||
      (mode === 'volume' && isVolumeMode) ||
      (mode === 'temperature' && isTemperatureMode) ||
      (mode === 'area' && isAreaMode) ||
      (mode === 'time' && isTimeMode) ||
      (mode === 'graphing' && isGraphingMode) ||
      (mode === 'about' && isAboutMode) ||
      (mode === 'std' && !isDateMode && !isHistoryMode && !isCurrencyMode && !isLengthMode && !isVolumeMode && !isTemperatureMode && !isAreaMode && !isTimeMode && !isGraphingMode && !isAboutMode)
    ) {
      setIsSidebarOpen(false);
      return;
    }

    triggerTransition(() => {
      // Reset all modes first
      setIsDateMode(false);
      setIsHistoryMode(false);
      setIsCurrencyMode(false);
      setIsLengthMode(false);
      setIsVolumeMode(false);
      setIsTemperatureMode(false);
      setIsAreaMode(false);
      setIsTimeMode(false);
      setIsGraphingMode(false);
      setIsAboutMode(false);

      // Activate the selected mode
      if (mode === 'date') setIsDateMode(true);
      else if (mode === 'history') setIsHistoryMode(true);
      else if (mode === 'currency') setIsCurrencyMode(true);
      else if (mode === 'length') setIsLengthMode(true);
      else if (mode === 'volume') setIsVolumeMode(true);
      else if (mode === 'temperature') setIsTemperatureMode(true);
      else if (mode === 'area') setIsAreaMode(true);
      else if (mode === 'time') setIsTimeMode(true);
      else if (mode === 'graphing') setIsGraphingMode(true);
      else if (mode === 'about') setIsAboutMode(true);

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
        {bgMedia?.type === 'image' && <img src={bgMedia.src} alt="" onError={(e) => e.target.style.display = 'none'} />}
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
      <div className={`container ${isScientific && !isDateMode && !isHistoryMode ? 'scientific-mode' : isGraphingMode ? 'graphing-mode' : ''}`}>
        <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <h3>Menu</h3>
            <button className="icon-btn" onClick={toggleSidebar}>&times;</button>
          </div>
          <div className="sidebar-content">
            <button className="menu-item" onClick={() => switchMode('history')}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{ width: '20px', height: '20px', marginRight: '10px', verticalAlign: 'middle' }}>
                <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z" />
              </svg>
              History
            </button>
            <button className="menu-item" onClick={() => switchMode('date')}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{ width: '20px', height: '20px', marginRight: '10px', verticalAlign: 'middle' }}>
                <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2zm-7 5h5v5h-5v-5z" />
              </svg>
              Date Calculator
            </button>
            <button className="menu-item" onClick={() => switchMode('currency')}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{ width: '20px', height: '20px', marginRight: '10px', verticalAlign: 'middle' }}>
                <path d="M12.5 6.9c1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3.01 1.49 3.01 2.81 0 1.26-1.07 1.96-2.83 1.96-1.55 0-2.5-1.02-2.58-2.61h-2.26c.11 2.37 1.7 3.86 3.84 4.3V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4-2.52-.66-3.01-1.54-3.01-2.79 0-1.25.75-2.11 2.33-2.11z" />
              </svg>
              Currency Converter
            </button>
            <button className="menu-item" onClick={() => switchMode('length')}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{ width: '20px', height: '20px', marginRight: '10px', verticalAlign: 'middle' }}>
                <path d="M2 5h20v14H2V5zm2 2v10h16V7H4zm2 2h2v3H6V9zm4 0h2v3h-2V9zm4 0h2v3h-2V9z" />
              </svg>
              Length Converter
            </button>
            <button className="menu-item" onClick={() => switchMode('volume')}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{ width: '20px', height: '20px', marginRight: '10px', verticalAlign: 'middle' }}>
                <path d="M2 20h20v2H2v-2zm2-8h2v7H4v-7zm5 0h2v7H9v-7zm5 0h2v7h-2v-7zm5 0h2v7h-2v-7zM2 2v3h20V2H2zm4 3h12v1H6V5zm2 5h8v1H8v-1z" />
              </svg>
              Volume Converter
            </button>
            <button className="menu-item" onClick={() => switchMode('temperature')}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{ width: '20px', height: '20px', marginRight: '10px', verticalAlign: 'middle' }}>
                <path d="M15 13V5c0-1.66-1.34-3-3-3S9 3.34 9 5v8c-1.21.91-2 2.37-2 4 0 2.76 2.24 5 5 5s5-2.24 5-5c0-1.63-.79-3.09-2-4zm-4-8c0-.55.45-1 1-1s1 .45 1 1v1h-1v1h1v1h-1v1h1v2.5c-.83.63-1.5 1.4-1.5 2.5 0 .19-2e-3.32.05-.5H11V5z" />
              </svg>
              Temperature
            </button>
            <button className="menu-item" onClick={() => switchMode('area')}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{ width: '20px', height: '20px', marginRight: '10px', verticalAlign: 'middle' }}>
                <path d="M3 3h18v18H3V3zm16 16V5H5v14h14zM7 7h2v2H7V7zm4 0h2v2h-2V7zm4 0h2v2h-2V7zM7 11h2v2H7v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2zM7 15h2v2H7v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2z" />
              </svg>
              Area Converter
            </button>
            <button className="menu-item" onClick={() => switchMode('time')}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{ width: '20px', height: '20px', marginRight: '10px', verticalAlign: 'middle' }}>
                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
              </svg>
              Time Converter
            </button>
            <button className="menu-item" onClick={() => switchMode('graphing')}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{ width: '20px', height: '20px', marginRight: '10px', verticalAlign: 'middle' }}>
                <path d="M7 19h10v-2H7v2zm-5-2h4v6h-4v-6zm4 6v-6h6v6h-6zm8-6v6h6v-6h-6zm-8-8h4v6h-4v-6zm4 6v-6h6v6h-6zm8-6v6h6v-6h-6zM3 13h4v-6H3v6zm0-8h4V2H3v3zm0 20h4v-6H3v6z" />
                {/* Simplified fake graph icon path */}
                <path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z" />
              </svg>
              Graphing Calc
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
            <button className="menu-item" onClick={() => switchMode('about')}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{ width: '20px', height: '20px', marginRight: '10px', verticalAlign: 'middle' }}>
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
              </svg>
              About Us
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
          isCurrencyMode={isCurrencyMode}
          isLengthMode={isLengthMode}
          isVolumeMode={isVolumeMode}
          isTemperatureMode={isTemperatureMode}
          isAreaMode={isAreaMode}
          isTimeMode={isTimeMode}
          isGraphingMode={isGraphingMode}
          isAboutMode={isAboutMode}
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
          ) : isCurrencyMode ? (
            <CurrencyConverter onClose={() => switchMode('std')} />
          ) : isLengthMode ? (
            <LengthConverter onClose={() => switchMode('std')} />
          ) : isVolumeMode ? (
            <VolumeConverter onClose={() => switchMode('std')} />
          ) : isTemperatureMode ? (
            <TemperatureConverter onClose={() => switchMode('std')} />
          ) : isAreaMode ? (
            <AreaConverter onClose={() => switchMode('std')} />
          ) : isTimeMode ? (
            <TimeConverter onClose={() => switchMode('std')} />
          ) : isGraphingMode ? (
            <Graphing onClose={() => switchMode('std')} isDark={isDark} />
          ) : isAboutMode ? (
            <About onClose={() => switchMode('std')} />
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
