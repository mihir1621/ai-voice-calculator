import { useState } from 'react';
import { solveMathProblem } from '../services/gemini';

// Number to Words Conversion for Voice Output
function numberToWords(num) {
    if (isNaN(num)) return "error";
    if (!isFinite(num)) return "infinity";

    const a = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
    const b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
    const g = ['', 'thousand', 'million', 'billion', 'trillion', 'quadrillion'];

    const convertGroup = (n) => {
        let str = '';
        if (n >= 100) {
            str += a[Math.floor(n / 100)] + ' hundred ';
            n %= 100;
        }
        if (n >= 20) {
            str += b[Math.floor(n / 10)] + (n % 10 ? '-' + a[n % 10] : '') + ' ';
        } else if (n > 0) {
            str += a[n] + ' ';
        }
        return str.trim();
    };

    let str = '';
    if (num < 0) {
        str += 'negative ';
        num = Math.abs(num);
    }

    // Handle integer part
    let parts = num.toString().split('.');
    let integerPart = parseInt(parts[0]);
    let decimalPart = parts[1];

    if (integerPart === 0) {
        str += 'zero';
    } else {
        let i = 0;
        let tempStr = '';
        while (integerPart > 0) {
            let chunk = integerPart % 1000;
            if (chunk > 0) {
                tempStr = convertGroup(chunk) + (g[i] ? ' ' + g[i] : '') + ' ' + tempStr;
            }
            integerPart = Math.floor(integerPart / 1000);
            i++;
        }
        str += tempStr.trim();
    }

    // Handle decimal part
    if (decimalPart) {
        str += ' point';
        const digits = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
        for (let char of decimalPart) {
            if (digits[parseInt(char)]) {
                str += ' ' + digits[parseInt(char)];
            }
        }
    }

    return str.trim();
}

// Speak Result Function
function speakResult(resultText) {
    if (!window.speechSynthesis) return;

    // Cancel any currently playing speech to avoid overlap
    window.speechSynthesis.cancel();

    const num = parseFloat(resultText);
    let spokenText = "";

    if (resultText === 'Error' || isNaN(num)) {
        spokenText = "There was an error in the calculation.";
    } else {
        spokenText = "The answer is " + numberToWords(num);
    }

    const utterance = new SpeechSynthesisUtterance(spokenText);

    // Configure voice settings for "warm, slightly playful" tone
    utterance.rate = 0.95; // Slightly slower for clarity
    utterance.pitch = 1.1; // Slightly higher pitch can sound friendlier/warmer
    utterance.volume = 1.0;

    // Attempt to select a suitable voice
    const voices = window.speechSynthesis.getVoices();
    // Look for a high-quality English voice
    const preferredVoice = voices.find(v =>
        (v.name.includes("Google US English") || v.name.includes("Samantha") || v.name.includes("Female")) && v.lang.startsWith("en")
    ) || voices.find(v => v.lang.startsWith("en"));

    if (preferredVoice) {
        utterance.voice = preferredVoice;
    }

    // 0.3s delay before speaking
    setTimeout(() => {
        window.speechSynthesis.speak(utterance);
    }, 300);
}

// Convert simple English number words to digits for voice input
function wordsToDigits(text) {
    if (!text || typeof text !== 'string') return text;
    text = text.toLowerCase();

    const small = {
        'zero': 0, 'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5, 'six': 6, 'seven': 7, 'eight': 8, 'nine': 9,
        'ten': 10, 'eleven': 11, 'twelve': 12, 'thirteen': 13, 'fourteen': 14, 'fifteen': 15, 'sixteen': 16,
        'seventeen': 17, 'eighteen': 18, 'nineteen': 19
    };
    const tens = { 'twenty': 20, 'thirty': 30, 'forty': 40, 'fifty': 50, 'sixty': 60, 'seventy': 70, 'eighty': 80, 'ninety': 90 };

    // handle combined tens like 'twenty five'
    text = text.replace(/\b(?:twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)\s+(?:one|two|three|four|five|six|seven|eight|nine)\b/gi, (m) => {
        const parts = m.split(/\s+/);
        return (tens[parts[0].toLowerCase()] + small[parts[1].toLowerCase()]);
    });

    // replace teens and single small words
    for (let w in small) {
        const re = new RegExp('\\b' + w + '\\b', 'gi');
        text = text.replace(re, small[w]);
    }
    for (let w in tens) {
        const re = new RegExp('\\b' + w + '\\b', 'gi');
        text = text.replace(re, tens[w]);
    }

    return text;
}

function processVoiceInput(spoken) {
    spoken = spoken.toLowerCase();

    // 1. Convert number words to digits first
    spoken = wordsToDigits(spoken);

    // 2. Operator Conversions
    const conversions = {
        "plus": "+",
        "minus": "-",
        "times": "*",
        "into": "*",
        "multiply by": "*",
        "multiplied by": "*",
        "multiply": "*",
        "divided by": "/",
        "divide": "/",
        "percent of": "%",
        "percentages": "%",
        "percent": "%",
        "square root": "sqrt ",
        "root": "sqrt ",
        "to the power of": "^",
        "power": "^",
        "x": "*"
    };

    const sortedKeys = Object.keys(conversions).sort((a, b) => b.length - a.length);

    for (let word of sortedKeys) {
        const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(word.length === 1 ? `\\b${escapedWord}\\b` : escapedWord, 'gi');
        spoken = spoken.replace(regex, conversions[word]);
    }

    // 3. Remove extra filler words
    const extraWords = ["calculate", "what is", "equals to", "equals", "answer", "please", "by"];
    extraWords.forEach(w => {
        const regex = new RegExp(`\\b${w}\\b`, 'gi');
        spoken = spoken.replace(regex, "");
    });

    // Normalize square phrases
    spoken = spoken.replace(/\b(?:square|squared|x2|x\s*squared)\b\s*(?:of\s*)?(\d+(?:\.\d+)?)/gi, function (_, n) { return n + '**2'; });
    spoken = spoken.replace(/(\d+(?:\.\d?)?)\s*\b(?:square|squared|x2|x\s*squared)\b/gi, function (_, n) { return n + '**2'; });

    // Normalize power phrases
    spoken = spoken.replace(/(\d+(?:\.\d+)?)\s*(?:\^|to the power of|power)\s*(\d+(?:\.\d+)?)/gi, function (_, base, exp) { return base + '^' + exp; });

    // Normalize square root phrases
    spoken = spoken.replace(/(square root|root|sqrt)\s*(?:of\s*)?(\d+(?:\.\d+)?)/gi, function (_, word, n) { return 'sqrt' + n; });

    return spoken;
}

export function useCalculator() {
    const [display, setDisplay] = useState('');
    const [lastCalculated, setLastCalculated] = useState(false);

    // Initialize history from localStorage
    const [history, setHistory] = useState(() => {
        try {
            const saved = localStorage.getItem('calc_history');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error("Failed to load history", e);
            return [];
        }
    });

    // Save history to localStorage whenever it changes
    const addToHistory = (expression, result) => {
        const newEntry = { expression, result, timestamp: Date.now() };
        const updatedHistory = [newEntry, ...history];
        setHistory(updatedHistory);
        localStorage.setItem('calc_history', JSON.stringify(updatedHistory));
    };

    const clearHistory = () => {
        setHistory([]);
        localStorage.removeItem('calc_history');
    };

    const append = (value) => {
        if (lastCalculated && !isNaN(value)) {
            setDisplay(value);
            setLastCalculated(false);
        } else {
            setDisplay((prev) => prev + value);
        }
    };

    const clear = () => {
        setDisplay('');
        setLastCalculated(false);
    };

    const deleteLast = () => {
        setDisplay((prev) => {
            if (!prev) return '';
            const m = prev.match(/(.*?)(\d+\.?\d*)$/);
            return m ? m[1] : prev.slice(0, -1);
        });
    };

    const prepareExpressionForEval = (expr) => {
        expr = expr.replace(/\^/g, '**');
        expr = expr.replace(/(\d+(?:\.\d+)?)%\s*(?:of\s*)?(\d+(?:\.\d+)?)/g, '($2*($1/100))');
        expr = expr.replace(/(\d+(?:\.\d+)?)%/g, '($1/100)');
        return expr;
    };

    const safeEval = (expr) => {
        try {
            const prepared = prepareExpressionForEval(expr);
            // using new Function to avoid direct eval usage
            // eslint-disable-next-line no-new-func
            return new Function('return ' + prepared)();
        } catch {
            throw new Error('Invalid Expression');
        }
    };

    const calculate = () => {
        try {
            let expr = display.trim();
            // n^2 shortcut
            if (/^(\d+(?:\.\d+)?)\^2$/.test(expr)) {
                const n = Number(expr.match(/^(\d+(?:\.\d+)?)\^2$/)[1]);
                const res = String(n * n);
                setDisplay(res);
                setLastCalculated(true);
                speakResult(res);
                addToHistory(expr, res); // Add to history
                return;
            }
            // sqrt shortcut
            if (/^sqrt(\d+(?:\.\d+)?)$/.test(expr)) {
                const n = Number(expr.match(/^sqrt(\d+(?:\.\d+)?)$/)[1]);
                if (n < 0) {
                    setDisplay('Error');
                    speakResult('Error');
                } else {
                    const resVal = Math.sqrt(n);
                    const res = Number.isInteger(resVal) ? String(resVal) : resVal.toFixed(6).replace(/\.0+$/, '');
                    setDisplay(res);
                    speakResult(res);
                    addToHistory(`sqrt(${n})`, res); // Add to history
                }
                setLastCalculated(true);
                return;
            }
            const result = safeEval(expr);
            const resStr = String(result);
            setDisplay(resStr);
            setLastCalculated(true);
            speakResult(resStr);
            addToHistory(expr, resStr); // Add to history
        } catch (e) {
            setDisplay('Error');
            speakResult('Error');
        }
    };

    const handleAction = (action) => {
        try {
            const val = display;
            const numVal = Number(safeEval(val || '0'));
            let result;
            let actionExpr = `${val} ${action}`; // Default expression for history

            switch (action) {
                case '%': {
                    const re = /(\d+(?:\.\d+)?)\s*([+\-*/])\s*(\d+(?:\.\d+)?$)/;
                    const m = re.exec(val);
                    if (m && (m[2] === '+' || m[2] === '-')) {
                        const A = parseFloat(m[1]);
                        const op = m[2];
                        const B = parseFloat(m[3]);
                        const computed = (A * B) / 100;
                        const finalExpr = val.slice(0, m.index) + A + op + computed;
                        setDisplay(finalExpr);
                        // For inline percent, we don't necessarily calculate the final result yet, 
                        // so we might not add to history here unless we define 'action' as finalizing the calc.
                        // The user can press equals later.
                        return;
                    }
                    const m2 = val.match(/(.*?)(\d+(?:\.\d+)?$)/);
                    if (m2) {
                        const prefix = m2[1];
                        const lastNum = parseFloat(m2[2]);
                        const finalVal = prefix + (lastNum / 100);
                        setDisplay(finalVal);
                        // Same here, usually intermediate.
                    }
                    return;
                }
                case 'square':
                    result = numVal * numVal;
                    actionExpr = `sqr(${numVal})`;
                    break;
                case 'sqrt':
                    if (numVal < 0) throw new Error();
                    result = Math.sqrt(numVal);
                    actionExpr = `sqrt(${numVal})`;
                    break;
                case 'sin':
                    result = Math.sin(numVal);
                    actionExpr = `sin(${numVal})`;
                    break;
                case 'cos':
                    result = Math.cos(numVal);
                    actionExpr = `cos(${numVal})`;
                    break;
                case 'tan':
                    result = Math.tan(numVal);
                    actionExpr = `tan(${numVal})`;
                    break;
                case 'asin':
                    if (Math.abs(numVal) > 1) throw new Error();
                    result = Math.asin(numVal);
                    actionExpr = `asin(${numVal})`;
                    break;
                case 'acos':
                    if (Math.abs(numVal) > 1) throw new Error();
                    result = Math.acos(numVal);
                    actionExpr = `acos(${numVal})`;
                    break;
                case 'atan':
                    result = Math.atan(numVal);
                    actionExpr = `atan(${numVal})`;
                    break;
                case 'ln':
                    if (numVal <= 0) throw new Error();
                    result = Math.log(numVal);
                    actionExpr = `ln(${numVal})`;
                    break;
                case 'log':
                    if (numVal <= 0) throw new Error();
                    result = Math.log10(numVal);
                    actionExpr = `log(${numVal})`;
                    break;
                case 'exp':
                    result = Math.exp(numVal);
                    actionExpr = `exp(${numVal})`;
                    break;
                case '^':
                    setDisplay((prev) => prev + '^');
                    setLastCalculated(false);
                    return;
                case 'pi':
                    setDisplay((prev) => prev + Math.PI.toString());
                    setLastCalculated(false);
                    return;
                default:
                    return;
            }
            if (result !== undefined) {
                const formatted = Number.isInteger(result) ? String(result) : result.toFixed(10).replace(/\.?0+$/, '');
                setDisplay(formatted);
                setLastCalculated(true);
                speakResult(formatted);
                addToHistory(actionExpr, formatted); // Add to history
            }
        } catch (e) {
            setDisplay('Error');
            speakResult('Error');
        }
    };

    const handleVoiceInput = async (spoken) => {
        try {
            if (spoken === 'clear' || spoken === 'c') {
                clear();
                return;
            }

            // Process the spoken input using our new helper
            const processed = processVoiceInput(spoken);

            if (/^sqrt(\d+(?:\.\d+)?)$/.test(processed)) {
                const n = Number(processed.match(/^sqrt(\d+(?:\.\d+)?)$/)[1]);
                if (n < 0) {
                    setDisplay('Error');
                    speakResult('Error');
                } else {
                    const resVal = Math.sqrt(n);
                    const res = Number.isInteger(resVal) ? String(resVal) : resVal.toFixed(6).replace(/\.0+$/, '');
                    setDisplay(res);
                    speakResult(res);
                    addToHistory(`sqrt(${n})`, res); // Add to history
                }
                setLastCalculated(true);
                return;
            }
            // Check for series/sequence keywords or list-like patterns (multiple numbers separated by commas/spaces)
            const isSeriesQuestion = /series|sequence|pattern|next|complete/i.test(spoken);
            const isList = /^\d+(?:[\s,]+\d+){2,}$/.test(spoken); // Matches "2, 4, 8" or "2 4 8"

            if (!isSeriesQuestion && !isList) {
                try {
                    const result = safeEval(processed);
                    const resStr = String(result);
                    setDisplay(resStr);
                    setLastCalculated(true);
                    speakResult(resStr);
                    addToHistory(processed, resStr); // Add to history
                    return;
                } catch {
                    // Ignore error
                }
            }
            // If the spoken input looks like a series request, try to compute locally
            if (isSeriesQuestion || isList) {
                // Extract all numbers from the spoken string
                const nums = spoken.match(/-?\d+(?:\.\d+)?/g);
                if (nums && nums.length >= 2) {
                    const numbers = nums.map(Number);
                    // Try geometric progression detection
                    const ratio = numbers[1] / numbers[0];
                    const isGeo = numbers.every((v, i) => i === 0 || Math.abs(v / numbers[i - 1] - ratio) < 1e-6);
                    if (isGeo) {
                        const next = numbers[numbers.length - 1] * ratio;
                        const resStr = String(next);
                        setDisplay(resStr);
                        setLastCalculated(true);
                        speakResult(resStr);
                        addToHistory(spoken, resStr); // Add to history
                        return;
                    }
                    // Try arithmetic progression detection
                    const diff = numbers[1] - numbers[0];
                    const isArith = numbers.every((v, i) => i === 0 || Math.abs(v - numbers[i - 1] - diff) < 1e-6);
                    if (isArith) {
                        const next = numbers[numbers.length - 1] + diff;
                        const resStr = String(next);
                        setDisplay(resStr);
                        setLastCalculated(true);
                        speakResult(resStr);
                        addToHistory(spoken, resStr); // Add to history
                        return;
                    }
                }
            }
            setDisplay('Thinking...');
            try {
                const aiResult = await solveMathProblem(spoken);
                const matches = aiResult.match(/-?\d+(?:\.\d+)?/g);
                const finalResult = matches ? matches[matches.length - 1] : aiResult.trim();
                setDisplay(finalResult);
                setLastCalculated(true);
                speakResult(finalResult);
                addToHistory(spoken, finalResult); // Add to history
            } catch (aiError) {
                console.error("AI Error caught in hook:", aiError);
                if (aiError.message.includes('API Key')) {
                    setDisplay('Set API Key');
                } else {
                    // Display a short error message to help debug
                    setDisplay('Err: ' + aiError.message.substring(0, 8));
                }
            }
        } catch (e) {
            console.error("General Error:", e);
            setDisplay('Error');
            setLastCalculated(false);
            speakResult('Error');
        }
    };

    return {
        display,
        setDisplay,
        append,
        clear,
        deleteLast,
        calculate,
        handleAction,
        handleVoiceInput,
        history,
        clearHistory
    };
}
