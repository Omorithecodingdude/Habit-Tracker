const app = {
    habits: [],
    settings: {},
    stats: {},
    history: {},
}

const UI = {
    app: document.getElementById("app"),
    loadingScreen: document.getElementById("loadingScreen"),
    sidebarNav: document.getElementById("sidebarNav"),
    pageTitle: document.getElementById("pageTitle"),
    pageDescription: document.getElementById("pageDescription"),
    dashboard: document.getElementById("dashboard"),
}

const Navigation = [
    {
        id: "dashboard",
        icon: "layout-dashboard",
        label: "Dashboard"
    },

    {
        id: "habits",
        icon: "check-square",
        label: "Habits"
    },

    {
        id: "calendar",
        icon: "calendar-days",
        label: "Calendar"
    },

    {
        id: "statistics",
        icon: "chart-column",
        label: "Statistics"
    },

    {
        id: "achievements",
        icon: "trophy",
        label: "Achievements"
    },

    {
        id: "settings",
        icon: "settings",
        label: "Settings"
    }
]

function renderSidebar() {
    UI.sidebarNav.innerHTML = "";

    Navigation.forEach(menu => {
        UI.sidebarNav.innerHTML += `
        <button class="flex w-full items-center gap-3 rounded-xl px-4 py-3 transition hover:bg-slate-800"><i data-lucide="${menu.icon}"></i><span>${menu.label}</span></button>
        `;
    });
    lucide.createIcons();
}

function hideLoading() {
    UI.loadingScreen.classList.add("hidden");
    UI.app.classList.remove("hidden");
}

function init() {
    renderSidebar();
    hideLoading();
}

init();

