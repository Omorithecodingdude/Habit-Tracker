const app = {

    currentPage: "dashboard",

    habits: [],

    stats: {

        xp: 0,
        level: 1,
        streak: 0

    },

    settings: {

        theme: "dark"

    },

    history: []

};

const UI = {
    // Root
    app: document.getElementById("app"),
    loadingScreen: document.getElementById("loadingScreen"),

    // Navigation
    sidebarNav: document.getElementById("sidebarNav"),
    pageTitle: document.getElementById("pageTitle"),
    pageDescription: document.getElementById("pageDescription"),

    // Dashboard
    dashboard: document.getElementById("dashboard"),
    todayHabits: document.getElementById("todayHabits"),
    habitList: document.getElementById("habitList"),
    emptyHabitState: document.getElementById("emptyHabitState"),

    // Floating Action Button
    fabAddHabit: document.getElementById("fabAddHabit"),

    // Modal
    habitModal: document.getElementById("habitModal"),
    closeHabitModal: document.getElementById("closeHabitModal"),
    cancelHabitBtn: document.getElementById("cancelHabitBtn"),
    habitForm: document.getElementById("habitForm"),

    // Inputs
    habitName: document.getElementById("habitName"),
    habitCategory: document.getElementById("habitCategory"),
    habitPriority: document.getElementById("habitPriority"),
    habitGoal: document.getElementById("habitGoal"),
    habitNotes: document.getElementById("habitNotes"),
};

const navigation = [
    {
        id: "dashboard",
        icon: "layout-dashboard",
        label: "Dashboard",
    },

    {
        id: "habits",
        icon: "check-square",
        label: "Habits",
    },

    {
        id: "calendar",
        icon: "calendar-days",
        label: "Calendar",
    },

    {
        id: "statistics",
        icon: "chart-column",
        label: "Statistics",
    },

    {
        id: "achievements",
        icon: "trophy",
        label: "Achievements",
    },

    {
        id: "settings",
        icon: "settings",
        label: "Settings",
    },
];

function $(id) {
    return document.getElementById(id);
}

function show(element) {
    element.classList.remove("hidden");
}

function hide(element) {
    element.classList.add("hidden");
}

function toggle(element) {
    element.classList.toggle("hidden");
}

function clear(element) {
    element.replaceChildren();
}

function createElement(tag, className = "") {
    const element = document.createElement(tag);

    if (className) {
        element.className = className;
    }

    return element;
}

function createIcon(iconName) {
    const icon = document.createElement("i");

    icon.setAttribute("data-lucide", iconName);

    return icon;
}

function formatDate(date = new Date()) {
    return new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
    }).format(date);
}

function generateId() {
    return crypto.randomUUID();
}

function isEmpty(value) {
    return value.trim() === "";
}

function createNavigationButton(menu) {

    const button = createElement(
        "button",
        "flex w-full items-center gap-3 rounded-xl px-4 py-3 transition hover:bg-slate-800"
    );

    button.dataset.page = menu.id;

    const icon = createIcon(menu.icon);

    const label = createElement("span");
    label.textContent = menu.label;

   if (menu.id === app.currentPage) {
    button.classList.add("bg-slate-800");
}

    button.append(icon, label);

return button;

}

function renderSidebar() {

    clear(UI.sidebarNav);

    navigation.forEach(menu => {

        const button = createNavigationButton(menu);

        UI.sidebarNav.append(button);

    });

    lucide.createIcons();

}

function openModal(modal) {

    show(modal);

    modal.classList.add("flex");

}

function closeModal(modal) {

    modal.classList.remove("flex");

    hide(modal);

}

function resetHabitForm() {

    UI.habitForm.reset();

}

function openHabitModal() {

    resetHabitForm();

    openModal(UI.habitModal);

}

function closeHabitModal() {

    closeModal(UI.habitModal);

}

function setupModalEvents() {

    UI.fabAddHabit.addEventListener("click", openHabitModal);

    UI.closeHabitModal.addEventListener("click", closeHabitModal);

    UI.cancelHabitBtn.addEventListener("click", closeHabitModal);

    UI.habitModal.addEventListener("click", (event) => {

        if (event.target === UI.habitModal) {

            closeHabitModal();

        }

    });

    document.addEventListener("keydown", (event) => {

        if (
            event.key === "Escape" &&
            !UI.habitModal.classList.contains("hidden")
        ) {

            closeHabitModal();

        }

    });

}

function createHabit() {

    return {

        id: generateId(),

        name: UI.habitName.value.trim(),

        category: UI.habitCategory.value,

        priority: UI.habitPriority.value,

        goal: Number(UI.habitGoal.value),

        notes: UI.habitNotes.value.trim(),

        progress: 0,

        completed: false,

        streak: 0,

        createdAt: new Date().toISOString(),

        completedAt: null

    };

}

function validateHabit(habit) {

    if (isEmpty(habit.name)) {

        alert("Habit name is required.");

        return false;

    }

    if (habit.goal <= 0) {

        alert("Goal must be greater than zero.");

        return false;

    }

    return true;

}

function addHabit(habit) {

    app.habits.push(habit);

    renderHabits();

    updateDashboard();

}

function findHabit(id) {

    return app.habits.find(habit => habit.id === id);

}

function removeHabit(id) {

    app.habits = app.habits.filter(

        habit => habit.id !== id

    );

    renderHabits();

    updateDashboard();

}

function createHabitCard(habit) {

    const card = createElement(
        "article",
        "rounded-2xl border border-slate-700 bg-slate-900 p-5"
    );

    const title = createElement(
        "h3",
        "text-lg font-semibold"
    );

    title.textContent = habit.name;

    const category = createElement(
        "p",
        "mt-2 text-sm text-slate-400"
    );

    category.textContent =
        `${habit.category} • ${habit.priority}`;

    const progress = createElement(
        "p",
        "mt-4 text-sm"
    );

    progress.textContent =
        `Progress ${habit.progress}/${habit.goal}`;

    const actions = createElement(
        "div",
        "mt-5 flex gap-3"
    );

    const completeBtn = createElement(
        "button",
        "rounded-lg bg-green-600 px-4 py-2 text-sm hover:bg-green-700"
    );

    completeBtn.textContent =
        habit.completed
            ? "Completed"
            : "Complete";

    completeBtn.addEventListener("click", () => {

        toggleHabitCompletion(habit.id);

    });

    const deleteBtn = createElement(
        "button",
        "rounded-lg bg-red-600 px-4 py-2 text-sm hover:bg-red-700"
    );

    deleteBtn.textContent = "Delete";

    deleteBtn.addEventListener("click", () => {

        removeHabit(habit.id);

    });

    actions.append(
        completeBtn,
        deleteBtn
    );

    card.append(
        title,
        category,
        progress,
        actions
    );

    return card;

}

function renderHabits() {

    clear(UI.habitList);

    if (app.habits.length === 0) {

        hide(UI.habitList);

        show(UI.emptyHabitState);

        return;

    }

    show(UI.habitList);

    hide(UI.emptyHabitState);

    app.habits.forEach(habit => {

        UI.habitList.append(

            createHabitCard(habit)

        );

    });

}

function getCompletedHabits() {

    return app.habits.filter(habit => habit.completed);

}

function getCompletionRate() {

    if (app.habits.length === 0) {

        return 0;

    }

    return Math.round(

        (getCompletedHabits().length / app.habits.length) * 100

    );

}

function updateDashboard() {

    UI.todayHabits.textContent = app.habits.length;

}