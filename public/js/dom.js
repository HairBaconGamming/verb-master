export const dom = {
    appContent: document.getElementById("app-content"),
    navigationControls: document.getElementById("navigation-controls"),
    prevCardBtn: document.getElementById("prevCardBtn"),
    nextCardBtn: document.getElementById("nextCardBtn"),
    cardNumberDisplay: document.getElementById("cardNumber"),
    scoreArea: document.getElementById("score-area"),
    scoreDisplay: document.getElementById("score"),
    totalQuestionsDisplay: document.getElementById("totalQuestions"),
    feedbackArea: document.getElementById("feedback-area"),
    currentModeTitle: document.getElementById("current-mode-title"),

    navButtons: document.querySelectorAll(".nav-btn"),
    startSmartLearnModeBtn: document.getElementById("startSmartLearnModeBtn"),
    startFlashcardModeBtn: document.getElementById("startFlashcardModeBtn"),
    startQuizModeBtn: document.getElementById("startQuizModeBtn"),
    startTypeModeBtn: document.getElementById("startTypeModeBtn"),
    startTestModeBtn: document.getElementById("startTestModeBtn"),
    startAiPracticeModeBtn: document.getElementById("startAiPracticeModeBtn"),
    startAdvancedStatsBtn: document.getElementById("startAdvancedStatsBtn"),

    saveProgressBtn: document.getElementById("saveProgressBtn"),
    loadProgressBtn: document.getElementById("loadProgressBtn"),
    resetProgressBtn: document.getElementById("resetProgressBtn"),

    testSettingsModal: document.getElementById("test-settings-modal"),
    closeTestSettingsBtn: document.getElementById("closeTestSettingsBtn"),
    numTestQuestionsInput: document.getElementById("numTestQuestions"),
    generateTestBtn: document.getElementById("generateTestBtn"),
    shuffleVerbsToggle: document.getElementById("shuffleVerbsToggle"),

    progressSummaryDiv: document.getElementById("progress-summary"),
    countNewDisplay: document.getElementById("countNew"),
    countLearningDisplay: document.getElementById("countLearning"),
    countMasteredDisplay: document.getElementById("countMastered"),
    countTotalDisplay: document.getElementById("countTotal"),

    themeToggleCheckbox: document.getElementById("themeToggleCheckbox"),

    modeSpecificContent: document.getElementById("mode-specific-content"),
    welcomeMessageContainer: document.getElementById("welcome-message-container"),
    mobileModeSelectionDiv: document.querySelector(".mobile-mode-selection"),

    // Mobile Buttons
    mobileNavButtons: document.querySelectorAll(".mode-btn-mobile"),
    startSmartLearnModeBtnMobile: document.getElementById("startSmartLearnModeBtnMobile"),
    startFlashcardModeBtnMobile: document.getElementById("startFlashcardModeBtnMobile"),
    startQuizModeBtnMobile: document.getElementById("startQuizModeBtnMobile"),
    startTypeModeBtnMobile: document.getElementById("startTypeModeBtnMobile"),
    startTestModeBtnMobile: document.getElementById("startTestModeBtnMobile"),
    startAiPracticeModeBtnMobile: document.getElementById("startAiPracticeModeBtnMobile"),
    startAdvancedStatsBtnMobile: document.getElementById("startAdvancedStatsBtnMobile"),

    // Mobile specific UI
    mobileSettingsToggleBtn: document.getElementById("mobileSettingsToggleBtn"),
    sidebarEl: document.querySelector(".sidebar"),

    // Progress Bar
    progressBarContainer: document.getElementById("progress-bar-container"),
    progressBarFill: document.getElementById("progress-bar-fill"),
    progressBarText: document.getElementById("progress-bar-text"),
};