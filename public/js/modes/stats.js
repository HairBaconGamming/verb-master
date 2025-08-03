import { dom } from '../dom.js';
import { state, setCurrentMode } from '../state.js';
import { updateModeTitle, hideFooterControls, displayWelcomeMessage, setActiveNavButton, setActiveMobileNavButton } from '../ui.js';
import { renderMasteryDoughnutChart } from '../chart.js'; // SỬA LỖI: charts.js -> chart.js
import { MASTERY_LEVELS } from '../constants.js';
import { initSmartLearnMode } from './smartlearn.js';

function renderAdvancedStats() {
    if (state.allPhrasalVerbs.length === 0) {
        dom.modeSpecificContent.innerHTML = '<p class="info-message">Không có dữ liệu thống kê.</p>';
        return;
    }
    const totalVerbs = state.allPhrasalVerbs.length;
    const masteredCount = state.allPhrasalVerbs.filter(v => v.masteryLevel === MASTERY_LEVELS.MASTERED).length;
    const learningCount = state.allPhrasalVerbs.filter(v => v.masteryLevel === MASTERY_LEVELS.LEARNING || v.masteryLevel === MASTERY_LEVELS.FAMILIAR).length;
    const newCount = state.allPhrasalVerbs.filter(v => v.masteryLevel === MASTERY_LEVELS.NEW).length;
    const overallMasteryPercentage = totalVerbs > 0 ? ((masteredCount / totalVerbs) * 100).toFixed(1) : 0;

    const verbsByDetailedMastery = {
        [MASTERY_LEVELS.NEW]: 0,
        [MASTERY_LEVELS.FAMILIAR]: 0,
        [MASTERY_LEVELS.LEARNING]: 0,
        [MASTERY_LEVELS.MASTERED]: 0,
    };
    state.allPhrasalVerbs.forEach(v => {
        // Fallback for older data structures that might not have masteryLevel
        verbsByDetailedMastery[v.masteryLevel || MASTERY_LEVELS.NEW]++;
    });
    
    const detailedMasteryDataValues = Object.values(MASTERY_LEVELS).sort((a,b)=>a-b).map(level => verbsByDetailedMastery[level]);
    const detailedMasteryLabels = ["Mới", "Thân Quen", "Đang Học", "Thành Thạo"];

    const dueForReviewCount = state.allPhrasalVerbs.filter(v => v.masteryLevel !== MASTERY_LEVELS.MASTERED).length;
    
    const mostCorrect = [...state.allPhrasalVerbs].sort((a, b) => (b.totalCorrect || 0) - (a.totalCorrect || 0)).slice(0, 5);
    const mostIncorrect = [...state.allPhrasalVerbs].filter(v => (v.totalIncorrect || 0) > 0).sort((a, b) => (b.totalIncorrect || 0) - (a.totalIncorrect || 0)).slice(0, 5);

    let statsHTML = `
        <div class="advanced-stats-container animate-pop-in">
            <h2><i class="fas fa-tachometer-alt"></i> Bảng Điều Khiển</h2>
            <div class="stats-grid">
                <div class="stat-card main-stat">
                    <h3><i class="fas fa-graduation-cap"></i> Thành Thạo</h3>
                    <div class="progress-bar-container"><div class="progress-bar" style="width:${overallMasteryPercentage}%;" data-label="${overallMasteryPercentage}%"></div></div>
                    <p><strong>${masteredCount}</strong> / ${totalVerbs} từ.</p>
                </div>
                <div class="stat-card">
                    <h3><i class="fas fa-layer-group"></i> Phân Loại</h3>
                    <p>Mới: <strong>${newCount}</strong></p>
                    <p>Đang học: <strong>${learningCount}</strong></p>
                    <p>Thành thạo: <strong>${masteredCount}</strong></p>
                </div>
                <div class="stat-card">
                    <h3><i class="fas fa-bell"></i> Cần Ôn Tập</h3>
                    <p>Số từ: <strong>${dueForReviewCount}</strong></p>
                    ${dueForReviewCount > 0 ? `<button id="reviewDueNowBtn" class="action-button secondary-btn small-btn"><i class="fas fa-book-reader"></i> Ôn ngay</button>` : '<p>Tuyệt vời, không có từ nào cần ôn gấp!</p>'}
                </div>
            </div>
            <div class="stats-grid equal-height-cards">
                <div class="stat-card list-card">
                    <h3><i class="fas fa-thumbs-up"></i> Top Hay Đúng</h3>
                    ${mostCorrect.length > 0 && mostCorrect[0].totalCorrect > 0 ? `<ul>${mostCorrect.map(v => `<li>${v.term} <span class="count-badge">${v.totalCorrect || 0}</span></li>`).join('')}</ul>` : '<p>Chưa có dữ liệu.</p>'}
                </div>
                <div class="stat-card list-card">
                    <h3><i class="fas fa-exclamation-triangle"></i> Top Hay Sai</h3>
                    ${mostIncorrect.length > 0 ? `<ul>${mostIncorrect.map(v => `<li>${v.term} <span class="count-badge error-badge">${v.totalIncorrect || 0}</span></li>`).join('')}</ul>` : '<p>Tuyệt vời, không có từ nào bị sai!</p>'}
                </div>
            </div>
            <div class="stat-card chart-card">
                <h3><i class="fas fa-chart-pie"></i> Phân Bố Thành Thạo</h3>
                <div class="chart-container"><canvas id="masteryChart"></canvas></div>
            </div>
        </div>`;
    dom.modeSpecificContent.innerHTML = statsHTML;
    renderMasteryDoughnutChart("masteryChart", detailedMasteryDataValues, detailedMasteryLabels);
    
    const reviewBtn = document.getElementById("reviewDueNowBtn");
    if (reviewBtn) reviewBtn.addEventListener('click', initSmartLearnMode);
}

export function initAdvancedStatsMode() {
    setCurrentMode("advancedStats");
    setActiveNavButton(dom.startAdvancedStatsBtn);
    setActiveMobileNavButton(dom.startAdvancedStatsBtnMobile);
    updateModeTitle('<i class="fas fa-chart-line"></i> Thống Kê Nâng Cao');
    
    if (dom.welcomeMessageContainer) dom.welcomeMessageContainer.style.display = 'none';
    if (dom.modeSpecificContent) dom.modeSpecificContent.style.display = 'block';
    
    hideFooterControls();
    renderAdvancedStats();
}