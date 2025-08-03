import { dom } from './dom.js';
import { state, setCurrentMode } from './state.js';
import { MASTERY_LEVELS } from './constants.js';
import { updateChartTheme } from './charts.js';
import { initQuizMode } from './modes/quiz.js';
import { initTypeMode } from './modes/type.js';

let welcomeStartBtnListener = null;

export function displayWelcomeMessage() {
    setCurrentMode('welcome');
    dom.currentModeTitle.innerHTML = 'Chào mừng đến với <span class="brand-highlight">VerbMaster!</span>';

    if (dom.welcomeMessageContainer) {
        dom.welcomeMessageContainer.innerHTML = `
            <img src="https://cdn.glitch.global/faec93b3-0d74-429c-bb70-2a632a40990a/Thi%E1%BA%BFt%20k%E1%BA%BF%20ch%C6%B0a%20c%C3%B3%20t%C3%AAn.png?v=1748191831492" alt="Người đang học tiếng Anh với sách và ý tưởng" class="welcome-img">
            <h2>Bắt đầu hành trình chinh phục Phrasal Verbs!</h2>
            <p>Chọn một chế độ học để bắt đầu. <br> VerbMaster ứng dụng phương pháp Lặp Lại Ngắt Quãng (Spaced Repetition) giúp bạn ghi nhớ bền vững.</p>
            <button id="startWelcomeSmartLearnBtn" class="primary-btn welcome-start-btn"><i class="fas fa-brain"></i> Bắt đầu Học Thông Minh</button>
        `;
        dom.welcomeMessageContainer.style.display = "block";

        const welcomeStartBtn = document.getElementById("startWelcomeSmartLearnBtn");
        if (welcomeStartBtn) {
            if (welcomeStartBtnListener) {
                welcomeStartBtn.removeEventListener('click', welcomeStartBtnListener);
            }
            welcomeStartBtnListener = () => {
                const smartLearnButton = window.innerWidth <= 768 ? dom.startSmartLearnModeBtnMobile : dom.startSmartLearnModeBtn;
                if (smartLearnButton) {
                    smartLearnButton.click();
                }
            };
            welcomeStartBtn.addEventListener('click', welcomeStartBtnListener);
        }
    }

    if (dom.modeSpecificContent) {
        dom.modeSpecificContent.innerHTML = "";
        dom.modeSpecificContent.style.display = "none";
    }

    if (dom.mobileModeSelectionDiv) {
        dom.mobileModeSelectionDiv.style.display = window.innerWidth <= 768 ? "grid" : "none";
    }

    hideFooterControls();
}

export function updateProgressSummary() {
    if (!state.allPhrasalVerbs || state.allPhrasalVerbs.length === 0) {
        dom.progressSummaryDiv.style.display = "none";
        return;
    }
    dom.progressSummaryDiv.style.display = "flex";
    dom.countNewDisplay.textContent = state.allPhrasalVerbs.filter(v => v.masteryLevel === MASTERY_LEVELS.NEW).length;
    dom.countMasteredDisplay.textContent = state.allPhrasalVerbs.filter(v => v.masteryLevel === MASTERY_LEVELS.MASTERED).length;
    dom.countLearningDisplay.textContent = state.allPhrasalVerbs.filter(v => v.masteryLevel > MASTERY_LEVELS.NEW && v.masteryLevel < MASTERY_LEVELS.MASTERED).length;
    dom.countTotalDisplay.textContent = state.allPhrasalVerbs.length;
}

export function setActiveNavButton(selectedButton) {
    dom.navButtons.forEach(btn => btn.classList.remove("active-nav-btn"));
    if (selectedButton) {
        selectedButton.classList.add("active-nav-btn");
    }
}

export function setActiveMobileNavButton(selectedButton) {
    dom.mobileNavButtons.forEach(btn => btn.classList.remove("active-nav-btn-mobile"));
    if (selectedButton) {
        selectedButton.classList.add("active-nav-btn-mobile");
    }
}

export function updateModeTitle(title) {
    dom.currentModeTitle.innerHTML = title;
}

export function hideFooterControls() {
    if (dom.navigationControls) dom.navigationControls.style.display = "none";
    if (dom.scoreArea) dom.scoreArea.style.display = "none";
    if (dom.progressBarContainer) dom.progressBarContainer.style.display = "none";
    if (dom.feedbackArea) dom.feedbackArea.textContent = "";
}

function createToastContainer() {
    const container = document.createElement("div");
    container.className = "toast-container";
    document.body.appendChild(container);
    return container;
}

export function showToast(message, type = "info") {
    const toastContainer = document.querySelector(".toast-container") || createToastContainer();
    const toast = document.createElement("div");
    toast.className = `toast toast-${type} show`;
    toast.innerHTML = `<i class="fas ${type === "success" ? "fa-check-circle" : type === "error" ? "fa-times-circle" : "fa-info-circle"}"></i> ${message}`;
    toastContainer.appendChild(toast);
    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

export function updateProgressBar(currentValue, totalValue) {
    if (!dom.progressBarContainer || !dom.progressBarFill || !dom.progressBarText) return;

    if (totalValue > 0) {
        dom.progressBarContainer.style.display = "block";
        const percentage = (currentValue / totalValue) * 100;
        dom.progressBarFill.style.width = `${Math.min(100, Math.max(0, percentage))}%`;
        dom.progressBarText.textContent = `${currentValue}/${totalValue}`;

        if (percentage > 15) {
            dom.progressBarFill.classList.add("show-text");
        } else {
            dom.progressBarFill.classList.remove("show-text");
        }
    } else {
        dom.progressBarContainer.style.display = "none";
        dom.progressBarFill.style.width = "0%";
        dom.progressBarText.textContent = "0/0";
        dom.progressBarFill.classList.remove("show-text");
    }
}

export function updateScoreInFooter() {
    if (!dom.scoreDisplay || !dom.totalQuestionsDisplay) return;

    let currentTotal = 0;
    let currentScore = 0;

    if (state.currentMode === 'test') {
        currentScore = state.score;
        currentTotal = state.currentTestSet.length;
    } else if (state.currentMode === 'smartlearn') {
        currentScore = state.currentLearningSet.filter(v => state.smartLearnRoundProgress[v.id]?.masteredInRound).length;
        currentTotal = state.currentLearningSet.length;
    } else if (['quiz', 'type'].includes(state.currentMode)) {
        currentScore = state.score;
        currentTotal = state.currentLearningSet.length;
    } else if (state.currentMode === 'aiPractice') {
        currentScore = state.aiPracticeUserScore;
        const mainQ = state.currentAiPracticeSet[state.currentAiQuestionIndex];
        if (mainQ && mainQ.type === 'passage_multi_cloze_mcq' && mainQ.content_json.questions) {
            currentTotal = mainQ.content_json.questions.length;
        } else {
            currentTotal = 1; // For single questions
        }
    }
    
    dom.scoreDisplay.textContent = currentScore;
    dom.totalQuestionsDisplay.textContent = currentTotal;
    updateProgressBar(currentScore, currentTotal);
}

export function showSessionEndSummary(modeName, finalScore, totalItems) {
    updateModeTitle(`<i class="fas fa-flag-checkered"></i> Hoàn Thành: ${modeName}`);
    dom.modeSpecificContent.innerHTML = `
        <div class="session-summary animate-pop-in">
            <h2><i class="fas fa-medal"></i> Tuyệt vời! Bạn đã hoàn thành ${modeName}.</h2>
            <p class="summary-score">Điểm của bạn: <strong>${finalScore} / ${totalItems}</strong></p>
            <div class="summary-actions">
                <button id="restart-session-btn" class="action-button primary-btn"><i class="fas fa-redo"></i> Chơi lại</button>
                <button id="choose-other-mode-btn" class="action-button secondary-btn"><i class="fas fa-th-large"></i> Chế độ khác</button>
            </div>
        </div>`;
    hideFooterControls();

    document.getElementById("restart-session-btn").addEventListener("click", () => {
        if (state.currentMode === "quiz") initQuizMode();
        else if (state.currentMode === "type") initTypeMode();
    });
    document.getElementById("choose-other-mode-btn").addEventListener("click", () => {
        setActiveNavButton(null);
        setActiveMobileNavButton(null);
        displayWelcomeMessage();
    });
    updateProgressSummary();
}

export function loadThemePreference() {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
        document.body.setAttribute("data-theme", "dark");
        dom.themeToggleCheckbox.checked = true;
    } else {
        document.body.removeAttribute("data-theme");
        dom.themeToggleCheckbox.checked = false;
    }
    updateChartTheme();
}

export function handleThemeToggle() {
    if (dom.themeToggleCheckbox.checked) {
        document.body.setAttribute("data-theme", "dark");
        localStorage.setItem("theme", "dark");
    } else {
        document.body.removeAttribute("data-theme");
        localStorage.setItem("theme", "light");
    }
    if (state.currentMode === "advancedStats") {
        updateChartTheme();
    }
}