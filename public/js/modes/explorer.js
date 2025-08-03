// public/js/modes/explorer.js

import { dom } from '../dom.js';
import { state, setCurrentMode } from '../state.js';
import { updateModeTitle, hideFooterControls, setActiveNavButton, setActiveMobileNavButton } from '../ui.js';
import { MASTERY_LEVELS } from '../constants.js';
import { speak } from '../speech.js';

let currentFilter = 'all';
let currentSort = 'alpha-vi';
let currentSearchQuery = '';

function getMasteryClass(level) {
    if (level === MASTERY_LEVELS.MASTERED) return 'mastered';
    if (level > MASTERY_LEVELS.NEW) return 'learning';
    return 'new';
}

function renderVerbList() {
    const verbListContainer = dom.modeSpecificContent.querySelector("#verb-list-container");
    if (!verbListContainer) return;

    // 1. Lọc
    let filteredVerbs = state.allPhrasalVerbs;
    if (currentFilter !== 'all') {
        filteredVerbs = filteredVerbs.filter(verb => getMasteryClass(verb.masteryLevel) === currentFilter);
    }
    if (currentSearchQuery) {
        filteredVerbs = filteredVerbs.filter(verb => 
            verb.term.toLowerCase().includes(currentSearchQuery) || 
            verb.definition.toLowerCase().includes(currentSearchQuery)
        );
    }

    // 2. Sắp xếp
    filteredVerbs.sort((a, b) => {
        switch (currentSort) {
            case 'alpha-vi':
                return a.term.localeCompare(b.term, 'vi');
            case 'alpha-en':
                return a.definition.localeCompare(b.definition, 'en');
            case 'mastery-asc':
                return (a.masteryLevel || 0) - (b.masteryLevel || 0);
            case 'mastery-desc':
                return (b.masteryLevel || 0) - (a.masteryLevel || 0);
            default:
                return 0;
        }
    });

    verbListContainer.innerHTML = ''; // Xóa danh sách cũ

    if (filteredVerbs.length === 0) {
        verbListContainer.innerHTML = '<p id="list-status-message">Không có từ nào khớp với bộ lọc của bạn.</p>';
        return;
    }

    filteredVerbs.forEach(verb => {
        const item = document.createElement('div');
        item.className = 'verb-item';
        item.innerHTML = `
            <div class="mastery-indicator ${getMasteryClass(verb.masteryLevel)}"></div>
            <div class="verb-info">
                <p class="term-def">${verb.term} - <span>${verb.definition}</span></p>
                <p class="example">${verb.example || 'Chưa có ví dụ'}</p>
            </div>
            <div class="verb-actions">
                <button class="action-icon-btn audio-btn" title="Phát âm"><i class="fas fa-volume-up"></i></button>
                <button class="action-icon-btn quick-review-btn" title="Ôn tập nhanh"><i class="fas fa-bolt"></i></button>
            </div>
        `;

        item.querySelector('.audio-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            speak(verb.definition, 'en-US');
        });
        
        item.querySelector('.quick-review-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            startQuickReview(verb);
        });

        verbListContainer.appendChild(item);
    });
}

function startQuickReview(verb) {
    const modal = document.getElementById('quick-review-modal');
    const modalContent = document.getElementById('quick-review-modal-content');
    if (!modal || !modalContent) return;
    
    modalContent.innerHTML = `
        <button class="close-btn" id="closeQuickReviewBtn" aria-label="Đóng">×</button>
        <h2 id="quickReviewModalTitle"><i class="fas fa-bolt"></i> Ôn Tập Nhanh</h2>
        <div class="flashcard-container">
            <div class="flashcard" id="qr-flashcard" tabindex="0">
                <div class="front"><p>${verb.term}</p></div>
                <div class="back"><p>${verb.definition}</p></div>
            </div>
        </div>
        <div id="qr-feedback" class="feedback-message" style="display:none;"></div>
    `;

    modal.classList.add('show-modal');

    const flashcard = modal.querySelector('#qr-flashcard');
    flashcard.addEventListener('click', () => flashcard.classList.toggle('flipped'));
    
    modal.querySelector('#closeQuickReviewBtn').addEventListener('click', () => {
        modal.classList.remove('show-modal');
    });
}


function setupExplorerEventListeners() {
    const searchInput = dom.modeSpecificContent.querySelector('#explorer-search-input');
    const filterButtons = dom.modeSpecificContent.querySelectorAll('.filter-btn-group button');
    const sortSelect = dom.modeSpecificContent.querySelector('#explorer-sort-select');

    searchInput.addEventListener('input', (e) => {
        currentSearchQuery = e.target.value.toLowerCase().trim();
        renderVerbList();
    });

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentFilter = button.dataset.filter;
            renderVerbList();
        });
    });

    sortSelect.addEventListener('change', (e) => {
        currentSort = e.target.value;
        renderVerbList();
    });
}

export function initExplorerMode() {
    setCurrentMode("explorer");
    setActiveNavButton(dom.startExplorerModeBtn);
    setActiveMobileNavButton(dom.startExplorerModeBtnMobile);
    updateModeTitle('<i class="fas fa-book-open"></i> Khám Phá Từ Vựng');
    
    hideFooterControls();
    if (dom.welcomeMessageContainer) dom.welcomeMessageContainer.style.display = 'none';
    if (dom.modeSpecificContent) dom.modeSpecificContent.style.display = 'block';

    dom.modeSpecificContent.innerHTML = `
        <div class="verb-explorer-container animate-pop-in">
            <div class="explorer-controls">
                <div class="explorer-search-wrapper">
                    <i class="fas fa-search search-icon"></i>
                    <input type="search" id="explorer-search-input" placeholder="Tìm theo tiếng Việt hoặc Anh...">
                </div>
                <div class="filter-group">
                    <label>Lọc:</label>
                    <div class="filter-btn-group">
                        <button class="active" data-filter="all">Tất cả</button>
                        <button data-filter="new">Mới</button>
                        <button data-filter="learning">Đang học</button>
                        <button data-filter="mastered">Thành thạo</button>
                    </div>
                </div>
                <div class="sort-group">
                    <label for="explorer-sort-select">Sắp xếp:</label>
                    <select id="explorer-sort-select">
                        <option value="alpha-vi">A-Z (Tiếng Việt)</option>
                        <option value="alpha-en">A-Z (Tiếng Anh)</option>
                        <option value="mastery-desc">Thành thạo nhất</option>
                        <option value="mastery-asc">Mới nhất</option>
                    </select>
                </div>
            </div>
            <div id="verb-list-container">
                <!-- Danh sách từ vựng sẽ được render ở đây -->
            </div>
        </div>
    `;

    renderVerbList();
    setupExplorerEventListeners();
}