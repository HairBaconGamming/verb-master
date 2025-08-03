import { dom } from '../dom.js';
import { state, setCurrentMode, setCurrentTestSet, resetScore, incrementScore, incrementAnswered } from '../state.js';
import { shuffleArray, normalizeAnswer } from '../utils.js';
import { saveProgress } from '../storage.js';
import { updateModeTitle, hideFooterControls, displayWelcomeMessage, updateScoreInFooter, setActiveNavButton, showToast } from '../ui.js';
import { MASTERY_LEVELS } from '../constants.js';

function showTestResults() {
    updateModeTitle('<i class="fas fa-poll"></i> Kết Quả Kiểm Tra');
    let resultsHTML = `
        <div class="test-results-container animate-pop-in">
            <h2><i class="fas fa-award"></i> Hoàn Thành Bài Kiểm Tra!</h2>
            <p>Điểm: <strong>${state.score} / ${state.currentTestSet.length}</strong> (${Math.round((state.score / state.currentTestSet.length) * 100) || 0}%)</p>
            <ul class="test-results-summary">`;

    state.currentTestSet.forEach((item, index) => {
        resultsHTML += `
            <li>
                <strong>Câu ${index + 1}: ${item.term}</strong><br>
                Bạn trả lời: <span class="user-answer ${item.isCorrect ? 'correct' : 'incorrect'}">${item.userAnswer || "(Bỏ qua)"}</span>
                ${!item.isCorrect ? `<br><span class="correct-answer-text">Đáp án đúng: ${item.definition}</span>` : ''}
            </li>`;

        item.lastReviewed = Date.now();
        if (item.isCorrect) item.totalCorrect++;
        else item.totalIncorrect++;

        if (item.isCorrect && item.masteryLevel < MASTERY_LEVELS.FAMILIAR) item.masteryLevel = MASTERY_LEVELS.FAMILIAR;
        else if (!item.isCorrect && item.masteryLevel >= MASTERY_LEVELS.LEARNING) item.masteryLevel = MASTERY_LEVELS.FAMILIAR;
    });

    resultsHTML += `</ul><button id="back-to-modes-btn" class="primary-btn" style="margin-top:25px;"><i class="fas fa-home"></i> Quay lại</button></div>`;
    dom.modeSpecificContent.innerHTML = resultsHTML;
    hideFooterControls();
    document.getElementById("back-to-modes-btn").addEventListener("click", () => {
        setActiveNavButton(null);
        displayWelcomeMessage();
    });
    saveProgress();
}

function displayTestQuestionItem() {
    if (state.questionsAnsweredInSession >= state.currentTestSet.length) {
        showTestResults();
        return;
    }
    const qData = state.currentTestSet[state.questionsAnsweredInSession];
    dom.feedbackArea.textContent = `Câu ${state.questionsAnsweredInSession + 1}/${state.currentTestSet.length}`;
    dom.feedbackArea.className = "feedback-area-footer";

    if (qData.questionType === "multipleChoice") {
        const correctAns = qData.definition;
        let opts = [correctAns];
        const distractors = state.allPhrasalVerbs.filter(v => v.id !== qData.id).map(v => v.definition);
        shuffleArray(distractors);
        for (let i = 0; opts.length < 4 && i < distractors.length; i++) {
            if (!opts.includes(distractors[i])) opts.push(distractors[i]);
        }
        while (opts.length < Math.min(4, state.allPhrasalVerbs.length)) {
            let rDef = state.allPhrasalVerbs[Math.floor(Math.random() * state.allPhrasalVerbs.length)].definition;
            if (!opts.includes(rDef)) opts.push(rDef);
        }
        shuffleArray(opts);
        dom.modeSpecificContent.innerHTML = `
            <div class="question-area animate-pop-in">
                <p>(Trắc nghiệm) "<strong>${qData.term}</strong>" nghĩa là gì?</p>
                <ul class="options-list">${opts.map(o => `<li data-answer="${o.replace(/"/g, '\"')}" tabindex="0">${o}</li>`).join('')}</ul>
            </div>`;
        dom.modeSpecificContent.querySelectorAll(".options-list li").forEach(li => {
            const handler = () => {
                qData.userAnswer = li.dataset.answer;
                qData.isCorrect = normalizeAnswer(li.dataset.answer) === normalizeAnswer(correctAns);
                if (qData.isCorrect) incrementScore();
                
                incrementAnswered();
                updateScoreInFooter();
                displayTestQuestionItem();
            };
            li.addEventListener("click", handler);
            li.addEventListener("keydown", (e) => {
                if (e.key === "Enter" || e.key === " ") {
                    handler();
                    e.preventDefault();
                }
            });
        });
    } else { // typeIn
        dom.modeSpecificContent.innerHTML = `
            <div class="type-question animate-pop-in">
                <p>(Tự luận) "<strong>${qData.term}</strong>" là gì?</p>
                <input type="text" id="test-type-in" placeholder="Đáp án..." autocomplete="off" autocorrect="off" autocapitalize="none">
                <button id="sub-test-type" class="action-button primary-btn" style="margin-top:15px;">Nộp & Tiếp</button>
            </div>`;
        const inputEl = document.getElementById("test-type-in");
        inputEl.focus();
        const subBtn = document.getElementById("sub-test-type");
        const handler = () => {
            qData.userAnswer = inputEl.value.trim();
            const correctOpts = qData.definition.toLowerCase().split(" / ").map(s => s.trim());
            qData.isCorrect = correctOpts.includes(qData.userAnswer.toLowerCase());
            if (qData.isCorrect) incrementScore();

            incrementAnswered();
            updateScoreInFooter();
            displayTestQuestionItem();
        };
        subBtn.addEventListener("click", handler);
        inputEl.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                handler();
                e.preventDefault();
            }
        });
    }
}


export function startNewTest() {
    const numQuestions = parseInt(dom.numTestQuestionsInput.value);
    const selectedTypesCheckboxes = document.querySelectorAll('#test-settings-modal input[name="questionType"]:checked');
    let questionTypes = Array.from(selectedTypesCheckboxes).map(cb => cb.value);

    if (numQuestions <= 0 || numQuestions > state.allPhrasalVerbs.length) {
        showToast("Số câu hỏi không hợp lệ.", "error");
        return;
    }
    if (questionTypes.length === 0) {
        showToast("Chọn ít nhất một loại câu hỏi.", "error");
        return;
    }
    dom.testSettingsModal.classList.remove("show-modal");

    let baseTestSet = state.settings.shuffleVerbs ? shuffleArray([...state.allPhrasalVerbs]) : [...state.allPhrasalVerbs];
    const testSet = baseTestSet.slice(0, numQuestions).map(verb => ({
        ...verb,
        questionType: questionTypes[Math.floor(Math.random() * questionTypes.length)],
        userAnswer: null,
        isCorrect: null,
    }));
    setCurrentTestSet(testSet);

    resetScore();
    hideFooterControls();
    dom.scoreArea.style.display = "block";
    updateScoreInFooter();
    displayTestQuestionItem();
}

export function initTestSettings() {
    setCurrentMode("test");
    updateModeTitle('<i class="fas fa-file-alt"></i> Bài Kiểm Tra');
    
    if (dom.welcomeMessageContainer) dom.welcomeMessageContainer.style.display = 'none';
    if (dom.modeSpecificContent) dom.modeSpecificContent.style.display = 'block';

    if (state.allPhrasalVerbs.length === 0) {
        dom.modeSpecificContent.innerHTML = '<p class="info-message">Không có từ để kiểm tra.</p>';
        return;
    }
    dom.modeSpecificContent.innerHTML = "";
    dom.numTestQuestionsInput.max = state.allPhrasalVerbs.length;
    dom.numTestQuestionsInput.value = Math.min(10, state.allPhrasalVerbs.length);
    dom.testSettingsModal.classList.add("show-modal");
}