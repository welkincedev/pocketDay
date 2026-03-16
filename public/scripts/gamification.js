/**
 * PocketDay Gamification Module
 * Handles streaks, badges, and achievements based on spending patterns.
 */

export const getStreak = (expenses) => {
    if (!expenses || expenses.length === 0) return 0;

    // Get unique dates with expenses
    const spentDates = new Set(expenses.map(e => e.date));
    
    // Starting from yesterday, check how many consecutive days had 0 expenses
    let streak = 0;
    let checkDate = new Date();
    
    // We don't count today for the "No Spend" streak until the day is over, 
    // but the user wants to see their current streak.
    // Let's count consecutive days including yesterday and back.
    
    while (true) {
        checkDate.setDate(checkDate.getDate() - 1);
        const dateStr = checkDate.toISOString().split('T')[0];
        
        if (!spentDates.has(dateStr)) {
            streak++;
            // Safety break for very old streaks or data limits
            if (streak > 365) break; 
        } else {
            break;
        }
    }
    
    return streak;
};

export const evaluateBadges = (expenses) => {
    const badges = [];
    const counts = {};
    
    expenses.forEach(e => {
        counts[e.category] = (counts[e.category] || 0) + 1;
    });

    // Tea Lover: > 5 Tea/Chai logs
    if ((counts['Tea'] || 0) + (counts['Chai'] || 0) > 5) {
        badges.push({ id: 'tea-lover', name: 'Tea Lover', icon: '☕', color: 'text-pd-yellow' });
    }

    // Snack Monster: > 5 Snacks
    if ((counts['Snack'] || 0) + (counts['Snacks'] || 0) > 5) {
        badges.push({ id: 'snack-monster', name: 'Snack Monster', icon: '🍪', color: 'text-pd-red' });
    }
    
    // Budget Master: At least 7 days of expenses with total < 50% of budget (abstract check)
    // For now, let's stick to simple pattern-based ones
    if (expenses.length > 20) {
        badges.push({ id: 'budget-veteran', name: 'Budget Veteran', icon: '🛡️', color: 'text-pd-green' });
    }

    return badges;
};

export const checkAchievements = (stats, achievements) => {
    const existingIds = new Set(achievements.map(a => a.id));
    const newAchievements = [];

    // Survival Master: Survive with > ₹500 balance at end of month (approximated)
    if (stats.balance > 500 && stats.daysRemaining < 2 && !existingIds.has('survival-master')) {
        newAchievements.push({ id: 'survival-master', name: 'Survival Master', icon: '🏆', description: 'Survived with over ₹500!' });
    }

    return newAchievements;
};

export const showAchievementPopup = (achievement) => {
    const popup = document.createElement('div');
    popup.className = 'fixed top-10 left-1/2 -translate-x-1/2 z-[200] bg-pd-black border border-pd-green/50 p-6 rounded-[24px] shadow-[0_20px_50px_rgba(0,255,65,0.3)] animate-in slide-in-from-top duration-500 w-[90%] max-w-[320px] text-center';
    popup.innerHTML = `
        <div class="text-4xl mb-4">${achievement.icon}</div>
        <h3 class="text-pd-green font-black uppercase tracking-widest text-sm mb-1">New Achievement!</h3>
        <p class="text-white font-bold text-lg mb-2">${achievement.name}</p>
        <p class="text-white/40 text-xs">${achievement.description || ''}</p>
    `;
    
    document.body.appendChild(popup);
    
    setTimeout(() => {
        popup.classList.add('animate-out', 'fade-out', 'zoom-out-95');
        setTimeout(() => popup.remove(), 500);
    }, 4000);
};
