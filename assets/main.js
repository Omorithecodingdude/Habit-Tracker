// ========== APP STATE ==========
const app = {
  currentPage: "dashboard",
  isLoggedIn: false,
  user: null,
  habits: [],
  stats: { xp: 0, level: 1 },
  settings: {
    theme: localStorage.getItem("ht-theme") || "dark",
    notifications: { daily: true, streak: true, weekly: false }
  },
  achievements: [],   // unlocked achievement ids
  history: [],
  deleteTargetId: null,
  editingHabitId: null
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
  habitModalTitle: document.getElementById("habitModalTitle"),
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
  notifDaily: document.getElementById("notifDaily"),
  notifStreak: document.getElementById("notifStreak"),
  notifWeekly: document.getElementById("notifWeekly"),
  // Achievements
  achievementsGrid: document.getElementById("achievementsGrid"),
  achievementsCount: document.getElementById("achievementsCount"),
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

function dateKey(d = new Date()) {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy.toISOString().slice(0, 10);
}

function todayKey() {
  return dateKey(new Date());
}

function daysAgoKey(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return dateKey(d);
}

function isDoneOnDate(habit, key) {
  return (habit.completions?.[key] || 0) >= habit.goal;
}

function isDoneToday(habit) {
  return isDoneOnDate(habit, todayKey());
}

function recalcHabitStreak(habit) {
  let streak = 0;
  let cursor = new Date();
  if (!isDoneOnDate(habit, dateKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (isDoneOnDate(habit, dateKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  habit.streak = streak;
  habit.bestStreak = Math.max(habit.bestStreak || 0, streak);
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
  checkAchievements();
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
  app.habits = [];
  app.stats = { xp: 0, level: 1 };
  app.history = [];
  app.achievements = [];
  showApp();
}

function handleLogout() {
  localStorage.removeItem("ht-session");
  app.user = null;
  app.habits = [];
  app.history = [];
  app.achievements = [];
  app.stats = { xp: 0, level: 1 };
  showAuthPage();
}

function loadUserData() {
  if (!app.user) return;
  const data = localStorage.getItem(`ht-data-${app.user.id}`);
  if (data) {
    const parsed = JSON.parse(data);
    app.habits = parsed.habits || [];
    app.stats = parsed.stats || { xp: 0, level: 1 };
    app.history = parsed.history || [];
    app.achievements = parsed.achievements || [];
    if (parsed.notifications) app.settings.notifications = parsed.notifications;
  } else {
    app.habits = [];
    app.stats = { xp: 0, level: 1 };
    app.history = [];
    app.achievements = [];
  }
}

function saveUserData() {
  if (!app.user) return;
  localStorage.setItem(`ht-data-${app.user.id}`, JSON.stringify({
    habits: app.habits,
    stats: app.stats,
    history: app.history,
    achievements: app.achievements,
    notifications: app.settings.notifications
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

const SCROLL_TARGETS = {
  habits: "#habitsSection",
  calendar: "#heatmapSection",
  statistics: "#statsGrid",
};

function navigateTo(pageId) {
  app.currentPage = pageId;

  // Update nav active state
  document.querySelectorAll(".nav-btn[data-page]").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.page === pageId);
  });

  // These three live inside the dashboard page; just scroll there.
  const scrollTarget = SCROLL_TARGETS[pageId];
  const realPageId = scrollTarget ? "dashboard" : pageId;

  // Show/hide pages
  document.querySelectorAll("[id^='page-']").forEach(page => {
    page.classList.toggle("hidden", page.id !== `page-${realPageId}`);
  });

  if (realPageId === "achievements" || pageId === "achievements") {
    renderAchievementsPage();
  }

  if (scrollTarget) {
    requestAnimationFrame(() => {
      document.querySelector(scrollTarget)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  } else {
    UI.mainContent.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Show FAB only on dashboard-related pages
  if (realPageId === "dashboard") {
    show(UI.fabAddHabit);
  } else {
    hide(UI.fabAddHabit);
  }
}

// ========== HABITS CRUD ==========
function createHabitFromForm() {
  return {
    name: UI.habitName.value.trim(),
    category: UI.habitCategory.value,
    priority: UI.habitPriority.value,
    goal: Number(UI.habitGoal.value),
    notes: UI.habitNotes.value.trim(),
  };
}

function validateHabit(habit) {
  if (isEmpty(habit.name)) {
    alert("Habit name is required.");
    return false;
  }
  if (!habit.goal || habit.goal <= 0) {
    alert("Goal must be greater than zero.");
    return false;
  }
  return true;
}

function addHabit(habit) {
  app.habits.push({
    id: generateId(),
    ...habit,
    completions: {},
    streak: 0,
    bestStreak: 0,
    createdAt: new Date().toISOString(),
  });
  saveUserData();
  renderHabits();
  updateDashboard();
  renderHeatmap();
}

function updateHabit(id, data) {
  const habit = app.habits.find(h => h.id === id);
  if (!habit) return;
  Object.assign(habit, data);
  saveUserData();
  renderHabits();
  updateDashboard();
}

function removeHabit(id) {
  app.habits = app.habits.filter(h => h.id !== id);
  app.history = app.history.filter(h => h.habitId !== id);
  saveUserData();
  renderHabits();
  updateDashboard();
  renderHeatmap();
}

function toggleHabitCompletion(id) {
  const habit = app.habits.find(h => h.id === id);
  if (!habit) return;
  if (!habit.completions) habit.completions = {};

  const key = todayKey();
  const wasDone = isDoneOnDate(habit, key);

  if (wasDone) {
    habit.completions[key] = 0;
    app.stats.xp = Math.max(0, app.stats.xp - 10);
  } else {
    habit.completions[key] = habit.goal;
    app.stats.xp += 10;
    app.history.push({ type: "complete", habitId: id, date: new Date().toISOString() });
  }

  recalcHabitStreak(habit);
  app.stats.level = Math.floor(app.stats.xp / 100) + 1;

  saveUserData();
  renderHabits();
  updateDashboard();
  renderHeatmap();
  checkAchievements();
}

function createHabitCard(habit) {
  const card = createElement("article", "habit-card");
  const done = isDoneToday(habit);

  const header = createElement("div", "");
  header.style.cssText = "display:flex; align-items:center; justify-content:space-between; gap:0.5rem;";

  const title = createElement("h3");
  title.textContent = habit.name;

  const badge = createElement("span");
  badge.style.cssText = `flex-shrink:0; font-size:0.7rem; padding:0.2rem 0.6rem; border-radius:99px;
    background:${done ? 'var(--success)' : 'var(--bg-hover)'};
    color:${done ? 'white' : 'var(--text-muted)'};`;
  badge.textContent = done ? "Done" : "Pending";

  header.append(title, badge);

  const meta = createElement("p", "habit-meta");
  meta.textContent = `${habit.category} • ${habit.priority} priority${habit.streak ? ` • 🔥 ${habit.streak} day streak` : ""}`;

  const progress = habit.completions?.[todayKey()] || 0;
  const progressText = createElement("p", "habit-progress");
  progressText.textContent = `Progress: ${progress}/${habit.goal}`;

  const progressBar = createElement("div", "progress-bar");
  const fill = createElement("div", "fill");
  fill.style.width = `${Math.min(100, (progress / habit.goal) * 100)}%`;
  progressBar.append(fill);

  const actions = createElement("div", "habit-actions");

  const completeBtn = createElement("button", `btn ${done ? 'btn-ghost' : 'btn-success'}`);
  completeBtn.textContent = done ? "Undo" : "Complete";
  completeBtn.addEventListener("click", () => toggleHabitCompletion(habit.id));

  const editBtn = createElement("button", "btn btn-ghost");
  editBtn.textContent = "Edit";
  editBtn.addEventListener("click", () => openHabitModal(habit));

  const deleteBtn = createElement("button", "btn btn-danger");
  deleteBtn.textContent = "Delete";
  deleteBtn.addEventListener("click", () => openDeleteModal(habit.id));

  actions.append(completeBtn, editBtn, deleteBtn);
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
  lucide.createIcons();
}

// ========== DASHBOARD ==========
function getCompletedHabits() {
  return app.habits.filter(isDoneToday);
}

function getCompletionRate() {
  if (app.habits.length === 0) return 0;
  return Math.round((getCompletedHabits().length / app.habits.length) * 100);
}

function updateDashboard() {
  const bestStreak = app.habits.reduce((max, h) => Math.max(max, h.streak || 0), 0);
  UI.statStreak.textContent = bestStreak;
  UI.statLevel.textContent = app.stats.level;
  UI.statProgress.textContent = getCompletionRate() + "%";
  UI.statAchievements.textContent = `${app.achievements.length}/${ACHIEVEMENTS.length}`;
}

// ========== HEATMAP ==========
function renderHeatmap() {
  clear(UI.heatmapGrid);
  const totalHabits = app.habits.length;

  for (let i = 364; i >= 0; i--) {
    const key = daysAgoKey(i);
    const count = totalHabits === 0 ? 0 : app.habits.filter(h => isDoneOnDate(h, key)).length;
    const cell = createElement("div", "heatmap-cell");

    if (count > 0 && totalHabits > 0) {
      const ratio = count / totalHabits;
      if (ratio >= 1) cell.classList.add("level-4");
      else if (ratio >= 0.75) cell.classList.add("level-3");
      else if (ratio >= 0.5) cell.classList.add("level-2");
      else cell.classList.add("level-1");
    }

    cell.title = totalHabits === 0
      ? key
      : `${key} — ${count}/${totalHabits} habits completed`;
    UI.heatmapGrid.append(cell);
  }
}

// ========== ACHIEVEMENTS ==========
const ACHIEVEMENTS = [
  { id: "first-habit", icon: "sparkles", title: "Getting Started", desc: "Create your first habit.", cond: s => s.totalHabits >= 1 },
  { id: "first-complete", icon: "footprints", title: "First Step", desc: "Complete a habit for the first time.", cond: s => s.totalCompletions >= 1 },
  { id: "collector", icon: "layers", title: "Habit Collector", desc: "Create 5 different habits.", cond: s => s.totalHabits >= 5 },
  { id: "streak-3", icon: "flame", title: "Streak Starter", desc: "Reach a 3-day streak.", cond: s => s.bestStreak >= 3 },
  { id: "streak-7", icon: "flame", title: "Week Warrior", desc: "Reach a 7-day streak.", cond: s => s.bestStreak >= 7 },
  { id: "streak-14", icon: "flame", title: "Fortnight Focus", desc: "Reach a 14-day streak.", cond: s => s.bestStreak >= 14 },
  { id: "streak-30", icon: "crown", title: "Monthly Master", desc: "Reach a 30-day streak.", cond: s => s.bestStreak >= 30 },
  { id: "century", icon: "medal", title: "Century Club", desc: "Log 100 total completions.", cond: s => s.totalCompletions >= 100 },
  { id: "perfect-day", icon: "check-check", title: "Perfect Day", desc: "Complete every habit in a single day.", cond: s => s.perfectDays >= 1 },
  { id: "perfect-week", icon: "calendar-check", title: "Perfect Week", desc: "Complete every habit every day for a week.", cond: s => s.perfectDays >= 7 },
];

function countPerfectDays() {
  if (app.habits.length === 0) return 0;
  let count = 0;
  for (let i = 0; i < 365; i++) {
    const key = daysAgoKey(i);
    if (app.habits.every(h => isDoneOnDate(h, key))) count++;
  }
  return count;
}

function computeAchievementStats() {
  return {
    totalHabits: app.habits.length,
    totalCompletions: app.habits.reduce(
      (sum, h) => sum + Object.values(h.completions || {}).filter(v => v >= h.goal).length, 0
    ),
    bestStreak: app.habits.reduce((max, h) => Math.max(max, h.bestStreak || 0), 0),
    perfectDays: countPerfectDays(),
  };
}

function checkAchievements() {
  const stats = computeAchievementStats();
  let unlockedNew = [];

  ACHIEVEMENTS.forEach(a => {
    if (!app.achievements.includes(a.id) && a.cond(stats)) {
      app.achievements.push(a.id);
      unlockedNew.push(a);
    }
  });

  if (unlockedNew.length > 0) {
    saveUserData();
    updateDashboard();
    if (!UI.achievementsGrid.classList.contains("hidden") || true) {
      unlockedNew.forEach(a => {
        // Lightweight, non-blocking toast-like alert via title change is overkill;
        // a simple console note keeps this unobtrusive while still confirming unlocks.
        console.log(`Achievement unlocked: ${a.title}`);
      });
    }
  }
}

function renderAchievementsPage() {
  clear(UI.achievementsGrid);
  const unlockedCount = app.achievements.length;
  UI.achievementsCount.textContent = `${unlockedCount} / ${ACHIEVEMENTS.length} unlocked`;

  ACHIEVEMENTS.forEach(a => {
    const unlocked = app.achievements.includes(a.id);
    const card = createElement("div", `achievement-card${unlocked ? " unlocked" : ""}`);

    const iconWrap = createElement("div", "achievement-icon");
    iconWrap.append(createIcon(unlocked ? a.icon : "lock", 20));

    const info = createElement("div", "achievement-info");
    const title = createElement("h4");
    title.textContent = a.title;
    const desc = createElement("p");
    desc.textContent = a.desc;
    info.append(title, desc);

    card.append(iconWrap, info);
    UI.achievementsGrid.append(card);
  });

  lucide.createIcons();
}
function openModal(modal) { modal.classList.add("show"); }
function closeModal(modal) { modal.classList.remove("show"); }

function openHabitModal(habit = null) {
  UI.habitForm.reset();
  app.editingHabitId = habit ? habit.id : null;
  UI.habitModalTitle.textContent = habit ? "Edit Habit" : "Add Habit";

  if (habit) {
    UI.habitName.value = habit.name;
    UI.habitCategory.value = habit.category;
    UI.habitPriority.value = habit.priority;
    UI.habitGoal.value = habit.goal;
    UI.habitNotes.value = habit.notes || "";
  }

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
  UI.notifDaily.checked = !!app.settings.notifications.daily;
  UI.notifStreak.checked = !!app.settings.notifications.streak;
  UI.notifWeekly.checked = !!app.settings.notifications.weekly;
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
  renderSidebar();
  alert("Profile saved!");
}

function updateNotificationSetting(key, value) {
  app.settings.notifications[key] = value;
  saveUserData();
}

function resetAllData() {
  if (!confirm("Are you sure? This will delete ALL habits and progress.")) return;
  app.habits = [];
  app.stats = { xp: 0, level: 1 };
  app.history = [];
  app.achievements = [];
  saveUserData();
  renderHabits();
  updateDashboard();
  renderHeatmap();
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
  UI.fabAddHabit.addEventListener("click", () => openHabitModal());
  $("addHabitBtn")?.addEventListener("click", () => openHabitModal());
  $("emptyAddBtn")?.addEventListener("click", () => openHabitModal());

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

  // Habit form submit (handles both create & edit)
  UI.habitForm.addEventListener("submit", e => {
    e.preventDefault();
    const habit = createHabitFromForm();
    if (!validateHabit(habit)) return;

    if (app.editingHabitId) {
      updateHabit(app.editingHabitId, habit);
      app.editingHabitId = null;
    } else {
      addHabit(habit);
    }
    closeModal(UI.habitModal);
  });

  // Settings
  UI.saveProfileBtn.addEventListener("click", saveProfile);
  UI.resetDataBtn.addEventListener("click", resetAllData);
  UI.notifDaily.addEventListener("change", () => updateNotificationSetting("daily", UI.notifDaily.checked));
  UI.notifStreak.addEventListener("change", () => updateNotificationSetting("streak", UI.notifStreak.checked));
  UI.notifWeekly.addEventListener("change", () => updateNotificationSetting("weekly", UI.notifWeekly.checked));
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