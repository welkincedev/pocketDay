export const getBrutalInsight = (expenses) => {
    const teaCount = expenses.filter(e => e.note === 'Chai').length;
    if (teaCount > 5) {
        return `You drank ${teaCount} cups of chai lately. That's ₹${teaCount * 10} gone!`;
    }
    const snackSpend = expenses.filter(e => e.category === 'Food' && e.note !== 'Chai').reduce((sum, e) => sum + e.amount, 0);
    if (snackSpend > 200) {
        return `Snacks cost you ₹${snackSpend}. Is it worth it?`;
    }
    return "You're actually doing okay for now. Keep it up.";
};

export const generateReport = (expenses, streak) => {
    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
    return `PocketDay Report\n\nTotal Spent: ₹${totalSpent}\nStreak: ${streak} days\nInsight: ${getBrutalInsight(expenses)}`;
};
