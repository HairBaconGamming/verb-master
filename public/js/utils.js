export function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

export function normalizeAnswer(answer) {
    if (typeof answer !== 'string') return '';
    return answer.toLowerCase().split("/")[0].trim();
}

export function normalizeAndCompareAnswers(userAnswer, correctAnswersString, ignorePunctuation = true) {
    if (typeof userAnswer !== "string" || typeof correctAnswersString !== "string") {
        return false;
    }

    let normalizedUserAnswer = userAnswer.trim().toLowerCase();

    if (ignorePunctuation) {
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