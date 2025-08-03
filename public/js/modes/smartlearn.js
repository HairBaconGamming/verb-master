import { dom } from '../dom.js';
import { state, setCurrentMode, setCurrentLearningSet, setSmartLearnSessionQueue, resetSmartLearnRound, resetScore } from '../state.js';
import { shuffleArray, normalizeAnswer, normalizeAndCompareAnswers } from '../utils.js';
import { saveProgress } from '../storage.js';
import { updateModeTitle, hideFooterControls, setActiveNavButton, setActiveMobileNavButton, updateScoreInFooter, displayWelcomeMessage } from '../ui.js';
import { MASTERY_LEVELS, SMART_LEARN_ROUND_SIZE_ADVANCED, MIN_CORRECT_IN_ROW_FOR_ROUND_MASTERY, MAX_EXPOSURES_PER_VERB_IN_ROUND, FAMILIAR_THRESHOLD_SRS_BOX, LEARNING_THRESHOLD_SRS_BOX, SRS_INTERVALS } from '../constants.js';

// ... (Các hàm renderSmartLearnFlashcard, renderSmartLearnMCQ, renderSmartLearnTypeIn, handleSmartLearnAnswer, determineNextChallengeType, etc. giữ nguyên như file trước)
function renderSmartLearnFlashcard(verbData, type) {
    if (!dom.modeSpecificContent) return;

    const flashcardHTML = `
        <div class="flashcard-container animate-pop-in">
            <div class="flashcard" id="smart-learn-flashcard" tabindex="0">
                <div class="front"><p class="flashcard-term">${verbData.term}</p></div>
                <div class="back"><p class="flashcard-definition">${verbData.definition}</p></div>
            </div>
        </div>
        <p class="instruction-text">${type === 'flashcard_intro' ? "Làm quen với từ này. Lật thẻ để xem nghĩa." : "Hãy nhớ lại! Bạn có biết từ này không?"}</p>
        <div class="flashcard-actions">
            <button id="sl-fc-incorrect" class="action-button danger-btn"><i class="fas fa-times"></i> Chưa biết</button>
            <button id="sl-fc-correct" class="action-button success-btn"><i class="fas fa-check"></i> Đã biết</button>
        </div>
    `;
    dom.modeSpecificContent.innerHTML = flashcardHTML;
    dom.feedbackArea.textContent = "";

    const flashcardEl = dom.modeSpecificContent.querySelector("#smart-learn-flashcard");
    const incorrectBtn = dom.modeSpecificContent.querySelector("#sl-fc-incorrect");
    const correctBtn = dom.modeSpecificContent.querySelector("#sl-fc-correct");

    if (flashcardEl) {
        flashcardEl.addEventListener("click", () => flashcardEl.classList.toggle("flipped"));
        flashcardEl.addEventListener("keydown", (e) => {
            if (e.key === " " || e.key === "Enter") {
                flashcardEl.classList.toggle("flipped");
                e.preventDefault();
            }
        });
    }
    if (correctBtn) correctBtn.onclick = () => handleSmartLearnAnswer(verbData, true, type);
    if (incorrectBtn) incorrectBtn.onclick = () => handleSmartLearnAnswer(verbData, false, type);
}

function renderSmartLearnMCQ(verbData, questionType, direction = "term_to_def") {
    let questionText, correctAnswer, optionsPoolSource;
    if (direction === "term_to_def") {
        questionText = `Nghĩa của "<strong>${verbData.term}</strong>" là gì?`;
        correctAnswer = verbData.definition;
        optionsPoolSource = state.allPhrasalVerbs.filter(v => v.id !== verbData.id).map(v => v.definition);
    } else {
        questionText = `Phrasal verb nào có nghĩa là "<strong>${verbData.definition}</strong>"?`;
        correctAnswer = verbData.term;
        optionsPoolSource = state.allPhrasalVerbs.filter(v => v.id !== verbData.id).map(v => v.term);
    }

    let options = [correctAnswer];
    shuffleArray(optionsPoolSource);
    const numOptions = questionType.includes("easy") ? 2 : 4;
    for (let i = 0; options.length < numOptions && i < optionsPoolSource.length; i++) {
        if (!options.includes(optionsPoolSource[i])) options.push(optionsPoolSource[i]);
    }
    while (options.length < Math.min(numOptions, state.allPhrasalVerbs.length)) {
        let randomItem = state.allPhrasalVerbs[Math.floor(Math.random() * state.allPhrasalVerbs.length)];
        let randomOption = direction === "term_to_def" ? randomItem.definition : randomItem.term;
        if (!options.includes(randomOption)) options.push(randomOption);
    }
    shuffleArray(options);

    dom.modeSpecificContent.innerHTML = `
        <div class="question-area animate-pop-in">
            <p>${questionText}</p>
            <ul class="options-list ${numOptions === 2 ? 'easy-mcq-options' : ''}">${options.map(opt => `<li data-answer="${String(opt).replace(/"/g, '\"')}" tabindex="0" role="button">${opt}</li>`).join('')}</ul>
        </div>`;
    
    dom.feedbackArea.textContent = "";
    dom.modeSpecificContent.querySelectorAll(".options-list li").forEach(li => {
        const handler = () => {
            const isCorrect = normalizeAnswer(li.dataset.answer) === normalizeAnswer(correctAnswer);
            dom.modeSpecificContent.querySelectorAll(".options-list li").forEach(innerLi => {
                innerLi.classList.add("disabled");
                if (normalizeAnswer(innerLi.dataset.answer) === normalizeAnswer(correctAnswer)) innerLi.classList.add("correct");
                else if (innerLi === li && !isCorrect) innerLi.classList.add("incorrect");
            });
            handleSmartLearnAnswer(verbData, isCorrect, questionType);
        };
        li.addEventListener("click", handler);
        li.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                handler();
                e.preventDefault();
            }
        });
    });
}

function renderSmartLearnTypeIn(verbData, questionType, direction = "term_to_def") {
    let promptText, answerToType, questionUILabel, placeholderText;
    if (direction === "term_to_def") {
        promptText = verbData.term;
        answerToType = verbData.definition;
        questionUILabel = `Phrasal verb tiếng Anh tương ứng là gì?`;
        placeholderText = "Nhập phrasal verb...";
    } else {
        promptText = verbData.definition;
        answerToType = verbData.term;
        questionUILabel = `Nghĩa tiếng Việt của phrasal verb này là gì?`;
        placeholderText = "Nhập nghĩa tiếng Việt...";
    }

    dom.modeSpecificContent.innerHTML = `
        <div class="type-question animate-pop-in">
            <p class="prompt-text">Cho: "<strong>${promptText}</strong>"</p>
            <p class="question-label">${questionUILabel}</p>
            <input type="text" id="sl-type-input" placeholder="${placeholderText}" autocomplete="off" autocorrect="off" autocapitalize="none">
            <button id="submit-sl-type" class="action-button primary-btn" style="margin-top:15px;"><i class="fas fa-paper-plane"></i> Gửi</button>
        </div>`;
    
    dom.feedbackArea.textContent = "";
    const inputEl = dom.modeSpecificContent.querySelector("#sl-type-input");
    const submitBtn = dom.modeSpecificContent.querySelector("#submit-sl-type");

    if (inputEl && submitBtn) {
        inputEl.focus();
        const submitHandler = () => {
            const isCorrect = normalizeAndCompareAnswers(inputEl.value, answerToType);
            inputEl.disabled = true;
            submitBtn.disabled = true;
            inputEl.classList.add(isCorrect ? "correct-input-feedback" : "incorrect-input-feedback");
            handleSmartLearnAnswer(verbData, isCorrect, questionType);
        };
        submitBtn.addEventListener("click", submitHandler);
        inputEl.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                submitHandler();
                e.preventDefault();
            }
        });
    }
}

function handleSmartLearnAnswer(verbData, isCorrect, questionType) {
    if (!verbData || !verbData.id || !state.smartLearnRoundProgress[verbData.id]) {
        console.error("Invalid state in handleSmartLearnAnswer", { verbData, progress: state.smartLearnRoundProgress[verbData.id] });
        state.smartLearnCurrentIndexInQueue++;
        setTimeout(displayNextSmartLearnItem, 500);
        return;
    }
    
    let roundProgress = state.smartLearnRoundProgress[verbData.id];
    verbData.lastReviewed = Date.now();

    if (isCorrect) {
        verbData.totalCorrect = (verbData.totalCorrect || 0) + 1;
        verbData.correctStreak = (verbData.correctStreak || 0) + 1;
        verbData.incorrectStreak = 0;
        roundProgress.correctInRow++;
    } else {
        verbData.totalIncorrect = (verbData.totalIncorrect || 0) + 1;
        verbData.incorrectStreak = (verbData.incorrectStreak || 0) + 1;
        verbData.correctStreak = 0;
        roundProgress.correctInRow = 0;
        roundProgress.masteredInRound = false;
        if (verbData.srsBox > 0) {
            verbData.srsBox = Math.max(0, verbData.srsBox - 1);
        }
    }

    if (!roundProgress.masteredInRound && roundProgress.correctInRow >= MIN_CORRECT_IN_ROW_FOR_ROUND_MASTERY) {
        if (questionType.includes('type_') || questionType.includes('hard_mcq')) {
             roundProgress.masteredInRound = true;
        }
    }

    if (roundProgress.masteredInRound && isCorrect) {
        if (verbData.srsBox < Object.keys(SRS_INTERVALS).length - 1) {
            verbData.srsBox++;
        }
    }
    
    if (verbData.srsBox === 0) verbData.masteryLevel = MASTERY_LEVELS.NEW;
    else if (verbData.srsBox <= FAMILIAR_THRESHOLD_SRS_BOX) verbData.masteryLevel = MASTERY_LEVELS.FAMILIAR;
    else if (verbData.srsBox <= LEARNING_THRESHOLD_SRS_BOX) verbData.masteryLevel = MASTERY_LEVELS.LEARNING;
    else verbData.masteryLevel = MASTERY_LEVELS.MASTERED;

    saveProgress();

    const correctAnswerText = questionType.includes("_def_to_term") ? verbData.term : verbData.definition;
    dom.feedbackArea.textContent = isCorrect ? "Chính xác!" : `Sai! Đáp án đúng là: ${correctAnswerText}`;
    dom.feedbackArea.className = `feedback-area-footer ${isCorrect ? 'correct' : 'incorrect'}`;
    
    updateScoreInFooter();
    state.smartLearnCurrentIndexInQueue++;

    if (!roundProgress.masteredInRound && roundProgress.timesSeenInRound < MAX_EXPOSURES_PER_VERB_IN_ROUND) {
        let nextChallengeType = determineNextChallengeType(verbData, isCorrect, questionType, roundProgress);
        if (nextChallengeType) {
            const insertIndex = Math.min(state.smartLearnCurrentIndexInQueue + Math.floor(Math.random() * 2) + 1, state.smartLearnSessionQueue.length);
            state.smartLearnSessionQueue.splice(insertIndex, 0, { verbId: verbData.id, type: nextChallengeType });
        }
    }

    setTimeout(displayNextSmartLearnItem, 1800);
}

function determineNextChallengeType(verbData, lastAnswerWasCorrect, lastQuestionType, roundProgress) {
    if (!lastAnswerWasCorrect) {
        return "flashcard_recall";
    }
    if (lastQuestionType.includes('flashcard')) return 'easy_mcq_term_to_def';
    if (lastQuestionType.includes('easy_mcq')) return 'hard_mcq_term_to_def';
    if (lastQuestionType.includes('hard_mcq')) return 'type_definition_from_term';
    return 'type_definition_from_term';
}

function addInitialQuestionsToQueue(verbId) {
    const verb = state.allPhrasalVerbs.find(v => v.id === verbId);
    if (!verb) return;
    
    const progress = state.smartLearnRoundProgress[verb.id];

    if (progress.timesSeenInRound === 0 || verb.srsBox === 0) {
        state.smartLearnSessionQueue.push({ verbId: verb.id, type: "flashcard_intro" });
        progress.questionTypesUsedInRound.add("flashcard_intro");
    }

    state.smartLearnSessionQueue.push({ verbId: verb.id, type: 'easy_mcq_term_to_def' });
    progress.questionTypesUsedInRound.add('easy_mcq_term_to_def');
}

function selectVerbsForSmartLearnRound(targetSize) {
    const now = Date.now();
    let potentialVerbs = state.allPhrasalVerbs.filter(v => v.masteryLevel < MASTERY_LEVELS.MASTERED || (v.nextReviewDate && v.nextReviewDate <= now));
    potentialVerbs.sort((a, b) => (a.srsBox || 0) - (b.srsBox || 0) || (a.lastReviewed || 0) - (b.lastReviewed || 0));
    let selectedSet = potentialVerbs.slice(0, targetSize);
    
    if (selectedSet.length < targetSize) {
        const newestVerbs = state.allPhrasalVerbs
            .filter(v => v.masteryLevel === MASTERY_LEVELS.NEW && !selectedSet.find(s => s.id === v.id))
            .sort(() => 0.5 - Math.random());
        selectedSet.push(...newestVerbs.slice(0, targetSize - selectedSet.length));
    }
    return selectedSet;
}

function generateMoreSmartLearnItems() {
    let itemsAdded = 0;
    state.currentLearningSet.forEach(verb => {
        const progress = state.smartLearnRoundProgress[verb.id];
        if (progress && !progress.masteredInRound && progress.timesSeenInRound < MAX_EXPOSURES_PER_VERB_IN_ROUND) {
            const alreadyQueued = state.smartLearnSessionQueue.slice(state.smartLearnCurrentIndexInQueue).some(item => item.verbId === verb.id);
            if (!alreadyQueued) {
                let nextType = determineNextChallengeType(verb, false, 'type_definition_from_term', progress);
                state.smartLearnSessionQueue.push({ verbId: verb.id, type: nextType });
                itemsAdded++;
            }
        }
    });
    return itemsAdded > 0;
}

function showSmartLearnRoundEndSummary() {
    updateModeTitle('<i class="fas fa-flag-checkered"></i> Hoàn Thành Vòng SmartLearn!');
    const masteredCount = state.currentLearningSet.filter(v => state.smartLearnRoundProgress[v.id]?.masteredInRound).length;

    dom.modeSpecificContent.innerHTML = `
        <div class="session-summary smartlearn-summary animate-pop-in">
            <h2><i class="fas fa-award"></i> Kết thúc vòng học!</h2>
            <p class="summary-score">Bạn đã làm chủ <strong>${masteredCount} / ${state.currentLearningSet.length}</strong> từ trong vòng này.</p>
            <div class="summary-actions">
                <button id="continue-smart-learn-btn" class="action-button primary-btn"><i class="fas fa-arrow-right"></i> Tiếp tục vòng mới</button>
                <button id="choose-other-mode-btn" class="action-button secondary-btn"><i class="fas fa-th-large"></i> Chọn chế độ khác</button>
            </div>
        </div>`;
    hideFooterControls();
    document.getElementById("continue-smart-learn-btn").addEventListener("click", initSmartLearnMode);
    document.getElementById("choose-other-mode-btn").addEventListener("click", () => {
        setActiveNavButton(null);
        setActiveMobileNavButton(null);
        displayWelcomeMessage();
    });
}

export function displayNextSmartLearnItem() {
    if (state.smartLearnCurrentIndexInQueue >= state.smartLearnSessionQueue.length) {
        const allMastered = state.currentLearningSet.every(v => state.smartLearnRoundProgress[v.id]?.masteredInRound);
        if(allMastered || !generateMoreSmartLearnItems()) {
            showSmartLearnRoundEndSummary();
            return;
        }
    }
    
    const currentItem = state.smartLearnSessionQueue[state.smartLearnCurrentIndexInQueue];
    const verbData = state.allPhrasalVerbs.find(v => v.id === currentItem.verbId);
    
    if (!verbData) {
        state.smartLearnCurrentIndexInQueue++;
        displayNextSmartLearnItem();
        return;
    }
    
    const roundProgress = state.smartLearnRoundProgress[verbData.id];
    if (roundProgress) roundProgress.timesSeenInRound++;
    
    switch (currentItem.type) {
        case "flashcard_intro":
        case "flashcard_recall":
            renderSmartLearnFlashcard(verbData, currentItem.type);
            break;
        case "easy_mcq_term_to_def":
        case "hard_mcq_term_to_def":
            renderSmartLearnMCQ(verbData, currentItem.type, "term_to_def");
            break;
        case "easy_mcq_def_to_term":
        case "hard_mcq_def_to_term":
            renderSmartLearnMCQ(verbData, currentItem.type, "def_to_term");
            break;
        case "type_definition_from_term":
            renderSmartLearnTypeIn(verbData, currentItem.type, "term_to_def");
            break;
        case "type_term_from_def":
            renderSmartLearnTypeIn(verbData, currentItem.type, "def_to_term");
            break;
        default:
            renderSmartLearnFlashcard(verbData, "flashcard_recall");
    }
    updateScoreInFooter();
}

export function initSmartLearnMode() {
    setCurrentMode("smartlearn");
    setActiveNavButton(dom.startSmartLearnModeBtn);
    setActiveMobileNavButton(dom.startSmartLearnModeBtnMobile);
    updateModeTitle('<i class="fas fa-brain"></i> SmartLearn Pro');
    if (dom.welcomeMessageContainer) dom.welcomeMessageContainer.style.display = 'none';
    if (dom.modeSpecificContent) dom.modeSpecificContent.style.display = 'block';

    const learningSet = selectVerbsForSmartLearnRound(SMART_LEARN_ROUND_SIZE_ADVANCED);

    if (learningSet.length === 0) {
        dom.modeSpecificContent.innerHTML = `
            <div class="session-summary animate-pop-in">
                <h2><i class="fas fa-check-circle"></i> Hoàn Tất!</h2>
                <p>Bạn đã ôn tập tất cả các từ cần thiết. Hãy quay lại sau!</p>
                <div class="summary-actions">
                     <button id="choose-other-mode-btn" class="action-button secondary-btn"><i class="fas fa-th-large"></i> Chọn chế độ khác</button>
                </div>
            </div>`;
        hideFooterControls();
        document.getElementById("choose-other-mode-btn").addEventListener("click", () => {
            setActiveNavButton(null);
            setActiveMobileNavButton(null);
            displayWelcomeMessage();
        });
        return;
    }

    setCurrentLearningSet(learningSet);
    resetSmartLearnRound();

    learningSet.forEach(verb => {
        state.smartLearnRoundProgress[verb.id] = {
            correctInRow: 0,
            timesSeenInRound: 0,
            masteredInRound: false,
            questionTypesUsedInRound: new Set(),
        };
        addInitialQuestionsToQueue(verb.id);
    });

    setSmartLearnSessionQueue(shuffleArray(state.smartLearnSessionQueue));
    resetScore();
    hideFooterControls();
    if (dom.progressBarContainer) dom.progressBarContainer.style.display = "block";
    updateScoreInFooter();
    displayNextSmartLearnItem();
}