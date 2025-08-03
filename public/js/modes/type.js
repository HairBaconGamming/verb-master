import { dom } from '../dom.js';
import { state, setCurrentMode, setCurrentLearningSet, resetScore, incrementScore, incrementAnswered } from '../state.js';
import { shuffleArray, normalizeAndCompareAnswers } from '../utils.js';
import { saveProgress } from '../storage.js';
import { updateModeTitle, hideFooterControls, showSessionEndSummary, updateScoreInFooter, setActiveNavButton, setActiveMobileNavButton } from '../ui.js';

function handleGeneralTypeSubmission(questionData) {
    const inputEl = document.getElementById("type-ans-in");
    if (!inputEl) return;

    const userAnswer = inputEl.value;
    const correctAnswerString = questionData.definition;
    const isCorrect = normalizeAndCompareAnswers(userAnswer, correctAnswerString);

    inputEl.disabled = true;
    document.getElementById("sub-type-ans").style.display = "none";
    const nextBtn = document.getElementById("next-q-btn");
    
    if (nextBtn) {
        nextBtn.style.display = "inline-flex";
        nextBtn.focus();
        nextBtn.onclick = () => {
            incrementAnswered();
            displayGeneralTypeQuestion();
        };
    }

    if (isCorrect) {
        incrementScore();
        dom.feedbackArea.textContent = "Chính xác!";
        dom.feedbackArea.className = "feedback-area-footer correct";
        questionData.totalCorrect = (questionData.totalCorrect || 0) + 1;
        inputEl.classList.add("correct-input-feedback");
    } else {
        dom.feedbackArea.textContent = `Sai! Đúng là: ${correctAnswerString}`;
        dom.feedbackArea.className = "feedback-area-footer incorrect";
        questionData.totalIncorrect = (questionData.totalIncorrect || 0) + 1;
        inputEl.classList.add("incorrect-input-feedback");
    }
    
    questionData.lastReviewed = Date.now();
    saveProgress();
    updateScoreInFooter();
}

function displayGeneralTypeQuestion() {
    if (state.questionsAnsweredInSession >= state.currentLearningSet.length) {
        showSessionEndSummary("Tự Luận", state.score, state.currentLearningSet.length);
        return;
    }
    const qData = state.currentLearningSet[state.questionsAnsweredInSession];
    dom.modeSpecificContent.innerHTML = `
        <div class="type-question animate-pop-in">
            <p>"<strong>${qData.term}</strong>" là gì?</p>
            <input type="text" id="type-ans-in" placeholder="Đáp án..." autocomplete="off" autocorrect="off" autocapitalize="none">
            <button id="sub-type-ans" class="action-button primary-btn" style="margin-top:15px;">Gửi</button>
            <button id="next-q-btn" class="action-button secondary-btn" style="display:none;margin-top:15px;">Tiếp</button>
        </div>`;
    
    dom.feedbackArea.textContent = `Câu ${state.questionsAnsweredInSession + 1}/${state.currentLearningSet.length}`;
    
    const inputEl = document.getElementById("type-ans-in");
    inputEl.focus();
    const subBtn = document.getElementById("sub-type-ans");
    const handler = () => handleGeneralTypeSubmission(qData);

    subBtn.addEventListener("click", handler);
    inputEl.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            handler();
            e.preventDefault();
        }
    });
}

export function initTypeMode(sessionSize = 10) {
    setCurrentMode("type");
    setActiveNavButton(dom.startTypeModeBtn);
    setActiveMobileNavButton(dom.startTypeModeBtnMobile);
    updateModeTitle('<i class="fas fa-keyboard"></i> Tự Luận');

    if (dom.welcomeMessageContainer) dom.welcomeMessageContainer.style.display = 'none';
    if (dom.modeSpecificContent) dom.modeSpecificContent.style.display = 'block';

    if (state.allPhrasalVerbs.length === 0) {
        dom.modeSpecificContent.innerHTML = '<p class="info-message">Không có từ vựng nào để học.</p>';
        return;
    }

    let tempSet = state.settings.shuffleVerbs ? shuffleArray([...state.allPhrasalVerbs]) : [...state.allPhrasalVerbs];
    setCurrentLearningSet(tempSet.slice(0, Math.min(state.allPhrasalVerbs.length, sessionSize)));
    resetScore();
    
    hideFooterControls();
    dom.scoreArea.style.display = "block";
    updateScoreInFooter();
    displayGeneralTypeQuestion();
}