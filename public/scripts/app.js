import {
    loginWithGoogle,
    logout,
    observeAuth
} from './auth.js';
import {
    addExpenseToFirestore,
    fetchExpensesFromFirestore,
    deleteExpenseFromFirestore,
    saveUserToCloud,
    fetchUserFromCloud,
    saveAchievements,
    loadAchievements
} from './firestore.js';
import {
    getStreak,
    evaluateBadges,
    checkAchievements,
    showAchievementPopup
} from './gamification.js';

// --- STATE MANAGEMENT ---
let state = {
    user: null, // Firebase User object
    balance: 0,
    expenses: [],
    targetDate: '',
    warningDismissed: false,
    selectedCategory: 'Tea',
    achievements: [],
    streak: 0,
    selectedEmoji: '☕'
};

const CATEGORIES = [
    { name: 'Tea', emoji: '☕' },
    { name: 'Snack', emoji: '🍪' },
    { name: 'Bus', emoji: '🚌' },
    { name: 'Food', emoji: '🍔' },
    { name: 'Grocery', emoji: '🛒' },
    { name: 'Study', emoji: '📚' },
    { name: 'Party', emoji: '🎉' },
    { name: 'Other', emoji: '💸' }
];

// --- UTILS ---
const getTodayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const formatCurrency = (amt) => new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0
}).format(amt);

const getDaysRemaining = () => {
    if (!state.targetDate) return 1;
    const target = new Date(state.targetDate + 'T23:59:59'); // End of that day
    const now = new Date();
    const diff = target - now;
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

// --- CORE FUNCTIONS ---
const saveMetaData = () => {
    localStorage.setItem('pocketday_balance', state.balance);
    localStorage.setItem('pocketday_target_date', state.targetDate);
};

const saveExpenses = () => {
    localStorage.setItem('pocketday_expenses', JSON.stringify(state.expenses));
};

// stats helper logic refactored into calculateStats

const calculateStats = () => {
    const today = getTodayStr();
    const todayExpenses = state.expenses.filter(e => e.date === today);
    const todaySpent = todayExpenses.reduce((sum, e) => sum + e.amount, 0);
    const daysLeft = getDaysRemaining();
    
    // Stabilized Daily Quota: Original share for today
    // (Current Balance + what we spent today) / days left
    const dailyQuota = daysLeft > 0 ? (state.balance + todaySpent) / daysLeft : state.balance + todaySpent;
    
    // Safe Spend Today: What's actually left of today's quota
    const safeSpendToday = dailyQuota - todaySpent;

    // Analytics: Transactions count, Biggest expense
    const transactionCount = todayExpenses.length;
    const biggestExpense = todayExpenses.length > 0 ? Math.max(...todayExpenses.map(e => e.amount)) : 0;

    // Survival Days: How long you'd last at your AVERAGE spending rate
    const uniqueDays = [...new Set(state.expenses.map(e => e.date))];
    const totalSpentAllTime = state.expenses.reduce((sum, e) => sum + e.amount, 0);
    const avgDaily = uniqueDays.length > 0 ? totalSpentAllTime / uniqueDays.length : (dailyQuota || 1);
    const survivalDays = avgDaily > 0 ? state.balance / avgDaily : 0;

    return { todaySpent, dailyBudget: dailyQuota, safeSpendToday, daysLeft, survivalDays, transactionCount, biggestExpense };
};

const updateDashboard = () => {
    const { todaySpent, dailyBudget, safeSpendToday, survivalDays, transactionCount, biggestExpense } = calculateStats();

    // Update Text & Dynamic Quota
    const safeSpendEl = document.getElementById('safe-spend');
    const labelEl = document.getElementById('safe-spend-label');
    const dailyBudgetEl = document.getElementById('daily-budget');
    
    if (dailyBudgetEl) dailyBudgetEl.textContent = formatCurrency(dailyBudget);

    // Color Coding Logic
    if (safeSpendToday < 0) {
        safeSpendEl.textContent = `₹${Math.abs(Math.round(safeSpendToday))}`;
        safeSpendEl.className = 'text-6xl font-mono font-bold text-pd-red';
        if (labelEl) {
            labelEl.textContent = `⚠ Overspent by ${formatCurrency(Math.abs(safeSpendToday))} today`;
            labelEl.className = 'text-[10px] font-black text-pd-red tracking-[0.2em] uppercase text-center transition-all mb-1';
        }
    } else {
        safeSpendEl.textContent = formatCurrency(safeSpendToday);
        if (labelEl) {
            labelEl.textContent = "Safe Spend Today";
            labelEl.className = 'text-[10px] font-black opacity-40 tracking-[0.3em] uppercase text-center transition-all mb-1';
        }

        if (safeSpendToday < 0.3 * dailyBudget) {
            safeSpendEl.className = 'text-6xl font-mono font-bold text-pd-yellow';
        } else {
            safeSpendEl.className = 'text-6xl font-mono font-bold text-pd-green';
        }
    }

    // Dynamic Stats
    const daysRemainingEl = document.getElementById('days-remaining');
    const totalBalanceEl = document.getElementById('total-balance');
    const todaySpentEl = document.getElementById('today-spent');

    if (daysRemainingEl) daysRemainingEl.textContent = Math.round(survivalDays);
    if (totalBalanceEl) totalBalanceEl.textContent = formatCurrency(state.balance);
    if (todaySpentEl) todaySpentEl.textContent = formatCurrency(todaySpent);

    // Activity Analytics Summary
    const statCountEl = document.getElementById('stat-count');
    const statSpentEl = document.getElementById('stat-spent');
    const statBiggestEl = document.getElementById('stat-biggest');

    if (statCountEl) statCountEl.textContent = transactionCount;
    if (statSpentEl) statSpentEl.textContent = formatCurrency(todaySpent);
    if (statBiggestEl) statBiggestEl.textContent = formatCurrency(biggestExpense);

    // Progress Bar
    const progressEl = document.getElementById('daily-progress-bar');
    const percentEl = document.getElementById('daily-progress-percent');
    const ratio = dailyBudget > 0 ? (todaySpent / dailyBudget) * 100 : 0;
    
    if (progressEl) {
        progressEl.style.width = `${Math.min(100, ratio)}%`;
        
        // Color Logic: Green < 70%, Yellow 70-100%, Red > 100%
        if (ratio >= 100) {
            progressEl.className = 'bg-pd-red h-full transition-all duration-500 shadow-[0_0_10px_rgba(255,65,54,0.5)]';
        } else if (ratio >= 70) {
            progressEl.className = 'bg-pd-yellow h-full transition-all duration-500 shadow-[0_0_10px_rgba(255,251,61,0.5)]';
        } else {
            progressEl.className = 'bg-pd-green h-full transition-all duration-500 shadow-[0_0_10px_rgba(0,255,65,0.5)]';
        }
    }

    if (percentEl) {
        percentEl.textContent = `${Math.round(ratio)}%`;
    }

    // Status Footer Warning Logic
    const warningEl = document.getElementById('footer-warning');

    if (safeSpendToday < 0 || dailyBudget < 50) {
        if (!state.warningDismissed && warningEl) {
            warningEl.classList.remove('hidden');
            
            // Update Title with overspent amount
            const overspentAmt = Math.abs(Math.round(safeSpendToday));
            const titleEl = warningEl.querySelector('p.font-black');
            if (titleEl) {
                titleEl.textContent = safeSpendToday < 0 ? `Overspent by ${formatCurrency(overspentAmt)}` : `Low Daily Quota`;
            }
        } else if (warningEl) {
            warningEl.classList.add('hidden');
        }
    } else {
        if (warningEl) warningEl.classList.add('hidden');
    }

    // --- WEEKLY HEATMAP ---
    renderWeeklyHeatmap(dailyBudget);

    // --- GAMIFICATION UPDATES ---
    const streak = getStreak(state.expenses);
    const streakEl = document.getElementById('streak-container');
    const streakCountEl = document.getElementById('streak-count');
    
    if (streak > 0) {
        streakEl.classList.remove('hidden');
        streakCountEl.textContent = `🔥 ${streak} Day No Spend Streak`;
    } else {
        streakEl.classList.add('hidden');
    }

    const badges = evaluateBadges(state.expenses);
    const badgesContainer = document.getElementById('badges-container');
    
    if (badges.length > 0) {
        badgesContainer.classList.remove('hidden');
        badgesContainer.innerHTML = badges.map(b => `
            <div class="flex-shrink-0 bg-white/5 border border-white/10 px-4 py-3 rounded-2xl flex items-center gap-2 animate-in zoom-in duration-300">
                <span class="text-xl">${b.icon}</span>
                <span class="text-[10px] font-black uppercase tracking-widest ${b.color}">${b.name}</span>
            </div>
        `).join('');
    } else {
        badgesContainer.classList.add('hidden');
    }

    // Check Achievements (Survive with > 500 etc)
    const newAchievements = checkAchievements({ balance: state.balance, daysRemaining: getDaysRemaining() }, state.achievements);
    if (newAchievements.length > 0) {
        newAchievements.forEach(ach => {
            state.achievements.push(ach);
            showAchievementPopup(ach);
            if (state.user) saveAchievements(state.user.uid, state.achievements);
        });
    }
};

const renderExpenses = () => {
    const listEl = document.getElementById('expense-list');
    if (!listEl) return;

    if (state.expenses.length === 0) {
        listEl.innerHTML = `
            <div class="text-center py-12 opacity-20 italic text-sm border border-dashed border-white/10 rounded-2xl">
                No expenses logged yet.
            </div>
        `;
        return;
    }

    // Sort expenses by ID (timestamp) descending
    const sortedExpenses = [...state.expenses].sort((a, b) => b.id - a.id);
    
    // Group by date
    const groups = {};
    sortedExpenses.forEach(exp => {
        if (!groups[exp.date]) groups[exp.date] = [];
        groups[exp.date].push(exp);
    });

    const todayDate = getTodayStr();

    listEl.innerHTML = Object.entries(groups).map(([date, items]) => {
        const isToday = date === todayDate;
        const dateObj = new Date(date + 'T00:00:00'); // Ensure local time
        const dateLabel = isToday ? 'Today' : dateObj.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
        
        return `
            <div class="mb-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <h4 class="text-[9px] font-black opacity-30 uppercase tracking-[0.2em] mb-3 px-1">${dateLabel}</h4>
                <div class="flex flex-col gap-2">
                    ${items.map(exp => `
                        <div class="bg-white/5 p-4 rounded-2xl border border-white/5 flex justify-between items-center group active:scale-[0.98] transition-all">
                            <div class="flex items-center gap-3">
                                <span class="text-xl shrink-0">${getEmoji(exp.category)}</span>
                                <div class="overflow-hidden">
                                    <span class="block font-bold text-sm text-white truncate w-full max-w-[180px]">${exp.title || exp.category}</span>
                                    <span class="text-[9px] opacity-40 uppercase font-black tracking-tighter">${new Date(exp.id).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                            </div>
                            <div class="flex items-center gap-4">
                                <span class="font-mono font-bold text-pd-red">-${formatCurrency(exp.amount)}</span>
                                <button onclick="deleteExpense(${exp.id}, '${exp.firestoreId || ''}')" class="opacity-20 hover:opacity-100 p-2 -mr-2 text-pd-red transition-all">✕</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }).join('');
};

const getEmoji = (cat) => {
    const found = CATEGORIES.find(c => c.name === cat);
    return found ? found.emoji : '💸';
};

const renderWeeklyHeatmap = (dailyBudget) => {
    const heatmapEl = document.getElementById('weekly-heatmap');
    if (!heatmapEl) return;

    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        last7Days.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
    }

    const dailyTotals = {};
    state.expenses.forEach(e => {
        if (last7Days.includes(e.date)) {
            dailyTotals[e.date] = (dailyTotals[e.date] || 0) + e.amount;
        }
    });

    heatmapEl.innerHTML = last7Days.map(date => {
        const total = dailyTotals[date] || 0;
        const ratio = dailyBudget > 0 ? (total / dailyBudget) : 0;
        const dayLabel = new Date(date + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short' });
        
        let bgColor = 'bg-white/5'; // Gray - No spending
        let barHeight = 'h-2'; 
        
        if (total > 0) {
            if (ratio > 1) {
                bgColor = 'bg-pd-red shadow-[0_0_10px_rgba(255,65,54,0.3)]';
            } else if (ratio >= 0.5) {
                bgColor = 'bg-pd-yellow shadow-[0_0_10px_rgba(255,251,61,0.3)]';
            } else {
                bgColor = 'bg-pd-green shadow-[0_0_10px_rgba(0,255,65,0.3)]';
            }
            barHeight = `h-[${Math.max(20, Math.min(100, Math.round(ratio * 60)))}%]`;
        }

        // Using inline style for dynamic height since Tailwind h-[x%] is tricky with JIT if not predefined
        const styleHeight = total > 0 ? `height: ${Math.max(20, Math.min(100, Math.round((total / (dailyBudget * 1.5)) * 100)))}%` : 'height: 8px';

        return `
            <div class="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                <div class="w-full ${bgColor} rounded-md transition-all duration-700" style="${styleHeight}"></div>
                <span class="text-[7px] font-black opacity-30 uppercase tracking-tighter">${dayLabel}</span>
            </div>
        `;
    }).join('');
};

// --- MODAL LOGIC ---
const openExpenseModal = (initialAmt = '', initialCat = 'Tea') => {
    const modal = document.getElementById('expense-modal');
    const amtInput = document.getElementById('modal-amount');
    
    state.selectedCategory = initialCat;
    state.selectedEmoji = getEmoji(initialCat);
    
    renderEmojiGrid();
    amtInput.value = initialAmt;
    modal.classList.remove('hidden');
    amtInput.focus();
};

const closeExpenseModal = () => {
    document.getElementById('expense-modal').classList.add('hidden');
};

const renderEmojiGrid = () => {
    const grid = document.getElementById('emoji-grid');
    grid.innerHTML = CATEGORIES.map(cat => `
        <button class="emoji-btn p-3 rounded-2xl border transition-all flex flex-col items-center gap-1 ${state.selectedCategory === cat.name ? 'bg-pd-green border-pd-green text-pd-black scale-95' : 'bg-white/5 border-white/5 opacity-60 hover:opacity-100 hover:bg-white/10'}" 
                onclick="selectCategory('${cat.name}', '${cat.emoji}')">
            <span class="text-xl">${cat.emoji}</span>
            <span class="text-[8px] font-bold uppercase">${cat.name}</span>
        </button>
    `).join('');
};

window.selectCategory = (name, emoji) => {
    state.selectedCategory = name;
    state.selectedEmoji = emoji;
    renderEmojiGrid();
};

// --- ACTIONS ---
window.addExpense = async (amount, category, title = '') => {
    if (!amount || isNaN(amount) || amount <= 0) return;
    
    const expense = {
        category: category,
        title: title,
        amount: parseFloat(amount),
        date: getTodayStr(),
        id: Date.now()
    };

    // UI Optimistic Update
    state.expenses.unshift(expense);
    state.balance -= expense.amount;
    state.warningDismissed = false; // Reset dismissal on new expense
    updateDashboard();
    renderExpenses();

    if (state.user) {
        try {
            const docRef = await addExpenseToFirestore(state.user.uid, expense);
            expense.firestoreId = docRef.id;
            await saveUserToCloud(state.user.uid, { balance: state.balance, targetDate: state.targetDate });
        } catch (e) {
            console.error("Cloud sync failed:", e);
            // In a real app, we'd queue this for retry or notify user
        }
    }

    saveExpenses();
    saveMetaData();
};

window.deleteExpense = async (id, firestoreId) => {
    const idx = state.expenses.findIndex(e => e.id === id);
    if (idx === -1) return;

    const removedAmt = state.expenses[idx].amount;
    state.expenses.splice(idx, 1);
    state.balance += removedAmt;

    // UI update
    state.warningDismissed = false; // Reset on delete too
    updateDashboard();
    renderExpenses();

    if (state.user) {
        try {
            if (firestoreId) await deleteExpenseFromFirestore(firestoreId);
            await saveUserToCloud(state.user.uid, { balance: state.balance, targetDate: state.targetDate });
        } catch (e) {
            console.error("Cloud delete failed:", e);
        }
    }

    saveExpenses();
    saveMetaData();
};

const initApp = () => {
    // Auth Observer
    observeAuth(async (user) => {
        state.user = user;
        const profileEl = document.getElementById('user-profile');
        const appEl = document.getElementById('app');
        const landingEl = document.getElementById('landing-page');
        const navEl = document.getElementById('main-nav');

        if (user) {
            landingEl?.classList.add('hidden');
            appEl?.classList.remove('hidden');
            profileEl?.classList.remove('hidden');
            navEl?.classList.remove('hidden');
            
            const nameEl = document.getElementById('user-name');
            const avatarEl = document.getElementById('user-avatar');
            if (nameEl) nameEl.textContent = user.displayName;
            if (avatarEl) avatarEl.src = user.photoURL;

            try {
                // Sync from Cloud - Priority
                const cloudUser = await fetchUserFromCloud(user.uid);
                if (cloudUser) {
                    state.balance = cloudUser.balance ?? state.balance;
                    state.targetDate = cloudUser.targetDate ?? state.targetDate;
                }

                // Load achievements from cloud if available
                state.achievements = await loadAchievements(state.user.uid);
                
                const cloudExpenses = await fetchExpensesFromFirestore(user.uid);
                
                // Merge Logic: If we have local expenses that aren't in the cloud yet, keep them.
                // But for a simple '1.0' experience, cloud is usually source of truth once logged in.
                if (cloudExpenses.length > 0) {
                    state.expenses = cloudExpenses;
                    saveExpenses(); // Sync local storage with latest cloud
                }
                
                // AUTOMATIC SETUP: If logged in but no balance/date set in cloud or local
                if (!state.balance && !state.targetDate) {
                    setupFirstLaunch();
                }
            } catch (e) {
                console.error("Initial cloud sync failed, using local fallback", e);
            }
            updateDashboard();
            renderExpenses();
        } else {
            state.user = null;
            landingEl?.classList.remove('hidden');
            appEl?.classList.add('hidden');
            profileEl?.classList.add('hidden');
            navEl?.classList.add('hidden');
            
            // SECURITY: Clear sensitive UI text immediately on logout
            const safeSpendEl = document.getElementById('safe-spend');
            const balanceEl = document.getElementById('total-balance');
            const spentEl = document.getElementById('today-spent');
            const nameEl = document.getElementById('user-name');
            const avatarEl = document.getElementById('user-avatar');

            if (safeSpendEl) safeSpendEl.textContent = '₹0';
            if (balanceEl) balanceEl.textContent = '₹0';
            if (spentEl) spentEl.textContent = '₹0';
            if (nameEl) nameEl.textContent = 'User';
            if (avatarEl) avatarEl.src = '';
            
            // Revert/Load local storage (or clear if preferred)
            // For now, we revert to local data, but we must ensure it's not the logged-in user's data.
            // PocketDay design follows "private by default". 
            // If User A logs out, User A's data should not be in localStorage if it was synced.
            // But state.expenses was just overwritten by user data.
            // Let's reset the state entirely to prevent leakage if user didn't have local data.
            state.balance = parseFloat(localStorage.getItem('pocketday_balance')) || 0;
            state.expenses = JSON.parse(localStorage.getItem('pocketday_expenses')) || [];
            state.targetDate = localStorage.getItem('pocketday_target_date') || '';
        }
        updateDashboard();
        renderExpenses();
    });

    // Login Action (Landing Page)
    document.getElementById('btn-login-main').addEventListener('click', async () => {
        try {
            await loginWithGoogle();
        } catch (e) {
            alert("Login failed");
        }
    });

    // Logout Action
    document.getElementById('btn-logout').addEventListener('click', () => {
        if (confirm("Logout? Data will sync next time you login.")) {
            logout();
        }
    });

    // Edit Actions
    document.getElementById('btn-edit-balance').addEventListener('click', () => {
        const bal = prompt("Update Total Balance (₹):", state.balance);
        if (bal !== null && !isNaN(bal)) {
            state.balance = parseFloat(bal);
            saveMetaData();
            if (state.user) saveUserToCloud(state.user.uid, { balance: state.balance, targetDate: state.targetDate });
            updateDashboard();
        }
    });

    document.getElementById('btn-edit-date').addEventListener('click', () => {
        const date = prompt("Update Month End Date (YYYY-MM-DD):", state.targetDate || "2026-03-31");
        if (date) {
            state.targetDate = date;
            saveMetaData();
            if (state.user) saveUserToCloud(state.user.uid, { balance: state.balance, targetDate: state.targetDate });
            updateDashboard();
        }
    });

    // Set up Quick Action (Custom)
    const customBtn = document.getElementById('btn-custom');
    if (customBtn) {
        customBtn.addEventListener('click', () => {
            openExpenseModal();
        });
    }

    // FAB Custom Add
    const fab = document.getElementById('fab-add-expense');
    if (fab) {
        fab.addEventListener('click', (e) => {
            e.preventDefault();
            openExpenseModal();
        });
    }

    // Modal Events
    document.getElementById('btn-close-modal').addEventListener('click', closeExpenseModal);
    document.getElementById('modal-backdrop').addEventListener('click', closeExpenseModal);
    
    document.getElementById('btn-submit-expense').addEventListener('click', () => {
        const amt = document.getElementById('modal-amount').value;
        const title = document.getElementById('modal-title').value;
        if (amt > 0) {
            window.addExpense(amt, state.selectedCategory, title);
            closeExpenseModal();
            document.getElementById('modal-amount').value = '';
            document.getElementById('modal-title').value = '';
        }
    });

    // Warning Close
    const closeWarningBtn = document.getElementById('btn-close-warning');
    if (closeWarningBtn) {
        closeWarningBtn.addEventListener('click', () => {
            state.warningDismissed = true;
            updateDashboard();
        });
    }
};

const setupFirstLaunch = () => {
    const bal = prompt("Welcome to PocketDay! Enter your starting balance (₹):");
    const date = prompt("Enter your month end date (YYYY-MM-DD):", "2026-03-31");
    if (bal && date) {
        state.balance = parseFloat(bal);
        state.targetDate = date;
        saveMetaData();
        updateDashboard();
    }
};

// Start the App
window.addEventListener('DOMContentLoaded', initApp);