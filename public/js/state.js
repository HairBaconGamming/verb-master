export const state = {
    allPhrasalVerbs: [],
    currentLearningSet: [],
    smartLearnSessionQueue: [],
    smartLearnCurrentIndexInQueue: 0,
    smartLearnRoundProgress: {},
    currentTestSet: [],
    currentIndex: 0,
    currentMode: "",
    score: 0,
    questionsAnsweredInSession: 0,
    settings: {
        shuffleVerbs: true,
    },
    currentAiPracticeSet: [],
    currentAiQuestionIndex: 0,
    aiPracticeUserScore: 0,
    aiPracticeIncorrectAnswers: [],
};

// Functions to modify state
export function setAllPhrasalVerbs(verbs) {
    state.allPhrasalVerbs = verbs;
}

export function setCurrentLearningSet(set) {
    state.currentLearningSet = set;
}

export function setSmartLearnSessionQueue(queue) {
    state.smartLearnSessionQueue = queue;
}

export function resetSmartLearnRound() {
    state.smartLearnSessionQueue = [];
    state.smartLearnCurrentIndexInQueue = 0;
    state.smartLearnRoundProgress = {};
}

export function setCurrentTestSet(set) {
    state.currentTestSet = set;
}

export function setCurrentIndex(index) {
    state.currentIndex = index;
}

export function setCurrentMode(mode) {
    state.currentMode = mode;
}

export function resetScore() {
    state.score = 0;
    state.questionsAnsweredInSession = 0;
}

export function incrementScore() {
    state.score++;
}

export function incrementAnswered() {
    state.questionsAnsweredInSession++;
}

export function updateSettings(newSettings) {
    state.settings = { ...state.settings, ...newSettings };
}

export function resetAiPracticeState() {
    state.currentAiPracticeSet = [];
    state.currentAiQuestionIndex = 0;
    state.aiPracticeUserScore = 0;
    state.aiPracticeIncorrectAnswers = [];
}