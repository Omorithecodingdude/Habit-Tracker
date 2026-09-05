// ========== CONSTANTS ==========
const CATEGORY_COLORS = {
  Health:   '#22c55e',
  Study:    '#60a5fa',
  Fitness:  '#fb923c',
  Work:     '#a78bfa',
  Personal: '#f472b6',
};

const PRIORITY_ORDER = { High: 0, Medium: 1, Low: 2 };

const QUOTES = [
  "The secret of getting ahead is getting started. — Mark Twain",
  "Small daily improvements lead to staggering long-term results.",
  "You don't rise to your goals, you fall to your systems. — James Clear",
  "Motivation gets you started. Habit keeps you going. — Jim Rohn",
  "Every day is a chance to be better than yesterday.",
  "We are what we repeatedly do. Excellence is a habit. — Aristotle",
  "A year from now you'll wish you had started today.",
  "Champions do ordinary things — just without thinking about it.",
  "The chains of habit are too light to be felt until they're too heavy to be broken.",
  "Success is the sum of small efforts, repeated day in and day out.",
  "Don't count the days — make the days count. — Muhammad Ali",
  "Start where you are. Use what you have. Do what you can.",
];

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
  achievements: [],
  history: [],
  deleteTargetId: null,
  editingHabitId: null,
};

let calendarViewDate = new Date();
let habitFilters = { search: "", category: "", priority: "", sort: "created" };

// ========== DOM REFS ==========
const UI = {
  loadingScreen:   document.getElementById("loadingScreen"),
  authPage:        document.getElementById("authPage"),
  appContainer:    document.getElementById("appContainer"),
  fabAddHabit:     document.getElementById("fabAddHabit"),
  sidebarNav:      document.getElementById("sidebarNav"),
  mainContent:     document.getElementById("mainContent"),
  userAvatar:      document.getElementById("userAvatar"),
  toastContainer:  document.getElementById("toastContainer"),
  // Auth
  loginForm:   document.getElementById("loginForm"),
  signupForm:  document.getElementById("signupForm"),
  authTabs:    document.querySelectorAll(".auth-tab"),
  // Theme
  themeToggleBtn: document.getElementById("themeToggleBtn"),
  themeIcon:      document.getElementById("themeIcon"),
  themeLabel:     document.getElementById("themeLabel"),
  themeOptions:   document.querySelectorAll(".theme-option"),
  // Dashboard
  statStreak:       document.getElementById("statStreak"),
  statLevel:        document.getElementById("statLevel"),
  statProgress:     document.getElementById("statProgress"),
  statAchievements: document.getElementById("statAchievements"),
  habitList:        document.getElementById("habitList"),
  emptyHabitState:  document.getElementById("emptyHabitState"),
  heatmapGrid:      document.getElementById("heatmapGrid"),
  dailyQuote:       document.getElementById("dailyQuote"),
  // Habit modal
  habitModal:      document.getElementById("habitModal"),
  habitModalTitle: document.getElementById("habitModalTitle"),
  closeHabitModal: document.getElementById("closeHabitModal"),
  cancelHabitBtn:  document.getElementById("cancelHabitBtn"),
  habitForm:       document.getElementById("habitForm"),
  habitName:       document.getElementById("habitName"),
  habitCategory:   document.getElementById("habitCategory"),
  habitPriority:   document.getElementById("habitPriority"),
  habitGoal:       document.getElementById("habitGoal"),
  habitNotes:      document.getElementById("habitNotes"),
  // Delete modal
  deleteModal:     document.getElementById("deleteModal"),
  closeDeleteModal: document.getElementById("closeDeleteModal"),
  cancelDeleteBtn: document.getElementById("cancelDeleteBtn"),
  confirmDeleteBtn: document.getElementById("confirmDeleteBtn"),
  // Settings
  settingsName:     document.getElementById("settingsName"),
  settingsEmail:    document.getElementById("settingsEmail"),
  saveProfileBtn:   document.getElementById("saveProfileBtn"),
  resetDataBtn:     document.getElementById("resetDataBtn"),
  deleteAccountBtn: document.getElementById("deleteAccountBtn"),
  exportDataBtn:    document.getElementById("exportDataBtn"),
  notifDaily:       document.getElementById("notifDaily"),
  notifStreak:      document.getElementById("notifStreak"),
  notifWeekly:      document.getElementById("notifWeekly"),
  // Achievements
  achievementsGrid:  document.getElementById("achievementsGrid"),
  achievementsCount: document.getElementById("achievementsCount"),
  // Logout
  logoutBtn: document.getElementById("logoutBtn"),
  // My Habits page
  habitSearch:          document.getElementById("habitSearch"),
  habitFilterCategory:  document.getElementById("habitFilterCategory"),
  habitFilterPriority:  document.getElementById("habitFilterPriority"),
  habitSort:            document.getElementById("habitSort"),
  allHabitsList:        document.getElementById("allHabitsList"),
  allHabitsEmpty:       document.getElementById("allHabitsEmpty"),
  habitsPageAddBtn:     document.getElementById("habitsPageAddBtn"),
  // Calendar
  calMonthLabel: document.getElementById("calMonthLabel"),
  calendarGrid:  document.getElementById("calendarGrid"),
  calPrev:       document.getElementById("calPrev"),
  calNext:       document.getElementById("calNext"),
  // Statistics
  weeklyChart:            document.getElementById("weeklyChart"),
  habitBreakdown:         document.getElementById("habitBreakdown"),
  habitBreakdownEmpty:    document.getElementById("habitBreakdownEmpty"),
  statTotalCompletions:   document.getElementById("statTotalCompletions"),
  statBestStreak:         document.getElementById("statBestStreak"),
  statPerfectDays:        document.getElementById("statPerfectDays"),
  statTotalXP:            document.getElementById("statTotalXP"),
};

// ========== NAVIGATION CONFIG ==========
const navigation = [
  { id: "dashboard",  icon: "layout-dashboard", label: "Dashboard"  },
  { id: "habits",     icon: "list-checks",      label: "My Habits"  },
  { id: "calendar",   icon: "calendar-days",    label: "Calendar"   },
  { id: "statistics", icon: "bar-chart-2",      label: "Statistics" },
  { id: "achievements", icon: "trophy",         label: "Achievements" },
  { id: "settings",   icon: "settings",         label: "Settings"   },
];

// ========== HELPERS ==========
function $(id)     { return document.getElementById(id); }
function show(el)  { el.classList.remove("hidden"); }
function hide(el)  { el.classList.add("hidden"); }
function clear(el) { el.replaceChildren(); }
function generateId() { return crypto.randomUUID(); }
function isEmpty(v)   { return v.trim() === ""; }

function createElement(tag, className = "") {
  const el = document.createElement(tag);
  if (className) el.className = className;
  return el;
}

function createIcon(name, size = 20) {
  const i = document.createElement("i");
  i.setAttribute("data-lucide", name);
  i.style.width  = size + "px";
  i.style.height = size + "px";
  return i;
}

function dateKey(d = new Date()) {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy.toISOString().slice(0, 10);
}

function todayKey()     { return dateKey(new Date()); }
function daysAgoKey(n)  {
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
  habit.streak     = streak;
  habit.bestStreak = Math.max(habit.bestStreak || 0, streak);
}

// ========== THEME ==========
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
  const icon  = resolved === "dark" ? "moon" : "sun";
  const label = resolved === "dark" ? "Dark Mode" : "Light Mode";
  UI.themeIcon.setAttribute("data-lucide", icon);
  UI.themeLabel.textContent = label;
  UI.themeOptions.forEach(btn => {
    btn.classList.toggle("active", btn.dataset.themeChoice === app.settings.theme);
  });
  lucide.createIcons();
}

function initTheme() {
  applyTheme(localStorage.getItem("ht-theme") || "dark");
}

// ========== TOAST SYSTEM ==========
function showToast(message, type = "info", iconName, duration = 3500) {
  const iconMap = { success: "check-circle", info: "info", warning: "alert-triangle", danger: "x-circle" };
  const icon = iconName || iconMap[type] || "info";

  const toast = createElement("div", `toast ${type}`);
  const iconWrap = createElement("div", "toast-icon");
  iconWrap.appendChild(createIcon(icon, 16));
  const msg = createElement("span");
  msg.textContent = message;
  toast.append(iconWrap, msg);

  UI.toastContainer.append(toast);
  lucide.createIcons();

  setTimeout(() => {
    toast.classList.add("removing");
    toast.addEventListener("animationend", () => toast.remove(), { once: true });
  }, duration);
}

// ========== QUOTE OF THE DAY ==========
function renderQuote() {
  if (!UI.dailyQuote) return;
  const day = new Date().getDate();
  UI.dailyQuote.textContent = QUOTES[day % QUOTES.length];
}

// ========== USER AVATAR ==========
function renderUserAvatar() {
  if (!UI.userAvatar || !app.user) return;
  const initials = (app.user.name || "?")
    .split(" ").map(w => w[0] || "").join("").toUpperCase().slice(0, 2) || "?";
  UI.userAvatar.innerHTML = `
    <div class="user-avatar">${initials}</div>
    <div class="user-info">
      <div class="user-name">${app.user.name || "User"}</div>
      <div class="user-level">⭐ Level ${app.stats.level} &middot; ${app.stats.xp} XP</div>
    </div>
  `;
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
  renderUserAvatar();
  renderSidebar();
  renderQuote();
  renderHabits();
  updateDashboard();
  renderHeatmap();
  checkAchievements();
  lucide.createIcons();
}

function handleLogin(e) {
  e.preventDefault();
  const email = $("loginEmail").value.trim();
  const pass  = $("loginPassword").value;

  if (!email || !pass) { showToast("Please fill in all fields.", "warning"); return; }

  const users = JSON.parse(localStorage.getItem("ht-users") || "[]");
  const user  = users.find(u => u.email === email && u.password === pass);

  if (user) {
    app.user = user;
    localStorage.setItem("ht-session", JSON.stringify(user));
    loadUserData();
    showApp();
    showToast(`Welcome back, ${user.name}! 👋`, "success");
  } else {
    showToast("Invalid email or password.", "danger");
  }
}

function handleSignup(e) {
  e.preventDefault();
  const name    = $("signupName").value.trim();
  const email   = $("signupEmail").value.trim();
  const pass    = $("signupPassword").value;
  const confirm = $("signupConfirm").value;

  if (!name || !email || !pass) { showToast("Please fill in all fields.", "warning"); return; }
  if (pass !== confirm)          { showToast("Passwords do not match.", "danger"); return; }
  if (pass.length < 6)           { showToast("Password must be at least 6 characters.", "warning"); return; }

  const users = JSON.parse(localStorage.getItem("ht-users") || "[]");
  if (users.find(u => u.email === email)) { showToast("Email already registered.", "warning"); return; }

  const newUser = { id: generateId(), name, email, password: pass, createdAt: new Date().toISOString() };
  users.push(newUser);
  localStorage.setItem("ht-users", JSON.stringify(users));

  app.user         = newUser;
  app.habits       = [];
  app.stats        = { xp: 0, level: 1 };
  app.history      = [];
  app.achievements = [];
  localStorage.setItem("ht-session", JSON.stringify(newUser));
  showApp();
  showToast(`Account created! Welcome, ${name}! 🎉`, "success");
}

function handleLogout() {
  localStorage.removeItem("ht-session");
  app.user = null;
  app.habits = app.history = app.achievements = [];
  app.stats = { xp: 0, level: 1 };
  showAuthPage();
}

function loadUserData() {
  if (!app.user) return;
  const raw = localStorage.getItem(`ht-data-${app.user.id}`);
  if (raw) {
    const d = JSON.parse(raw);
    app.habits       = d.habits       || [];
    app.stats        = d.stats        || { xp: 0, level: 1 };
    app.history      = d.history      || [];
    app.achievements = d.achievements || [];
    if (d.notifications) app.settings.notifications = d.notifications;
  } else {
    app.habits = app.history = app.achievements = [];
    app.stats  = { xp: 0, level: 1 };
  }
}

function saveUserData() {
  if (!app.user) return;
  localStorage.setItem(`ht-data-${app.user.id}`, JSON.stringify({
    habits:        app.habits,
    stats:         app.stats,
    history:       app.history,
    achievements:  app.achievements,
    notifications: app.settings.notifications,
  }));
}

// ========== SIDEBAR & NAVIGATION ==========
function createNavButton(menu) {
  const btn = createElement("button", "nav-btn");
  btn.dataset.page = menu.id;
  if (menu.id === app.currentPage) btn.classList.add("active");
  btn.append(createIcon(menu.icon), Object.assign(createElement("span"), { textContent: menu.label }));
  btn.addEventListener("click", () => navigateTo(menu.id));
  return btn;
}

function renderSidebar() {
  clear(UI.sidebarNav);
  navigation.forEach(m => UI.sidebarNav.append(createNavButton(m)));
  lucide.createIcons();
}

function navigateTo(pageId) {
  app.currentPage = pageId;

  document.querySelectorAll(".nav-btn[data-page]").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.page === pageId);
  });

  document.querySelectorAll("[id^='page-']").forEach(page => {
    page.classList.toggle("hidden", page.id !== `page-${pageId}`);
  });

  switch (pageId) {
    case "dashboard":
      renderHabits();
      updateDashboard();
      renderHeatmap();
      break;
    case "habits":      renderHabitsPage();      break;
    case "calendar":    renderCalendarPage();    break;
    case "statistics":  renderStatisticsPage();  break;
    case "achievements": renderAchievementsPage(); break;
    case "settings":    initSettings();          break;
  }

  if (pageId === "dashboard" || pageId === "habits") {
    show(UI.fabAddHabit);
  } else {
    hide(UI.fabAddHabit);
  }

  UI.mainContent.scrollTo({ top: 0, behavior: "smooth" });
  lucide.createIcons();
}

// ========== HABITS CRUD ==========
function createHabitFromForm() {
  return {
    name:     UI.habitName.value.trim(),
    category: UI.habitCategory.value,
    priority: UI.habitPriority.value,
    goal:     Number(UI.habitGoal.value),
    notes:    UI.habitNotes.value.trim(),
  };
}

function validateHabit(habit) {
  if (isEmpty(habit.name))          { showToast("Habit name is required.", "warning"); return false; }
  if (!habit.goal || habit.goal <= 0){ showToast("Goal must be greater than zero.", "warning"); return false; }
  return true;
}

function addHabit(habit) {
  app.habits.push({
    id: generateId(), ...habit,
    completions: {}, streak: 0, bestStreak: 0,
    createdAt: new Date().toISOString(),
  });
  saveUserData();
  renderHabits();
  updateDashboard();
  renderHeatmap();
  checkAchievements();
  showToast("Habit created! 🚀 Keep it up.", "success");
}

function updateHabit(id, data) {
  const habit = app.habits.find(h => h.id === id);
  if (!habit) return;
  Object.assign(habit, data);
  saveUserData();
  renderHabits();
  updateDashboard();
  showToast("Habit updated.", "info");
}

function removeHabit(id) {
  const habit = app.habits.find(h => h.id === id);
  const name  = habit?.name || "Habit";
  app.habits  = app.habits.filter(h => h.id !== id);
  app.history = app.history.filter(h => h.habitId !== id);
  saveUserData();
  renderHabits();
  updateDashboard();
  renderHeatmap();
  showToast(`"${name}" deleted.`, "warning");
}

function toggleHabitCompletion(id) {
  const habit = app.habits.find(h => h.id === id);
  if (!habit) return;
  if (!habit.completions) habit.completions = {};

  const key    = todayKey();
  const wasDone = isDoneOnDate(habit, key);

  if (wasDone) {
    habit.completions[key] = 0;
    app.stats.xp = Math.max(0, app.stats.xp - 10);
  } else {
    habit.completions[key] = habit.goal;
    app.stats.xp += 10;
    app.history.push({ type: "complete", habitId: id, date: new Date().toISOString() });
    showToast(`"${habit.name}" done! +10 XP ⚡`, "success");
  }

  recalcHabitStreak(habit);
  app.stats.level = Math.floor(app.stats.xp / 100) + 1;

  saveUserData();
  renderHabits();
  updateDashboard();
  renderHeatmap();
  checkAchievements();
  renderUserAvatar();

  // Perfect day check
  if (!wasDone && app.habits.length > 0 && app.habits.every(isDoneToday)) {
    setTimeout(() => showToast("🎉 Perfect Day! Every habit complete!", "success", "star", 5000), 600);
  }
}

function createHabitCard(habit) {
  const done = isDoneToday(habit);
  const card = createElement("article", `habit-card cat-${habit.category}${done ? " is-done" : ""}`);

  // Header row: title + status badge
  const header = createElement("div");
  header.style.cssText = "display:flex; align-items:flex-start; justify-content:space-between; gap:0.5rem;";

  const titleWrap = createElement("div");
  titleWrap.style.flex = "1";
  const title = createElement("h3");
  title.textContent = habit.name;

  // Tags
  const tags = createElement("div", "habit-tags");
  const catTag = createElement("span", `category-tag cat-${habit.category}`);
  catTag.textContent = habit.category;
  const priTag = createElement("span", `priority-tag priority-${habit.priority}`);
  priTag.textContent = habit.priority;
  tags.append(catTag, priTag);
  titleWrap.append(title, tags);

  const badge = createElement("span", `status-badge ${done ? "done" : "pending"}`);
  badge.textContent = done ? "✓ Done" : "Pending";
  header.append(titleWrap, badge);

  // Meta: streak, notes
  const meta = createElement("p", "habit-meta");
  const parts = [];
  if (habit.streak)                        parts.push(`🔥 ${habit.streak} day streak`);
  if (habit.bestStreak > habit.streak)     parts.push(`🏆 Best: ${habit.bestStreak}`);
  if (habit.notes)                         parts.push(`📝 ${habit.notes}`);
  meta.textContent = parts.join("   ·   ");
  if (!parts.length) hide(meta);

  // Progress
  const progress    = habit.completions?.[todayKey()] || 0;
  const progressText = createElement("p", "habit-progress");
  progressText.textContent = `Progress: ${progress} / ${habit.goal}`;

  const progressBar = createElement("div", "progress-bar");
  const fill = createElement("div", "fill");
  fill.style.width = `${Math.min(100, (progress / habit.goal) * 100)}%`;
  progressBar.append(fill);

  // Actions
  const actions = createElement("div", "habit-actions");

  const completeBtn = createElement("button", `btn ${done ? "btn-ghost" : "btn-success"}`);
  completeBtn.append(createIcon(done ? "rotate-ccw" : "check", 14));
  completeBtn.append(Object.assign(document.createTextNode(""), { textContent: "" }));
  completeBtn.insertAdjacentText("beforeend", done ? " Undo" : " Complete");
  completeBtn.addEventListener("click", () => toggleHabitCompletion(habit.id));

  const editBtn = createElement("button", "btn btn-ghost");
  editBtn.append(createIcon("pencil", 14));
  editBtn.insertAdjacentText("beforeend", " Edit");
  editBtn.addEventListener("click", () => openHabitModal(habit));

  const deleteBtn = createElement("button", "btn btn-danger");
  deleteBtn.title = "Delete habit";
  deleteBtn.append(createIcon("trash-2", 14));
  deleteBtn.addEventListener("click", () => openDeleteModal(habit.id));

  actions.append(completeBtn, editBtn, deleteBtn);
  card.append(header, meta, progressText, progressBar, actions);
  return card;
}

function renderHabits() {
  clear(UI.habitList);
  if (app.habits.length === 0) { hide(UI.habitList); show(UI.emptyHabitState); return; }

  show(UI.habitList);
  hide(UI.emptyHabitState);

  // Pending first, done at bottom
  const sorted = [...app.habits].sort((a, b) => (isDoneToday(a) ? 1 : 0) - (isDoneToday(b) ? 1 : 0));
  sorted.forEach(h => UI.habitList.append(createHabitCard(h)));
  lucide.createIcons();
}

// ========== DASHBOARD ==========
function getCompletionRate() {
  if (!app.habits.length) return 0;
  return Math.round((app.habits.filter(isDoneToday).length / app.habits.length) * 100);
}

function updateDashboard() {
  const bestStreak = app.habits.reduce((max, h) => Math.max(max, h.streak || 0), 0);
  UI.statStreak.textContent       = bestStreak;
  UI.statLevel.textContent        = app.stats.level;
  UI.statProgress.textContent     = getCompletionRate() + "%";
  UI.statAchievements.textContent = `${app.achievements.length}/${ACHIEVEMENTS.length}`;
}

// ========== HEATMAP ==========
function renderHeatmap() {
  clear(UI.heatmapGrid);
  const total = app.habits.length;
  for (let i = 364; i >= 0; i--) {
    const key   = daysAgoKey(i);
    const count = total === 0 ? 0 : app.habits.filter(h => isDoneOnDate(h, key)).length;
    const cell  = createElement("div", "heatmap-cell");
    if (count > 0 && total > 0) {
      const r = count / total;
      cell.classList.add(r >= 1 ? "level-4" : r >= 0.75 ? "level-3" : r >= 0.5 ? "level-2" : "level-1");
    }
    cell.title = total === 0 ? key : `${key} — ${count}/${total} done`;
    UI.heatmapGrid.append(cell);
  }
}

// ========== MY HABITS PAGE ==========
function renderHabitsPage() {
  let list = [...app.habits];

  // Filters
  if (habitFilters.search) {
    const q = habitFilters.search.toLowerCase();
    list = list.filter(h => h.name.toLowerCase().includes(q) || (h.notes || "").toLowerCase().includes(q));
  }
  if (habitFilters.category) list = list.filter(h => h.category === habitFilters.category);
  if (habitFilters.priority) list = list.filter(h => h.priority === habitFilters.priority);

  // Sort
  switch (habitFilters.sort) {
    case "name":     list.sort((a, b) => a.name.localeCompare(b.name)); break;
    case "streak":   list.sort((a, b) => (b.bestStreak || 0) - (a.bestStreak || 0)); break;
    case "priority": list.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]); break;
    default:         list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  clear(UI.allHabitsList);

  if (list.length === 0) {
    show(UI.allHabitsEmpty);
    hide(UI.allHabitsList);
  } else {
    hide(UI.allHabitsEmpty);
    show(UI.allHabitsList);
    list.forEach(h => UI.allHabitsList.append(createHabitCard(h)));
  }
  lucide.createIcons();
}

// ========== CALENDAR PAGE ==========
function renderCalendarPage() {
  const year     = calendarViewDate.getFullYear();
  const month    = calendarViewDate.getMonth();
  const today    = new Date();
  const todayStr = dateKey(today);

  UI.calMonthLabel.textContent = calendarViewDate.toLocaleString("en-US", {
    month: "long", year: "numeric"
  });

  clear(UI.calendarGrid);

  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++) {
    UI.calendarGrid.append(createElement("div", "cal-day empty"));
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const d   = new Date(year, month, day);
    const key = dateKey(d);
    const isFuture = d > today && key !== todayStr;
    const isToday  = key === todayStr;

    const total = app.habits.length;
    const done  = total === 0 ? 0 : app.habits.filter(h => isDoneOnDate(h, key)).length;

    let cls = "cal-day";
    if (isFuture)                            cls += " future";
    else if (isToday)                        cls += " today";
    else if (total > 0 && done === total)    cls += " perfect";
    else if (done > 0)                       cls += " partial";

    const cell = createElement("div", cls);
    cell.textContent = day;
    if (!isFuture && total > 0) cell.title = `${key}: ${done}/${total} done`;
    UI.calendarGrid.append(cell);
  }
}

// ========== STATISTICS PAGE ==========
function renderStatisticsPage() {
  const stats = computeAchievementStats();

  UI.statTotalCompletions.textContent = stats.totalCompletions;
  UI.statBestStreak.textContent       = stats.bestStreak;
  UI.statPerfectDays.textContent      = stats.perfectDays;
  UI.statTotalXP.textContent          = app.stats.xp;

  // Weekly bar chart
  if (UI.weeklyChart) {
    clear(UI.weeklyChart);
    const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    for (let i = 6; i >= 0; i--) {
      const d       = new Date();
      d.setDate(d.getDate() - i);
      const key     = dateKey(d);
      const dayName = DAY_NAMES[d.getDay()];
      const isToday = i === 0;
      const total   = app.habits.length;
      const done    = total === 0 ? 0 : app.habits.filter(h => isDoneOnDate(h, key)).length;
      const pct     = total === 0 ? 0 : Math.round((done / total) * 100);

      const col    = createElement("div", "chart-col");
      const pctLbl = createElement("div", "chart-pct");
      pctLbl.textContent = pct > 0 ? `${pct}%` : "";

      const barBg   = createElement("div", "chart-bar-bg");
      const barFill = createElement("div", `chart-bar-fill${isToday ? " today-bar" : ""}`);
      barFill.style.height = pct > 0 ? `${pct}%` : "3px";
      barBg.append(barFill);

      const dayLbl = createElement("div", `chart-label${isToday ? " today-label" : ""}`);
      dayLbl.textContent = dayName;

      col.append(pctLbl, barBg, dayLbl);
      UI.weeklyChart.append(col);
    }
  }

  // Per-habit breakdown
  if (UI.habitBreakdown) {
    clear(UI.habitBreakdown);
    if (app.habits.length === 0) {
      show(UI.habitBreakdownEmpty);
    } else {
      hide(UI.habitBreakdownEmpty);

      const sorted = [...app.habits].sort((a, b) => {
        const calc = h => {
          const total = Object.keys(h.completions || {}).length;
          const done  = Object.values(h.completions || {}).filter(v => v >= h.goal).length;
          return total === 0 ? 0 : done / total;
        };
        return calc(b) - calc(a);
      });

      sorted.forEach(habit => {
        const total = Object.keys(habit.completions || {}).length;
        const done  = Object.values(habit.completions || {}).filter(v => v >= habit.goal).length;
        const pct   = total === 0 ? 0 : Math.round((done / total) * 100);

        const row      = createElement("div", "habit-stat-row");
        const nameWrap = createElement("div", "habit-stat-name-wrap");
        const dot = createElement("span", "cat-dot-inline");
        dot.style.background = CATEGORY_COLORS[habit.category] || "var(--accent)";
        const nameEl = createElement("span", "habit-stat-name");
        nameEl.textContent = habit.name;
        nameEl.title = habit.name;
        nameWrap.append(dot, nameEl);

        const bar  = createElement("div", "progress-bar");
        bar.style.margin = "0";
        const fill = createElement("div", "fill");
        fill.style.width = `${pct}%`;
        bar.append(fill);

        const pctLbl = createElement("span", "pct-label");
        pctLbl.textContent = `${pct}%`;

        row.append(nameWrap, bar, pctLbl);
        UI.habitBreakdown.append(row);
      });
    }
  }
  lucide.createIcons();
}

// ========== ACHIEVEMENTS ==========
const ACHIEVEMENTS = [
  { id: "first-habit",    icon: "sparkles",       title: "Getting Started",  desc: "Create your first habit.",                         cond: s => s.totalHabits >= 1   },
  { id: "first-complete", icon: "footprints",      title: "First Step",       desc: "Complete a habit for the first time.",             cond: s => s.totalCompletions >= 1 },
  { id: "collector",      icon: "layers",          title: "Habit Collector",  desc: "Create 5 different habits.",                       cond: s => s.totalHabits >= 5   },
  { id: "streak-3",       icon: "flame",           title: "Streak Starter",   desc: "Reach a 3-day streak.",                            cond: s => s.bestStreak >= 3    },
  { id: "streak-7",       icon: "flame",           title: "Week Warrior",     desc: "Reach a 7-day streak.",                            cond: s => s.bestStreak >= 7    },
  { id: "streak-14",      icon: "flame",           title: "Fortnight Focus",  desc: "Reach a 14-day streak.",                           cond: s => s.bestStreak >= 14   },
  { id: "streak-30",      icon: "crown",           title: "Monthly Master",   desc: "Reach a 30-day streak.",                           cond: s => s.bestStreak >= 30   },
  { id: "century",        icon: "medal",           title: "Century Club",     desc: "Log 100 total completions.",                       cond: s => s.totalCompletions >= 100 },
  { id: "perfect-day",    icon: "check-check",     title: "Perfect Day",      desc: "Complete every habit in a single day.",            cond: s => s.perfectDays >= 1   },
  { id: "perfect-week",   icon: "calendar-check",  title: "Perfect Week",     desc: "Complete every habit every day for a full week.",  cond: s => s.perfectDays >= 7   },
];

function countPerfectDays() {
  if (!app.habits.length) return 0;
  let count = 0;
  for (let i = 0; i < 365; i++) {
    if (app.habits.every(h => isDoneOnDate(h, daysAgoKey(i)))) count++;
  }
  return count;
}

function computeAchievementStats() {
  return {
    totalHabits:      app.habits.length,
    totalCompletions: app.habits.reduce(
      (sum, h) => sum + Object.values(h.completions || {}).filter(v => v >= h.goal).length, 0
    ),
    bestStreak: app.habits.reduce((max, h) => Math.max(max, h.bestStreak || 0), 0),
    perfectDays: countPerfectDays(),
  };
}

function checkAchievements() {
  const stats      = computeAchievementStats();
  const newUnlocks = [];

  ACHIEVEMENTS.forEach(a => {
    if (!app.achievements.includes(a.id) && a.cond(stats)) {
      app.achievements.push(a.id);
      newUnlocks.push(a);
    }
  });

  if (newUnlocks.length > 0) {
    saveUserData();
    updateDashboard();
    newUnlocks.forEach((a, i) => {
      setTimeout(() => showToast(`🏆 Achievement unlocked: ${a.title}!`, "success", "trophy", 5000), i * 1300);
    });
  }
}

function renderAchievementsPage() {
  clear(UI.achievementsGrid);
  UI.achievementsCount.textContent = `${app.achievements.length} / ${ACHIEVEMENTS.length} unlocked`;

  ACHIEVEMENTS.forEach(a => {
    const unlocked = app.achievements.includes(a.id);
    const card     = createElement("div", `achievement-card${unlocked ? " unlocked" : ""}`);
    const iconWrap = createElement("div", "achievement-icon");
    iconWrap.append(createIcon(unlocked ? a.icon : "lock", 20));
    const info  = createElement("div", "achievement-info");
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

// ========== MODALS ==========
function openModal(modal)  { modal.classList.add("show");    }
function closeModal(modal) { modal.classList.remove("show"); }

function openHabitModal(habit = null) {
  UI.habitForm.reset();
  app.editingHabitId          = habit ? habit.id : null;
  UI.habitModalTitle.textContent = habit ? "Edit Habit" : "Add Habit";

  if (habit) {
    UI.habitName.value     = habit.name;
    UI.habitCategory.value = habit.category;
    UI.habitPriority.value = habit.priority;
    UI.habitGoal.value     = habit.goal;
    UI.habitNotes.value    = habit.notes || "";
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
    UI.settingsName.value  = app.user.name  || "";
    UI.settingsEmail.value = app.user.email || "";
  }
  UI.notifDaily.checked  = !!app.settings.notifications.daily;
  UI.notifStreak.checked = !!app.settings.notifications.streak;
  UI.notifWeekly.checked = !!app.settings.notifications.weekly;

  // Keep theme selector in sync
  UI.themeOptions.forEach(btn => {
    btn.classList.toggle("active", btn.dataset.themeChoice === app.settings.theme);
  });
}

function saveProfile() {
  if (!app.user) return;
  const newName = UI.settingsName.value.trim();
  if (!newName) { showToast("Display name cannot be empty.", "warning"); return; }

  app.user.name = newName;
  const users   = JSON.parse(localStorage.getItem("ht-users") || "[]");
  const idx     = users.findIndex(u => u.id === app.user.id);
  if (idx !== -1) { users[idx] = app.user; localStorage.setItem("ht-users", JSON.stringify(users)); }
  localStorage.setItem("ht-session", JSON.stringify(app.user));

  renderSidebar();
  renderUserAvatar();
  showToast("Profile saved!", "success");
}

function updateNotificationSetting(key, value) {
  app.settings.notifications[key] = value;
  saveUserData();
}

function resetAllData() {
  if (!confirm("Are you sure? This will permanently delete ALL habits and progress.")) return;
  app.habits = app.history = app.achievements = [];
  app.stats  = { xp: 0, level: 1 };
  saveUserData();
  renderHabits();
  updateDashboard();
  renderHeatmap();
  renderUserAvatar();
  showToast("All data has been reset.", "warning");
}

function exportData() {
  if (!app.user) return;
  const payload = {
    user:         { name: app.user.name, email: app.user.email, createdAt: app.user.createdAt },
    habits:       app.habits,
    stats:        app.stats,
    achievements: app.achievements,
    exportedAt:   new Date().toISOString(),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement("a"), {
    href: url, download: `habit-tracker-${dateKey()}.json`
  });
  a.click();
  URL.revokeObjectURL(url);
  showToast("Data exported successfully!", "success", "download");
}

// ========== EVENT LISTENERS ==========
function setupEvents() {
  // Auth tabs
  UI.authTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      UI.authTabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      tab.dataset.tab === "login" ? (show(UI.loginForm), hide(UI.signupForm))
                                  : (hide(UI.loginForm), show(UI.signupForm));
    });
  });

  UI.loginForm.addEventListener("submit", handleLogin);
  UI.signupForm.addEventListener("submit", handleSignup);
  UI.logoutBtn.addEventListener("click", handleLogout);

  // Theme
  UI.themeToggleBtn.addEventListener("click", () => {
    applyTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark");
  });
  UI.themeOptions.forEach(btn => btn.addEventListener("click", () => applyTheme(btn.dataset.themeChoice)));

  // FAB & add buttons
  UI.fabAddHabit.addEventListener("click", () => openHabitModal());
  $("addHabitBtn")?.addEventListener("click", () => openHabitModal());
  $("emptyAddBtn")?.addEventListener("click", () => openHabitModal());
  UI.habitsPageAddBtn?.addEventListener("click", () => openHabitModal());

  // Habit modal
  UI.closeHabitModal.addEventListener("click",  () => closeModal(UI.habitModal));
  UI.cancelHabitBtn.addEventListener("click",   () => closeModal(UI.habitModal));
  UI.habitModal.addEventListener("click", e => { if (e.target === UI.habitModal) closeModal(UI.habitModal); });

  // Delete modal
  UI.closeDeleteModal.addEventListener("click",  () => closeModal(UI.deleteModal));
  UI.cancelDeleteBtn.addEventListener("click",   () => closeModal(UI.deleteModal));
  UI.confirmDeleteBtn.addEventListener("click",  () => {
    if (app.deleteTargetId) { removeHabit(app.deleteTargetId); app.deleteTargetId = null; }
    closeModal(UI.deleteModal);
    if (app.currentPage === "habits") renderHabitsPage();
  });

  // Habit form
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
    if (app.currentPage === "habits") renderHabitsPage();
  });

  // Settings
  UI.saveProfileBtn.addEventListener("click",  saveProfile);
  UI.resetDataBtn.addEventListener("click",    resetAllData);
  UI.exportDataBtn?.addEventListener("click",  exportData);
  UI.notifDaily.addEventListener("change",  () => updateNotificationSetting("daily",  UI.notifDaily.checked));
  UI.notifStreak.addEventListener("change", () => updateNotificationSetting("streak", UI.notifStreak.checked));
  UI.notifWeekly.addEventListener("change", () => updateNotificationSetting("weekly", UI.notifWeekly.checked));
  UI.deleteAccountBtn.addEventListener("click", () => {
    if (!confirm("Permanently delete your account? This cannot be undone.")) return;
    localStorage.removeItem(`ht-data-${app.user.id}`);
    const users = JSON.parse(localStorage.getItem("ht-users") || "[]");
    localStorage.setItem("ht-users", JSON.stringify(users.filter(u => u.id !== app.user.id)));
    handleLogout();
  });

  // My Habits page filters
  UI.habitSearch?.addEventListener("input", () => {
    habitFilters.search = UI.habitSearch.value;
    if (app.currentPage === "habits") renderHabitsPage();
  });
  UI.habitFilterCategory?.addEventListener("change", () => {
    habitFilters.category = UI.habitFilterCategory.value;
    if (app.currentPage === "habits") renderHabitsPage();
  });
  UI.habitFilterPriority?.addEventListener("change", () => {
    habitFilters.priority = UI.habitFilterPriority.value;
    if (app.currentPage === "habits") renderHabitsPage();
  });
  UI.habitSort?.addEventListener("change", () => {
    habitFilters.sort = UI.habitSort.value;
    if (app.currentPage === "habits") renderHabitsPage();
  });

  // Calendar navigation
  UI.calPrev?.addEventListener("click", () => {
    calendarViewDate.setMonth(calendarViewDate.getMonth() - 1);
    renderCalendarPage();
    lucide.createIcons();
  });
  UI.calNext?.addEventListener("click", () => {
    calendarViewDate.setMonth(calendarViewDate.getMonth() + 1);
    renderCalendarPage();
    lucide.createIcons();
  });

  // Escape closes modals
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") { closeModal(UI.habitModal); closeModal(UI.deleteModal); }
  });
}

// ========== INIT ==========
function init() {
  initTheme();
  setupEvents();

  const session = localStorage.getItem("ht-session");
  if (session) {
    app.user = JSON.parse(session);
    loadUserData();
    showApp();
    initSettings();
  } else {
    showAuthPage();
  }

  setTimeout(() => UI.loadingScreen.classList.add("hidden"), 800);
  lucide.createIcons();
}

document.addEventListener("DOMContentLoaded", init);