export const MASTERY_LEVELS = {
    NEW: 0,
    FAMILIAR: 1,
    LEARNING: 2,
    MASTERED: 3,
};

export const SRS_INTERVALS = {
    [MASTERY_LEVELS.NEW]: 1,
    [MASTERY_LEVELS.FAMILIAR]: 2,
    [MASTERY_LEVELS.LEARNING]: 5,
    [MASTERY_LEVELS.MASTERED]: 15,
};

export const SMART_LEARN_ROUND_SIZE_ADVANCED = 7;
export const MIN_CORRECT_IN_ROW_FOR_ROUND_MASTERY = 2;
export const MAX_EXPOSURES_PER_VERB_IN_ROUND = 6;
export const FAMILIAR_THRESHOLD_SRS_BOX = 1;
export const LEARNING_THRESHOLD_SRS_BOX = 3;

export const AI_PRACTICE_API_URL = "https://verbmaster-database.glitch.me/api/practice-set";