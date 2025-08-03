import { dom } from './dom.js';
import { state, updateSettings } from './state.js';
import { initializeVerbsData, loadAppSettings, saveAppSettings, saveProgress, resetProgress } from './storage.js';
import { displayWelcomeMessage, updateProgressSummary, loadThemePreference, handleThemeToggle, showToast } from './ui.js';
import { initFlashcardMode, navigateFlashcardPrev, navigateFlashcardNext } from './modes/flashcard.js';
import { initQuizMode } from './modes/quiz.js';
import { initTypeMode } from './modes/type.js';
import { initTestSettings, startNewTest } from './modes/test.js';
import { initAdvancedStatsMode } from './modes/stats.js';
import { initSmartLearnMode } from './modes/smartlearn.js';
import { initAiPracticeMode } from './modes/aiPractice.js';
import { initExplorerMode } from './modes/explorer.js';
import { speak } from './speech.js'; // THÊM MỚI

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
    dom.startExplorerModeBtn.addEventListener('click', initExplorerMode);
    dom.startFlashcardModeBtn.addEventListener('click', initFlashcardMode);
    dom.startQuizModeBtn.addEventListener('click', initQuizMode);
    dom.startTypeModeBtn.addEventListener('click', initTypeMode);
    dom.startTestModeBtn.addEventListener('click', initTestSettings);
    dom.startAiPracticeModeBtn.addEventListener('click', initAiPracticeMode);
    dom.startAdvancedStatsBtn.addEventListener('click', initAdvancedStatsMode);

    // Mobile Buttons
    dom.startSmartLearnModeBtnMobile.addEventListener('click', initSmartLearnMode);
    dom.startExplorerModeBtnMobile.addEventListener('click', initExplorerMode);
    dom.startFlashcardModeBtnMobile.addEventListener('click', initFlashcardMode);
    dom.startQuizModeBtnMobile.addEventListener('click', initQuizMode);
    dom.startTypeModeBtnMobile.addEventListener('click', initTypeMode);
    dom.startTestModeBtnMobile.addEventListener('click', initTestSettings);
    dom.startAiPracticeModeBtnMobile.addEventListener('click', initAiPracticeMode);
    dom.startAdvancedStatsBtnMobile.addEventListener('click', initAdvancedStatsMode);

    // Data Controls
    dom.saveProgressBtn.addEventListener('click', saveProgress);
    dom.loadProgressBtn.addEventListener('click', async () => {
        await initializeVerbsData();
        displayWelcomeMessage();
        showToast("Tải tiến độ thành công!", "success");
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
    if(dom.shuffleVerbsToggle) {
        dom.shuffleVerbsToggle.addEventListener('change', (event) => {
            updateSettings({ shuffleVerbs: event.target.checked });
            saveAppSettings();
        });
    }

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

    dom.sidebarEl.querySelectorAll(".sidebar-main-content .nav-btn, .sidebar-main-content .data-controls-sidebar button").forEach(btn => {
        btn.addEventListener('click', () => {
             if (dom.sidebarEl.classList.contains("mobile-settings-open")) {
                dom.sidebarEl.classList.remove("mobile-settings-open");
                dom.mobileSettingsToggleBtn.querySelector("i").className = 'fas fa-cog';
             }
        });
    });

    // ==================== THÊM MỚI: EVENT LISTENERS CHO TÍNH NĂNG MỚI ====================
    setupSearch();
    setupKeyboardShortcuts();
    // ==================== KẾT THÚC THÊM MỚI ====================
}

// ==================== THÊM MỚI: CÁC HÀM CHO TÍNH NĂNG MỚI ====================

// ==================== BẮT ĐẦU THAY THẾ HÀM NÀY ====================
function setupSearch() {
    const searchInput = document.getElementById('verbSearchInput');
    const resultsContainer = document.getElementById('searchResultsContainer');

    if (!searchInput || !resultsContainer) return;

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        if (query.length < 2) {
            resultsContainer.classList.remove('show');
            return;
        }

        const results = state.allPhrasalVerbs.filter(verb => 
            verb.term.toLowerCase().includes(query) || verb.definition.toLowerCase().includes(query)
        ).slice(0, 10);

        resultsContainer.innerHTML = '';
        if (results.length > 0) {
            results.forEach(verb => {
                const item = document.createElement('div');
                item.className = 'search-result-item';
                // THAY ĐỔI: Thêm icon và cấu trúc div để style flexbox
                item.innerHTML = `
                    <div>
                        <strong>${verb.term}</strong>
                        <span>${verb.definition}</span>
                    </div>
                    <i class="fas fa-external-link-alt external-link-icon"></i>
                `;
                
                // THAY ĐỔI: Sự kiện click giờ sẽ mở tab mới
                item.addEventListener('click', () => {
                    // Lấy phần tiếng Anh của cụm động từ (chỉ lấy phần đầu tiên nếu có dấu '/')
                    const phrasalVerbToSearch = verb.definition.split(' / ')[0].trim();
                    
                    // Chuyển đổi khoảng trắng thành dấu gạch nối cho URL
                    const formattedVerb = phrasalVerbToSearch.toLowerCase().replace(/ /g, '-');
                    
                    // Tạo URL và mở tab mới
                    const url = `https://dictionary.cambridge.org/vi/dictionary/english/${formattedVerb}`;
                    window.open(url, '_blank');
                    
                    // Dọn dẹp giao diện
                    searchInput.value = '';
                    resultsContainer.classList.remove('show');
                });
                resultsContainer.appendChild(item);
            });
        } else {
            resultsContainer.innerHTML = '<div class="no-results">Không tìm thấy kết quả.</div>';
        }
        resultsContainer.classList.add('show');
    });

    document.addEventListener('click', (e) => {
        if (!dom.sidebarEl.contains(e.target)) {
            resultsContainer.classList.remove('show');
        }
    });
}
// ==================== KẾT THÚC THAY THẾ HÀM NÀY ====================

function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Bỏ qua nếu đang gõ trong ô input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }

        // Phím tắt cho Flashcard
        if (state.currentMode === 'flashcard') {
            if (e.key === 'ArrowRight') navigateFlashcardNext();
            if (e.key === 'ArrowLeft') navigateFlashcardPrev();
        }
        
        // Phím tắt cho việc chọn đáp án trắc nghiệm
        if ((state.currentMode === 'quiz' || state.currentMode === 'test' || state.currentMode === 'smartlearn') && ['1', '2', '3', '4'].includes(e.key)) {
            const options = dom.modeSpecificContent.querySelectorAll('.options-list li:not(.disabled)');
            const index = parseInt(e.key) - 1;
            if (options && options[index]) {
                options[index].click();
            }
        }
    });
}
// ==================== KẾT THÚC THÊM MỚI ====================


// Bắt đầu ứng dụng
document.addEventListener("DOMContentLoaded", initializeApp);