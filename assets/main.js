// ========== APP STATE ==========
const app = {
  currentPage: "dashboard",
  isLoggedIn: false,
  user: null,
  habits: [],
  stats: { xp: 0, level: 1, streak: 0 },
  settings: {
    theme: localStorage.getItem("ht-theme") || "dark",
    notifications: { daily: true, streak: true, weekly: false }
  },
  history: [],
  deleteTargetId: null
};

// ========== DOM REFS ==========
const UI = {
  loadingScreen: document.getElementById("loadingScreen"),
  authPage: document.getElementById("authPage"),
  appContainer: document.getElementById("appContainer"),
  fabAddHabit: document.getElementById("fabAddHabit"),
  sidebarNav: document.getElementById("sidebarNav"),
  mainContent: document.getElementById("mainContent"),
  // Auth
  loginForm: document.getElementById("loginForm"),
  signupForm: document.getElementById("signupForm"),
  authTabs: document.querySelectorAll(".auth-tab"),
  // Theme
  themeToggleBtn: document.getElementById("themeToggleBtn"),
  themeIcon: document.getElementById("themeIcon"),
  themeLabel: document.getElementById("themeLabel"),
  themeOptions: document.querySelectorAll(".theme-option"),
  // Dashboard
  statStreak: document.getElementById("statStreak"),
  statLevel: document.getElementById("statLevel"),
  statProgress: document.getElementById("statProgress"),
  statAchievements: document.getElementById("statAchievements"),
  habitList: document.getElementById("habitList"),
  emptyHabitState: document.getElementById("emptyHabitState"),
  heatmapGrid: document.getElementById("heatmapGrid"),
  // Modal
  habitModal: document.getElementById("habitModal"),
  closeHabitModal: document.getElementById("closeHabitModal"),
  cancelHabitBtn: document.getElementById("cancelHabitBtn"),
  habitForm: document.getElementById("habitForm"),
  // Delete Modal
  deleteModal: document.getElementById("deleteModal"),
  closeDeleteModal: document.getElementById("closeDeleteModal"),
  cancelDeleteBtn: document.getElementById("cancelDeleteBtn"),
  confirmDeleteBtn: document.getElementById("confirmDeleteBtn"),
  // Inputs
  habitName: document.getElementById("habitName"),
  habitCategory: document.getElementById("habitCategory"),
  habitPriority: document.getElementById("habitPriority"),
  habitGoal: document.getElementById("habitGoal"),
  habitNotes: document.getElementById("habitNotes"),
  // Settings
  settingsName: document.getElementById("settingsName"),
  settingsEmail: document.getElementById("settingsEmail"),
  saveProfileBtn: document.getElementById("saveProfileBtn"),
  resetDataBtn: document.getElementById("resetDataBtn"),
  deleteAccountBtn: document.getElementById("deleteAccountBtn"),
  // Logout
  logoutBtn: document.getElementById("logoutBtn"),
};

// ========== NAVIGATION CONFIG ==========
const navigation = [
  { id: "dashboard", icon: "layout-dashboard", label: "Dashboard" },
  { id: "habits", icon: "check-square", label: "Habits" },
  { id: "calendar", icon: "calendar-days", label: "Calendar" },
  { id: "statistics", icon: "chart-column", label: "Statistics" },
  { id: "achievements", icon: "trophy", label: "Achievements" },
  { id: "settings", icon: "settings", label: "Settings" },
];

// ========== HELPERS ==========
function $(id) { return document.getElementById(id); }
function show(el) { el.classList.remove("hidden"); }
function hide(el) { el.classList.add("hidden"); }
function clear(el) { el.replaceChildren(); }
function generateId() { return crypto.randomUUID(); }
function isEmpty(v) { return v.trim() === ""; }

function createElement(tag, className = "") {
  const el = document.createElement(tag);
  if (className) el.className = className;
  return el;
}

function createIcon(name, size = 20) {
  const i = document.createElement("i");
  i.setAttribute("data-lucide", name);
  i.style.width = size + "px";
  i.style.height = size + "px";
  return i;
}

function formatDate(date = new Date()) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric"
  }).format(date);
}

// ========== THEME MANAGEMENT ==========
function applyTheme(theme) {
  let resolved = theme;
  if (theme === "system") {
    resolved = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  document.documentElement.setAttribute("data-theme", resolved);
  app.settings.theme = theme;
  localStorage.setItem("ht-theme", theme);
  updateThemeUI(resolved);
}

function updateThemeUI(resolved) {
  // Update sidebar toggle
  const icon = resolved === "dark" ? "moon" : "sun";
  const label = resolved === "dark" ? "Dark Mode" : "Light Mode";
  UI.themeIcon.setAttribute("data-lucide", icon);
  UI.themeLabel.textContent = label;

  // Update settings theme options
  UI.themeOptions.forEach(btn => {
    btn.classList.toggle("active", btn.dataset.themeChoice === app.settings.theme);
  });

  lucide.createIcons();
}

function initTheme() {
  const saved = localStorage.getItem("ht-theme") || "dark";
  applyTheme(saved);
}

// ========== AUTH ==========
function showAuthPage() {
  hide(UI.appContainer);
  hide(UI.fabAddHabit);
  show(UI.authPage);
  app.isLoggedIn = false;
}

function showApp() {
  hide(UI.authPage);
  show(UI.appContainer);
  show(UI.fabAddHabit);
  app.isLoggedIn = true;
  renderSidebar();
  renderHabits();
  updateDashboard();
  renderHeatmap();
  lucide.createIcons();
}

function handleLogin(e) {
  e.preventDefault();
  const email = $("loginEmail").value.trim();
  const pass = $("loginPassword").value;

  if (!email || !pass) {
    alert("Please fill in all fields.");
    return;
  }

  // Simulasi login (ganti dengan API call)
  const users = JSON.parse(localStorage.getItem("ht-users") || "[]");
  const user = users.find(u => u.email === email && u.password === pass);

  if (user) {
    app.user = user;
    localStorage.setItem("ht-session", JSON.stringify(user));
    loadUserData();
    showApp();
  } else {
    alert("Invalid email or password.");
  }
}

function handleSignup(e) {
  e.preventDefault();
  const name = $("signupName").value.trim();
  const email = $("signupEmail").value.trim();
  const pass = $("signupPassword").value;
  const confirm = $("signupConfirm").value;

  if (!name || !email || !pass) {
    alert("Please fill in all fields.");
    return;
  }
  if (pass !== confirm) {
    alert("Passwords do not match.");
    return;
  }
  if (pass.length < 6) {
    alert("Password must be at least 6 characters.");
    return;
  }

  const users = JSON.parse(localStorage.getItem("ht-users") || "[]");
  if (users.find(u => u.email === email)) {
    alert("Email already registered.");
    return;
  }

  const newUser = { id: generateId(), name, email, password: pass, createdAt: new Date().toISOString() };
  users.push(newUser);
  localStorage.setItem("ht-users", JSON.stringify(users));

  app.user = newUser;
  localStorage.setItem("ht-session", JSON.stringify(newUser));
  showApp();
}

function handleLogout() {
  localStorage.removeItem("ht-session");
  app.user = null;
  app.habits = [];
  showAuthPage();
}

function loadUserData() {
  if (!app.user) return;
  const data = localStorage.getItem(`ht-data-${app.user.id}`);
  if (data) {
    const parsed = JSON.parse(data);
    app.habits = parsed.habits || [];
    app.stats = parsed.stats || { xp: 0, level: 1, streak: 0 };
    app.history = parsed.history || [];
  }
}

function saveUserData() {
  if (!app.user) return;
  localStorage.setItem(`ht-data-${app.user.id}`, JSON.stringify({
    habits: app.habits,
    stats: app.stats,
    history: app.history
  }));
}

// ========== SIDEBAR & NAVIGATION ==========
function createNavButton(menu) {
  const btn = createElement("button", "nav-btn");
  btn.dataset.page = menu.id;
  if (menu.id === app.currentPage) btn.classList.add("active");

  const icon = createIcon(menu.icon);
  const label = createElement("span");
  label.textContent = menu.label;
  btn.append(icon, label);

  btn.addEventListener("click", () => navigateTo(menu.id));
  return btn;
}

function renderSidebar() {
  clear(UI.sidebarNav);
  navigation.forEach(menu => {
    UI.sidebarNav.append(createNavButton(menu));
  });
  lucide.createIcons();
}

function navigateTo(pageId) {
  app.currentPage = pageId;

  // Update nav active state
  document.querySelectorAll(".nav-btn[data-page]").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.page === pageId);
  });

  // Show/hide pages
  document.querySelectorAll("[id^='page-']").forEach(page => {
    page.classList.toggle("hidden", page.id !== `page-${pageId}`);
  });

  // Show FAB only on dashboard/habits
  if (pageId === "dashboard" || pageId === "habits") {
    show(UI.fabAddHabit);
  } else {
    hide(UI.fabAddHabit);
  }
}

// ========== HABITS CRUD ==========
function createHabitFromForm() {
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
  saveUserData();
  renderHabits();
  updateDashboard();
}

function removeHabit(id) {
  app.habits = app.habits.filter(h => h.id !== id);
  saveUserData();
  renderHabits();
  updateDashboard();
}

function toggleHabitCompletion(id) {
  const habit = app.habits.find(h => h.id === id);
  if (!habit) return;

  habit.completed = !habit.completed;
  habit.completedAt = habit.completed ? new Date().toISOString() : null;

  if (habit.completed) {
    habit.progress = habit.goal;
    habit.streak++;
    app.stats.xp += 10;
    app.history.push({ type: "complete", habitId: id, date: new Date().toISOString() });
  } else {
    habit.progress = 0;
    habit.streak = Math.max(0, habit.streak - 1);
  }

  // Level up
  app.stats.level = Math.floor(app.stats.xp / 100) + 1;

  saveUserData();
  renderHabits();
  updateDashboard();
}

function createHabitCard(habit) {
  const card = createElement("article", "habit-card");

  const header = createElement("div", "");
  header.style.cssText = "display:flex; align-items:center; justify-content:space-between;";

  const title = createElement("h3");
  title.textContent = habit.name;

  const badge = createElement("span");
  badge.style.cssText = `font-size:0.7rem; padding:0.2rem 0.6rem; border-radius:99px;
    background:${habit.completed ? 'var(--success)' : 'var(--bg-hover)'};
    color:${habit.completed ? 'white' : 'var(--text-muted)'};`;
  badge.textContent = habit.completed ? "Done" : "Pending";

  header.append(title, badge);

  const meta = createElement("p", "habit-meta");
  meta.textContent = `${habit.category} • ${habit.priority} priority`;

  const progressText = createElement("p", "habit-progress");
  progressText.textContent = `Progress: ${habit.progress}/${habit.goal}`;

  const progressBar = createElement("div", "progress-bar");
  const fill = createElement("div", "fill");
  fill.style.width = `${(habit.progress / habit.goal) * 100}%`;
  progressBar.append(fill);

  const actions = createElement("div", "");
  actions.style.cssText = "display:flex; gap:0.5rem; margin-top:1rem;";

  const completeBtn = createElement("button", `btn ${habit.completed ? 'btn-ghost' : 'btn-success'}`);
  completeBtn.textContent = habit.completed ? "Undo" : "Complete";
  completeBtn.addEventListener("click", () => toggleHabitCompletion(habit.id));

  const deleteBtn = createElement("button", "btn btn-danger");
  deleteBtn.textContent = "Delete";
  deleteBtn.addEventListener("click", () => openDeleteModal(habit.id));

  actions.append(completeBtn, deleteBtn);
  card.append(header, meta, progressText, progressBar, actions);
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
    UI.habitList.append(createHabitCard(habit));
  });
}

// ========== DASHBOARD ==========
function getCompletedHabits() {
  return app.habits.filter(h => h.completed);
}

function getCompletionRate() {
  if (app.habits.length === 0) return 0;
  return Math.round((getCompletedHabits().length / app.habits.length) * 100);
}

function updateDashboard() {
  UI.statStreak.textContent = app.stats.streak;
  UI.statLevel.textContent = app.stats.level;
  UI.statProgress.textContent = getCompletionRate() + "%";
  UI.statAchievements.textContent = `0/32`;
}

// ========== HEATMAP ==========
function renderHeatmap() {
  clear(UI.heatmapGrid);
  for (let i = 0; i < 364; i++) {
    const cell = createElement("div", "heatmap-cell");
    const rand = Math.random();
    if (rand > 0.8) cell.classList.add("level-4");
    else if (rand > 0.6) cell.classList.add("level-3");
    else if (rand > 0.4) cell.classList.add("level-2");
    else if (rand > 0.2) cell.classList.add("level-1");
    UI.heatmapGrid.append(cell);
  }
}

// ========== MODALS ==========
function openModal(modal) { modal.classList.add("show"); }
function closeModal(modal) { modal.classList.remove("show"); }

function openHabitModal() {
  UI.habitForm.reset();
  openModal(UI.habitModal);
}

function openDeleteModal(id) {
  app.deleteTargetId = id;
  openModal(UI.deleteModal);
}

// ========== SETTINGS ==========
function initSettings() {
  if (app.user) {
    UI.settingsName.value = app.user.name || "";
    UI.settingsEmail.value = app.user.email || "";
  }
}

function saveProfile() {
  if (!app.user) return;
  app.user.name = UI.settingsName.value.trim();
  const users = JSON.parse(localStorage.getItem("ht-users") || "[]");
  const idx = users.findIndex(u => u.id === app.user.id);
  if (idx !== -1) {
    users[idx] = app.user;
    localStorage.setItem("ht-users", JSON.stringify(users));
  }
  localStorage.setItem("ht-session", JSON.stringify(app.user));
  alert("Profile saved!");
}

function resetAllData() {
  if (!confirm("Are you sure? This will delete ALL habits and progress.")) return;
  app.habits = [];
  app.stats = { xp: 0, level: 1, streak: 0 };
  app.history = [];
  saveUserData();
  renderHabits();
  updateDashboard();
}

// ========== EVENT LISTENERS ==========
function setupEvents() {
  // Auth tabs
  UI.authTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      UI.authTabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      if (tab.dataset.tab === "login") {
        show(UI.loginForm);
        hide(UI.signupForm);
      } else {
        hide(UI.loginForm);
        show(UI.signupForm);
      }
    });
  });

  // Auth forms
  UI.loginForm.addEventListener("submit", handleLogin);
  UI.signupForm.addEventListener("submit", handleSignup);
  UI.logoutBtn.addEventListener("click", handleLogout);

  // Theme toggle (sidebar)
  UI.themeToggleBtn.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";
    applyTheme(next);
  });

  // Theme options (settings)
  UI.themeOptions.forEach(btn => {
    btn.addEventListener("click", () => {
      applyTheme(btn.dataset.themeChoice);
    });
  });

  // FAB & Add buttons
  UI.fabAddHabit.addEventListener("click", openHabitModal);
  $("addHabitBtn")?.addEventListener("click", openHabitModal);
  $("emptyAddBtn")?.addEventListener("click", openHabitModal);

  // Modal close
  UI.closeHabitModal.addEventListener("click", () => closeModal(UI.habitModal));
  UI.cancelHabitBtn.addEventListener("click", () => closeModal(UI.habitModal));
  UI.habitModal.addEventListener("click", e => {
    if (e.target === UI.habitModal) closeModal(UI.habitModal);
  });

  // Delete modal
  UI.closeDeleteModal.addEventListener("click", () => closeModal(UI.deleteModal));
  UI.cancelDeleteBtn.addEventListener("click", () => closeModal(UI.deleteModal));
  UI.confirmDeleteBtn.addEventListener("click", () => {
    if (app.deleteTargetId) {
      removeHabit(app.deleteTargetId);
      app.deleteTargetId = null;
    }
    closeModal(UI.deleteModal);
  });

  // Habit form submit
  UI.habitForm.addEventListener("submit", e => {
    e.preventDefault();
    const habit = createHabitFromForm();
    if (validateHabit(habit)) {
      addHabit(habit);
      closeModal(UI.habitModal);
    }
  });

  // Settings
  UI.saveProfileBtn.addEventListener("click", saveProfile);
  UI.resetDataBtn.addEventListener("click", resetAllData);
  UI.deleteAccountBtn.addEventListener("click", () => {
    if (!confirm("Delete account permanently?")) return;
    localStorage.removeItem(`ht-data-${app.user.id}`);
    const users = JSON.parse(localStorage.getItem("ht-users") || "[]");
    localStorage.setItem("ht-users", JSON.stringify(users.filter(u => u.id !== app.user.id)));
    handleLogout();
  });

  // Escape key
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      closeModal(UI.habitModal);
      closeModal(UI.deleteModal);
    }
  });
}

// ========== INIT ==========
function init() {
  initTheme();
  setupEvents();

  // Check existing session
  const session = localStorage.getItem("ht-session");
  if (session) {
    app.user = JSON.parse(session);
    loadUserData();
    showApp();
    initSettings();
  } else {
    showAuthPage();
  }

  // Hide loading screen
  setTimeout(() => {
    UI.loadingScreen.classList.add("hidden");
  }, 800);

  lucide.createIcons();
}

// Start
document.addEventListener("DOMContentLoaded", init);