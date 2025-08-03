import { dom } from './dom.js';
import { state, updateSettings } from './state.js';
import { initializeVerbsData, loadAppSettings, saveAppSettings, saveProgress, resetProgress } from './storage.js';
import { displayWelcomeMessage, updateProgressSummary, loadThemePreference, handleThemeToggle } from './ui.js';
import { initFlashcardMode, navigateFlashcardPrev, navigateFlashcardNext } from './modes/flashcard.js';
import { initQuizMode } from './modes/quiz.js';
import { initTypeMode } from './modes/type.js';
import { initTestSettings, startNewTest } from './modes/test.js';
import { initAdvancedStatsMode } from './modes/stats.js';
import { initSmartLearnMode } from './modes/smartlearn.js';
import { initAiPracticeMode } from './modes/aiPractice.js';

async function initializeApp() {
    loadThemePreference();
    loadAppSettings();
    const success = await initializeVerbsData();
    if (success) {
        displayWelcomeMessage();
        updateProgressSummary();
    } else {
        dom.appContent.innerHTML = '<p class="error-message">Lỗi tải dữ liệu từ vựng. Vui lòng thử lại.</p>';
    }
    setupEventListeners();
}

function setupEventListeners() {
    // Desktop Sidebar Buttons
    dom.startSmartLearnModeBtn.addEventListener('click', initSmartLearnMode);
    dom.startFlashcardModeBtn.addEventListener('click', initFlashcardMode);
    dom.startQuizModeBtn.addEventListener('click', initQuizMode);
    dom.startTypeModeBtn.addEventListener('click', initTypeMode);
    dom.startTestModeBtn.addEventListener('click', initTestSettings);
    dom.startAiPracticeModeBtn.addEventListener('click', initAiPracticeMode);
    dom.startAdvancedStatsBtn.addEventListener('click', initAdvancedStatsMode);

    // Mobile Buttons
    dom.startSmartLearnModeBtnMobile.addEventListener('click', initSmartLearnMode);
    dom.startFlashcardModeBtnMobile.addEventListener('click', initFlashcardMode);
    dom.startQuizModeBtnMobile.addEventListener('click', initQuizMode);
    dom.startTypeModeBtnMobile.addEventListener('click', initTypeMode);
    dom.startTestModeBtnMobile.addEventListener('click', initTestSettings);
    dom.startAiPracticeModeBtnMobile.addEventListener('click', initAiPracticeMode);
    dom.startAdvancedStatsBtnMobile.addEventListener('click', initAdvancedStatsMode);

    // Data Controls
    dom.saveProgressBtn.addEventListener('click', saveProgress);
    dom.loadProgressBtn.addEventListener('click', async () => {
        await initializeVerbsData(); // Reloads data from localStorage
        displayWelcomeMessage(); // Show welcome screen after loading
    });
    dom.resetProgressBtn.addEventListener('click', () => {
        if (confirm("Bạn có chắc chắn muốn reset toàn bộ tiến độ học tập không?")) {
            resetProgress();
            displayWelcomeMessage();
        }
    });

    // Theme Toggle
    dom.themeToggleCheckbox.addEventListener('change', handleThemeToggle);

    // Test Modal
    dom.closeTestSettingsBtn.addEventListener('click', () => dom.testSettingsModal.classList.remove('show-modal'));
    window.addEventListener('click', (event) => {
        if (event.target === dom.testSettingsModal) dom.testSettingsModal.classList.remove('show-modal');
    });
    dom.generateTestBtn.addEventListener('click', startNewTest);
    dom.shuffleVerbsToggle.addEventListener('change', (event) => {
        updateSettings({ shuffleVerbs: event.target.checked });
        saveAppSettings();
    });

    // Flashcard Navigation
    dom.prevCardBtn.addEventListener('click', navigateFlashcardPrev);
    dom.nextCardBtn.addEventListener('click', navigateFlashcardNext);
    
    // Mobile Settings Menu Toggle
    dom.mobileSettingsToggleBtn.addEventListener("click", () => {
        dom.sidebarEl.classList.toggle("mobile-settings-open");
        const icon = dom.mobileSettingsToggleBtn.querySelector("i");
        const isOpen = dom.sidebarEl.classList.contains("mobile-settings-open");
        icon.className = isOpen ? 'fas fa-times' : 'fas fa-cog';
    });

    // Close mobile menu when a nav item is clicked
    dom.sidebarEl.querySelectorAll(".sidebar-main-content .nav-btn, .sidebar-main-content .data-controls-sidebar button").forEach(btn => {
        btn.addEventListener('click', () => {
             if (dom.sidebarEl.classList.contains("mobile-settings-open")) {
                dom.sidebarEl.classList.remove("mobile-settings-open");
                dom.mobileSettingsToggleBtn.querySelector("i").className = 'fas fa-cog';
             }
        });
    });
}

// Start the application
document.addEventListener("DOMContentLoaded", initializeApp);