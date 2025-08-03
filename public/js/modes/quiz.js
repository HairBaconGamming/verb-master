import { dom } from '../dom.js';
import { state, setCurrentMode, setCurrentLearningSet, resetScore, incrementScore, incrementAnswered } from '../state.js';
import { shuffleArray, normalizeAnswer } from '../utils.js';
import { saveProgress } from '../storage.js';
import { updateModeTitle, hideFooterControls, showSessionEndSummary, updateScoreInFooter, setActiveNavButton, setActiveMobileNavButton } from '../ui.js';

function handleGeneralQuizChoice(selectedLi, qData) {
    const selectedAns = selectedLi.dataset.answer;
    const correctAns = qData.definition;
    const isCorrect = normalizeAnswer(selectedAns) === normalizeAnswer(correctAns);

    dom.modeSpecificContent.querySelectorAll(".options-list li").forEach(li => {
        li.classList.add("disabled");
        if (normalizeAnswer(li.dataset.answer) === normalizeAnswer(correctAns)) li.classList.add("correct");
        else if (li === selectedLi && !isCorrect) li.classList.add("incorrect");
    });

    if (isCorrect) {
        incrementScore();
        dom.feedbackArea.textContent = "Chính xác!";
        dom.feedbackArea.className = "feedback-area-footer correct";
        qData.totalCorrect++;
    } else {
        dom.feedbackArea.textContent = `Sai! Đúng là: ${correctAns}`;
        dom.feedbackArea.className = "feedback-area-footer incorrect";
        qData.totalIncorrect++;
    }
    
    qData.lastReviewed = Date.now();
    saveProgress();
    updateScoreInFooter();
    
    const nextBtn = dom.modeSpecificContent.querySelector("#next-q-btn"); // Sửa thành querySelector
    if (nextBtn) {
        nextBtn.style.display = "inline-flex";
        nextBtn.focus();
        nextBtn.onclick = () => {
            incrementAnswered();
            displayGeneralQuizQuestion();
        };
    }
}

function displayGeneralQuizQuestion() {
    if (state.questionsAnsweredInSession >= state.currentLearningSet.length) {
        // SỬA LỖI: Truyền initQuizMode vào làm callback
        showSessionEndSummary("Trắc Nghiệm", state.score, state.currentLearningSet.length, initQuizMode);
        return;
    }
    const qData = state.currentLearningSet[state.questionsAnsweredInSession];
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
            <p>"<strong>${qData.term}</strong>" nghĩa là gì?</p>
            <ul class="options-list">${opts.map(o => `<li data-answer="${o.replace(/"/g, '\"')}" tabindex="0">${o}</li>`).join('')}</ul>
            <button id="next-q-btn" class="action-button primary-btn" style="display:none;margin-top:20px;">Tiếp</button>
        </div>`;
    
    dom.feedbackArea.textContent = `Câu ${state.questionsAnsweredInSession + 1}/${state.currentLearningSet.length}`;
    
    dom.modeSpecificContent.querySelectorAll(".options-list li").forEach(li => {
        const handler = () => handleGeneralQuizChoice(li, qData);
        li.addEventListener("click", handler);
        li.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                handler();
                e.preventDefault();
            }
        });
    });
}

export function initQuizMode(sessionSize = 10) {
    setCurrentMode("quiz");
    setActiveNavButton(dom.startQuizModeBtn);
    setActiveMobileNavButton(dom.startQuizModeBtnMobile);
    updateModeTitle('<i class="fQas fa-list-check"></i> Trắc Nghiệm');
    
    if (dom.welcomeMessageContainer) dom.welcomeMessageContainer.style.display = 'none';
    if (dom.modeSpecificContent) dom.modeSpecificContent.style.display = 'block';

    if (state.allPhrasalVerbs.length < 4) {
        dom.modeSpecificContent.innerHTML = '<p class="info-message">Cần ít nhất 4 từ để bắt đầu chế độ Trắc Nghiệm.</p>';
        return;
    }
    
    let tempSet = state.settings.shuffleVerbs ? shuffleArray([...state.allPhrasalVerbs]) : [...state.allPhrasalVerbs];
    setCurrentLearningSet(tempSet.slice(0, Math.min(state.allPhrasalVerbs.length, sessionSize)));
    resetScore();
    
    hideFooterControls();
    dom.scoreArea.style.display = "flex"; // Sửa thành flex để căn giữa
    updateScoreInFooter();
    displayGeneralQuizQuestion();
}