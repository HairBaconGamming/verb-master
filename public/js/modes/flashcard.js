import { dom } from '../dom.js';
import { state, setCurrentMode, setCurrentLearningSet, setCurrentIndex } from '../state.js';
import { shuffleArray } from '../utils.js';
import { saveProgress } from '../storage.js';
import { updateModeTitle, hideFooterControls, setActiveNavButton, setActiveMobileNavButton } from '../ui.js';
import { MASTERY_LEVELS } from '../constants.js';

function displayFlashcard() {
    if (state.currentIndex >= state.currentLearningSet.length) {
        dom.modeSpecificContent.innerHTML = '<p class="info-message">Hết thẻ!</p>';
        hideFooterControls();
        return;
    }
    const verb = state.currentLearningSet[state.currentIndex];
    dom.modeSpecificContent.innerHTML = `
        <div class="flashcard-container"><div class="flashcard" id="current-flashcard" tabindex="0">
            <div class="front"><p class="flashcard-term">${verb.term}</p>${verb.example ? `<p class="flashcard-example"><em>e.g., ${verb.example}</em></p>` : ''}</div>
            <div class="back"><p class="flashcard-definition">${verb.definition}</p></div>
        </div></div>
        <div class="flashcard-actions">
            <button id="fc-mark-incorrect" class="action-button danger-btn"><i class="fas fa-times-circle"></i> Chưa biết</button>
            <button id="fc-mark-correct" class="action-button success-btn"><i class="fas fa-check-circle"></i> Đã biết</button>
        </div>`;
    
    const fcEl = document.getElementById("current-flashcard");
    fcEl.addEventListener("click", () => fcEl.classList.toggle("flipped"));
    fcEl.addEventListener("keydown", (e) => {
        if (e.key === " " || e.key === "Enter") {
            fcEl.classList.toggle("flipped");
            e.preventDefault();
        }
    });

    document.getElementById("fc-mark-correct").onclick = () => handleFlashcardMarkSimple(true);
    document.getElementById("fc-mark-incorrect").onclick = () => handleFlashcardMarkSimple(false);
    updateFlashcardNavUI();
}

function handleFlashcardMarkSimple(known) {
    const verb = state.currentLearningSet[state.currentIndex];
    verb.lastReviewed = Date.now();
    if (known) verb.totalCorrect++;
    else verb.totalIncorrect++;

    if (known && verb.masteryLevel < MASTERY_LEVELS.FAMILIAR) verb.masteryLevel = MASTERY_LEVELS.FAMILIAR;
    else if (!known && verb.masteryLevel > MASTERY_LEVELS.NEW) verb.masteryLevel = MASTERY_LEVELS.NEW;
    
    saveProgress();
    dom.feedbackArea.textContent = known ? `"${verb.term}" được ghi nhớ.` : `"${verb.term}" cần ôn thêm.`;
    dom.feedbackArea.className = `feedback-area-footer ${known ? 'correct' : 'incorrect'}`;

    setTimeout(() => {
        if (state.currentIndex < state.currentLearningSet.length - 1) {
            setCurrentIndex(state.currentIndex + 1);
            displayFlashcard();
        } else {
            dom.modeSpecificContent.innerHTML = '<p class="info-message">Hết thẻ!</p>';
            hideFooterControls();
        }
    }, 1000);
}

function updateFlashcardNavUI() {
    dom.prevCardBtn.disabled = state.currentIndex === 0;
    dom.nextCardBtn.disabled = state.currentIndex >= state.currentLearningSet.length - 1;
    dom.cardNumberDisplay.textContent = `${state.currentIndex + 1} / ${state.currentLearningSet.length}`;
}

export function navigateFlashcardPrev() {
    if (state.currentMode === "flashcard" && state.currentIndex > 0) {
        setCurrentIndex(state.currentIndex - 1);
        displayFlashcard();
    }
}

export function navigateFlashcardNext() {
    if (state.currentMode === "flashcard" && state.currentIndex < state.currentLearningSet.length - 1) {
        setCurrentIndex(state.currentIndex + 1);
        displayFlashcard();
    } else if (state.currentMode === "flashcard") {
        dom.modeSpecificContent.innerHTML = '<p class="info-message">Hết thẻ!</p>';
        hideFooterControls();
    }
}

export function initFlashcardMode() {
    setCurrentMode("flashcard");
    setActiveNavButton(dom.startFlashcardModeBtn);
    setActiveMobileNavButton(dom.startFlashcardModeBtnMobile);
    updateModeTitle('<i class="fas fa-clone"></i> Flashcards');

    if (dom.welcomeMessageContainer) dom.welcomeMessageContainer.style.display = 'none';
    if (dom.modeSpecificContent) dom.modeSpecificContent.style.display = 'block';

    if (state.allPhrasalVerbs.length === 0) {
        dom.modeSpecificContent.innerHTML = '<p class="info-message">Không có từ vựng nào để học.</p>';
        return;
    }
    
    const learningSet = state.settings.shuffleVerbs ? shuffleArray([...state.allPhrasalVerbs]) : [...state.allPhrasalVerbs];
    setCurrentLearningSet(learningSet);
    setCurrentIndex(0);
    
    hideFooterControls();
    dom.navigationControls.style.display = "flex";
    dom.feedbackArea.textContent = "Lật thẻ để xem nghĩa.";
    
    displayFlashcard();
}