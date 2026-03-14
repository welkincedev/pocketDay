export const calculateSafeSpend = (balance, daysRemaining) => {
    return daysRemaining > 0 ? balance / daysRemaining : 0;
};

export const calculateSurvivalDays = (balance, avgSpend) => {
    return avgSpend > 0 ? balance / avgSpend : 0;
};

export const calculateNoSpendStreak = (expenses) => {
    let streak = 0;
    let checkDate = new Date();
    checkDate.setHours(0, 0, 0, 0);

    while (true) {
        const dateStr = checkDate.toISOString().split('T')[0];
        const hasSpend = expenses.some(e => new Date(e.timestamp).toISOString().split('T')[0] === dateStr);
        
        if (!hasSpend) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
        } else {
            break;
        }
    }
    return streak;
};
