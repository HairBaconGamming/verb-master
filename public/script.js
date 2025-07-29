// public/script.js
import { renderMasteryDoughnutChart, updateChartTheme } from "./js/charts.js";

document.addEventListener("DOMContentLoaded", () => {
  // --- DOM Elements ---
  const appContent = document.getElementById("app-content");
  const navigationControls = document.getElementById("navigation-controls");
  const prevCardBtn = document.getElementById("prevCardBtn");
  const nextCardBtn = document.getElementById("nextCardBtn");
  const cardNumberDisplay = document.getElementById("cardNumber");
  const scoreArea = document.getElementById("score-area");
  const scoreDisplay = document.getElementById("score");
  const totalQuestionsDisplay = document.getElementById("totalQuestions");
  const feedbackArea = document.getElementById("feedback-area");
  const currentModeTitle = document.getElementById("current-mode-title");

  const navButtons = document.querySelectorAll(".nav-btn");
  const startSmartLearnModeBtn = document.getElementById(
    "startSmartLearnModeBtn"
  );
  const startFlashcardModeBtn = document.getElementById(
    "startFlashcardModeBtn"
  );
  const startQuizModeBtn = document.getElementById("startQuizModeBtn");
  const startTypeModeBtn = document.getElementById("startTypeModeBtn");
  const startTestModeBtn = document.getElementById("startTestModeBtn");
  const startAdvancedStatsBtn = document.getElementById(
    "startAdvancedStatsBtn"
  );

  const saveProgressBtn = document.getElementById("saveProgressBtn");
  const loadProgressBtn = document.getElementById("loadProgressBtn");
  const resetProgressBtn = document.getElementById("resetProgressBtn");

  const testSettingsModal = document.getElementById("test-settings-modal");
  const closeTestSettingsBtn = document.getElementById("closeTestSettingsBtn");
  const numTestQuestionsInput = document.getElementById("numTestQuestions");
  const generateTestBtn = document.getElementById("generateTestBtn");

  const progressSummaryDiv = document.getElementById("progress-summary");
  const countNewDisplay = document.getElementById("countNew");
  const countLearningDisplay = document.getElementById("countLearning");
  const countMasteredDisplay = document.getElementById("countMastered");
  const countTotalDisplay = document.getElementById("countTotal");

  const themeToggleCheckbox = document.getElementById("themeToggleCheckbox");

  const modeSpecificContent = document.getElementById("mode-specific-content");
  const welcomeMessageContainer = document.getElementById(
    "welcome-message-container"
  );
  const mobileModeSelectionDiv = document.querySelector(
    ".mobile-mode-selection"
  ); // Lấy div chứa các nút mobile

  // Mobile Mode Buttons
  const startSmartLearnModeBtnMobile = document.getElementById(
    "startSmartLearnModeBtnMobile"
  );
  const startFlashcardModeBtnMobile = document.getElementById(
    "startFlashcardModeBtnMobile"
  );
  const startQuizModeBtnMobile = document.getElementById(
    "startQuizModeBtnMobile"
  );
  const startTypeModeBtnMobile = document.getElementById(
    "startTypeModeBtnMobile"
  );
  const startTestModeBtnMobile = document.getElementById(
    "startTestModeBtnMobile"
  );
  const startAdvancedStatsBtnMobile = document.getElementById(
    "startAdvancedStatsBtnMobile"
  );

  const mobileNavButtons = document.querySelectorAll(".mode-btn-mobile"); // Lấy tất cả các nút mobile

  const mobileSettingsToggleBtn = document.getElementById(
    "mobileSettingsToggleBtn"
  );
  const sidebarEl = document.querySelector(".sidebar"); // Lấy element sidebar

  const startAiPracticeModeBtn = document.getElementById(
    "startAiPracticeModeBtn"
  );
  const startAiPracticeModeBtnMobile = document.getElementById(
    "startAiPracticeModeBtnMobile"
  );

  const progressBarContainer = document.getElementById(
    "progress-bar-container"
  );
  const progressBarFill = document.getElementById("progress-bar-fill");
  const progressBarText = document.getElementById("progress-bar-text");

  const AI_PRACTICE_API_URL =
    "https://verbmaster-database.glitch.me/api/practice-set";

  let currentAiPracticeSet = [];
  let currentAiQuestionIndex = 0;
  let aiPracticeUserScore = 0;
  let aiPracticeIncorrectAnswers = [];

  // --- State Variables ---
  let allPhrasalVerbs = [];
  let currentLearningSet = []; // For current mode, including SmartLearn session
  let smartLearnSessionQueue = []; // Full queue for current SmartLearn round
  let smartLearnCurrentIndexInQueue = 0; // Index within smartLearnSessionQueue
  let smartLearnRoundProgress = {}; // Tracks exposures for each verb in the current round
  // Constants for SmartLearn Advanced
  const SMART_LEARN_ROUND_SIZE_ADVANCED = 7; // Số từ mục tiêu cho mỗi vòng (Quizlet thường dùng 7)
  const MIN_CORRECT_IN_ROW_FOR_ROUND_MASTERY = 2; // Cần đúng X lần liên tiếp để coi là "mastered" trong vòng này
  const MAX_EXPOSURES_PER_VERB_IN_ROUND = 6; // Số lần tối đa một từ xuất hiện nếu chưa master
  const FAMILIAR_THRESHOLD_SRS_BOX = 1; // SRS Box <= này được coi là FAMILIAR hoặc NEW
  const LEARNING_THRESHOLD_SRS_BOX = 3; // SRS Box <= này được coi là LEARNING

  let currentTestSet = [];
  let currentIndex = 0; // For flashcard navigation
  let currentMode = "";
  let score = 0; // Generic score for modes like quiz, type, test, smartlearn session
  let questionsAnsweredInSession = 0; // General counter for quiz/type/test

  const SMART_LEARN_SESSION_SIZE = 7; // Quizlet default is 7 for a round, but can be adjusted. Let's use 10 for more variety in question types per round.
  const SMART_LEARN_ROUND_SIZE = 10; // How many unique verbs to focus on in one "round" of Smart Learn

  let settings = {
    shuffleVerbs: true, // Mặc định là xáo trộn
  };

  const MASTERY_LEVELS = {
    NEW: 0, // Not seen or seen few times, mostly incorrect
    FAMILIAR: 1, // Seen multiple times, some correct answers
    LEARNING: 2, // Consistently getting it right, but still needs reinforcement
    MASTERED: 3, // Confidently knows the item
  };

  // Spaced Repetition Intervals (simplified for this example, Quizlet's is more complex)
  // These represent "buckets" or "boxes" in a Leitner system like approach
  const SRS_INTERVALS = {
    [MASTERY_LEVELS.NEW]: 1, // Review next session or very soon
    [MASTERY_LEVELS.FAMILIAR]: 2, // Review in 2-3 sessions
    [MASTERY_LEVELS.LEARNING]: 5, // Review in 5-7 sessions
    [MASTERY_LEVELS.MASTERED]: 15, // Review much later
  };
  // For actual date-based SRS, you'd store 'nextReviewDate' timestamp.
  // For session-based SRS, 'srsBox' can indicate which "box" it's in.

  function setActiveMobileNavButton(selectedButton) {
    mobileNavButtons.forEach((btn) =>
      btn.classList.remove("active-nav-btn-mobile")
    );
    if (selectedButton) {
      selectedButton.classList.add("active-nav-btn-mobile");
    }
  }

  // --- INITIALIZATION & DATA MANAGEMENT ---
  async function initializeApp() {
    loadThemePreference();
    loadAppSettings();
    const success = await initializeVerbsData();
    if (success) {
      displayWelcomeMessage();
      updateProgressSummary();
    } else {
      appContent.innerHTML =
        '<p class="error-message"><i class="fas fa-exclamation-triangle"></i> Lỗi tải dữ liệu từ vựng. Vui lòng kiểm tra file <code>public/data/phrasalVerbs.js</code> và thử lại.</p>';
    }
    setupEventListeners();
  }

  async function initializeVerbsData() {
    try {
      if (
        typeof phrasalVerbsList === "undefined" ||
        phrasalVerbsList.length === 0
      ) {
        console.error(
          "Phrasal verbs list (phrasalVerbsList) not found or empty."
        );
        return false;
      }
      const storedVerbs = localStorage.getItem("phrasalVerbProgress_v3_smart"); // New key for smart learn structure
      if (storedVerbs) {
        allPhrasalVerbs = JSON.parse(storedVerbs);
        const baseVerbsMap = new Map(
          phrasalVerbsList.map((v) => [
            v.term.toLowerCase() + "||" + v.definition.toLowerCase(),
            v,
          ])
        );
        const currentVerbsMap = new Map(
          allPhrasalVerbs.map((v) => [
            v.term.toLowerCase() + "||" + v.definition.toLowerCase(),
            v,
          ])
        );
        let changed = false;

        baseVerbsMap.forEach((baseVerb, key) => {
          if (!currentVerbsMap.has(key)) {
            allPhrasalVerbs.push(createSmartLearnVerbObject(baseVerb));
            changed = true;
          } else {
            let verb = currentVerbsMap.get(key);
            const defaultVerb = createSmartLearnVerbObject(baseVerb);
            for (const prop in defaultVerb) {
              if (verb[prop] === undefined) {
                verb[prop] = defaultVerb[prop];
                changed = true;
              }
            }
            // Ensure smartLearn specific fields are present
            if (verb.srsBox === undefined) verb.srsBox = 0;
            if (verb.lastCorrect === undefined) verb.lastCorrect = null;
            if (verb.correctStreak === undefined) verb.correctStreak = 0;
            if (verb.incorrectStreak === undefined) verb.incorrectStreak = 0;
            if (verb.totalSeen === undefined) verb.totalSeen = 0;
          }
        });
        allPhrasalVerbs = allPhrasalVerbs.filter((verb) =>
          baseVerbsMap.has(
            verb.term.toLowerCase() + "||" + verb.definition.toLowerCase()
          )
        );
        if (changed) saveProgress();
      } else {
        allPhrasalVerbs = phrasalVerbsList.map((verb) =>
          createSmartLearnVerbObject(verb)
        );
        saveProgress();
      }
      return true;
    } catch (error) {
      console.error(
        "Failed to initialize or load phrasal verbs for SmartLearn:",
        error
      );
      return false;
    }
  }

  function createSmartLearnVerbObject(verb) {
    return {
      term: verb.term,
      definition: verb.definition,
      id: verb.term.toLowerCase() + "||" + verb.definition.toLowerCase(),
      example: verb.example || "",
      // SmartLearn specific fields
      masteryLevel: MASTERY_LEVELS.NEW, // Overall mastery based on srsBox/streaks
      srsBox: 0, // Current Leitner box (0 = newest)
      lastReviewed: null, // Timestamp of last review in any mode
      nextReviewDate: Date.now(), // For date-based SRS, if implemented later
      lastCorrect: null, // Timestamp of last correct answer in SmartLearn
      correctStreak: 0, // Consecutive correct answers in SmartLearn
      incorrectStreak: 0, // Consecutive incorrect answers in SmartLearn
      totalCorrect: 0, // Total correct answers across all modes
      totalIncorrect: 0, // Total incorrect answers across all modes
      totalSeen: 0, // How many times this verb appeared in SmartLearn
    };
  }

  function loadAppSettings() {
    const storedSettings = localStorage.getItem("verbMasterSettings");
    if (storedSettings) {
      settings = JSON.parse(storedSettings);
      // Đảm bảo các giá trị mặc định nếu setting mới được thêm vào
      if (settings.shuffleVerbs === undefined) {
        settings.shuffleVerbs = true;
      }
    }
    // Cập nhật UI của toggle nếu nó hiển thị ở đâu đó ngoài modal
    const shuffleToggle = document.getElementById("shuffleVerbsToggle");
    if (shuffleToggle) {
      // Kiểm tra xem toggle có tồn tại trên trang không (ví dụ, trong modal)
      shuffleToggle.checked = settings.shuffleVerbs;
    }
  }

  function saveAppSettings() {
    localStorage.setItem("verbMasterSettings", JSON.stringify(settings));
    // Không cần toast ở đây trừ khi người dùng chủ động thay đổi setting và có nút "Lưu Cài Đặt"
  }

  function saveProgress() {
    try {
      localStorage.setItem(
        "phrasalVerbProgress_v3_smart",
        JSON.stringify(allPhrasalVerbs)
      );
      showToast("Tiến độ đã được lưu!", "success");
      updateProgressSummary();
    } catch (e) {
      console.error("Error saving progress:", e);
      showToast("Lỗi lưu tiến độ. Bộ nhớ có thể đã đầy.", "error");
    }
  }
  async function loadProgress() {
    const success = await initializeVerbsData();
    if (success) {
      showToast("Tiến độ đã được tải!", "success");
      displayWelcomeMessage(true);
    } else {
      showToast("Không có tiến độ nào được lưu hoặc có lỗi xảy ra.", "error");
    }
  }
  function resetProgress() {
    if (
      confirm(
        "Bạn có chắc chắn muốn reset toàn bộ tiến độ học tập không? Hành động này không thể hoàn tác."
      )
    ) {
      localStorage.removeItem("phrasalVerbProgress_v3_smart");
      allPhrasalVerbs = phrasalVerbsList.map((verb) =>
        createSmartLearnVerbObject(verb)
      );
      saveProgress();
      showToast("Tiến độ đã được reset.", "info");
      displayWelcomeMessage(true);
      updateProgressSummary();
    }
  }
  function updateProgressSummary() {
    if (!allPhrasalVerbs || allPhrasalVerbs.length === 0) {
      progressSummaryDiv.style.display = "none";
      return;
    }
    progressSummaryDiv.style.display = "flex";
    countNewDisplay.textContent = allPhrasalVerbs.filter(
      (v) => v.masteryLevel === MASTERY_LEVELS.NEW
    ).length;
    countMasteredDisplay.textContent = allPhrasalVerbs.filter(
      (v) => v.masteryLevel === MASTERY_LEVELS.MASTERED
    ).length;
    countLearningDisplay.textContent = allPhrasalVerbs.filter(
      (v) =>
        v.masteryLevel > MASTERY_LEVELS.NEW &&
        v.masteryLevel < MASTERY_LEVELS.MASTERED
    ).length;
    countTotalDisplay.textContent = allPhrasalVerbs.length;
  }

  // --- THEME MANAGEMENT (same as before) ---
  function loadThemePreference() {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.body.setAttribute("data-theme", "dark");
      themeToggleCheckbox.checked = true;
    } else {
      document.body.removeAttribute("data-theme");
      themeToggleCheckbox.checked = false;
    }
  }
  themeToggleCheckbox.addEventListener("change", () => {
    if (themeToggleCheckbox.checked) {
      document.body.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.removeAttribute("data-theme");
      localStorage.setItem("theme", "light");
    }
    if (currentMode === "advancedStats") {
      updateChartTheme();
    }
  });

  // --- UI & UX HELPERS (mostly same, showToast is new) ---
  function displayWelcomeMessage() {
    currentModeTitle.innerHTML =
      'Chào mừng đến với <span class="brand-highlight">VerbMaster!</span>';

    if (welcomeMessageContainer) {
      welcomeMessageContainer.innerHTML = `
            <img src="https://cdn.glitch.global/faec93b3-0d74-429c-bb70-2a632a40990a/Thi%E1%BA%BFt%20k%E1%BA%BF%20ch%C6%B0a%20c%C3%B3%20t%C3%AAn.png?v=1748191831492" alt="Người đang học tiếng Anh với sách và ý tưởng" class="welcome-img">
            <h2>Bắt đầu hành trình chinh phục Phrasal Verbs!</h2>
            <p>Chọn một chế độ học để bắt đầu. <br> VerbMaster ứng dụng phương pháp Lặp Lại Ngắt Quãng (Spaced Repetition) giúp bạn ghi nhớ bền vững.</p>
            <button id="startWelcomeSmartLearnBtn" class="primary-btn welcome-start-btn"><i class="fas fa-brain"></i> Bắt đầu Học Thông Minh</button>
        `;
      welcomeMessageContainer.style.display = "block";

      const welcomeStartBtn = document.getElementById(
        "startWelcomeSmartLearnBtn"
      );
      if (welcomeStartBtn) {
        welcomeStartBtn.addEventListener("click", () => {
          const smartLearnBtnSidebar = document.getElementById(
            "startSmartLearnModeBtn"
          );
          const smartLearnBtnMobile = document.getElementById(
            "startSmartLearnModeBtnMobile"
          );
          if (window.innerWidth <= 768 && smartLearnBtnMobile) {
            smartLearnBtnMobile.click();
          } else if (smartLearnBtnSidebar) {
            smartLearnBtnSidebar.click();
          }
          welcomeMessageContainer.style.display = "none";
        });
      }
    } else {
      console.warn(
        "welcomeMessageContainer not found in DOM for displayWelcomeMessage"
      );
    }

    if (modeSpecificContent) {
      modeSpecificContent.innerHTML = "";
      modeSpecificContent.style.display = "none";
    }

    if (mobileModeSelectionDiv) {
      mobileModeSelectionDiv.style.display =
        window.innerWidth <= 768 ? "grid" : "none";
    }

    hideFooterControls(); // Sẽ ẩn cả progress bar
    updateProgressBar(0, 0); // Reset progress bar

    hideFooterControls();
  }

  function setActiveNavButton(selectedButton) {
    navButtons.forEach((btn) => btn.classList.remove("active-nav-btn"));
    if (selectedButton) {
      selectedButton.classList.add("active-nav-btn");
    }
  }
  function updateModeTitle(title) {
    currentModeTitle.innerHTML = title;
  }
  function hideFooterControls() {
    if (navigationControls) navigationControls.style.display = "none";
    if (scoreArea) scoreArea.style.display = "none"; // Ẩn score text cũ
    if (progressBarContainer) progressBarContainer.style.display = "none"; // Ẩn progress bar
    if (feedbackArea) feedbackArea.textContent = "";
  }
  function showToast(message, type = "info") {
    const toastContainer =
      document.querySelector(".toast-container") || createToastContainer();
    const toast = document.createElement("div");
    toast.className = `toast toast-${type} show`;
    toast.innerHTML = `<i class="fas ${
      type === "success"
        ? "fa-check-circle"
        : type === "error"
        ? "fa-times-circle"
        : "fa-info-circle"
    }"></i> ${message}`;
    toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => {
        toast.remove();
      }, 500);
    }, 3000);
  }
  function createToastContainer() {
    const container = document.createElement("div");
    container.className = "toast-container";
    document.body.appendChild(container);
    return container;
  }
  // Add CSS for .toast-container and improved .toast
  /*
    .toast-container { position: fixed; top: 20px; right: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 10px; }
    .toast { display: flex; align-items: center; padding: 12px 18px; border-radius: 8px; color: white; font-size: 0.95em; box-shadow: 0 4px 12px rgba(0,0,0,0.15); opacity: 0; transform: translateX(100%); transition: opacity 0.3s ease, transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1); }
    .toast.show { opacity: 1; transform: translateX(0); }
    .toast i { margin-right: 10px; font-size: 1.2em; }
    .toast-success { background-color: var(--success-color); }
    .toast-error { background-color: var(--error-color); }
    .toast-info { background-color: var(--primary-color); }
    */
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
  function normalizeAnswer(answer) {
    return answer.toLowerCase().split("/")[0].trim();
  }
  /**
   * Chuẩn hóa và so sánh câu trả lời của người dùng với các đáp án đúng.
   * @param {string} userAnswer Câu trả lời của người dùng.
   * @param {string} correctAnswersString Chuỗi chứa một hoặc nhiều đáp án đúng, cách nhau bởi " / ".
   * @param {boolean} ignorePunctuation Bỏ qua dấu câu ở cuối (mặc định là true).
   * @returns {boolean} True nếu userAnswer khớp với một trong các đáp án đúng, ngược lại false.
   */
  function normalizeAndCompareAnswers(
    userAnswer,
    correctAnswersString,
    ignorePunctuation = true
  ) {
    if (
      typeof userAnswer !== "string" ||
      typeof correctAnswersString !== "string"
    ) {
      return false;
    }

    let normalizedUserAnswer = userAnswer.trim().toLowerCase();

    if (ignorePunctuation) {
      // Loại bỏ các dấu câu phổ biến ở cuối chuỗi
      normalizedUserAnswer = normalizedUserAnswer.replace(/[.,!?;:]+$/, "");
    }

    const correctOptions = correctAnswersString
      .toLowerCase()
      .split(" / ")
      .map((s) => {
        let normalizedOption = s.trim();
        if (ignorePunctuation) {
          normalizedOption = normalizedOption.replace(/[.,!?;:]+$/, "");
        }
        return normalizedOption;
      });

    return correctOptions.includes(normalizedUserAnswer);
  }

  function updateProgressBar(currentValue, totalValue) {
    if (!progressBarContainer || !progressBarFill || !progressBarText) {
      // console.warn("Progress bar elements not found.");
      return;
    }

    if (totalValue > 0) {
      progressBarContainer.style.display = "block"; // Hiện thanh tiến trình
      const percentage = (currentValue / totalValue) * 100;
      progressBarFill.style.width = `${Math.min(
        100,
        Math.max(0, percentage)
      )}%`; // Giới hạn từ 0-100%
      progressBarText.textContent = `${currentValue}/${totalValue}`;

      // Quyết định có hiển thị text trên thanh fill không
      if (percentage > 15) {
        // Chỉ hiện text nếu thanh fill đủ rộng (ví dụ > 15%)
        progressBarFill.classList.add("show-text");
      } else {
        progressBarFill.classList.remove("show-text");
      }
      // Nếu màu fill sáng, bạn có thể thêm class 'light-fill' để đổi màu text
      // if (isProgressBarFillLight()) { // Hàm này cần tự định nghĩa
      //     progressBarFill.classList.add('light-fill');
      // } else {
      //     progressBarFill.classList.remove('light-fill');
      // }
    } else {
      // Ẩn thanh tiến trình nếu không có tổng (ví dụ, ở welcome screen)
      progressBarContainer.style.display = "none";
      progressBarFill.style.width = "0%";
      progressBarText.textContent = "0/0";
      progressBarFill.classList.remove("show-text");
    }
  }

  function updateScoreInFooter() {
    if (!scoreDisplay || !totalQuestionsDisplay) return; // Kiểm tra element tồn tại

    scoreDisplay.textContent = aiPracticeUserScore; // Giả sử aiPracticeUserScore là biến điểm chung cho các mode có điểm

    let currentTotal = 0;
    if (currentMode === "test" && currentTestSet.length > 0) {
      currentTotal = currentTestSet.length;
    } else if (currentMode === "smartlearn") {
      // Trong SmartLearn, tổng số câu hỏi có thể là số từ trong vòng học (currentLearningSet)
      // hoặc tổng số item trong queue (nếu mỗi item trong queue là một "câu hỏi" riêng)
      // Để đơn giản và nhất quán với cách Quizlet làm (hiển thị tiến trình qua các từ trong vòng),
      // chúng ta có thể dùng currentLearningSet.length.
      // Hoặc, nếu muốn phản ánh số lần tương tác trong queue: smartLearnSessionQueue.length
      currentTotal =
        currentLearningSet.length > 0
          ? currentLearningSet.length
          : smartLearnSessionQueue.length || 0;
      // Hiển thị số từ đã "masteredInRound" / tổng số từ trong vòng
      const masteredInRoundCount = currentLearningSet.filter(
        (v) => smartLearnRoundProgress[v.id]?.masteredInRound
      ).length;
      scoreDisplay.textContent = masteredInRoundCount; // Điểm là số từ đã master trong vòng
      totalQuestionsDisplay.textContent = currentLearningSet.length; // Tổng là số từ trong vòng

      // Cập nhật thanh tiến trình (nếu có)
      updateProgressBar(masteredInRoundCount, currentLearningSet.length);
    } else if (currentLearningSet.length > 0) {
      // Cho Quiz, Type (không phải AI Practice)
      currentTotal = currentLearningSet.length;
      scoreDisplay.textContent = score; // Biến score riêng của các mode này
      totalQuestionsDisplay.textContent = currentTotal;
      updateProgressBar(score, currentTotal);
    } else if (
      currentMode === "aiPractice" &&
      currentAiPracticeSet.length > 0
    ) {
      // Cho AI Practice, totalQuestionsDisplay đã được set trong displayAiQuestion
      // scoreDisplay (aiPracticeUserScore) cũng được cập nhật trong revealAiAnswer
      // Chỉ cần đảm bảo nó được gọi.
      // Nếu là passage_multi_cloze_mcq, total là số câu hỏi con
      const mainQ = currentAiPracticeSet[currentAiQuestionIndex];
      if (
        mainQ &&
        mainQ.type === "passage_multi_cloze_mcq" &&
        mainQ.content_json.questions
      ) {
        currentTotal = mainQ.content_json.questions.length;
      } else {
        currentTotal = currentAiPracticeSet.length; // Hoặc 1 nếu là single_mcq
      }
      scoreDisplay.textContent = aiPracticeUserScore;
      totalQuestionsDisplay.textContent = currentTotal;
      updateProgressBar(aiPracticeUserScore, currentTotal);
    } else {
      // Mặc định hoặc khi không có set nào active
      scoreDisplay.textContent = "0";
      totalQuestionsDisplay.textContent = "0";
      updateProgressBar(0, 0);
    }
  }

  // --- SMART LEARN MODE (Quizlet-like "Learn" mode) ---
  function initSmartLearnMode() {
    currentMode = "smartlearn";
    setActiveNavButton(startSmartLearnModeBtn);
    const mobileButton = document.getElementById(
      "startSmartLearnModeBtnMobile"
    );
    if (mobileButton) {
      setActiveMobileNavButton(mobileButton);
    }
    updateModeTitle('<i class="fas fa-brain"></i> SmartLearn Pro');
    if (welcomeMessageContainer) welcomeMessageContainer.style.display = "none"; // Ẩn welcome
    if (modeSpecificContent) modeSpecificContent.style.display = "block"; // Hiện khu vực nội dung chế độ

    if (allPhrasalVerbs.length === 0) {
      modeSpecificContent.innerHTML =
        '<p class="info-message">Không có từ vựng nào để học. Hãy thử thêm từ hoặc reset dữ liệu.</p>';
      hideFooterControls();
      return;
    }

    currentLearningSet = selectVerbsForSmartLearnRound(
      SMART_LEARN_ROUND_SIZE_ADVANCED
    );

    if (currentLearningSet.length === 0) {
      modeSpecificContent.innerHTML = `
            <div class="session-summary animate-pop-in">
                <h2><i class="fas fa-check-circle"></i> Hoàn Tất!</h2>
                <p>Bạn đã ôn tập tất cả các từ cần thiết hiện tại. Hãy quay lại sau để tiếp tục củng cố kiến thức!</p>
                <div class="summary-actions">
                    <button id="choose-other-mode-btn" class="action-button secondary-btn"><i class="fas fa-th-large"></i> Chọn Chế Độ Khác</button>
                </div>
            </div>
        `;
      hideFooterControls();
      const chooseOtherModeBtn = document.getElementById(
        "choose-other-mode-btn"
      );
      if (chooseOtherModeBtn) {
        chooseOtherModeBtn.addEventListener("click", () => {
          setActiveNavButton(null);
          setActiveMobileNavButton(null);
          displayWelcomeMessage();
        });
      }
      return;
    }

    smartLearnSessionQueue = [];
    smartLearnRoundProgress = {};

    currentLearningSet.forEach((verb) => {
      smartLearnRoundProgress[verb.id] = {
        correctInRow: 0,
        timesSeenInRound: 0,
        masteredInRound: false,
        questionTypesUsedInRound: new Set(),
      };
      addInitialQuestionsToQueue(verb.id);
    });

    shuffleArray(smartLearnSessionQueue);

    smartLearnCurrentIndexInQueue = 0;
    aiPracticeUserScore = 0;
    questionsAnsweredInSession = 0;

    hideFooterControls();
    if (progressBarContainer) progressBarContainer.style.display = "block"; // Hiện thanh tiến trình

    updateScoreInFooter();
    displayNextSmartLearnItem();
  }

  function displayNextSmartLearnItem() {
    if (smartLearnCurrentIndexInQueue >= smartLearnSessionQueue.length) {
      const allMasteredInRound =
        currentLearningSet.length > 0 &&
        currentLearningSet.every(
          (v) => smartLearnRoundProgress[v.id]?.masteredInRound
        );

      if (allMasteredInRound || currentLearningSet.length === 0) {
        showSmartLearnRoundEndSummary();
        return;
      } else {
        const itemsWereAdded = generateMoreSmartLearnItems();
        if (
          itemsWereAdded &&
          smartLearnCurrentIndexInQueue < smartLearnSessionQueue.length
        ) {
          // Ok, tiếp tục
        } else {
          console.log(
            "SmartLearn: No more items could be generated or queue invalid after trying to add more. Ending round."
          );
          showSmartLearnRoundEndSummary();
          return;
        }
      }
    }

    const currentItem = smartLearnSessionQueue[smartLearnCurrentIndexInQueue];
    if (!currentItem || typeof currentItem.verbId === "undefined") {
      console.error(
        "SmartLearn: currentItem invalid at index",
        smartLearnCurrentIndexInQueue,
        ". Queue:",
        JSON.stringify(smartLearnSessionQueue)
      );
      smartLearnCurrentIndexInQueue++;
      setTimeout(displayNextSmartLearnItem, 100);
      return;
    }

    const verbData = allPhrasalVerbs.find((v) => v.id === currentItem.verbId);
    if (!verbData) {
      console.error(
        "SmartLearn: Verb data not found for verbId:",
        currentItem.verbId
      );
      smartLearnCurrentIndexInQueue++;
      setTimeout(displayNextSmartLearnItem, 100);
      return;
    }

    if (!smartLearnRoundProgress[verbData.id]) {
      smartLearnRoundProgress[verbData.id] = {
        correctInRow: 0,
        timesSeenInRound: 0,
        masteredInRound: false,
        questionTypesUsedInRound: new Set(),
      };
    }
    smartLearnRoundProgress[verbData.id].timesSeenInRound++;
    questionsAnsweredInSession++;

    const itemsMasteredInRound = currentLearningSet.filter(
      (v) => smartLearnRoundProgress[v.id]?.masteredInRound
    ).length;
    const currentFocusVerbInSet = currentLearningSet.find(
      (v) => !smartLearnRoundProgress[v.id]?.masteredInRound
    );

    feedbackArea.textContent = `SmartLearn Pro: ${itemsMasteredInRound} / ${currentLearningSet.length} từ đã vững`;
    if (currentFocusVerbInSet) {
      feedbackArea.textContent += ` (Đang học: ${currentFocusVerbInSet.term})`;
    } else if (currentLearningSet.length > 0) {
      feedbackArea.textContent += ` (Hoàn thành vòng!)`;
    }
    feedbackArea.className = "feedback-area-footer";

    const finalQuestionType = currentItem.type;
    // console.log(`Displaying SmartLearn: Verb: ${verbData.term}, Type: ${finalQuestionType}, Index: ${smartLearnCurrentIndexInQueue}, Seen in round: ${smartLearnRoundProgress[verbData.id].timesSeenInRound}`);

    switch (finalQuestionType) {
      case "flashcard_intro":
      case "flashcard_recall":
        renderSmartLearnFlashcard(verbData, finalQuestionType);
        break;
      case "easy_mcq_term_to_def":
      case "hard_mcq_term_to_def":
        renderSmartLearnMCQ(verbData, finalQuestionType, "term_to_def");
        break;
      case "easy_mcq_def_to_term":
      case "hard_mcq_def_to_term":
        renderSmartLearnMCQ(verbData, finalQuestionType, "def_to_term");
        break;
      case "type_definition_from_term":
        renderSmartLearnTypeIn(verbData, finalQuestionType, "term_to_def");
        break;
      case "type_term_from_def":
        renderSmartLearnTypeIn(verbData, finalQuestionType, "def_to_term");
        break;
      default:
        console.warn(
          "Unknown SmartLearn item type:",
          finalQuestionType,
          "- Defaulting to flashcard_recall for:",
          verbData.term
        );
        renderSmartLearnFlashcard(verbData, "flashcard_recall");
    }
    updateScoreInFooter();
  }

  function renderSmartLearnFlashcard(verbData, type) {
    if (!modeSpecificContent) {
      console.error(
        "SmartLearn Critical: modeSpecificContent DOM element is null. Cannot render flashcard."
      );
      // Ngăn chặn việc tiếp tục nếu container chính không tồn tại
      // Có thể hiển thị một thông báo lỗi chung cho người dùng ở một vị trí khác
      const generalErrorArea = document.getElementById("general-app-error"); // Giả sử có một div này
      if (generalErrorArea)
        generalErrorArea.textContent =
          "Lỗi hiển thị giao diện. Vui lòng thử làm mới trang.";
      return;
    }

    const flashcardHTML = `
        <div class="flashcard-container animate-pop-in">
            <div class="flashcard" id="smart-learn-flashcard" tabindex="0">
                <div class="front"><p class="flashcard-term">${
                  verbData.term
                }</p></div>
                <div class="back"><p class="flashcard-definition">${
                  verbData.definition
                }</p></div>
            </div>
        </div>
        <p class="instruction-text">${
          type === "flashcard_intro"
            ? "Làm quen với từ này. Lật thẻ để xem nghĩa."
            : "Hãy nhớ lại! Bạn có biết từ này không?"
        }</p>
        <div class="flashcard-actions">
            <button id="sl-fc-incorrect" class="action-button danger-btn"><i class="fas fa-times"></i> Chưa biết</button>
            <button id="sl-fc-correct" class="action-button success-btn"><i class="fas fa-check"></i> Đã biết</button>
        </div>
    `;

    modeSpecificContent.innerHTML = flashcardHTML;
    feedbackArea.textContent = "";

    // SỬ DỤNG querySelector TRÊN modeSpecificContent
    const flashcardEl = modeSpecificContent.querySelector(
      "#smart-learn-flashcard"
    );
    const incorrectBtn = modeSpecificContent.querySelector("#sl-fc-incorrect");
    const correctBtn = modeSpecificContent.querySelector("#sl-fc-correct");

    // Log để kiểm tra
    console.log(
      "Rendered flashcard HTML into modeSpecificContent. Querying elements now..."
    );
    console.log("#smart-learn-flashcard found:", flashcardEl);
    console.log("#sl-fc-correct found:", correctBtn);
    console.log("#sl-fc-incorrect found:", incorrectBtn);

    if (flashcardEl) {
      flashcardEl.addEventListener("click", () =>
        flashcardEl.classList.toggle("flipped")
      );
      flashcardEl.addEventListener("keydown", (e) => {
        if (e.key === " " || e.key === "Enter") {
          flashcardEl.classList.toggle("flipped");
          e.preventDefault();
        }
      });
    } else {
      console.error(
        "SmartLearn Error (querySelector): Element with ID 'smart-learn-flashcard' not found within modeSpecificContent."
      );
    }

    if (correctBtn) {
      correctBtn.onclick = () => handleSmartLearnAnswer(verbData, true, type);
    } else {
      console.error(
        "SmartLearn Error (querySelector): Element with ID 'sl-fc-correct' not found within modeSpecificContent."
      );
    }

    if (incorrectBtn) {
      incorrectBtn.onclick = () =>
        handleSmartLearnAnswer(verbData, false, type);
    } else {
      console.error(
        "SmartLearn Error (querySelector): Element with ID 'sl-fc-incorrect' not found within modeSpecificContent."
      );
    }
  }

  function renderSmartLearnMCQ(
    verbData,
    questionType,
    direction = "term_to_def"
  ) {
    // direction: 'term_to_def' (cho term, chọn definition) hoặc 'def_to_term' (cho definition, chọn term)

    let questionText, correctAnswer, optionsPoolSource;
    if (direction === "term_to_def") {
      questionText = `Nghĩa của "<strong>${verbData.term}</strong>" là gì?`;
      correctAnswer = verbData.definition;
      optionsPoolSource = allPhrasalVerbs
        .filter((v) => v.id !== verbData.id)
        .map((v) => v.definition);
    } else {
      // def_to_term
      questionText = `Phrasal verb nào có nghĩa là "<strong>${verbData.definition}</strong>"?`;
      correctAnswer = verbData.term; // Đáp án đúng là term (tiếng Việt)
      optionsPoolSource = allPhrasalVerbs
        .filter((v) => v.id !== verbData.id)
        .map((v) => v.term);
    }

    let options = [correctAnswer];
    shuffleArray(optionsPoolSource);

    const numOptions = questionType.includes("easy") ? 2 : 4;
    for (
      let i = 0;
      options.length < numOptions && i < optionsPoolSource.length;
      i++
    ) {
      if (!options.includes(optionsPoolSource[i])) {
        options.push(optionsPoolSource[i]);
      }
    }
    while (options.length < Math.min(numOptions, allPhrasalVerbs.length)) {
      let randomItem =
        allPhrasalVerbs[Math.floor(Math.random() * allPhrasalVerbs.length)];
      let randomOption =
        direction === "term_to_def" ? randomItem.definition : randomItem.term;
      if (!options.includes(randomOption)) {
        options.push(randomOption);
      }
    }
    shuffleArray(options);

    modeSpecificContent.innerHTML = `
        <div class="question-area animate-pop-in">
            <p>${questionText}</p>
            <ul class="options-list ${
              numOptions === 2 ? "easy-mcq-options" : ""
            }">
                ${options
                  .map(
                    (opt) =>
                      `<li data-answer="${String(opt).replace(
                        /"/g,
                        '"'
                      )}" tabindex="0" role="button">${opt}</li>`
                  )
                  .join("")}
            </ul>
        </div>
    `;
    feedbackArea.textContent = "";
    modeSpecificContent.querySelectorAll(".options-list li").forEach((li) => {
      const handler = () => {
        const selectedAnswer = li.dataset.answer;
        // Normalize cả selectedAnswer và correctAnswer trước khi so sánh
        const isCorrect =
          normalizeAnswer(selectedAnswer) === normalizeAnswer(correctAnswer);

        modeSpecificContent
          .querySelectorAll(".options-list li")
          .forEach((innerLi) => {
            innerLi.classList.add("disabled");
            innerLi.setAttribute("tabindex", "-1");
            if (
              normalizeAnswer(innerLi.dataset.answer) ===
              normalizeAnswer(correctAnswer)
            ) {
              innerLi.classList.add("correct");
            } else if (innerLi === li && !isCorrect) {
              innerLi.classList.add("incorrect");
            }
          });
        if (isCorrect) score++;
        handleSmartLearnAnswer(
          verbData,
          isCorrect,
          questionType,
          isCorrect ? "Chính xác!" : `Sai! Đáp án đúng là: ${correctAnswer}`
        );
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

  function renderSmartLearnTypeIn(
    verbData,
    questionType,
    direction = "term_to_def"
  ) {
    // direction: 'term_to_def' (cho term, gõ definition) hoặc 'def_to_term' (cho definition, gõ term)

    let promptText, answerToType, questionUILabel, placeholderText;
    if (direction === "term_to_def") {
      promptText = verbData.term; // Nghĩa tiếng Việt
      answerToType = verbData.definition; // Phrasal verb tiếng Anh
      questionUILabel = `Phrasal verb tiếng Anh tương ứng là gì?`;
      placeholderText = "Nhập phrasal verb...";
    } else {
      // def_to_term
      promptText = verbData.definition; // Phrasal verb tiếng Anh
      answerToType = verbData.term; // Nghĩa tiếng Việt
      questionUILabel = `Nghĩa tiếng Việt của phrasal verb này là gì?`;
      placeholderText = "Nhập nghĩa tiếng Việt...";
    }

    modeSpecificContent.innerHTML = `
        <div class="type-question animate-pop-in">
            <p class="prompt-text">Cho: "<strong>${promptText}</strong>"</p>
            <p class="question-label">${questionUILabel}</p>
            <input type="text" id="sl-type-input" placeholder="${placeholderText}" autocomplete="off" autocorrect="off" autocapitalize="none">
            <button id="submit-sl-type" class="action-button primary-btn" style="margin-top:15px;"><i class="fas fa-paper-plane"></i> Gửi</button>
        </div>
    `;
    feedbackArea.textContent = "";
    const inputEl = modeSpecificContent.querySelector("#sl-type-input");
    const submitBtn = modeSpecificContent.querySelector("#submit-sl-type");

    if (inputEl && submitBtn) {
      inputEl.focus();
      const submitHandler = () => {
        const userAnswer = inputEl.value; // Lấy giá trị gốc để có thể hiển thị lại nếu cần

        // SỬ DỤNG HÀM CHUẨN HÓA MỚI
        const isCorrect = normalizeAndCompareAnswers(userAnswer, answerToType);

        inputEl.disabled = true;
        submitBtn.disabled = true;

        // Thêm class feedback vào input
        inputEl.classList.add(
          isCorrect ? "correct-input-feedback" : "incorrect-input-feedback"
        );

        // if (isCorrect) { aiPracticeUserScore++; } // Logic điểm nên ở handleSmartLearnAnswer
        handleSmartLearnAnswer(
          verbData,
          isCorrect,
          questionType,
          isCorrect ? "Chính xác!" : `Sai! Đáp án đúng là: ${answerToType}`
        );
      };

      submitBtn.addEventListener("click", submitHandler);
      inputEl.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          submitHandler();
          e.preventDefault();
        }
      });
    } else {
      /* ... log lỗi như cũ ... */
    }
  }

  // Trong public/script.js của VerbMaster

  function handleSmartLearnAnswer(
    verbData,
    isCorrect,
    questionType,
    feedbackMsg = ""
  ) {
    if (!verbData || !verbData.id) {
      console.error(
        "SmartLearn Critical Error: Invalid verbData in handleSmartLearnAnswer",
        verbData
      );
      smartLearnCurrentIndexInQueue++; // Cố gắng bỏ qua để tránh kẹt
      setTimeout(displayNextSmartLearnItem, 500); // Thử item tiếp theo
      return;
    }

    if (!smartLearnRoundProgress[verbData.id]) {
      // Tình huống này không nên xảy ra nếu initSmartLearnMode và displayNextSmartLearnItem chạy đúng
      smartLearnRoundProgress[verbData.id] = {
        correctInRow: 0,
        timesSeenInRound: 1, // Nếu vào đây, coi như là lần thấy đầu tiên
        masteredInRound: false,
        questionTypesUsedInRound: new Set(),
      };
      console.warn(
        "SmartLearn: Re-initialized missing round progress in handleSmartLearnAnswer for verbId:",
        verbData.id
      );
    }
    let roundProgress = smartLearnRoundProgress[verbData.id];

    verbData.lastReviewed = Date.now();
    // totalSeen đã được tăng trong displayNextSmartLearnItem khi nó được chọn để hiển thị

    if (isCorrect) {
      // Điểm của SmartLearn (aiPracticeUserScore) được cập nhật dựa trên số từ masteredInRound (trong updateScoreInFooter)
      verbData.totalCorrect = (verbData.totalCorrect || 0) + 1;
      verbData.correctStreak = (verbData.correctStreak || 0) + 1;
      verbData.incorrectStreak = 0;
      roundProgress.correctInRow++;
      if (
        verbData.correctStreak >= 2 &&
        verbData.masteryLevel < MASTERY_LEVELS.MASTERED
      ) {
        // Cần ít nhất 2 lần đúng liên tiếp để coi là "nhớ"
        verbData.lastCorrect = Date.now();
      }
    } else {
      verbData.totalIncorrect = (verbData.totalIncorrect || 0) + 1;
      verbData.incorrectStreak = (verbData.incorrectStreak || 0) + 1;
      verbData.correctStreak = 0;
      roundProgress.correctInRow = 0;
      // Nếu trả lời sai một từ đã từng được coi là masteredInRound, thì bỏ trạng thái đó đi
      if (roundProgress.masteredInRound) {
        console.log(
          `SmartLearn: ${verbData.term} was mastered in round, but answered incorrectly. Resetting masteredInRound.`
        );
      }
      roundProgress.masteredInRound = false;

      if (verbData.srsBox > 0) {
        // Nếu sai, và không phải là từ mới tinh, thì giảm SRS box
        verbData.srsBox = Math.max(0, verbData.srsBox - 1);
        console.log(
          `SmartLearn: Demoted ${verbData.term} due to incorrect answer. New SRS Box: ${verbData.srsBox}`
        );
      }
    }

    // Logic quyết định masteredInRound:
    // Cần MIN_CORRECT_IN_ROW_FOR_ROUND_MASTERY (ví dụ 2) lần đúng liên tiếp VÀ
    // Phải trả lời đúng ít nhất một câu hỏi "khó" (type hoặc hard_mcq) HOẶC
    // Trả lời đúng nhiều lần câu hỏi dễ (ví dụ 3 lần liên tiếp cho easy_mcq)
    if (
      !roundProgress.masteredInRound &&
      roundProgress.correctInRow >= MIN_CORRECT_IN_ROW_FOR_ROUND_MASTERY
    ) {
      if (questionType.includes("type_") || questionType.includes("hard_mcq")) {
        roundProgress.masteredInRound = true;
      } else if (
        questionType.includes("easy_mcq") &&
        roundProgress.correctInRow >= MIN_CORRECT_IN_ROW_FOR_ROUND_MASTERY + 1
      ) {
        // Ví dụ: cần 3 lần đúng liên tiếp cho easy_mcq để master
        roundProgress.masteredInRound = true;
      } else if (
        questionType.includes("flashcard") &&
        roundProgress.correctInRow >= MIN_CORRECT_IN_ROW_FOR_ROUND_MASTERY + 1
      ) {
        // Flashcard cũng cần nhiều lần đúng hơn để coi là master trong vòng
        roundProgress.masteredInRound = true;
      }
    }
    // Nếu đã masteredInRound, và trả lời đúng tiếp, thì tăng SRS box
    if (roundProgress.masteredInRound && isCorrect) {
      if (verbData.srsBox < Object.keys(SRS_INTERVALS).length - 1) {
        verbData.srsBox++;
        console.log(
          `SmartLearn: Promoted ${verbData.term} to SRS Box ${verbData.srsBox} after mastering in round.`
        );
      }
    }

    // Cập nhật masteryLevel chung dựa trên srsBox
    if (verbData.srsBox === 0) verbData.masteryLevel = MASTERY_LEVELS.NEW;
    else if (verbData.srsBox <= FAMILIAR_THRESHOLD_SRS_BOX)
      verbData.masteryLevel = MASTERY_LEVELS.FAMILIAR;
    else if (verbData.srsBox <= LEARNING_THRESHOLD_SRS_BOX)
      verbData.masteryLevel = MASTERY_LEVELS.LEARNING;
    else verbData.masteryLevel = MASTERY_LEVELS.MASTERED;

    saveProgress();

    // Hiển thị feedback
    let feedbackTextToShow = feedbackMsg;
    if (!feedbackTextToShow) {
      feedbackTextToShow = isCorrect ? "Chính xác!" : "Cố gắng hơn nhé!";
    }
    if (!isCorrect) {
      let actualCorrectAnswer = questionType.includes("_def_to_term")
        ? verbData.term
        : verbData.definition;
      feedbackTextToShow = `Sai rồi! Đáp án đúng là: ${actualCorrectAnswer}`;
    }
    feedbackArea.textContent = feedbackTextToShow;
    feedbackArea.className = `feedback-area-footer ${
      isCorrect ? "correct" : "incorrect"
    }`;

    updateScoreInFooter(); // Cập nhật hiển thị masteredInRoundCount / totalInRound trên progress bar

    smartLearnCurrentIndexInQueue++;

    // Quyết định thêm câu hỏi thử thách vào queue
    if (
      !roundProgress.masteredInRound &&
      roundProgress.timesSeenInRound < MAX_EXPOSURES_PER_VERB_IN_ROUND
    ) {
      let nextChallengeType = determineNextChallengeType(
        verbData,
        isCorrect,
        questionType,
        roundProgress
      );

      if (nextChallengeType) {
        // Tránh thêm lại cùng một dạng câu hỏi cho cùng một từ nếu nó vừa mới xuất hiện
        // và từ đó chưa được thấy quá nhiều lần.
        // (questionTypesUsedInRound có thể giúp ở đây, nhưng logic này cần cẩn thận hơn)

        const insertOffset = Math.floor(Math.random() * 2) + 1; // Chèn sau 1 hoặc 2 câu hỏi khác
        const insertIndex = Math.min(
          smartLearnCurrentIndexInQueue + insertOffset,
          smartLearnSessionQueue.length
        );

        let canInsert = true;
        // Đơn giản hóa kiểm tra tránh lặp: không chèn nếu item tiếp theo trong queue là cùng verbId và cùng type
        if (
          insertIndex < smartLearnSessionQueue.length &&
          smartLearnSessionQueue[insertIndex]?.verbId === verbData.id &&
          smartLearnSessionQueue[insertIndex]?.type === nextChallengeType
        ) {
          canInsert = false;
          console.log(
            `SmartLearn: Skipped re-adding identical immediate challenge ${nextChallengeType} for ${verbData.term}`
          );
        }

        if (canInsert) {
          smartLearnSessionQueue.splice(insertIndex, 0, {
            verbId: verbData.id,
            type: nextChallengeType,
          });
          // roundProgress.questionTypesUsedInRound.add(nextChallengeType); // Thêm vào set đã dùng
          // totalQuestionsDisplay không còn phản ánh queue.length nữa, mà là currentLearningSet.length
          console.log(
            `SmartLearn: Added challenge ${nextChallengeType} for ${verbData.term} at queue index ${insertIndex}. Queue length: ${smartLearnSessionQueue.length}`
          );
        }
      }
    }

    setTimeout(
      () => {
        displayNextSmartLearnItem();
      },
      feedbackMsg ? 2000 : 1500
    );
  }

  // Hàm mới để quyết định loại câu hỏi thử thách tiếp theo
  function determineNextChallengeType(
    verbData,
    lastAnswerWasCorrect,
    lastQuestionType,
    roundProgress
  ) {
    const currentDirection = lastQuestionType.includes("_def_to_term")
      ? "reverse"
      : "forward";
    let nextType = null;
    const typesUsed = roundProgress.questionTypesUsedInRound;

    if (!lastAnswerWasCorrect) {
      // Ưu tiên Flashcard nếu sai nhiều hoặc sai câu khó
      if (
        (verbData.incorrectStreak >= 1 && !typesUsed.has("flashcard_recall")) ||
        lastQuestionType.includes("type_")
      ) {
        nextType = "flashcard_recall";
      }
      // Thử MCQ dễ theo chiều ngược lại
      else if (
        currentDirection === "forward" &&
        !typesUsed.has("easy_mcq_def_to_term")
      ) {
        nextType = "easy_mcq_def_to_term";
      } else if (
        currentDirection === "reverse" &&
        !typesUsed.has("easy_mcq_term_to_def")
      ) {
        nextType = "easy_mcq_term_to_def";
      } else if (!typesUsed.has("flashcard_recall")) {
        // Fallback nếu các MCQ dễ đã dùng
        nextType = "flashcard_recall";
      } else {
        // Nếu flashcard cũng đã dùng, thử lại MCQ dễ khác chiều
        nextType =
          currentDirection === "forward"
            ? "easy_mcq_def_to_term"
            : "easy_mcq_term_to_def";
      }
    } else {
      // TRẢ LỜI ĐÚNG (nhưng chưa masteredInRound)
      if (roundProgress.correctInRow === 1) {
        // Mới đúng 1 lần liên tiếp
        if (lastQuestionType.includes("flashcard")) {
          // Sau flashcard, thử MCQ dễ
          nextType =
            currentDirection === "forward" || Math.random() < 0.7
              ? "easy_mcq_term_to_def"
              : "easy_mcq_def_to_term";
        } else if (lastQuestionType.includes("easy_mcq")) {
          // Sau MCQ dễ, thử MCQ khó hoặc type
          if (currentDirection === "forward") {
            nextType =
              Math.random() < 0.6
                ? "hard_mcq_term_to_def"
                : "type_definition_from_term";
          } else {
            // reverse
            nextType =
              Math.random() < 0.6
                ? "hard_mcq_def_to_term"
                : "type_term_from_def";
          }
        } else {
          // Sau MCQ khó hoặc type, thử type khác chiều hoặc type cùng chiều (để chắc chắn)
          nextType =
            currentDirection === "forward"
              ? "type_definition_from_term"
              : "type_term_from_def";
        }
      } else {
        // Đã đúng >= MIN_CORRECT_IN_ROW_FOR_ROUND_MASTERY lần (nhưng có thể chưa master vì loại câu hỏi)
        // Thử thách bằng dạng gõ để xác nhận mastery
        nextType =
          currentDirection === "forward"
            ? "type_definition_from_term"
            : "type_term_from_def";
      }
    }

    // Nếu type được chọn đã được dùng quá nhiều cho từ này trong vòng, thử fallback
    if (nextType && typesUsed.has(nextType) && typesUsed.size >= 3) {
      // Ví dụ: nếu đã dùng 3 loại khác nhau
      // Tìm một loại chưa dùng, ưu tiên type, rồi hard_mcq, rồi easy_mcq, rồi flashcard
      const potentialTypesForward = [
        "type_definition_from_term",
        "hard_mcq_term_to_def",
        "easy_mcq_term_to_def",
        "flashcard_recall",
      ];
      const potentialTypesReverse = [
        "type_term_from_def",
        "hard_mcq_def_to_term",
        "easy_mcq_def_to_term",
        "flashcard_recall",
      ];
      const potentialTypes =
        currentDirection === "forward" && Math.random() < 0.7
          ? potentialTypesForward
          : potentialTypesReverse;

      for (const pt of potentialTypes) {
        if (!typesUsed.has(pt)) {
          nextType = pt;
          break;
        }
      }
      // Nếu tất cả đã dùng, có thể lặp lại một loại khó, hoặc flashcard
      if (typesUsed.has(nextType) || !nextType) {
        // Vẫn là type đã dùng hoặc không tìm được type mới
        nextType =
          currentDirection === "forward"
            ? "type_definition_from_term"
            : "type_term_from_def";
        if (typesUsed.has(nextType)) nextType = "flashcard_recall"; // Fallback cuối cùng
      }
    }
    if (nextType) typesUsed.add(nextType); // Ghi nhận type sẽ được dùng (nếu được chèn vào queue)
    return nextType;
  }

  function addInitialQuestionsToQueue(verbId) {
    const verb = allPhrasalVerbs.find((v) => v.id === verbId);
    if (!verb) return;

    const progress = smartLearnRoundProgress[verb.id]; // progress đã được khởi tạo trong initSmartLearnMode

    // Luôn có flashcard_intro nếu chưa từng thấy trong vòng này hoặc là từ rất mới (srsBox 0)
    if (progress.timesSeenInRound === 0 || verb.srsBox === 0) {
      smartLearnSessionQueue.push({ verbId: verb.id, type: "flashcard_intro" });
      progress.questionTypesUsedInRound.add("flashcard_intro");
    }

    // Thêm một câu hỏi trắc nghiệm
    let initialMcqType = "easy_mcq_term_to_def";
    if (verb.srsBox > FAMILIAR_THRESHOLD_SRS_BOX && Math.random() < 0.5) {
      // Nếu từ đã quen, có thể hỏi ngược
      initialMcqType = "easy_mcq_def_to_term";
    }
    if (!progress.questionTypesUsedInRound.has(initialMcqType)) {
      smartLearnSessionQueue.push({ verbId: verb.id, type: initialMcqType });
      progress.questionTypesUsedInRound.add(initialMcqType);
    } else {
      // Nếu đã có type đó, thử type dễ còn lại
      const alternativeEasyMcq =
        initialMcqType === "easy_mcq_term_to_def"
          ? "easy_mcq_def_to_term"
          : "easy_mcq_term_to_def";
      if (!progress.questionTypesUsedInRound.has(alternativeEasyMcq)) {
        smartLearnSessionQueue.push({
          verbId: verb.id,
          type: alternativeEasyMcq,
        });
        progress.questionTypesUsedInRound.add(alternativeEasyMcq);
      }
    }
  }

  function selectVerbsForSmartLearnRound(targetSize) {
    const now = Date.now();
    let potentialVerbs = allPhrasalVerbs.filter(
      (v) =>
        v.masteryLevel < MASTERY_LEVELS.MASTERED ||
        (v.nextReviewDate && v.nextReviewDate <= now)
    );

    potentialVerbs.sort((a, b) => {
      const aDueScore = a.nextReviewDate && a.nextReviewDate <= now ? -1000 : 0; // Ưu tiên từ due
      const bDueScore = b.nextReviewDate && b.nextReviewDate <= now ? -1000 : 0;
      // Trọng số cho srsBox thấp hơn (mới hơn)
      const aSrsScore = (a.srsBox || 0) * 10;
      const bSrsScore = (b.srsBox || 0) * 10;
      // Trọng số cho lastReviewed cũ hơn
      const aLastReviewedScore = a.lastReviewed || 0;
      const bLastReviewedScore = b.lastReviewed || 0;

      return (
        aDueScore +
        aSrsScore +
        aLastReviewedScore -
        (bDueScore + bSrsScore + bLastReviewedScore)
      );
    });

    let selectedSet = potentialVerbs.slice(0, targetSize);

    if (selectedSet.length < targetSize) {
      const newestVerbs = allPhrasalVerbs
        .filter(
          (v) =>
            v.masteryLevel === MASTERY_LEVELS.NEW &&
            !selectedSet.find((s) => s.id === v.id)
        )
        .sort(() => 0.5 - Math.random());
      selectedSet.push(
        ...newestVerbs.slice(0, targetSize - selectedSet.length)
      );
    }

    if (selectedSet.length < targetSize) {
      const lessReviewedOthers = allPhrasalVerbs
        .filter(
          (v) =>
            v.masteryLevel < MASTERY_LEVELS.MASTERED &&
            !selectedSet.find((s) => s.id === v.id)
        )
        .sort((a, b) => (a.lastReviewed || 0) - (b.lastReviewed || 0));
      selectedSet.push(
        ...lessReviewedOthers.slice(0, targetSize - selectedSet.length)
      );
    }

    console.log(
      "SmartLearn: Selected verbs for round:",
      selectedSet.map((v) => ({
        term: v.term,
        srs: v.srsBox,
        lastRev: v.lastReviewed
          ? new Date(v.lastReviewed).toLocaleDateString()
          : "N/A",
      }))
    );
    return selectedSet;
  }

  function generateMoreSmartLearnItems() {
    let itemsAddedToQueueThisCall = 0;
    currentLearningSet.forEach((verb) => {
      const progress = smartLearnRoundProgress[verb.id];
      if (!progress) return; // Nên được khởi tạo rồi

      const alreadyQueuedForRetry = smartLearnSessionQueue
        .slice(smartLearnCurrentIndexInQueue)
        .some((item) => item.verbId === verb.id);

      if (
        !progress.masteredInRound &&
        progress.timesSeenInRound < MAX_EXPOSURES_PER_VERB_IN_ROUND &&
        !alreadyQueuedForRetry
      ) {
        // Lấy type cuối cùng đã dùng cho từ này để quyết định type tiếp theo nếu sai
        const lastTypeUsed =
          Array.from(progress.questionTypesUsedInRound).pop() ||
          "flashcard_recall";
        let nextType = determineNextChallengeType(
          verb,
          false,
          lastTypeUsed,
          progress
        );

        if (!nextType) nextType = "flashcard_recall"; // Fallback

        // Chỉ thêm nếu type này chưa được dùng hoặc là flashcard (flashcard có thể lặp lại)
        if (
          !progress.questionTypesUsedInRound.has(nextType) ||
          nextType.includes("flashcard")
        ) {
          smartLearnSessionQueue.push({ verbId: verb.id, type: nextType });
          progress.questionTypesUsedInRound.add(nextType);
          itemsAddedToQueueThisCall++;
          console.log(
            `SmartLearn (GenerateMore): Added ${nextType} for ${verb.term}.`
          );
        }
      }
    });

    if (itemsAddedToQueueThisCall > 0) {
      // Không shuffle những cái vừa thêm vào cuối để có thể kiểm soát thứ tự hơn
      // totalQuestionsDisplay đã được cập nhật trong updateScoreInFooter
    }
    return itemsAddedToQueueThisCall > 0;
  }

  function showSmartLearnRoundEndSummary() {
    updateModeTitle(
      '<i class="fas fa-flag-checkered"></i> Hoàn Thành Vòng SmartLearn!'
    );
    const masteredThisRoundCount = currentLearningSet.filter(
      (v) => smartLearnRoundProgress[v.id]?.masteredInRound
    ).length;

    let summaryHTML = `
        <div class="session-summary smartlearn-summary animate-pop-in">
            <h2><i class="fas fa-award"></i> Kết thúc vòng học!</h2>
            <p class="summary-score">Bạn đã làm chủ <strong>${masteredThisRoundCount} / ${
      currentLearningSet.length
    }</strong> từ trong vòng này.</p>
            <div class="round-progress-bar-container">
                <div class="round-progress-bar-fill" style="width: ${
                  (masteredThisRoundCount / currentLearningSet.length) * 100
                }%;"></div>
            </div>
    `;
    if (
      masteredThisRoundCount < currentLearningSet.length &&
      aiPracticeIncorrectAnswers.length > 0
    ) {
      // Hiển thị từ khó nếu chưa master hết
      summaryHTML += `<h3><i class="fas fa-brain"></i> Từ cần chú ý thêm:</h3><ul class="review-focus-list">`;
      currentLearningSet.forEach((v) => {
        if (!smartLearnRoundProgress[v.id]?.masteredInRound) {
          summaryHTML += `<li><strong>${v.term}</strong> <span class="focus-status">(SRS Box: ${v.srsBox}, Cần ôn tập)</span></li>`;
        }
      });
      summaryHTML += `</ul>`;
    } else if (masteredThisRoundCount === currentLearningSet.length) {
      summaryHTML += `<p class="all-correct-message"><i class="fas fa-check-circle"></i> Xuất sắc! Bạn đã nắm vững tất cả các từ trong vòng này!</p>`;
    }

    summaryHTML += `
            <div class="summary-actions">
                <button id="continue-smart-learn-btn" class="action-button primary-btn"><i class="fas fa-arrow-right"></i> Tiếp tục vòng mới</button>
                <button id="choose-other-mode-btn" class="action-button secondary-btn"><i class="fas fa-th-large"></i> Chọn chế độ khác</button>
            </div>
        </div>
    `;
    modeSpecificContent.innerHTML = summaryHTML;
    // Thêm CSS cho .smartlearn-summary, .round-progress-bar-container, .review-focus-list
    hideFooterControls();
    document
      .getElementById("continue-smart-learn-btn")
      .addEventListener("click", initSmartLearnMode);
    document
      .getElementById("choose-other-mode-btn")
      .addEventListener("click", () => {
        setActiveNavButton(null);
        setActiveMobileNavButton(null);
        displayWelcomeMessage();
      });
    updateProgressSummary(); // Cập nhật tổng quan chung sau vòng học
  }

  // --- EVENT LISTENERS SETUP (ensure SmartLearn button is wired) ---
  function setupEventListeners() {
    if (startSmartLearnModeBtnMobile) {
      startSmartLearnModeBtnMobile.addEventListener("click", () => {
        setActiveMobileNavButton(startSmartLearnModeBtnMobile); // Đặt class active cho nút mobile
        initSmartLearnMode();
      });
    }
    if (startFlashcardModeBtnMobile) {
      startFlashcardModeBtnMobile.addEventListener("click", () => {
        setActiveMobileNavButton(startFlashcardModeBtnMobile);
        initFlashcardMode();
      });
    }
    if (startQuizModeBtnMobile) {
      startQuizModeBtnMobile.addEventListener("click", () => {
        setActiveMobileNavButton(startQuizModeBtnMobile);
        initQuizMode();
      });
    }
    if (startTypeModeBtnMobile) {
      startTypeModeBtnMobile.addEventListener("click", () => {
        setActiveMobileNavButton(startTypeModeBtnMobile);
        initTypeMode();
      });
    }
    if (startTestModeBtnMobile) {
      startTestModeBtnMobile.addEventListener("click", () => {
        setActiveMobileNavButton(startTestModeBtnMobile);
        initTestSettings();
      });
    }
    if (startAdvancedStatsBtnMobile) {
      startAdvancedStatsBtnMobile.addEventListener("click", () => {
        setActiveMobileNavButton(startAdvancedStatsBtnMobile);
        initAdvancedStatsMode();
      });
    }
    startSmartLearnModeBtn.addEventListener("click", () => {
      setActiveNavButton(startSmartLearnModeBtn);
      initSmartLearnMode();
    });
    // ... (other existing event listeners for Flashcard, Quiz, Type, Test, Stats, Data controls, Theme) ...
    startFlashcardModeBtn.addEventListener("click", () => {
      setActiveNavButton(startFlashcardModeBtn);
      initFlashcardMode();
    });
    startQuizModeBtn.addEventListener("click", () => {
      setActiveNavButton(startQuizModeBtn);
      initQuizMode();
    });
    startTypeModeBtn.addEventListener("click", () => {
      setActiveNavButton(startTypeModeBtn);
      initTypeMode();
    });
    startTestModeBtn.addEventListener("click", () => {
      setActiveNavButton(startTestModeBtn);
      initTestSettings();
    });
    if (startAdvancedStatsBtn) {
      startAdvancedStatsBtn.addEventListener("click", () => {
        setActiveNavButton(startAdvancedStatsBtn);
        initAdvancedStatsMode();
      });
    }

    saveProgressBtn.addEventListener("click", saveProgress);
    loadProgressBtn.addEventListener("click", loadProgress);
    resetProgressBtn.addEventListener("click", resetProgress);

    closeTestSettingsBtn.addEventListener("click", () =>
      testSettingsModal.classList.remove("show-modal")
    );
    window.addEventListener("click", (event) => {
      if (event.target === testSettingsModal)
        testSettingsModal.classList.remove("show-modal");
    });
    generateTestBtn.addEventListener("click", startNewTest);

    prevCardBtn.addEventListener("click", navigateFlashcardPrev);
    nextCardBtn.addEventListener("click", navigateFlashcardNext);

    const shuffleVerbsToggle = document.getElementById("shuffleVerbsToggle");
    if (shuffleVerbsToggle) {
      shuffleVerbsToggle.addEventListener("change", (event) => {
        settings.shuffleVerbs = event.target.checked;
        saveAppSettings(); // Lưu ngay khi thay đổi
        // showToast(`Xáo trộn từ: ${settings.shuffleVerbs ? 'Bật' : 'Tắt'}`, 'info'); // Optional feedback
      });
    }

    mobileSettingsToggleBtn.addEventListener("click", () => {
      sidebarEl.classList.toggle("mobile-settings-open");
      const icon = mobileSettingsToggleBtn.querySelector("i");
      if (sidebarEl.classList.contains("mobile-settings-open")) {
        icon.classList.remove("fa-cog");
        icon.classList.add("fa-times");
        mobileSettingsToggleBtn.setAttribute("aria-label", "Đóng cài đặt");
        mobileSettingsToggleBtn.setAttribute("aria-expanded", "true");
      } else {
        icon.classList.remove("fa-times");
        icon.classList.add("fa-cog");
        mobileSettingsToggleBtn.setAttribute("aria-label", "Mở cài đặt");
        mobileSettingsToggleBtn.setAttribute("aria-expanded", "false");
      }
    });

    // Đóng menu settings mobile khi click vào một nút nav-btn bên trong nó
    const navButtonsInMobileMenu = sidebarEl.querySelectorAll(
      ".sidebar-main-content .nav-btn"
    );
    navButtonsInMobileMenu.forEach((btn) => {
      btn.addEventListener("click", () => {
        if (sidebarEl.classList.contains("mobile-settings-open")) {
          sidebarEl.classList.remove("mobile-settings-open");
          const icon = mobileSettingsToggleBtn.querySelector("i");
          icon.classList.remove("fa-times");
          icon.classList.add("fa-cog");
          mobileSettingsToggleBtn.setAttribute("aria-label", "Mở cài đặt");
          mobileSettingsToggleBtn.setAttribute("aria-expanded", "false");
        }
      });
    });

    // Đóng menu settings mobile khi click ra ngoài (tùy chọn nâng cao)
    document.addEventListener("click", function (event) {
      const isClickInsideSidebar = sidebarEl.contains(event.target);
      const isClickOnToggleButton = mobileSettingsToggleBtn.contains(
        event.target
      );

      if (
        !isClickInsideSidebar &&
        !isClickOnToggleButton &&
        sidebarEl.classList.contains("mobile-settings-open")
      ) {
        sidebarEl.classList.remove("mobile-settings-open");
        const icon = mobileSettingsToggleBtn.querySelector("i");
        icon.classList.remove("fa-times");
        icon.classList.add("fa-cog");
        mobileSettingsToggleBtn.setAttribute("aria-label", "Mở cài đặt");
        mobileSettingsToggleBtn.setAttribute("aria-expanded", "false");
      }
    });

    if (startAiPracticeModeBtn) {
      startAiPracticeModeBtn.addEventListener("click", () => {
        setActiveNavButton(startAiPracticeModeBtn);
        initAiPracticeMode();
      });
    }
    if (startAiPracticeModeBtnMobile) {
      startAiPracticeModeBtnMobile.addEventListener("click", () => {
        setActiveMobileNavButton(startAiPracticeModeBtnMobile);
        initAiPracticeMode();
      });
    }
  }

  // --- SHARED FUNCTIONS (already exist, ensure they are compatible) ---
  // function updateScoreInFooter() { ... }
  // function showSessionEndSummary(modeName, finalScore, totalItems) { ... } -> adapt for SmartLearn round end

  // --- START THE APP ---
  initializeApp();

  // --- EXISTING MODE FUNCTIONS (Flashcard, Quiz, Type, Test, Stats) ---
  // Make sure these functions are present in your script.js if you haven't removed them.
  // For brevity, I'm not re-listing them entirely here, but they should be the same
  // as provided in previous responses, with minor adaptations if needed to use the
  // new verb object structure (from createSmartLearnVerbObject).
  // Example adaptation: when updating mastery in these modes, you might want to
  // simplify it or make it less aggressive than the SmartLearn SRS logic, or just
  // track totalCorrect/totalIncorrect.

  // Simplified Flashcard Mode (example, ensure it's complete in your actual file)
  function initFlashcardMode() {
    currentMode = "flashcard";
    setActiveNavButton(startFlashcardModeBtn);
    // setActiveMobileNavButton(startFlashcardModeBtnMobile); // Gọi hàm này ở đây
    updateModeTitle('<i class="fas fa-clone"></i> Flashcards');

    if (welcomeMessageContainer) welcomeMessageContainer.style.display = "none"; // Ẩn welcome
    if (modeSpecificContent) modeSpecificContent.style.display = "block"; // Hiện khu vực nội dung chế độ

    if (allPhrasalVerbs.length === 0) {
      modeSpecificContent.innerHTML =
        '<p class="info-message">Không có từ vựng nào để học. Hãy thử reset dữ liệu nếu đây là lỗi.</p>';
      return;
    }
    currentLearningSet = settings.shuffleVerbs
      ? shuffleArray([...allPhrasalVerbs])
      : [...allPhrasalVerbs];
    currentIndex = 0;
    hideFooterControls();
    navigationControls.style.display = "flex";
    scoreArea.style.display = "none";
    feedbackArea.textContent = "Lật thẻ để xem nghĩa.";
    displayFlashcard(); // displayFlashcard sẽ render vào modeSpecificContent
    updateFlashcardNavUI();

    // Active nút mobile tương ứng
    const mobileBtn = document.getElementById("startFlashcardModeBtnMobile");
    if (mobileBtn) setActiveMobileNavButton(mobileBtn);
  }
  function displayFlashcard() {
    if (currentIndex >= currentLearningSet.length) {
      modeSpecificContent.innerHTML = '<p class="info-message">Hết thẻ!</p>';
      hideFooterControls();
      return;
    }
    const verb = currentLearningSet[currentIndex];
    modeSpecificContent.innerHTML = `
            <div class="flashcard-container"><div class="flashcard" id="current-flashcard" tabindex="0">
                <div class="front"><p class="flashcard-term">${verb.term}</p>${
      verb.example
        ? `<p class="flashcard-example"><em>e.g., ${verb.example}</em></p>`
        : ""
    }</div>
                <div class="back"><p class="flashcard-definition">${
                  verb.definition
                }</p></div>
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
    document.getElementById("fc-mark-correct").onclick = () =>
      handleFlashcardMarkSimple(true);
    document.getElementById("fc-mark-incorrect").onclick = () =>
      handleFlashcardMarkSimple(false);
    updateFlashcardNavUI();
  }
  function handleFlashcardMarkSimple(known) {
    // Simplified mastery for general flashcard mode
    const verb = currentLearningSet[currentIndex];
    verb.lastReviewed = Date.now();
    if (known) verb.totalCorrect++;
    else verb.totalIncorrect++;
    // Optionally, a very simple mastery update here, or none if SmartLearn is the main driver
    if (known && verb.masteryLevel < MASTERY_LEVELS.FAMILIAR)
      verb.masteryLevel = MASTERY_LEVELS.FAMILIAR;
    else if (!known && verb.masteryLevel > MASTERY_LEVELS.NEW)
      verb.masteryLevel = MASTERY_LEVELS.NEW;
    saveProgress();
    feedbackArea.textContent = known
      ? `"${verb.term}" được ghi nhớ.`
      : `"${verb.term}" cần ôn thêm.`;
    feedbackArea.className = `feedback-area-footer ${
      known ? "correct" : "incorrect"
    }`;
    setTimeout(() => {
      if (currentIndex < currentLearningSet.length - 1) {
        currentIndex++;
        displayFlashcard();
      } else {
        modeSpecificContent.innerHTML = '<p class="info-message">Hết thẻ!</p>';
        hideFooterControls();
      }
    }, 1000);
  }
  function navigateFlashcardPrev() {
    if (currentMode === "flashcard" && currentIndex > 0) {
      currentIndex--;
      displayFlashcard();
    }
  }
  function navigateFlashcardNext() {
    if (
      currentMode === "flashcard" &&
      currentIndex < currentLearningSet.length - 1
    ) {
      currentIndex++;
      displayFlashcard();
    } else if (currentMode === "flashcard") {
      modeSpecificContent.innerHTML = '<p class="info-message">Hết thẻ!</p>';
      hideFooterControls();
    }
  }
  function updateFlashcardNavUI() {
    prevCardBtn.disabled = currentIndex === 0;
    nextCardBtn.disabled = currentIndex >= currentLearningSet.length - 1;
    cardNumberDisplay.textContent = `${currentIndex + 1} / ${
      currentLearningSet.length
    }`;
  }

  // Simplified Quiz Mode
  function initQuizMode(sessionSize = 10) {
    currentMode = "quiz";
    updateModeTitle('<i class="fas fa-list-check"></i> Trắc Nghiệm');
    if (welcomeMessageContainer) welcomeMessageContainer.style.display = "none"; // Ẩn welcome
    if (modeSpecificContent) modeSpecificContent.style.display = "block"; // Hiện khu vực nội dung chế độ
    if (allPhrasalVerbs.length < 4) {
      modeSpecificContent.innerHTML =
        '<p class="info-message">Cần ít nhất 4 từ.</p>';
      return;
    }
    let tempSet = settings.shuffleVerbs
      ? shuffleArray([...allPhrasalVerbs])
      : [...allPhrasalVerbs]; // Dòng mới
    currentLearningSet = tempSet.slice(
      0,
      Math.min(allPhrasalVerbs.length, sessionSize)
    );
    score = 0;
    questionsAnsweredInSession = 0;
    hideFooterControls();
    scoreArea.style.display = "block";
    totalQuestionsDisplay.textContent = currentLearningSet.length;
    updateScoreInFooter();
    displayGeneralQuizQuestion();
  }
  function displayGeneralQuizQuestion() {
    /* Similar to renderSmartLearnMCQ but calls handleGeneralQuizChoice */
    if (questionsAnsweredInSession >= currentLearningSet.length) {
      showSessionEndSummary("Trắc Nghiệm", score, currentLearningSet.length);
      return;
    }
    const qData = currentLearningSet[questionsAnsweredInSession];
    const correctAns = qData.definition;
    let opts = [correctAns];
    const distractors = allPhrasalVerbs
      .filter((v) => v.id !== qData.id)
      .map((v) => v.definition);
    shuffleArray(distractors);
    for (let i = 0; opts.length < 4 && i < distractors.length; i++) {
      if (!opts.includes(distractors[i])) opts.push(distractors[i]);
    }
    while (opts.length < Math.min(4, allPhrasalVerbs.length)) {
      let rDef =
        allPhrasalVerbs[Math.floor(Math.random() * allPhrasalVerbs.length)]
          .definition;
      if (!opts.includes(rDef)) opts.push(rDef);
    }
    shuffleArray(opts);
    modeSpecificContent.innerHTML = `<div class="question-area animate-pop-in"><p>"<strong>${
      qData.term
    }</strong>" nghĩa là gì?</p><ul class="options-list">${opts
      .map(
        (o) =>
          `<li data-answer="${o.replace(/"/g, '"')}" tabindex="0">${o}</li>`
      )
      .join(
        ""
      )}</ul><button id="next-q-btn" class="action-button P" style="display:none;margin-top:20px;">Tiếp</button></div>`;
    feedbackArea.textContent = `Câu ${questionsAnsweredInSession + 1}/${
      currentLearningSet.length
    }`;
    modeSpecificContent.querySelectorAll(".options-list li").forEach((li) => {
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
  function handleGeneralQuizChoice(selectedLi, qData) {
    /* Similar to handleQuizChoice but simpler mastery */
    const selectedAns = selectedLi.dataset.answer;
    const correctAns = qData.definition;
    const isCorrect =
      normalizeAnswer(selectedAns) === normalizeAnswer(correctAns);
    modeSpecificContent.querySelectorAll(".options-list li").forEach((li) => {
      li.classList.add("disabled");
      if (normalizeAnswer(li.dataset.answer) === normalizeAnswer(correctAns))
        li.classList.add("correct");
      else if (li === selectedLi && !isCorrect) li.classList.add("incorrect");
    });
    if (isCorrect) {
      score++;
      feedbackArea.textContent = "Chính xác!";
      feedbackArea.className = "feedback-area-footer correct";
      qData.totalCorrect++;
    } else {
      feedbackArea.textContent = `Sai! Đúng là: ${correctAns}`;
      feedbackArea.className = "feedback-area-footer incorrect";
      qData.totalIncorrect++;
    }
    qData.lastReviewed = Date.now();
    saveProgress();
    updateScoreInFooter();
    const nextBtn = document.getElementById("next-q-btn");
    nextBtn.style.display = "inline-flex";
    nextBtn.focus();
    nextBtn.onclick = () => {
      questionsAnsweredInSession++;
      displayGeneralQuizQuestion();
    };
  }

  // Simplified Type Mode
  function initTypeMode(sessionSize = 10) {
    /* Similar to initQuizMode */
    currentMode = "type";
    updateModeTitle('<i class="fas fa-keyboard"></i> Tự Luận');
    if (welcomeMessageContainer) welcomeMessageContainer.style.display = "none"; // Ẩn welcome
    if (modeSpecificContent) modeSpecificContent.style.display = "block"; // Hiện khu vực nội dung chế độ
    if (allPhrasalVerbs.length === 0) {
      modeSpecificContent.innerHTML =
        '<p class="info-message">Không có từ.</p>';
      return;
    }
    let tempSet = settings.shuffleVerbs
      ? shuffleArray([...allPhrasalVerbs])
      : [...allPhrasalVerbs]; // Dòng mới
    currentLearningSet = tempSet.slice(
      0,
      Math.min(allPhrasalVerbs.length, sessionSize)
    );
    score = 0;
    questionsAnsweredInSession = 0;
    hideFooterControls();
    scoreArea.style.display = "block";
    totalQuestionsDisplay.textContent = currentLearningSet.length;
    updateScoreInFooter();
    displayGeneralTypeQuestion();
  }
  function displayGeneralTypeQuestion() {
    /* Similar to renderSmartLearnTypeIn but calls handleGeneralTypeSubmission */
    if (questionsAnsweredInSession >= currentLearningSet.length) {
      showSessionEndSummary("Tự Luận", score, currentLearningSet.length);
      return;
    }
    const qData = currentLearningSet[questionsAnsweredInSession];
    modeSpecificContent.innerHTML = `<div class="type-question animate-pop-in"><p>"<strong>${qData.term}</strong>" là gì?</p><input type="text" id="type-ans-in" placeholder="Đáp án..."><button id="sub-type-ans" class="action-button P" style="margin-top:15px;">Gửi</button><button id="next-q-btn" class="action-button S" style="display:none;margin-top:15px;">Tiếp</button></div>`;
    feedbackArea.textContent = `Câu ${questionsAnsweredInSession + 1}/${
      currentLearningSet.length
    }`;
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
  function handleGeneralTypeSubmission(questionData) {
    const inputEl = document.getElementById("type-ans-in"); // Giả sử ID này được dùng trong Type Mode
    if (!inputEl) return;

    const userAnswer = inputEl.value;
    const correctAnswerString = questionData.definition; // Hoặc questionData.term tùy theo chiều hỏi

    const isCorrect = normalizeAndCompareAnswers(
      userAnswer,
      correctAnswerString
    );

    inputEl.disabled = true;
    document.getElementById("sub-type-ans").style.display = "none"; // Nút submit của Type Mode
    const nextBtn = document.getElementById("next-q-btn"); // Nút next của Type Mode
    if (nextBtn) {
      nextBtn.style.display = "inline-flex";
      nextBtn.focus();
      nextBtn.onclick = () => {
        questionsAnsweredInSession++;
        displayGeneralTypeQuestion();
      };
    }

    if (isCorrect) {
      score++;
      feedbackArea.textContent = "Chính xác!";
      feedbackArea.className = "feedback-area-footer correct";
      questionData.totalCorrect = (questionData.totalCorrect || 0) + 1;
      inputEl.classList.add("correct-input-feedback");
    } else {
      feedbackArea.textContent = `Sai! Đúng là: ${correctAnswerString}`;
      feedbackArea.className = "feedback-area-footer incorrect";
      questionData.totalIncorrect = (questionData.totalIncorrect || 0) + 1;
      inputEl.classList.add("incorrect-input-feedback");
    }
    questionData.lastReviewed = Date.now();
    saveProgress();
    updateScoreInFooter();
  }

  // Test Mode, Stats Mode functions as previously defined
  // initTestSettings, startNewTest, displayTestQuestion (needs adaptation for test structure), showTestResults
  // initAdvancedStatsMode, renderAdvancedStats
  // ... (These functions should be included in your final script.js)
  // Ensure they use the new verb object structure if they interact with mastery/progress fields.

  function showSessionEndSummary(modeName, finalScore, totalItems) {
    updateModeTitle(
      `<i class="fas fa-flag-checkered"></i> Hoàn Thành: ${modeName}`
    );
    modeSpecificContent.innerHTML = `
            <div class="session-summary animate-pop-in">
                <h2><i class="fas fa-medal"></i> Tuyệt vời! Bạn đã hoàn thành ${modeName}.</h2>
                <p class="summary-score">Điểm của bạn: <strong>${finalScore} / ${totalItems}</strong></p>
                <div class="summary-actions">
                    <button id="restart-session-btn" class="action-button primary-btn"><i class="fas fa-redo"></i> Chơi lại</button>
                    <button id="choose-other-mode-btn" class="action-button secondary-btn"><i class="fas fa-th-large"></i> Chế độ khác</button>
                </div>
            </div>`;
    hideFooterControls();
    document
      .getElementById("restart-session-btn")
      .addEventListener("click", () => {
        if (currentMode === "quiz") initQuizMode();
        else if (currentMode === "type") initTypeMode();
        // SmartLearn round end is handled by showSmartLearnRoundEndSummary
      });
    document
      .getElementById("choose-other-mode-btn")
      .addEventListener("click", () => {
        setActiveNavButton(null);
        displayWelcomeMessage();
      });
    updateProgressSummary();
  }

  function initTestSettings() {
    currentMode = "test";
    updateModeTitle('<i class="fas fa-file-alt"></i> Bài Kiểm Tra');
    if (welcomeMessageContainer) welcomeMessageContainer.style.display = "none"; // Ẩn welcome
    if (modeSpecificContent) modeSpecificContent.style.display = "block"; // Hiện khu vực nội dung chế độ
    if (allPhrasalVerbs.length === 0) {
      modeSpecificContent.innerHTML =
        '<p class="info-message">Không có từ để kiểm tra.</p>';
      return;
    }
    modeSpecificContent.innerHTML = "";
    numTestQuestionsInput.max = allPhrasalVerbs.length;
    numTestQuestionsInput.value = Math.min(10, allPhrasalVerbs.length);
    testSettingsModal.classList.add("show-modal");
  }
  function startNewTest() {
    const numQuestions = parseInt(numTestQuestionsInput.value);
    const selectedTypesCheckboxes = document.querySelectorAll(
      '#test-settings-modal input[name="questionType"]:checked'
    );
    let questionTypes = Array.from(selectedTypesCheckboxes).map(
      (cb) => cb.value
    );

    if (numQuestions <= 0 || numQuestions > allPhrasalVerbs.length) {
      showToast("Số câu hỏi không hợp lệ.", "error");
      return;
    }
    if (questionTypes.length === 0) {
      showToast("Chọn ít nhất một loại câu hỏi.", "error");
      return;
    }
    testSettingsModal.classList.remove("show-modal");

    let baseTestSet = settings.shuffleVerbs
      ? shuffleArray([...allPhrasalVerbs])
      : [...allPhrasalVerbs]; // Dòng mới
    currentTestSet = baseTestSet.slice(0, numQuestions).map((verb) => ({
      ...verb,
      questionType:
        questionTypes[Math.floor(Math.random() * questionTypes.length)],
      userAnswer: null,
      isCorrect: null,
    }));

    score = 0;
    questionsAnsweredInSession = 0;
    hideFooterControls();
    scoreArea.style.display = "block";
    totalQuestionsDisplay.textContent = currentTestSet.length;
    updateScoreInFooter();
    displayTestQuestionItem();
  }
  function displayTestQuestionItem() {
    // Renamed to avoid conflict
    if (questionsAnsweredInSession >= currentTestSet.length) {
      showTestResults();
      return;
    }
    const qData = currentTestSet[questionsAnsweredInSession];
    feedbackArea.textContent = `Câu ${questionsAnsweredInSession + 1}/${
      currentTestSet.length
    }`;
    feedbackArea.className = "feedback-area-footer";

    if (qData.questionType === "multipleChoice") {
      const correctAns = qData.definition;
      let opts = [correctAns];
      const distractors = allPhrasalVerbs
        .filter((v) => v.id !== qData.id)
        .map((v) => v.definition);
      shuffleArray(distractors);
      for (let i = 0; opts.length < 4 && i < distractors.length; i++) {
        if (!opts.includes(distractors[i])) opts.push(distractors[i]);
      }
      while (opts.length < Math.min(4, allPhrasalVerbs.length)) {
        let rDef =
          allPhrasalVerbs[Math.floor(Math.random() * allPhrasalVerbs.length)]
            .definition;
        if (!opts.includes(rDef)) opts.push(rDef);
      }
      shuffleArray(opts);
      modeSpecificContent.innerHTML = `<div class="question-area animate-pop-in"><p>(Trắc nghiệm) "<strong>${
        qData.term
      }</strong>" nghĩa là gì?</p><ul class="options-list">${opts
        .map(
          (o) =>
            `<li data-answer="${o.replace(/"/g, '"')}" tabindex="0">${o}</li>`
        )
        .join(
          ""
        )}</ul><button id="test-next-q" class="action-button P" style="display:none;margin-top:20px;">Tiếp</button></div>`;
      modeSpecificContent.querySelectorAll(".options-list li").forEach((li) => {
        const handler = () => {
          qData.userAnswer = li.dataset.answer;
          qData.isCorrect =
            normalizeAnswer(li.dataset.answer) === normalizeAnswer(correctAns);
          if (qData.isCorrect) score++;
          modeSpecificContent
            .querySelectorAll(".options-list li")
            .forEach((iLi) => {
              iLi.classList.add("disabled");
              if (iLi === li) iLi.style.borderColor = "var(--accent-color)";
            });
          const nextBtn = document.getElementById("test-next-q");
          nextBtn.style.display = "inline-flex";
          nextBtn.focus();
          nextBtn.onclick = () => {
            questionsAnsweredInSession++;
            updateScoreInFooter();
            displayTestQuestionItem();
          };
        };
        li.addEventListener("click", handler);
        li.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            handler();
            e.preventDefault();
          }
        });
      });
    } else {
      // typeIn
      modeSpecificContent.innerHTML = `<div class="type-question animate-pop-in"><p>(Tự luận) "<strong>${qData.term}</strong>" là gì?</p><input type="text" id="test-type-in" placeholder="Đáp án..."><button id="sub-test-type" class="action-button P" style="margin-top:15px;">Nộp & Tiếp</button></div>`;
      const inputEl = document.getElementById("test-type-in");
      inputEl.focus();
      const subBtn = document.getElementById("sub-test-type");
      const handler = () => {
        qData.userAnswer = inputEl.value.trim();
        const correctOpts = qData.definition
          .toLowerCase()
          .split(" / ")
          .map((s) => s.trim());
        qData.isCorrect = correctOpts.includes(qData.userAnswer.toLowerCase());
        if (qData.isCorrect) score++;
        questionsAnsweredInSession++;
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
  function showTestResults() {
    updateModeTitle('<i class="fas fa-poll"></i> Kết Quả Kiểm Tra');
    let resultsHTML = `<div class="test-results-container animate-pop-in"><h2><i class="fas fa-award"></i> Hoàn Thành Bài Kiểm Tra!</h2><p>Điểm: <strong>${score} / ${
      currentTestSet.length
    }</strong> (${
      Math.round((score / currentTestSet.length) * 100) || 0
    }%)</p><ul class="test-results-summary">`;
    currentTestSet.forEach((item, index) => {
      resultsHTML += `<li><strong>Câu ${index + 1}: ${
        item.term
      }</strong><br>Bạn trả lời: <span class="user-answer ${
        item.isCorrect ? "correct" : "incorrect"
      }">${item.userAnswer || "(Bỏ qua)"}</span>${
        !item.isCorrect
          ? `<br><span class="correct-answer-text">Đáp án đúng: ${item.definition}</span>`
          : ""
      }</li>`;
      // Update general mastery from test (less aggressive than SmartLearn)
      item.lastReviewed = Date.now();
      if (item.isCorrect) item.totalCorrect++;
      else item.totalIncorrect++;
      // Simple test feedback: if correct and not mastered, maybe move to FAMILIAR
      if (item.isCorrect && item.masteryLevel < MASTERY_LEVELS.FAMILIAR)
        item.masteryLevel = MASTERY_LEVELS.FAMILIAR;
      // If incorrect and was MASTERED or LEARNING, demote to FAMILIAR
      else if (!item.isCorrect && item.masteryLevel >= MASTERY_LEVELS.LEARNING)
        item.masteryLevel = MASTERY_LEVELS.FAMILIAR;
    });
    resultsHTML += `</ul><button id="back-to-modes-btn" class="primary-btn" style="margin-top:25px;"><i class="fas fa-home"></i> Quay lại</button></div>`;
    modeSpecificContent.innerHTML = resultsHTML;
    hideFooterControls();
    document
      .getElementById("back-to-modes-btn")
      .addEventListener("click", () => {
        setActiveNavButton(null);
        displayWelcomeMessage();
      });
    saveProgress();
    updateProgressSummary();
  }

  function initAdvancedStatsMode() {
    currentMode = "advancedStats";
    setActiveNavButton(startAdvancedStatsBtn);
    updateModeTitle('<i class="fas fa-chart-line"></i> Thống Kê Nâng Cao');
    if (welcomeMessageContainer) welcomeMessageContainer.style.display = "none"; // Ẩn welcome
    if (modeSpecificContent) modeSpecificContent.style.display = "block"; // Hiện khu vực nội dung chế độ
    hideFooterControls();
    renderAdvancedStats();
  }
  function renderAdvancedStats() {
    /* As previously defined, ensure it uses the new verb object fields */
    if (allPhrasalVerbs.length === 0) {
      modeSpecificContent.innerHTML =
        '<p class="info-message">Không có dữ liệu thống kê.</p>';
      return;
    }
    const totalVerbs = allPhrasalVerbs.length;
    const masteredCount = allPhrasalVerbs.filter(
      (v) => v.masteryLevel === MASTERY_LEVELS.MASTERED
    ).length;
    const learningCount = allPhrasalVerbs.filter(
      (v) =>
        v.masteryLevel === MASTERY_LEVELS.LEARNING ||
        v.masteryLevel === MASTERY_LEVELS.FAMILIAR
    ).length;
    const newCount = allPhrasalVerbs.filter(
      (v) => v.masteryLevel === MASTERY_LEVELS.NEW
    ).length;
    const overallMasteryPercentage =
      totalVerbs > 0 ? ((masteredCount / totalVerbs) * 100).toFixed(1) : 0;

    const verbsByMasteryData = [newCount, learningCount, masteredCount]; // Simpler for this example
    const masteryLabelsForChart = ["Mới", "Đang Học", "Thành Thạo"];
    // More detailed breakdown:
    const verbsByDetailedMastery = {};
    Object.values(MASTERY_LEVELS).forEach((level) => {
      verbsByDetailedMastery[level] = 0;
    });
    allPhrasalVerbs.forEach((v) => {
      verbsByDetailedMastery[v.masteryLevel]++;
    });
    const detailedMasteryDataValues = Object.values(MASTERY_LEVELS)
      .sort((a, b) => a - b)
      .map((level) => verbsByDetailedMastery[level]);
    const detailedMasteryLabels = [
      "Mới",
      "Thân Quen",
      "Đang Học",
      "Thành Thạo",
    ];

    const dueForReviewCount = allPhrasalVerbs.filter(
      (v) =>
        v.srsBox < Object.keys(SRS_INTERVALS).length - 1 &&
        v.masteryLevel !== MASTERY_LEVELS.MASTERED
    ).length; // Approximation for "due"
    const mostCorrect = [...allPhrasalVerbs]
      .sort((a, b) => b.totalCorrect - a.totalCorrect)
      .slice(0, 5);
    const mostIncorrect = [...allPhrasalVerbs]
      .filter((v) => v.totalIncorrect > 0)
      .sort((a, b) => b.totalIncorrect - a.totalIncorrect)
      .slice(0, 5);

    let statsHTML = `<div class="advanced-stats-container animate-pop-in"><h2><i class="fas fa-tachometer-alt"></i> Bảng Điều Khiển</h2><div class="stats-grid">
            <div class="stat-card main-stat"><h3><i class="fas fa-graduation-cap"></i> Thành Thạo</h3><div class="progress-bar-container"><div class="progress-bar" style="width:${overallMasteryPercentage}%;" data-label="${overallMasteryPercentage}%"></div></div><p><strong>${masteredCount}</strong> / ${totalVerbs} từ.</p></div>
            <div class="stat-card"><h3><i class="fas fa-layer-group"></i> Phân Loại</h3><p>Mới: <strong>${newCount}</strong></p><p>Đang học: <strong>${learningCount}</strong></p><p>Thành thạo: <strong>${masteredCount}</strong></p></div>
            <div class="stat-card"><h3><i class="fas fa-bell"></i> Cần Ôn Tập (Ước tính)</h3><p>Số từ: <strong>${dueForReviewCount}</strong></p>${
      dueForReviewCount > 0
        ? `<button id="reviewDueNowBtn" class="action-button S small-btn"><i class="fas fa-book-reader"></i> Ôn ngay</button>`
        : "<p>Tuyệt vời!</p>"
    }</div>
            </div><div class="stats-grid equal-height-cards">
            <div class="stat-card list-card"><h3><i class="fas fa-thumbs-up"></i> Top Hay Đúng</h3>${
              mostCorrect.length > 0
                ? `<ul>${mostCorrect
                    .map(
                      (v) =>
                        `<li>${v.term} <span class="count-badge">${v.totalCorrect}</span></li>`
                    )
                    .join("")}</ul>`
                : "<p>Chưa có.</p>"
            }</div>
            <div class="stat-card list-card"><h3><i class="fas fa-exclamation-triangle"></i> Top Hay Sai</h3>${
              mostIncorrect.length > 0
                ? `<ul>${mostIncorrect
                    .map(
                      (v) =>
                        `<li>${v.term} <span class="count-badge error-badge">${v.totalIncorrect}</span></li>`
                    )
                    .join("")}</ul>`
                : "<p>Tuyệt vời!</p>"
            }</div>
            </div><div class="stat-card chart-card"><h3><i class="fas fa-chart-pie"></i> Phân Bố Thành Thạo</h3><canvas id="masteryChart" width="400" height="250"></canvas></div>
            <button id="backToWelcomeStats" class="action-button P" style="margin-top:30px;"><i class="fas fa-arrow-left"></i> Quay lại</button></div>`;
    modeSpecificContent.innerHTML = statsHTML;
    renderMasteryDoughnutChart(
      "masteryChart",
      detailedMasteryDataValues,
      detailedMasteryLabels
    );
    const reviewBtn = document.getElementById("reviewDueNowBtn");
    if (reviewBtn) reviewBtn.onclick = initSmartLearnMode;
    const backBtn = document.getElementById("backToWelcomeStats");
    if (backBtn)
      backBtn.onclick = () => {
        setActiveNavButton(null); // Xóa active cho nút sidebar (desktop)
        setActiveMobileNavButton(null); // Xóa active cho nút mobile (nếu có)
        displayWelcomeMessage();
      };
  }
  function initAiPracticeMode() {
    currentMode = "aiPractice";
    setActiveNavButton(startAiPracticeModeBtn); // Nút sidebar
    // setActiveMobileNavButton(startAiPracticeModeBtnMobile); // Gọi ở đây nếu nút mobile là riêng biệt và có thể active
    updateModeTitle('<i class="fas fa-robot"></i> AI Luyện Tập');

    if (welcomeMessageContainer) welcomeMessageContainer.style.display = "none";
    if (modeSpecificContent) {
      // CHỌN MỘT TRONG CÁC ANIMATION BÊN DƯỚI HOẶC KẾT HỢP

      // Lựa chọn 1: Sách lật trang
      modeSpecificContent.innerHTML = `
            <div id="ai-loading-screen" class="ai-loading-container">
                <div class="ai-loading-animation">
                    <div class="book-spinner">
                        <div class="page fixed-page left-cover"></div> 
                        
                        <div class="page flipping-page"></div> 
                        
                        <div class="page fixed-page right-cover">
                            
                        </div>
                        
                        <div class="book-spine"></div>
                    </div>
                </div>
                <p class="ai-loading-text">Đang chuẩn bị bài luyện tập thông minh...</p>
                <p class="ai-loading-subtext">AI đang soạn thảo những câu hỏi từ vựng phong phú và các bài đọc thú vị dành riêng cho bạn. Vui lòng chờ trong giây lát!</p>
            </div>
        `;

      // Lựa chọn 2: Các chấm nhấp nháy
      /*
        modeSpecificContent.innerHTML = `
            <div id="ai-loading-screen" class="ai-loading-container">
                <div class="ai-loading-animation">
                    <div class="dots-loader">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
                <p class="ai-loading-text">AI đang tìm kiếm câu hỏi phù hợp...</p>
                <p class="ai-loading-subtext">"Học tập là hạt giống của kiến thức, kiến thức là hạt giống của hạnh phúc." - Ngạn ngữ Gruzia</p>
            </div>
        `;
        */

      modeSpecificContent.style.display = "flex"; // Đảm bảo flex hoạt động để căn giữa
    }
    hideFooterControls();
    aiPracticeIncorrectAnswers = [];

    fetchAiPracticeSet();
  }

  async function fetchAiPracticeSet() {
    try {
      const response = await fetch(AI_PRACTICE_API_URL);
      const loadingScreenAi = document.getElementById("ai-loading-screen"); // Lấy ID mới
      if (loadingScreenAi) {
        loadingScreenAi.style.opacity = "0";
        setTimeout(() => {
          loadingScreenAi.style.display = "none";
        }, 300); // Thời gian khớp với transition
      }

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ details: "Lỗi không xác định từ server AI." }));
        throw new Error(
          errorData.details ||
            `Không thể tải câu hỏi từ AI (status: ${response.status})`
        );
      }
      currentAiPracticeSet = await response.json();

      if (currentAiPracticeSet && currentAiPracticeSet.length > 0) {
        currentAiQuestionIndex = 0;
        aiPracticeUserScore = 0;
        displayAiQuestion();
        scoreArea.style.display = "block"; // Hiện khu vực điểm
        totalQuestionsDisplay.textContent = currentAiPracticeSet.length;
        scoreDisplay.textContent = aiPracticeUserScore;
      } else {
        modeSpecificContent.innerHTML =
          '<p class="info-message">Không nhận được câu hỏi nào từ AI. Vui lòng thử lại.</p>';
      }
    } catch (error) {
      console.error("Lỗi khi tải bộ câu hỏi AI:", error);
      const loadingSpinnerAi = document.getElementById("loading-spinner-ai");
      if (loadingSpinnerAi) loadingSpinnerAi.style.display = "none";
      modeSpecificContent.innerHTML = `<p class="error-message"><i class="fas fa-exclamation-triangle"></i> Lỗi: ${error.message}. Hãy đảm bảo project AI đang chạy.</p>`;
    }
  }

  function displayAiQuestion() {
    if (!modeSpecificContent) {
      console.error("modeSpecificContent DOM element not found!");
      return;
    }
    if (currentAiQuestionIndex >= currentAiPracticeSet.length) {
      showAiPracticeSessionSummary();
      return;
    }

    const questionData = currentAiPracticeSet[currentAiQuestionIndex]; // Đây là mainQuestionData
    let questionRenderHTML = "";

    scoreDisplay.textContent = aiPracticeUserScore;
    feedbackArea.textContent = "";

    if (questionData.type === "passage_multi_cloze_mcq") {
      const passageContent = questionData.content_json;
      if (
        !passageContent ||
        !passageContent.questions ||
        !Array.isArray(passageContent.questions)
      ) {
        console.error(
          "Invalid passage_multi_cloze_mcq structure:",
          questionData
        );
        modeSpecificContent.innerHTML =
          '<p class="error-message">Lỗi dữ liệu câu hỏi bài đọc.</p>';
        const errorNavHTML = `<div id="ai-question-navigation" class="question-navigation-footer">
                <button id="next-ai-main-question-btn" class="action-button secondary-btn"><i class="fas fa-arrow-right"></i> Bỏ qua câu lỗi</button>
            </div>`;
        modeSpecificContent.insertAdjacentHTML("beforeend", errorNavHTML);
        document.getElementById("next-ai-main-question-btn").onclick = () => {
          currentAiQuestionIndex++;
          displayAiQuestion();
        };
        return;
      }

      totalQuestionsDisplay.textContent = passageContent.questions.length;

      questionRenderHTML = `<div class="ai-practice-card passage-mcq-card animate-pop-in" data-main-question-id="${questionData.id}">`;
      if (passageContent.passage_title) {
        questionRenderHTML += `<h3 class="passage-title">${passageContent.passage_title}</h3>`;
      }
      questionRenderHTML += `<div class="passage-text">${passageContent.passage_text_with_blanks.replace(
        /\((\d+)\)_{2,}/g,
        (match, p1) =>
          `(<span class="blank-in-passage" data-blank-ref="${p1}">${p1}</span>)___`
      )}</div>`;

      questionRenderHTML += `<div class="passage-questions-container">`;
      passageContent.questions.forEach((subQuestion) => {
        questionRenderHTML += `
                <div class="sub-question-block" id="sub-q-${questionData.id}-${
          subQuestion.blank_number
        }" data-blank-number="${subQuestion.blank_number}">
                    <p class="sub-question-prompt">
                        <strong>${subQuestion.blank_number}.</strong> ${
          subQuestion.question_prompt ||
          `Chọn đáp án cho chỗ trống (${subQuestion.blank_number}):`
        }
                    </p>
                    <ul class="options-list sub-options-list">
                        ${Object.entries(subQuestion.options)
                          .map(
                            ([key, text]) =>
                              `<li data-option-key="${key}" data-blank-target="${subQuestion.blank_number}" tabindex="0" role="button">
                                <span class="option-key">${key}.</span> ${text}
                             </li>`
                          )
                          .join("")}
                    </ul>
                    <div class="feedback-message sub-feedback" style="display: none;"></div>
                </div>
            `;
      });
      questionRenderHTML += `</div></div>`;

      modeSpecificContent.innerHTML = questionRenderHTML;
      addEventListenersToAiPassageOptions(questionData); // Truyền questionData (là mainQuestionData)
    } else if (questionData.type === "single_mcq_pv") {
      const mcqContent = questionData.content_json;
      if (!mcqContent || !Array.isArray(mcqContent.options)) {
        console.error("Invalid single_mcq_pv structure:", questionData);
        modeSpecificContent.innerHTML =
          '<p class="error-message">Lỗi dữ liệu câu hỏi trắc nghiệm.</p>';
        const errorNavHTML = `<div id="ai-question-navigation" class="question-navigation-footer">
                <button id="next-ai-main-question-btn" class="action-button secondary-btn"><i class="fas fa-arrow-right"></i> Bỏ qua câu lỗi</button>
            </div>`;
        modeSpecificContent.insertAdjacentHTML("beforeend", errorNavHTML);
        document.getElementById("next-ai-main-question-btn").onclick = () => {
          currentAiQuestionIndex++;
          displayAiQuestion();
        };
        return;
      }

      totalQuestionsDisplay.textContent = 1;
      // aiPracticeUserScore đã được reset ở initAiPracticeMode hoặc giữ nguyên để tính tổng

      questionRenderHTML = `<div class="ai-practice-card single-mcq-card animate-pop-in" id="ai-q-${questionData.id}" data-question-id="${questionData.id}">`;
      questionRenderHTML += `<h3 class="question-prompt">${highlightAiBlank(
        mcqContent.sentence_with_blank,
        "___"
      )}</h3>`;

      questionRenderHTML += '<ul class="options-list">';
      const options = shuffleArray([...mcqContent.options]);
      options.forEach((option) => {
        questionRenderHTML += `<li data-value="${String(option).replace(
          /"/g,
          '"'
        )}" tabindex="0" role="button">${option}</li>`;
      });
      questionRenderHTML += "</ul>";
      questionRenderHTML += `<div class="feedback-message ai-feedback" style="display: none;"></div>`;
      questionRenderHTML += `</div>`;

      modeSpecificContent.innerHTML = questionRenderHTML;
      addEventListenersToSingleMcqOptions(questionData);
    } else {
      modeSpecificContent.innerHTML = `<p class="error-message">Lỗi: Loại câu hỏi không được hỗ trợ ("${
        questionData.type || "unknown"
      }").</p>`;
    }

    // Thanh Điều Hướng Chung
    let navHTML = `
        <div id="ai-question-navigation" class="question-navigation-footer">
            <span class="progress-text">Câu hỏi chính ${
              currentAiQuestionIndex + 1
            } / ${currentAiPracticeSet.length}</span>
            <button id="next-ai-main-question-btn" class="action-button ${
              questionData.type === "passage_multi_cloze_mcq"
                ? "primary-btn"
                : "secondary-btn"
            }" 
                    style="${
                      questionData.type === "single_mcq_pv" ||
                      (questionData.type === "passage_multi_cloze_mcq" &&
                        !allSubQuestionsAttemptedInPassage(questionData))
                        ? "display: none;"
                        : "inline-flex;"
                    }"> 
                    ${
                      currentAiQuestionIndex >= currentAiPracticeSet.length - 1
                        ? '<i class="fas fa-flag-checkered"></i> Xem Tổng Kết'
                        : questionData.type === "passage_multi_cloze_mcq"
                        ? '<i class="fas fa-check-double"></i> Hoàn Thành Bài Đọc'
                        : '<i class="fas fa-arrow-right"></i> Câu Tiếp Theo'
                    }
            </button>
        </div>`;

    const existingNav = modeSpecificContent.querySelector(
      "#ai-question-navigation"
    );
    if (existingNav) existingNav.remove();
    modeSpecificContent.insertAdjacentHTML("beforeend", navHTML);

    const nextMainButton = document.getElementById("next-ai-main-question-btn");
    if (nextMainButton) {
      nextMainButton.addEventListener("click", () => {
        currentAiQuestionIndex++;
        displayAiQuestion();
      });
    }
  }

  function allSubQuestionsAttemptedInPassage(mainPassageData) {
    if (
      !mainPassageData ||
      mainPassageData.type !== "passage_multi_cloze_mcq" ||
      !mainPassageData.content_json ||
      !mainPassageData.content_json.questions
    ) {
      return false;
    }
    const passageCard = modeSpecificContent.querySelector(
      `.passage-mcq-card[data-main-question-id="${mainPassageData.id}"]`
    );
    if (!passageCard) return false;

    let answeredCount = 0;
    mainPassageData.content_json.questions.forEach((subQ) => {
      const subQBlock = passageCard.querySelector(
        `.sub-question-block[data-blank-number="${subQ.blank_number}"]`
      );
      if (subQBlock && subQBlock.querySelector(".options-list li.answered")) {
        answeredCount++;
      }
    });
    return answeredCount === mainPassageData.content_json.questions.length;
  }

  function addEventListenersToAiPassageOptions(mainQuestionData) {
    // mainQuestionData là object passage_multi_cloze_mcq được truyền vào
    if (
      !mainQuestionData ||
      mainQuestionData.type !== "passage_multi_cloze_mcq" ||
      !mainQuestionData.content_json ||
      !mainQuestionData.content_json.questions
    ) {
      console.error(
        "Invalid data for addEventListenersToAiPassageOptions:",
        mainQuestionData
      );
      return;
    }

    const passageCard = modeSpecificContent.querySelector(
      `.passage-mcq-card[data-main-question-id="${mainQuestionData.id}"]`
    );
    if (!passageCard) {
      console.error(
        "Passage card not found for listeners:",
        mainQuestionData.id
      );
      return;
    }

    const subQuestionBlocks = passageCard.querySelectorAll(
      ".sub-question-block"
    );
    subQuestionBlocks.forEach((block) => {
      const blankNum = parseInt(block.dataset.blankNumber);
      const subQuestionData = mainQuestionData.content_json.questions.find(
        (q) => q.blank_number === blankNum
      );

      if (!subQuestionData) {
        console.warn(`Sub-question data not found for blank: ${blankNum}`);
        return;
      }

      const optionElements = block.querySelectorAll(".sub-options-list li");
      optionElements.forEach((li) => {
        const clickHandler = (event) => {
          const selectedOptionEl = event.target.closest("li");
          const alreadyAnsweredThisSubQuestion = Array.from(
            optionElements
          ).some((opt) => opt.classList.contains("answered"));

          if (!selectedOptionEl || alreadyAnsweredThisSubQuestion) {
            return;
          }

          optionElements.forEach((opt) =>
            opt.classList.add("answered", "disabled")
          );
          selectedOptionEl.classList.remove("disabled");

          const selectedKey = selectedOptionEl.dataset.optionKey;
          const isCorrect = selectedKey === subQuestionData.correct_option_key;
          const feedbackEl = block.querySelector(".sub-feedback");

          if (isCorrect) {
            aiPracticeUserScore++;
            scoreDisplay.textContent = aiPracticeUserScore;
            selectedOptionEl.classList.add("correct");
            feedbackEl.textContent = "Chính xác!";
            feedbackEl.className = "feedback-message sub-feedback correct";
          } else {
            selectedOptionEl.classList.add("incorrect");
            const correctAnswerText =
              subQuestionData.options[subQuestionData.correct_option_key];
            feedbackEl.textContent = `Không đúng. Đáp án: ${subQuestionData.correct_option_key}. ${correctAnswerText}`;
            if (subQuestionData.explanation) {
              feedbackEl.innerHTML += `<br><small><em>Giải thích: ${subQuestionData.explanation}</em></small>`;
            }
            feedbackEl.className = "feedback-message sub-feedback incorrect";

            const correctOptionLi = block.querySelector(
              `li[data-option-key="${subQuestionData.correct_option_key}"]`
            );
            if (correctOptionLi) correctOptionLi.classList.add("correct-hint");

            aiPracticeIncorrectAnswers.push({
              question_id: mainQuestionData.id + "-blank" + blankNum,
              question_prompt: `Chỗ trống (${blankNum}) trong bài: ${
                subQuestionData.question_prompt || ""
              }`,
              user_answer: `${selectedKey}. ${selectedOptionEl.textContent
                .replace(new RegExp(`^${selectedKey}\\.\\s*`), "")
                .trim()}`,
              correct_answer: `${subQuestionData.correct_option_key}. ${correctAnswerText}`,
              explanation: subQuestionData.explanation,
              passage_context:
                mainQuestionData.content_json.passage_text_with_blanks,
              blank_marker_in_passage: `(${blankNum})___`,
            });
          }
          feedbackEl.style.display = "block";

          // Kiểm tra xem tất cả các câu hỏi con đã được trả lời chưa để hiện nút "Hoàn Thành Bài Đọc"
          if (allSubQuestionsAttemptedInPassage(mainQuestionData)) {
            const finishPassageBtn = document.getElementById(
              "next-ai-main-question-btn"
            );
            if (finishPassageBtn) {
              finishPassageBtn.style.display = "inline-flex";
              finishPassageBtn.innerHTML =
                currentAiQuestionIndex >= currentAiPracticeSet.length - 1
                  ? '<i class="fas fa-flag-checkered"></i> Xem Tổng Kết'
                  : '<i class="fas fa-check-double"></i> Hoàn Thành Bài Đọc';
              finishPassageBtn.focus();
            }
          }
        };
        li.addEventListener("click", clickHandler);
        li.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            clickHandler(e);
          }
        });
      });
    });
  }

  function addEventListenersToSingleMcqOptions(questionData) {
    const mcqCard = modeSpecificContent.querySelector(
      `.single-mcq-card[data-question-id="${questionData.id}"]`
    );
    if (!mcqCard) return;

    const options = mcqCard.querySelectorAll(".options-list li");
    options.forEach((option) => {
      const clickHandler = (event) => {
        const selectedOptionElement = event.target.closest("li");
        if (
          !selectedOptionElement ||
          selectedOptionElement.classList.contains("disabled")
        )
          return;

        options.forEach((opt) => opt.classList.add("disabled")); // Disable all options

        const selectedAnswer = selectedOptionElement.dataset.value;
        const correctAnswer = questionData.content_json.correct_answer;
        const isCorrect =
          normalizeAnswer(selectedAnswer) === normalizeAnswer(correctAnswer);

        const feedbackDiv = mcqCard.querySelector(".ai-feedback");
        const nextButton = document.getElementById("next-ai-main-question-btn"); // Nút chung

        if (isCorrect) {
          aiPracticeUserScore++;
          scoreDisplay.textContent = aiPracticeUserScore;
          selectedOptionElement.classList.add("correct");
          feedbackDiv.textContent = "Chính xác!";
          feedbackDiv.className = "feedback-message ai-feedback correct";
        } else {
          selectedOptionElement.classList.add("incorrect");
          feedbackDiv.textContent = `Không đúng. Đáp án là: ${correctAnswer}`;
          if (questionData.content_json.explanation) {
            feedbackDiv.innerHTML += `<br><small><em>Giải thích: ${questionData.content_json.explanation}</em></small>`;
          }
          feedbackDiv.className = "feedback-message ai-feedback incorrect";
          options.forEach((opt) => {
            if (
              normalizeAnswer(opt.dataset.value) ===
              normalizeAnswer(correctAnswer)
            ) {
              opt.classList.add("correct-hint");
            }
          });
          aiPracticeIncorrectAnswers.push({
            question_id: questionData.id,
            question_prompt: questionData.content_json.sentence_with_blank,
            user_answer: selectedAnswer,
            correct_answer: correctAnswer,
            explanation: questionData.content_json.explanation,
          });
        }
        feedbackDiv.style.display = "block";
        if (nextButton) nextButton.style.display = "inline-flex"; // Hiện nút Next/Finish
      };

      option.addEventListener("click", clickHandler);
      option.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          clickHandler(e);
        }
      });
    });
  }

  function highlightAiBlank(text, blankMarker) {
    if (!text) return "";
    if (!blankMarker) {
      // If no specific marker, try to find (N)___ patterns for passages
      return text.replace(
        /\((\d+)\)_{2,}/g,
        (match, p1) => `<span class="blank-marker highlight">(${p1})</span>`
      );
    }
    if (blankMarker === "___") {
      // For single_mcq_pv
      return text.replace(
        /___/g,
        `<span class="blank-marker highlight">___</span>`
      );
    }
    // For specific markers like "[A]" from passage data
    const escapedMarker = blankMarker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escapedMarker, "g");
    return text.replace(
      regex,
      `<span class="blank-marker highlight">${blankMarker}</span>`
    );
  }

  function addEventListenersToAiOptions() {
    const options = modeSpecificContent.querySelectorAll(".options-list li");
    options.forEach((option) => {
      option.addEventListener("click", handleAiOptionClick);
      option.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleAiOptionClick(e);
        }
      });
    });

    const submitFillBtn = modeSpecificContent.querySelector(
      ".submit-ai-fill-btn"
    );
    if (submitFillBtn) {
      submitFillBtn.addEventListener("click", handleAiSubmitFillIn);
      const fillInput = modeSpecificContent.querySelector(".ai-fill-in");
      if (fillInput) {
        fillInput.addEventListener("keydown", (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleAiSubmitFillIn();
          }
        });
      }
    }

    const nextButton = document.getElementById("next-ai-question-btn");
    if (nextButton) {
      nextButton.addEventListener("click", () => {
        currentAiQuestionIndex++;
        displayAiQuestion();
      });
    }
  }

  function handleAiOptionClick(event) {
    const selectedOptionElement = event.target.closest("li");
    if (
      !selectedOptionElement ||
      selectedOptionElement.classList.contains("disabled")
    )
      return;

    const question = currentAiPracticeSet[currentAiQuestionIndex];
    const selectedAnswer = selectedOptionElement.dataset.value;
    const correctAnswer = question.content_json.correct_answer;
    const isCorrect =
      normalizeAnswer(selectedAnswer) === normalizeAnswer(correctAnswer);

    revealAiAnswer(isCorrect, correctAnswer, selectedOptionElement);
  }

  function handleAiSubmitFillIn() {
    const inputElement = modeSpecificContent.querySelector(".ai-fill-in");
    const submitBtn = modeSpecificContent.querySelector(".submit-ai-fill-btn");
    if (!inputElement || inputElement.disabled) return;

    const question = currentAiPracticeSet[currentAiQuestionIndex];
    const userAnswer = inputElement.value.trim();
    const correctAnswer = question.content_json.correct_answer;
    const correctOptions = correctAnswer
      .toLowerCase()
      .split(" / ")
      .map((s) => s.trim());
    const isCorrect = correctOptions.includes(userAnswer.toLowerCase());

    inputElement.disabled = true;
    if (submitBtn) submitBtn.style.display = "none";
    revealAiAnswer(isCorrect, correctAnswer, null, userAnswer);
  }

  function revealAiAnswer(
    isCorrect,
    correctAnswer,
    selectedOptionElement = null,
    userAnswerIfFillIn = null
  ) {
    const questionCard = modeSpecificContent.querySelector(".ai-practice-card");
    if (!questionCard) return;
    const feedbackDiv = questionCard.querySelector(".ai-feedback");
    const nextButton = document.getElementById("next-ai-question-btn");
    const question = currentAiPracticeSet[currentAiQuestionIndex];

    if (isCorrect) {
      aiPracticeUserScore++;
      feedbackDiv.textContent = "Chính xác!";
      feedbackDiv.className = "feedback-message ai-feedback correct";
      if (selectedOptionElement) selectedOptionElement.classList.add("correct");
    } else {
      feedbackDiv.textContent = `Không đúng. Đáp án là: ${correctAnswer}`;
      feedbackDiv.className = "feedback-message ai-feedback incorrect";
      if (selectedOptionElement) {
        selectedOptionElement.classList.add("incorrect");
        const options = questionCard.querySelectorAll(".options-list li");
        options.forEach((opt) => {
          if (
            normalizeAnswer(opt.dataset.value) ===
            normalizeAnswer(correctAnswer)
          ) {
            opt.classList.add("correct");
          }
        });
      }
      aiPracticeIncorrectAnswers.push({
        question_prompt:
          question.content_json.question_prompt ||
          question.content_json.sentence_with_blank ||
          question.phrasal_verb_focus,
        user_answer: selectedOptionElement
          ? selectedOptionElement.dataset.value
          : userAnswerIfFillIn,
        correct_answer: correctAnswer,
        passage: question.content_json.passage, // Để hiển thị lại ngữ cảnh
        blank_marker: question.content_json.blank_marker,
      });
    }
    feedbackDiv.style.display = "block";
    if (nextButton) {
      nextButton.style.display = "inline-flex";
      nextButton.focus();
    }
    if (
      currentAiQuestionIndex >= currentAiPracticeSet.length - 1 &&
      nextButton
    ) {
      nextButton.innerHTML =
        '<i class="fas fa-flag-checkered"></i> Xem Kết Quả';
    }

    scoreDisplay.textContent = aiPracticeUserScore; // Cập nhật điểm ở footer

    // Disable options for MCQs
    if (
      question.type === "single_mcq_pv" ||
      question.type === "reading_cloze_mcq"
    ) {
      const options = questionCard.querySelectorAll(".options-list li");
      options.forEach((opt) => opt.classList.add("disabled"));
    }

    // Lưu ý: Việc cập nhật mastery cho từng từ trong allPhrasalVerbs dựa trên kết quả AI
    // là một bước phức tạp hơn, vì các câu hỏi AI có thể không trực tiếp map 1-1 với
    // danh sách từ gốc của VerbMaster. Chúng ta có thể tìm từ gốc dựa trên phrasal_verb_focus
    // hoặc bỏ qua việc cập nhật mastery chi tiết từ mode này, chỉ tập trung vào luyện tập.
    // Ví dụ đơn giản:
    const targetVerb = allPhrasalVerbs.find(
      (v) =>
        v.term.toLowerCase() === question.phrasal_verb_focus?.toLowerCase() ||
        v.definition
          .toLowerCase()
          .includes(question.phrasal_verb_focus?.toLowerCase())
    );
    if (targetVerb) {
      targetVerb.lastReviewed = Date.now();
      if (isCorrect)
        targetVerb.totalCorrect = (targetVerb.totalCorrect || 0) + 1;
      else targetVerb.totalIncorrect = (targetVerb.totalIncorrect || 0) + 1;
      // Không thay đổi srsBox/masteryLevel từ mode này để tránh xung đột với SmartLearn
      saveProgress(); // Lưu thay đổi totalCorrect/Incorrect
    }
  }

  function showAiPracticeSessionSummary() {
    updateModeTitle('<i class="fas fa-poll"></i> Kết Quả Luyện Tập AI');
    // Tính tổng số câu hỏi tương tác thực tế
    let totalInteractions = 0;
    currentAiPracticeSet.forEach((mainQ) => {
      if (
        mainQ.type === "passage_multi_cloze_mcq" &&
        mainQ.content_json.questions
      ) {
        totalInteractions += mainQ.content_json.questions.length;
      } else if (mainQ.type === "single_mcq_pv") {
        totalInteractions += 1;
      }
    });
    if (totalInteractions === 0 && currentAiPracticeSet.length > 0) {
      // Fallback if calculation above fails due to unexpected structure
      totalInteractions = currentAiPracticeSet.length;
      console.warn("Total interactions fallback to main set length.");
    }
    let summaryHTML = `
        <div class="session-summary ai-summary animate-pop-in">
            <h2><i class="fas fa-award"></i> Hoàn Thành Lượt Luyện Tập!</h2>
            <p class="summary-score">Điểm của bạn: <strong>${aiPracticeUserScore} / ${totalInteractions}</strong></p>
    `;
    if (aiPracticeIncorrectAnswers.length > 0) {
      summaryHTML += `<h3><i class="fas fa-book-open"></i> Xem Lại Câu Sai:</h3><ul class="review-incorrect-list">`;
      aiPracticeIncorrectAnswers.forEach((item) => {
        summaryHTML += `
                <li>
                    ${
                      item.passage
                        ? `<div class="passage-text-review">${highlightAiBlank(
                            item.passage,
                            item.blank_marker
                          )}</div>`
                        : ""
                    }
                    <p class="question-prompt-review"><strong>Câu hỏi:</strong> ${
                      item.question_prompt
                    }</p>
                    <p><strong>Bạn trả lời:</strong> <span class="user-answer-review">${
                      item.user_answer || "(Chưa trả lời)"
                    }</span></p>
                    <p><strong>Đáp án đúng:</strong> <span class="correct-answer-review">${
                      item.correct_answer
                    }</span></p>
                </li>`;
      });
      summaryHTML += `</ul>`;
    } else {
      summaryHTML += `<p class="all-correct-message"><i class="fas fa-party-popper"></i> Xuất sắc! Bạn đã trả lời đúng tất cả các câu!</p>`;
    }
    summaryHTML += `
            <div class="summary-actions">
                <button id="restart-ai-practice-btn" class="action-button primary-btn"><i class="fas fa-redo"></i> Luyện Tập Lượt Mới</button>
                <button id="back-to-modes-from-ai-btn" class="action-button secondary-btn"><i class="fas fa-th-large"></i> Chọn Chế Độ Khác</button>
            </div>
        </div>
    `;
    modeSpecificContent.innerHTML = summaryHTML;
    hideFooterControls(); // Ẩn navigation và score/feedback ở footer

    document
      .getElementById("restart-ai-practice-btn")
      .addEventListener("click", initAiPracticeMode);
    document
      .getElementById("back-to-modes-from-ai-btn")
      .addEventListener("click", () => {
        setActiveNavButton(null);
        setActiveMobileNavButton(null);
        displayWelcomeMessage();
      });
    updateProgressSummary(); // Cập nhật tổng quan nếu có
  }
  const welcomeStartBtn = document.getElementById("startWelcomeSmartLearnBtn");
  if (welcomeStartBtn) {
    welcomeStartBtn.addEventListener("click", () => {
      if (window.innerWidth <= 768 && startSmartLearnModeBtnMobile) {
        // Kiểm tra kích thước màn hình
        startSmartLearnModeBtnMobile.click(); // Kích hoạt nút mobile
      } else if (startSmartLearnModeBtn) {
        // Fallback cho desktop hoặc nếu nút mobile không có
        startSmartLearnModeBtn.click(); // Kích hoạt nút sidebar
      }
    });
  }
});
