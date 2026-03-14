/**
 * Utility functions for PocketDay
 */

/**
 * Calculate the number of days remaining until the target end date.
 * @param {string|Date} endDate 
 * @returns {number}
 */
export const getDaysRemaining = (endDate) => {
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    
    const diff = end - today;
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

/**
 * Format currency to Indian Rupee (INR)
 * @param {number} amount 
 * @returns {string}
 */
export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
};
