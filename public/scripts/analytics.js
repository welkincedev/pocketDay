import { observeAuth } from './auth.js';
import { listenToExpenses } from './firestore.js';

let weeklyChart = null;
let categoryChart = null;

const COLORS = {
    green: '#00FF41',
    red: '#FF4136',
    yellow: '#FFFB3D',
    blue: '#3DA5FF',
    purple: '#A53DFF',
    pink: '#FF3D9C',
    white: '#FFFFFF',
    other: '#444444'
};

const CATEGORY_COLORS = {
    'Tea': COLORS.yellow,
    'Snack': COLORS.blue,
    'Bus': COLORS.purple,
    'Food': COLORS.green,
    'Grocery': COLORS.pink,
    'Study': COLORS.white,
    'Party': COLORS.red,
    'Other': COLORS.other
};

const initAnalytics = () => {
    console.log("Analytics Initializing...");
    observeAuth(async (user) => {
        if (user === null) {
            // Only redirect if we are sure no user is logged in
            console.log("No user confirmed, redirecting...");
            window.location.href = 'index.html';
            return;
        }
        if (!user) return; // Still loading

        // Populate User Profile
        const nameEl = document.getElementById('user-name');
        const avatarEl = document.getElementById('user-avatar');
        if (nameEl) nameEl.textContent = user.displayName;
        if (avatarEl) avatarEl.src = user.photoURL;

        try {
            console.log("Setting up real-time listener for:", user.uid);
            listenToExpenses(user.uid, (expenses) => {
                console.log("Analytics real-time update:", expenses.length);
                renderDashboard(expenses);
            });
        } catch (e) {
            console.error("Analytics listener failed:", e);
        }
    });

    // Dropdown Logic
    const avatarBtn = document.getElementById('btn-avatar');
    const dropdown = document.getElementById('profile-dropdown');

    const toggleDropdown = (show) => {
        if (!dropdown) return;
        if (show) {
            dropdown.classList.remove('scale-95', 'opacity-0', 'pointer-events-none');
            dropdown.classList.add('scale-100', 'opacity-100');
        } else {
            dropdown.classList.remove('scale-100', 'opacity-100');
            dropdown.classList.add('scale-95', 'opacity-0', 'pointer-events-none');
        }
    };

    if (avatarBtn) {
        avatarBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = dropdown.classList.contains('opacity-100');
            toggleDropdown(!isOpen);
        });
    }

    document.addEventListener('click', (e) => {
        if (dropdown && !dropdown.contains(e.target) && !avatarBtn.contains(e.target)) {
            toggleDropdown(false);
        }
    });

    // Logout Action
    const logoutBtn = document.getElementById('btn-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm("Logout?")) {
                import('./auth.js').then(auth => auth.logout());
            }
        });
    }
};

const renderDashboard = (expenses) => {
    updateMonthlyTotal(expenses);
    renderWeeklyChart(expenses);
    renderCategoryChart(expenses);
    updateInsights(expenses);
};

const updateMonthlyTotal = (expenses) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlyTotal = expenses
        .filter(e => {
            const d = new Date(e.date);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        })
        .reduce((sum, e) => sum + e.amount, 0);

    document.getElementById('monthly-total').textContent = `₹${Math.round(monthlyTotal)}`;
};

const renderWeeklyChart = (expenses) => {
    const ctx = document.getElementById('weeklyChart').getContext('2d');
    
    // Last 7 days labels
    const labels = [];
    const data = [];
    
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        
        labels.push(d.toLocaleDateString([], { weekday: 'short' }));
        const dayTotal = expenses
            .filter(e => e.date === dateStr)
            .reduce((sum, e) => sum + e.amount, 0);
        data.push(dayTotal);
    }

    if (weeklyChart) weeklyChart.destroy();

    weeklyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Spending',
                data: data,
                borderColor: COLORS.green,
                backgroundColor: 'rgba(0, 255, 65, 0.1)',
                fill: true,
                tension: 0.4,
                borderWidth: 3,
                pointRadius: 4,
                pointBackgroundColor: COLORS.green
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { display: false },
                x: {
                    grid: { display: false },
                    ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 10, weight: 'bold' } }
                }
            }
        }
    });
};

const renderCategoryChart = (expenses) => {
    const ctx = document.getElementById('categoryChart').getContext('2d');
    
    const categoryTotals = {};
    expenses.forEach(e => {
        categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    });

    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);
    const bgColors = labels.map(label => CATEGORY_COLORS[label] || COLORS.other);

    if (categoryChart) categoryChart.destroy();

    if (labels.length === 0) {
        console.warn("No category data found for chart");
        return;
    }

    categoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: bgColors,
                borderWidth: 0,
                cutout: '70%'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            }
        }
    });
};

const updateInsights = (expenses) => {
    const insightEl = document.getElementById('spending-insight');
    if (expenses.length === 0) {
        insightEl.textContent = "Start logging your expenses to see spending patterns!";
        return;
    }

    // Simple insight: Identify top category
    const categoryTotals = {};
    expenses.forEach(e => {
        categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    });

    const topCategory = Object.keys(categoryTotals).reduce((a, b) => categoryTotals[a] > categoryTotals[b] ? a : b);
    
    insightEl.textContent = `Most of your money is going towards "${topCategory}". Consider if you can optimize this to extend your survival days!`;
};

window.addEventListener('DOMContentLoaded', initAnalytics);
