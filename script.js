// Helpers
function prepareExpressionForEval(expr) {
    // Replace ^ with ** for JS exponent. Avoid replacing bitwise ^ by accident in non-user input.
    expr = expr.replace(/\^/g, '**');
    // Handle patterns like "10% of 40" or "10% 40" -> convert to (40*(10/100))
    expr = expr.replace(/(\d+(?:\.\d+)?)%\s*(?:of\s*)?(\d+(?:\.\d+)?)/g, '($2*($1/100))');
    // Replace remaining percent tokens like 50% -> (50/100)
    expr = expr.replace(/(\d+(?:\.\d+)?)%/g, '($1/100)');
    return expr;
}

function safeEval(expr) {
    const prepared = prepareExpressionForEval(expr);
    // eslint-disable-next-line no-eval
    return eval(prepared);
}

function evaluateDisplay() {
    try {
        display.value = String(safeEval(display.value));
        speakResult(display.value);
    } catch (e) {
        display.value = 'Error';
    }
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

// Background Handling
const bgInput = document.getElementById('bgInput');
const changeBgBtn = document.getElementById('changeBgBtn');
const bgContainer = document.getElementById('bg-container');

if (changeBgBtn && bgInput && bgContainer) {
    changeBgBtn.addEventListener('click', () => {
        bgInput.click();
    });

    bgInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const fileURL = URL.createObjectURL(file);
        bgContainer.innerHTML = ''; // Clear previous background

        if (file.type.startsWith('image/')) {
            const img = document.createElement('img');
            img.src = fileURL;
            bgContainer.appendChild(img);
        } else if (file.type.startsWith('video/')) {
            const video = document.createElement('video');
            video.src = fileURL;
            video.autoplay = true;
            video.loop = true;
            video.muted = true; // Required for autoplay
            video.playsInline = true;
            bgContainer.appendChild(video);
        }
    });
}

// Sidebar Handling
const menuBtn = document.getElementById('menuBtn');
const closeSidebar = document.getElementById('closeSidebar');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');

function toggleSidebar() {
    if (sidebar && overlay) {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('visible');
    }
}

if (menuBtn && sidebar && overlay && closeSidebar) {
    menuBtn.addEventListener('click', toggleSidebar);
    closeSidebar.addEventListener('click', toggleSidebar);
    overlay.addEventListener('click', toggleSidebar);
}

// Date Calculator Logic
const dateCalcBtn = document.getElementById('dateCalcBtn');
const closeDateCalcBtn = document.getElementById('closeDateCalcBtn');
const mainCalculator = document.getElementById('main-calculator');
const dateCalculator = document.getElementById('date-calculator');
const appTitle = document.getElementById('appTitle');
const modeSwitch = document.getElementById('modeSwitch');

const dateFrom = document.getElementById('dateFrom');
const dateTo = document.getElementById('dateTo');

const diffExact = document.getElementById('diffExact');
const diffDays = document.getElementById('diffDays');
const diffWeeks = document.getElementById('diffWeeks');
const diffMonths = document.getElementById('diffMonths');
const diffBusiness = document.getElementById('diffBusiness');

// Mode Handling
let currentMode = 'scientific'; // Default assumption, will sync with DOM

// Initialize mode based on checkbox
const modeToggle = document.getElementById('modeToggle');
if (modeToggle) {
    currentMode = modeToggle.checked ? 'scientific' : 'standard';
    modeToggle.addEventListener('change', () => {
        const newMode = modeToggle.checked ? 'scientific' : 'standard';
        switchMode(newMode);
    });
}

// Ensure scientific keys are correct on load
const sciKeys = document.querySelector('.sci-keys');
if (sciKeys) {
    sciKeys.style.display = currentMode === 'scientific' ? 'grid' : 'none';
}

function switchMode(newMode) {
    if (currentMode === newMode) return;

    let outgoingView = null;
    let incomingView = null;
    let isMainToMain = (currentMode !== 'date' && newMode !== 'date');

    if (currentMode === 'date') {
        outgoingView = dateCalculator;
    } else {
        outgoingView = mainCalculator;
    }

    if (newMode === 'date') {
        incomingView = dateCalculator;
    } else {
        incomingView = mainCalculator;
    }

    // Add exit class to outgoing view
    outgoingView.classList.add('view-transition', 'view-exit');

    // If Date Calc is closing, animate close button too
    if (currentMode === 'date') {
        closeDateCalcBtn.style.transition = 'opacity 0.32s ease-in-out';
        closeDateCalcBtn.style.opacity = '0';
    }

    // Wait for transition
    setTimeout(() => {
        // Hide outgoing
        outgoingView.style.display = 'none';
        outgoingView.classList.remove('view-transition', 'view-exit');

        // Prepare incoming content
        if (isMainToMain) {
            if (newMode === 'scientific') {
                sciKeys.style.display = 'grid';
            } else {
                sciKeys.style.display = 'none';
            }
        }

        // Setup incoming view
        incomingView.style.display = 'block';
        incomingView.classList.add('view-transition', 'view-enter-init');

        // Update UI Elements (Title, Toggles)
        const togglesDiv = document.querySelector('.toggles');
        if (newMode === 'date') {
            appTitle.textContent = 'Date Calculator';
            Array.from(togglesDiv.children).forEach(child => {
                if (child.id !== 'closeDateCalcBtn') child.style.display = 'none';
            });
            closeDateCalcBtn.style.display = 'block';
            closeDateCalcBtn.style.opacity = '1';

            // Set defaults (DD-MM-YYYY)
            const now = new Date();
            const d = String(now.getDate()).padStart(2, '0');
            const m = String(now.getMonth() + 1).padStart(2, '0');
            const y = now.getFullYear();
            const today = `${d}-${m}-${y}`;

            if (true) { // Always update
                dateFrom.value = today;
                dateTo.value = today;
            }
            calculateDateDifference();
        } else {
            appTitle.textContent = 'AI Voice Calculator';
            Array.from(togglesDiv.children).forEach(child => {
                if (child.id !== 'closeDateCalcBtn') child.style.display = 'flex';
            });
            closeDateCalcBtn.style.display = 'none';

            // Sync checkbox if coming from Date
            if (modeToggle) {
                modeToggle.checked = (newMode === 'scientific');
            }
        }

        // Force reflow to enable transition
        void incomingView.offsetWidth;

        // Animate in
        incomingView.classList.remove('view-enter-init');

        currentMode = newMode;

    }, 320);

    // Close sidebar if open
    if (sidebar.classList.contains('open')) {
        toggleSidebar();
    }
}

if (dateCalcBtn) {
    dateCalcBtn.addEventListener('click', () => switchMode('date'));
}

if (closeDateCalcBtn) {
    closeDateCalcBtn.addEventListener('click', (e) => {
        e.preventDefault();
        // Return to previous mode state (Standard or Scientific based on toggle)
        const target = modeToggle && modeToggle.checked ? 'scientific' : 'standard';
        switchMode(target);
    });
}

function handleDateInput(e) {
    let value = e.target.value;
    let cleaned = value.replace(/\D/g, '');

    // Enforce max length
    if (cleaned.length > 8) cleaned = cleaned.slice(0, 8);

    // Format as DD-MM-YYYY
    let formatted = cleaned;
    if (cleaned.length >= 2) {
        formatted = cleaned.slice(0, 2) + '-' + cleaned.slice(2);
    }
    if (cleaned.length >= 4) {
        formatted = formatted.slice(0, 5) + '-' + formatted.slice(5);
    }

    // Validate Day (1-31) and Month (1-12)
    if (cleaned.length >= 2) {
        const day = parseInt(cleaned.slice(0, 2));
        if (day > 31) formatted = '31' + formatted.slice(2);
        if (day === 0) formatted = '01' + formatted.slice(2);
    }
    if (cleaned.length >= 4) {
        const month = parseInt(cleaned.slice(2, 4));
        if (month > 12) formatted = formatted.slice(0, 3) + '12' + formatted.slice(5);
        if (month === 0) formatted = formatted.slice(0, 3) + '01' + formatted.slice(5);
    }

    e.target.value = formatted;
    calculateDateDifference();
}

function calculateDateDifference() {
    if (!dateFrom.value || !dateTo.value || dateFrom.value.length !== 10 || dateTo.value.length !== 10) return;

    // Parse dates (DD-MM-YYYY)
    const [d1_val, m1, y1] = dateFrom.value.split('-').map(Number);
    const [d2_val, m2, y2] = dateTo.value.split('-').map(Number);

    const d1 = new Date(y1, m1 - 1, d1_val);
    const d2 = new Date(y2, m2 - 1, d2_val);

    const start = d1 < d2 ? d1 : d2;
    const end = d1 < d2 ? d2 : d1;

    const totalTime = Math.abs(d2 - d1);
    const totalDays = Math.round(totalTime / (1000 * 60 * 60 * 24));

    // Exact difference (Years, Months, Weeks, Days)
    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();
    let days = end.getDate() - start.getDate();

    if (days < 0) {
        months--;
        // Get days in previous month
        const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0);
        days += prevMonth.getDate();
    }
    if (months < 0) {
        years--;
        months += 12;
    }

    // Calculate weeks from remaining days
    const weeks = Math.floor(days / 7);
    const remainingDays = days % 7;

    // Business Days
    let businessDays = 0;
    let current = new Date(start);
    while (current < end) {
        current.setDate(current.getDate() + 1);
        const day = current.getDay();
        if (day !== 0 && day !== 6) { // 0 is Sunday, 6 is Saturday
            businessDays++;
        }
    }

    // Update UI
    diffExact.textContent = `${years} years, ${months} months, ${weeks} weeks, ${remainingDays} days`;
    diffDays.textContent = `${totalDays} days`;

    const totalWeeks = Math.floor(totalDays / 7);
    const totalWeeksDays = totalDays % 7;
    diffWeeks.textContent = `${totalWeeks} weeks, ${totalWeeksDays} days`;

    // Approximate months for total months display
    const totalMonths = (years * 12) + months;
    diffMonths.textContent = `${totalMonths} months, ${days} days`;

    diffBusiness.textContent = `${businessDays} days`;
}

if (dateFrom && dateTo) {
    dateFrom.addEventListener('input', handleDateInput);
    dateTo.addEventListener('input', handleDateInput);
}

// Calendar Picker Logic
const btnPickerFrom = document.getElementById('btnPickerFrom');
const pickerFrom = document.getElementById('pickerFrom');
const btnPickerTo = document.getElementById('btnPickerTo');
const pickerTo = document.getElementById('pickerTo');
const calculateDateBtn = document.getElementById('calculateDateBtn');

if (btnPickerFrom && pickerFrom) {
    btnPickerFrom.addEventListener('click', () => pickerFrom.showPicker());
    pickerFrom.addEventListener('change', (e) => {
        const val = e.target.value; // YYYY-MM-DD
        if (val) {
            const [y, m, d] = val.split('-');
            dateFrom.value = `${d}-${m}-${y}`;
            calculateDateDifference();
        }
    });
}

if (btnPickerTo && pickerTo) {
    btnPickerTo.addEventListener('click', () => pickerTo.showPicker());
    pickerTo.addEventListener('change', (e) => {
        const val = e.target.value; // YYYY-MM-DD
        if (val) {
            const [y, m, d] = val.split('-');
            dateTo.value = `${d}-${m}-${y}`;
            calculateDateDifference();
        }
    });
}

if (calculateDateBtn) {
    calculateDateBtn.addEventListener('click', calculateDateDifference);
}
