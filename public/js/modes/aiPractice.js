import { dom } from '../dom.js';
import { state, setCurrentMode, resetAiPracticeState } from '../state.js';
import { normalizeAnswer } from '../utils.js';
import { saveProgress } from '../storage.js';
import { updateModeTitle, hideFooterControls, updateScoreInFooter, setActiveNavButton, setActiveMobileNavButton, displayWelcomeMessage, updateProgressSummary } from '../ui.js';
import { AI_PRACTICE_API_URL } from '../constants.js';

function highlightAiBlank(text, blankMarker) {
    if (!text) return "";
    const escapedMarker = blankMarker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escapedMarker, "g");
    return text.replace(regex, `<span class="blank-marker highlight">${blankMarker}</span>`);
}

function showAiPracticeSessionSummary() {
    updateModeTitle('<i class="fas fa-poll"></i> Kết Quả Luyện Tập AI');
    let totalInteractions = state.currentAiPracticeSet.reduce((acc, q) => {
        return acc + (q.content_json?.questions?.length || 1);
    }, 0);

    let summaryHTML = `
        <div class="session-summary ai-summary animate-pop-in">
            <h2><i class="fas fa-award"></i> Hoàn Thành Lượt Luyện Tập!</h2>
            <p class="summary-score">Điểm của bạn: <strong>${state.aiPracticeUserScore} / ${totalInteractions}</strong></p>`;
    
    if (state.aiPracticeIncorrectAnswers.length > 0) {
        summaryHTML += `<h3><i class="fas fa-book-open"></i> Xem Lại Câu Sai:</h3><ul class="review-incorrect-list">`;
        state.aiPracticeIncorrectAnswers.forEach(item => {
            summaryHTML += `
                <li>
                    ${item.passage_context ? `<div class="passage-text-review">${highlightAiBlank(item.passage_context, item.blank_marker_in_passage)}</div>` : ''}
                    <p class="question-prompt-review"><strong>Câu hỏi:</strong> ${item.question_prompt}</p>
                    <p><strong>Bạn trả lời:</strong> <span class="user-answer-review">${item.user_answer || "(Chưa trả lời)"}</span></p>
                    <p><strong>Đáp án đúng:</strong> <span class="correct-answer-review">${item.correct_answer}</span></p>
                    ${item.explanation ? `<p><small><em>Giải thích: ${item.explanation}</em></small></p>` : ''}
                </li>`;
        });
        summaryHTML += `</ul>`;
    } else {
        summaryHTML += `<p class="all-correct-message"><i class="fas fa-check-circle"></i> Xuất sắc! Bạn đã trả lời đúng tất cả!</p>`;
    }
    
    summaryHTML += `
            <div class="summary-actions">
                <button id="restart-ai-practice-btn" class="action-button primary-btn"><i class="fas fa-redo"></i> Luyện Tập Lượt Mới</button>
                <button id="back-to-modes-from-ai-btn" class="action-button secondary-btn"><i class="fas fa-th-large"></i> Chọn Chế Độ Khác</button>
            </div>
        </div>`;
    dom.modeSpecificContent.innerHTML = summaryHTML;
    hideFooterControls();

    document.getElementById("restart-ai-practice-btn").addEventListener("click", initAiPracticeMode);
    document.getElementById("back-to-modes-from-ai-btn").addEventListener("click", () => {
        setActiveNavButton(null);
        setActiveMobileNavButton(null);
        displayWelcomeMessage();
    });
    updateProgressSummary();
}

function addEventListenersToSingleMcqOptions(questionData) {
    const mcqCard = dom.modeSpecificContent.querySelector(`[data-question-id="${questionData.id}"]`);
    if (!mcqCard) return;
    const options = mcqCard.querySelectorAll(".options-list li");
    options.forEach(option => {
        const clickHandler = (event) => {
            const selectedOpt = event.target.closest('li');
            if (!selectedOpt || selectedOpt.classList.contains('disabled')) return;
            options.forEach(opt => opt.classList.add("disabled"));

            const isCorrect = normalizeAnswer(selectedOpt.dataset.value) === normalizeAnswer(questionData.content_json.correct_answer);
            const feedbackDiv = mcqCard.querySelector(".ai-feedback");
            if (isCorrect) {
                state.aiPracticeUserScore++;
                selectedOpt.classList.add("correct");
                feedbackDiv.textContent = "Chính xác!";
                feedbackDiv.className = "feedback-message ai-feedback correct";
            } else {
                selectedOpt.classList.add("incorrect");
                feedbackDiv.innerHTML = `Không đúng. Đáp án là: ${questionData.content_json.correct_answer}<br><small><em>${questionData.content_json.explanation || ''}</em></small>`;
                feedbackDiv.className = "feedback-message ai-feedback incorrect";
                mcqCard.querySelector(`li[data-value="${questionData.content_json.correct_answer}"]`)?.classList.add('correct-hint');
                state.aiPracticeIncorrectAnswers.push({ question_id: questionData.id, ...questionData.content_json, user_answer: selectedOpt.dataset.value });
            }
            feedbackDiv.style.display = "block";
            document.getElementById("next-ai-main-question-btn").style.display = "inline-flex";
            updateScoreInFooter();
        };
        option.addEventListener("click", clickHandler);
    });
}

function allSubQuestionsAttempted(passageCard, passageData) {
    const answeredCount = passageCard.querySelectorAll('.sub-question-block .answered').length;
    return answeredCount === passageData.content_json.questions.length;
}

function addEventListenersToAiPassageOptions(passageData) {
    const passageCard = dom.modeSpecificContent.querySelector(`[data-main-question-id="${passageData.id}"]`);
    passageData.content_json.questions.forEach(subQ => {
        const subQBlock = passageCard.querySelector(`#sub-q-${passageData.id}-${subQ.blank_number}`);
        subQBlock.querySelectorAll('li').forEach(li => {
            li.addEventListener('click', (e) => {
                if (li.parentElement.classList.contains('answered')) return;
                li.parentElement.classList.add('answered');
                
                const isCorrect = li.dataset.optionKey === subQ.correct_option_key;
                const feedbackEl = subQBlock.querySelector('.sub-feedback');

                if (isCorrect) {
                    state.aiPracticeUserScore++;
                    li.classList.add('correct');
                    feedbackEl.textContent = 'Chính xác!';
                    feedbackEl.className = 'feedback-message sub-feedback correct';
                } else {
                    li.classList.add('incorrect');
                    const correctText = subQ.options[subQ.correct_option_key];
                    feedbackEl.innerHTML = `Sai! Đáp án: ${subQ.correct_option_key}. ${correctText}<br><small><em>${subQ.explanation || ''}</em></small>`;
                    feedbackEl.className = 'feedback-message sub-feedback incorrect';
                    subQBlock.querySelector(`li[data-option-key="${subQ.correct_option_key}"]`).classList.add('correct-hint');
                    state.aiPracticeIncorrectAnswers.push({ ...passageData, ...subQ, user_answer: li.textContent.trim(), correct_answer: correctText, passage_context: passageData.content_json.passage_text_with_blanks, blank_marker_in_passage: `(${subQ.blank_number})___` });
                }
                feedbackEl.style.display = 'block';
                updateScoreInFooter();

                if (allSubQuestionsAttempted(passageCard, passageData)) {
                    document.getElementById('next-ai-main-question-btn').style.display = 'inline-flex';
                }
            });
        });
    });
}

function displayAiQuestion() {
    if (state.currentAiQuestionIndex >= state.currentAiPracticeSet.length) {
        showAiPracticeSessionSummary();
        return;
    }
    const questionData = state.currentAiPracticeSet[state.currentAiQuestionIndex];
    let html = '';

    if (questionData.type === 'passage_multi_cloze_mcq') {
        const content = questionData.content_json;
        html += `<div class="ai-practice-card passage-mcq-card animate-pop-in" data-main-question-id="${questionData.id}">
                    ${content.passage_title ? `<h3 class="passage-title">${content.passage_title}</h3>` : ''}
                    <div class="passage-text">${content.passage_text_with_blanks.replace(/\((\d+)\)_{2,}/g, `(<span class="blank-in-passage">$1</span>)___`)}</div>
                    <div class="passage-questions-container">`;
        content.questions.forEach(subQ => {
            html += `<div class="sub-question-block" id="sub-q-${questionData.id}-${subQ.blank_number}" data-blank-number="${subQ.blank_number}">
                        <p class="sub-question-prompt"><strong>${subQ.blank_number}.</strong> ${subQ.question_prompt || `Chọn đáp án cho chỗ trống (${subQ.blank_number})`}</p>
                        <ul class="options-list sub-options-list">${Object.entries(subQ.options).map(([key, text]) => `<li data-option-key="${key}" tabindex="0"><span class="option-key">${key}.</span> ${text}</li>`).join('')}</ul>
                        <div class="feedback-message sub-feedback" style="display: none;"></div>
                     </div>`;
        });
        html += `</div></div>`;
    } else if (questionData.type === 'single_mcq_pv') {
        const content = questionData.content_json;
        html += `<div class="ai-practice-card single-mcq-card animate-pop-in" data-question-id="${questionData.id}">
                    <h3 class="question-prompt">${highlightAiBlank(content.sentence_with_blank, '___')}</h3>
                    <ul class="options-list">${shuffleArray([...content.options]).map(opt => `<li data-value="${opt}" tabindex="0">${opt}</li>`).join('')}</ul>
                    <div class="feedback-message ai-feedback" style="display: none;"></div>
                 </div>`;
    } else {
        html = `<p class="error-message">Loại câu hỏi không được hỗ trợ: ${questionData.type}</p>`;
    }
    
    dom.modeSpecificContent.innerHTML = html;
    dom.modeSpecificContent.insertAdjacentHTML('beforeend', `
        <div id="ai-question-navigation" class="navigation-controls-footer" style="justify-content:center;">
            <button id="next-ai-main-question-btn" class="action-button primary-btn" style="display: none;">
                ${state.currentAiQuestionIndex >= state.currentAiPracticeSet.length - 1 ? '<i class="fas fa-flag-checkered"></i> Xem Tổng Kết' : '<i class="fas fa-arrow-right"></i> Câu Tiếp Theo'}
            </button>
        </div>`);

    document.getElementById('next-ai-main-question-btn').onclick = () => {
        state.currentAiQuestionIndex++;
        displayAiQuestion();
    };

    if (questionData.type === 'passage_multi_cloze_mcq') addEventListenersToAiPassageOptions(questionData);
    else if (questionData.type === 'single_mcq_pv') addEventListenersToSingleMcqOptions(questionData);
    updateScoreInFooter();
}

async function fetchAiPracticeSet() {
    try {
        const response = await fetch(AI_PRACTICE_API_URL);
        if (!response.ok) throw new Error(`Server AI trả về lỗi: ${response.status}`);
        state.currentAiPracticeSet = await response.json();

        if (state.currentAiPracticeSet && state.currentAiPracticeSet.length > 0) {
            displayAiQuestion();
        } else {
            dom.modeSpecificContent.innerHTML = '<p class="info-message">Không nhận được câu hỏi từ AI. Vui lòng thử lại.</p>';
        }
    } catch (error) {
        dom.modeSpecificContent.innerHTML = `<p class="error-message"><i class="fas fa-exclamation-triangle"></i> Lỗi: ${error.message}.</p>`;
    }
}

export function initAiPracticeMode() {
    setCurrentMode("aiPractice");
    setActiveNavButton(dom.startAiPracticeModeBtn);
    setActiveMobileNavButton(dom.startAiPracticeModeBtnMobile);
    updateModeTitle('<i class="fas fa-robot"></i> AI Luyện Tập');
    
    if (dom.welcomeMessageContainer) dom.welcomeMessageContainer.style.display = 'none';
    if (dom.modeSpecificContent) {
        dom.modeSpecificContent.style.display = 'flex';
        dom.modeSpecificContent.innerHTML = `
            <div id="ai-loading-screen" class="ai-loading-container">
                <div class="ai-loading-animation">
                    <div class="book-spinner">
                        <div class="page fixed-page left-cover"></div>
                        <div class="page flipping-page"></div>
                        <div class="page fixed-page right-cover"></div>
                        <div class="book-spine"></div>
                    </div>
                </div>
                <p class="ai-loading-text">Đang chuẩn bị bài luyện tập thông minh...</p>
                <p class="ai-loading-subtext">AI đang soạn thảo những câu hỏi thú vị dành riêng cho bạn. Vui lòng chờ!</p>
            </div>`;
    }
    
    hideFooterControls();
    resetAiPracticeState();
    fetchAiPracticeSet();
}
