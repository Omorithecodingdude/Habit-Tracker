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

    // Floating Action Button
    fabAddHabit: document.getElementById("fabAddHabit"),

    // Habit Modal
    habitModal: document.getElementById("habitModal"),
    closeHabitModal: document.getElementById("closeHabitModal"),
    cancelHabitBtn: document.getElementById("cancelHabitBtn"),
    habitForm: document.getElementById("habitForm"),
    todayHabits: document.getElementById("todayHabits"),
    habitList: document.getElementById("habitList"),
    emptyHabitState: document.getElementById("emptyHabitState"),
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

function openHabitModal() {
    UI.habitModal.classList.remove("hidden");
    UI.habitModal.classList.add("text");
}

function closeHabitModal() {
    UI.habitModal.classList.remove("flex");
    UI.habitModal.classList.add("hidden");
}

function resetHabitForm() {
    UI.habitForm.reset();
}

function setupEventListeners() {
    UI.fabAddHabit.addEventListener("click", openHabitModal);
    UI.closeHabitModal.addEventListener("click", closeHabitModal);
    UI.cancelHabitBtn.addEventListener("click", closeHabitModal);

    UI.habitModal.addEventListener("click", (event) => {
        if (event.target === UI.habitModal) {
            closeHabitModal();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeHabitModal();
        }
    });

    UI.habitForm.addEventListener("submit", saveHabit);

}

function createHabit() {
    const habit = {
        id: crypto.randomUUID(),
        name: document.getElementById("habitName").value.trim(),
        category: document.getElementById("habitCategory").value,
        priority: document.getElementById("habitPriority").value,
        goal: Number(document.getElementById("habitGoal").value),
        notes: document.getElementById("habitNotes").value.trim(),
        progress: 0,
        completed: false,
        streak: 0,
        createdAt: Date.now()
    };
    return habit;
}

function validateHabit(habit) {
    if (habit.name === "") {
        alert("Habit name is required.");
        return false;
    }

    if (habit.goal <= 0) {
        alert("Goal must be greater than zero.");
        return false;
    }
    return true;
}

function saveHabit(event) {
    event.preventDefault();
    const habit = createHabit();
    if (!validateHabit(habit)) {
        return;
    }
    app.habits.push(habit);
    console.log(app.habits);
    resetHabitForm();
    closeHabitModal();
}

function renderHabits() {
    UI.habitList.innerHTML = "";

    if (app.habit.length === 0) {
        UI.habitList.classList.add("hidden");
        UI.emptyHabitState.classList.remove("hidden");

        return;
    }

    UI.habitList.classList.remove("hidden");
    UI.emptyHabitState.classList.add("hidden");

    app.habits.forEach(habit => {
        
    })
}

function init() {
    renderSidebar();
    setupEventListeners();
    hideLoading();
}

init();

