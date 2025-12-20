// --- Global State Variables ---
let workDuration = 25 * 60; // Default 25 minutes in seconds
let breakDuration = 5 * 60;  // Default 5 minutes in seconds
let timeRemaining = workDuration;
let isPaused = true;
let isWorkMode = true;
let timerInterval = null;
const TOTAL_WORK_TIME = workDuration; // Used for calculating egg progress

// --- DOM Elements ---
const timeDisplay = document.getElementById('time-display');
const modeDisplay = document.getElementById('mode-display');
const startPauseBtn = document.getElementById('start-pause-btn');
const resetBtn = document.getElementById('reset-btn');
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const configForm = document.getElementById('config-form');
const toggleSettingsBtn = document.getElementById('toggle-settings-btn');
const saveSettingsBtn = document.getElementById('save-settings-btn');

// NEW BUTTONS
const skipWorkBtn = document.getElementById('skip-work-btn');
const skipBreakBtn = document.getElementById('skip-break-btn');

const eggContainer = document.getElementById('egg-container');
const eggTop = eggContainer.querySelector('.egg-top');
const eggBottom = eggContainer.querySelector('.egg-bottom');
const chickContainer = document.getElementById('chick-container');

// --- Core Timer Logic ---

/**
 * Formats seconds into MM:SS string.
 * @param {number} totalSeconds - The total seconds remaining.
 */
function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Updates the time display and drives the animations based on the current time.
 */
function updateTimer() {
    if (isPaused || timeRemaining <= 0) {
        clearInterval(timerInterval);
        timerInterval = null;
        if (timeRemaining <= 0) {
            handleTimerEnd();
        }
        return;
    }

    timeRemaining--;
    timeDisplay.textContent = formatTime(timeRemaining);

    // Synchronize Animation with Timer
    if (isWorkMode) {
        animateEggBreaking();
    }
}

/**
 * Starts or pauses the timer.
 */
function toggleTimer() {
    isPaused = !isPaused;
    startPauseBtn.textContent = isPaused ? 'Start' : 'Pause';

    if (!isPaused && timerInterval === null) {
        timerInterval = setInterval(updateTimer, 1000);
        // Ensure the chick animation runs during the break time
        if (!isWorkMode) {
            chickContainer.classList.add('wiggle');
        }
    } else if (isPaused) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

/**
 * Resets the timer to the beginning of the current mode.
 */
function resetTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    isPaused = true;
    startPauseBtn.textContent = 'Start';

    timeRemaining = isWorkMode ? workDuration : breakDuration;
    timeDisplay.textContent = formatTime(timeRemaining);

    // Reset animation state
    if (isWorkMode) {
        resetEgg();
    } else {
        showChick();
        chickContainer.classList.remove('wiggle');
    }

    updateControlVisibility(); // Ensure correct skip button is visible
}

/**
 * Handles the moment the timer reaches zero.
 */
function handleTimerEnd() {
    // Play a sound or show a notification here (optional)

    isWorkMode ? transitionToBreak() : transitionToWork();
}

// --- Control Visibility ---

/**
 * Toggles the visibility of the skip buttons based on the current mode.
 */
function updateControlVisibility() {
    if (isWorkMode) {
        skipWorkBtn.classList.remove('hidden');
        skipBreakBtn.classList.add('hidden');
    } else {
        skipWorkBtn.classList.add('hidden');
        skipBreakBtn.classList.remove('hidden');
    }
}


// --- Mode Transition Logic (State C) ---

/**
 * Switches from Work (Egg) to Break (Chick).
 */
function transitionToBreak() {
    // Stop any running timer
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    isWorkMode = false;
    timeRemaining = breakDuration;
    modeDisplay.textContent = 'Break Time';

    // State C: Fully break the egg and show the chick
    animateEggBreaking(100);

    // Use a slight delay to ensure egg animation completes before chick is fully visible
    setTimeout(() => {
        hideEgg();
        showChick();
        isPaused = true; // Timer is initially paused after transition
        startPauseBtn.textContent = 'Start';
        timeDisplay.textContent = formatTime(timeRemaining);

        // Update button visibility and start the timer if it wasn't a skip from paused state
        updateControlVisibility();
        // toggleTimer(); // Don't auto-start, let user click start
    }, 500);
}

/**
 * Switches from Break (Chick) back to Work (Egg).
 */
function transitionToWork() {
    // Stop any running timer
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    isWorkMode = true;
    timeRemaining = workDuration;
    modeDisplay.textContent = 'Work Time';

    // State C: Start chick exit animation
    chickContainer.classList.add('chick-exit');
    chickContainer.classList.remove('wiggle');

    // After chick is off-screen, reset and show the egg
    setTimeout(() => {
        hideChick();
        resetEgg();
        isPaused = true; // Timer is initially paused after transition
        startPauseBtn.textContent = 'Start';
        timeDisplay.textContent = formatTime(timeRemaining);

        // Update button visibility
        updateControlVisibility();
        // toggleTimer(); // Don't auto-start, let user click start
    }, 500);
}

// --- Animation Functions (CSS Control) ---

/**
 * Calculates the percentage of time elapsed and applies the corresponding CSS classes
 * to the egg to simulate breaking.
 * @param {number} [forcePercent] - Optional value to force a specific animation state (e.g., 100 for fully broken).
 */
function animateEggBreaking(forcePercent = null) {
    // Calculate elapsed percentage
    const elapsedSeconds = workDuration - timeRemaining;
    let percentComplete = forcePercent !== null ? forcePercent : Math.round((elapsedSeconds / workDuration) * 100);

    // Clamp the percentage to 0-100
    percentComplete = Math.min(100, Math.max(0, percentComplete));

    // Convert percentage to the nearest 10% interval for CSS classes
    const classPercent = Math.floor(percentComplete / 10) * 10;

    // Clear all existing 'broken' classes
    eggTop.className = 'egg-top';

    if (classPercent > 0) {
        eggTop.classList.add(`broken-${classPercent}`);
    }
}

function showChick() {
    chickContainer.classList.remove('hidden', 'chick-exit');
    // Ensure the chick starts centered before the wiggle animation begins
    chickContainer.style.transform = 'translateX(-50%)';
    timeDisplay.textContent = formatTime(timeRemaining);
}

function hideChick() {
    chickContainer.classList.add('hidden');
}

function resetEgg() {
    eggContainer.classList.remove('hidden');
    eggTop.className = 'egg-top'; // Remove all broken classes
    eggBottom.className = 'egg-bottom';
    timeDisplay.textContent = formatTime(workDuration);
}

function hideEgg() {
    eggContainer.classList.add('hidden');
}

// --- User Configuration and Setup ---

/**
 * Loads durations from inputs and updates the global state.
 */
function loadSettings() {
    const newWork = parseInt(document.getElementById('work-duration').value) * 60;
    const newBreak = parseInt(document.getElementById('break-duration').value) * 60;

    if (newWork > 0 && newBreak > 0) {
        workDuration = newWork;
        breakDuration = newBreak;

        if (isWorkMode) {
            timeRemaining = workDuration;
        } else {
            timeRemaining = breakDuration;
        }
        timeDisplay.textContent = formatTime(timeRemaining);
    }
}

/**
 * Initializes the application state and event listeners.
 */
function init() {
    // Load initial settings and display time
    loadSettings();
    timeDisplay.textContent = formatTime(timeRemaining);
    updateControlVisibility(); // Set initial button visibility

    // Event Listeners
    startPauseBtn.addEventListener('click', toggleTimer);
    resetBtn.addEventListener('click', resetTimer);
    themeToggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
    });

    toggleSettingsBtn.addEventListener('click', () => {
        configForm.classList.toggle('hidden');
    });

    saveSettingsBtn.addEventListener('click', () => {
        loadSettings();
        resetTimer(); // Apply new duration and reset the timer
        configForm.classList.add('hidden');
    });

    // NEW EVENT LISTENERS FOR SKIP FUNCTIONALITY
    skipWorkBtn.addEventListener('click', transitionToBreak);
    skipBreakBtn.addEventListener('click', transitionToWork);
}

// Start the application
init();
