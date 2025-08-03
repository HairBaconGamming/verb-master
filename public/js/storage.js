import { state, setAllPhrasalVerbs, updateSettings } from './state.js';
import { MASTERY_LEVELS } from './constants.js';
import { showToast, updateProgressSummary } from './ui.js';

function createSmartLearnVerbObject(verb) {
    return {
        term: verb.term,
        definition: verb.definition,
        id: verb.term.toLowerCase() + "||" + verb.definition.toLowerCase(),
        example: verb.example || "",
        masteryLevel: MASTERY_LEVELS.NEW,
        srsBox: 0,
        lastReviewed: null,
        nextReviewDate: Date.now(),
        lastCorrect: null,
        correctStreak: 0,
        incorrectStreak: 0,
        totalCorrect: 0,
        totalIncorrect: 0,
        totalSeen: 0,
    };
}

export async function initializeVerbsData() {
    try {
        if (typeof phrasalVerbsList === "undefined" || phrasalVerbsList.length === 0) {
            console.error("Phrasal verbs list (phrasalVerbsList) not found or empty.");
            return false;
        }
        const storedVerbs = localStorage.getItem("phrasalVerbProgress_v3_smart");
        if (storedVerbs) {
            let loadedVerbs = JSON.parse(storedVerbs);
            const baseVerbsMap = new Map(phrasalVerbsList.map(v => [v.term.toLowerCase() + "||" + v.definition.toLowerCase(), v]));
            const currentVerbsMap = new Map(loadedVerbs.map(v => [v.term.toLowerCase() + "||" + v.definition.toLowerCase(), v]));
            let changed = false;

            baseVerbsMap.forEach((baseVerb, key) => {
                if (!currentVerbsMap.has(key)) {
                    loadedVerbs.push(createSmartLearnVerbObject(baseVerb));
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
                }
            });
            loadedVerbs = loadedVerbs.filter(verb => baseVerbsMap.has(verb.term.toLowerCase() + "||" + verb.definition.toLowerCase()));
            setAllPhrasalVerbs(loadedVerbs);
            if (changed) saveProgress();
        } else {
            const newVerbs = phrasalVerbsList.map(verb => createSmartLearnVerbObject(verb));
            setAllPhrasalVerbs(newVerbs);
            saveProgress();
        }
        return true;
    } catch (error) {
        console.error("Failed to initialize or load phrasal verbs for SmartLearn:", error);
        return false;
    }
}

export function loadAppSettings() {
    const storedSettings = localStorage.getItem("verbMasterSettings");
    if (storedSettings) {
        const loadedSettings = JSON.parse(storedSettings);
        if (loadedSettings.shuffleVerbs === undefined) {
            loadedSettings.shuffleVerbs = true;
        }
        updateSettings(loadedSettings);
    }
}

export function saveAppSettings() {
    localStorage.setItem("verbMasterSettings", JSON.stringify(state.settings));
}

export function saveProgress() {
    try {
        localStorage.setItem("phrasalVerbProgress_v3_smart", JSON.stringify(state.allPhrasalVerbs));
        showToast("Tiến độ đã được lưu!", "success");
        updateProgressSummary();
    } catch (e) {
        console.error("Error saving progress:", e);
        showToast("Lỗi lưu tiến độ. Bộ nhớ có thể đã đầy.", "error");
    }
}

export function resetProgress() {
    const newVerbs = phrasalVerbsList.map(verb => createSmartLearnVerbObject(verb));
    setAllPhrasalVerbs(newVerbs);
    saveProgress();
    showToast("Tiến độ đã được reset.", "info");
    updateProgressSummary();
}