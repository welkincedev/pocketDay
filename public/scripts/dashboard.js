import { formatCurrency } from '../utils/date-utils.js';

export const updateDashboard = (el, amount, statusClass) => {
    el.textContent = formatCurrency(Math.max(0, amount));
    el.className = `text-6xl font-mono font-bold ${statusClass}`;
};

export const updateSurvivalStatus = (elDays, days) => {
    elDays.textContent = days;
};
