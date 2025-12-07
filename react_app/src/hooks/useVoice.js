import { useState, useEffect, useRef } from 'react';

export function useVoice(onInput) {
    const [isListening, setIsListening] = useState(false);
    const [statusText, setStatusText] = useState("");
    const recognitionRef = useRef(null);
    const onInputRef = useRef(onInput);

    useEffect(() => {
        onInputRef.current = onInput;
    }, [onInput]);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.lang = "en-US";

            recognitionRef.current.onstart = () => {
                setIsListening(true);
                setStatusText("Listening...");
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
                setStatusText("Stopped listening.");
            };

            recognitionRef.current.onresult = (event) => {
                let spoken = event.results[0][0].transcript.toLowerCase();
                setStatusText("You said: " + spoken);
                processVoiceInput(spoken);
            };
        } else {
            setStatusText("Voice input not supported in this browser.");
        }
    }, []);

    const processVoiceInput = (spoken) => {
        const conversions = {
            "plus": "+",
            "minus": "-",
            "times": "*",
            "into": "*",
            "multiply": "*",
            "multiplied by": "*",
            "divide": "/",
            "divided by": "/",
            "percent": "%",
            "percent of": "%",
            "percentages": "%",
            "square root": "sqrt ",
            "root": "sqrt ",
            "to the power of": "^",
            "power": "^"
        };

        for (let word in conversions) {
            spoken = spoken.replaceAll(word, conversions[word]);
        }

        const extraWords = ["calculate", "what is", "equals to", "equals", "answer", "please"];
        extraWords.forEach(w => spoken = spoken.replaceAll(w, ""));

        spoken = wordsToDigits(spoken);

        // Normalize square phrases
        spoken = spoken.replace(/\b(?:square|squared|x2|x\s*squared)\b\s*(?:of\s*)?(\d+(?:\.\d+)?)/gi, (_, n) => n + '**2');
        spoken = spoken.replace(/(\d+(?:\.\d?)?)\s*\b(?:square|squared|x2|x\s*squared)\b/gi, (_, n) => n + '**2');

        // Normalize power phrases
        spoken = spoken.replace(/(\d+(?:\.\d+)?)\s*(?:\^|to the power of|power)\s*(\d+(?:\.\d+)?)/gi, (_, base, exp) => base + '^' + exp);

        // Normalize square root phrases
        spoken = spoken.replace(/(square root|root|sqrt)\s*(?:of\s*)?(\d+(?:\.\d+)?)/gi, (_, word, n) => 'sqrt' + n);

        if (onInputRef.current) {
            onInputRef.current(spoken);
        }
    };

    const startListening = () => {
        if (recognitionRef.current) {
            try {
                recognitionRef.current.start();
            } catch (e) {
                console.error(e);
            }
        }
    };

    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.abort();
            setIsListening(false);
            setStatusText("Stopped listening.");
        }
    };

    return {
        isListening,
        statusText,
        startListening,
        stopListening
    };
}

function wordsToDigits(text) {
    if (!text || typeof text !== 'string') return text;
    text = text.toLowerCase();

    const small = {
        'zero': 0, 'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5, 'six': 6, 'seven': 7, 'eight': 8, 'nine': 9,
        'ten': 10, 'eleven': 11, 'twelve': 12, 'thirteen': 13, 'fourteen': 14, 'fifteen': 15, 'sixteen': 16,
        'seventeen': 17, 'eighteen': 18, 'nineteen': 19
    };
    const tens = { 'twenty': 20, 'thirty': 30, 'forty': 40, 'fifty': 50, 'sixty': 60, 'seventy': 70, 'eighty': 80, 'ninety': 90 };

    text = text.replace(/\b(?:twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)\s+(?:one|two|three|four|five|six|seven|eight|nine)\b/gi, (m) => {
        const parts = m.split(/\s+/);
        return (tens[parts[0].toLowerCase()] + small[parts[1].toLowerCase()]);
    });

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
