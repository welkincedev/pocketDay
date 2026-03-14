import { formatCurrency } from '../utils/date-utils.js';

export const renderExpenseList = (container, expenses) => {
    if (expenses.length === 0) {
        container.innerHTML = '<div class="text-center py-8 opacity-40 italic text-sm">No expenses logged yet.</div>';
        return;
    }

    container.innerHTML = expenses
        .slice(0, 10)
        .map(exp => `
            <div class="bg-white/5 p-4 rounded-xl border border-white/5 flex justify-between items-center">
                <div>
                    <span class="block font-semibold">${exp.note}</span>
                    <span class="text-xs opacity-50 uppercase">${exp.category}</span>
                </div>
                <span class="font-mono font-bold text-pd-red">-${formatCurrency(exp.amount)}</span>
            </div>
        `).join('');
};
