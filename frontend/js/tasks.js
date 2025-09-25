// Professional Tasks Management JavaScript (Fixed & Complete)

// DOM Elements
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");
const mobileMenuToggle = document.getElementById("mobileMenuToggle");
const logoutBtn = document.getElementById("logoutBtn");
const userEmail = document.getElementById("userEmail");

// Task elements
const tasksTableBody = document.getElementById("tasksTableBody");
const tasksCardsContainer = document.getElementById("tasksCardsContainer");
const addTaskBtn = document.getElementById("addTaskBtn");
const emptyStateAddBtn = document.getElementById("emptyStateAddBtn");
const emptyState = document.getElementById("emptyState");

// Modal elements
const taskModal = document.getElementById("taskModal");
const taskModalTitle = document.getElementById("taskModalTitle");
const taskModalClose = document.getElementById("taskModalClose");
const taskModalCancel = document.getElementById("taskModalCancel");
const taskForm = document.getElementById("taskForm");

// Form inputs
const taskTitleInput = document.getElementById("taskTitleInput");
const taskDescInput = document.getElementById("taskDescInput");
const taskStatusInput = document.getElementById("taskStatusInput");
const taskPriorityInput = document.getElementById("taskPriorityInput");
const taskDueDateInput = document.getElementById("taskDueDateInput");
const taskBoardInput = document.getElementById("taskBoardInput");

// Filter elements
const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");
const priorityFilter = document.getElementById("priorityFilter");
const boardFilter = document.getElementById("boardFilter");

// View toggle
const viewToggleBtns = document.querySelectorAll(".view-toggle-btn");
const desktopTable = document.querySelector(".desktop-table");
const mobileCards = document.getElementById("tasksCardsContainer");

// Bulk actions
const selectAllCheckbox = document.getElementById("selectAllTasks");
const bulkActionsBar = document.getElementById("bulkActionsBar");
const selectedCount = document.getElementById("selectedCount");
const clearSelection = document.getElementById("clearSelection");
const bulkStatusUpdate = document.getElementById("bulkStatusUpdate");
const bulkDelete = document.getElementById("bulkDelete");
const bulkStatusModal = document.getElementById("bulkStatusModal");

// Stats elements
const totalTasks = document.getElementById("totalTasks");
const pendingTasks = document.getElementById("pendingTasks");
const inProgressTasks = document.getElementById("inProgressTasks");
const completedTasks = document.getElementById("completedTasks");

// Global variables
const token = localStorage.getItem("token");
let payload = token ? parseJwt(token) : null;
let editingTaskId = null;
let allTasks = [];
let allBoards = [];
let filteredTasks = [];
let selectedTasks = new Set();
let currentView = "table";
let boardId = null; // will be set after fetching boards

// API Base URL
const API_BASE = "https://taskmanager-tj4l.onrender.com";

// Initialize application
document.addEventListener("DOMContentLoaded", async () => {
  if (!token) {
    alert("No authentication token found. Please login.");
    window.location.href = "index.html";
    return;
  }
  await initializeApp();
});

// Initialize app
async function initializeApp() {
  try {
    showLoading();
    await fetchUser();
    await fetchBoards();
    await fetchTasks();
    setupEventListeners();
    hideLoading();
  } catch (error) {
    console.error("Failed to initialize app:", error);
    hideLoading();
    showError("Failed to load application data");
  }
}

// Show loading state
function showLoading() {
  const loadingOverlay = document.createElement("div");
  loadingOverlay.className = "loading-overlay";
  loadingOverlay.id = "loadingOverlay";
  loadingOverlay.innerHTML = `<div class="loading-spinner"></div><span>Loading tasks...</span>`;
  document.body.appendChild(loadingOverlay);
}

// Hide loading state
function hideLoading() {
  const loadingOverlay = document.getElementById("loadingOverlay");
  if (loadingOverlay) loadingOverlay.remove();
}

// Show error
function showError(message) {
  const errorDiv = document.createElement("div");
  errorDiv.className = "error-message";
  errorDiv.style.cssText = `
    position: fixed; top: 20px; right: 20px; 
    background: #e74c3c; color: white; 
    padding: 1rem; border-radius: 0.5rem; z-index: 3000;
    box-shadow: 0 4px 10px rgba(0,0,0,0.3);
  `;
  errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message} 
  <button onclick="this.parentElement.remove()" style="background:none;border:none;color:white;margin-left:1rem;cursor:pointer;">
    <i class="fas fa-times"></i>
  </button>`;
  document.body.appendChild(errorDiv);
  setTimeout(() => errorDiv.remove(), 5000);
}

// Setup event listeners
function setupEventListeners() {
  mobileMenuToggle.addEventListener("click", toggleSidebar);
  overlay.addEventListener("click", closeSidebar);
  logoutBtn.addEventListener("click", logout);
  addTaskBtn.addEventListener("click", openAddTaskModal);
  emptyStateAddBtn.addEventListener("click", openAddTaskModal);
  taskModalClose.addEventListener("click", closeTaskModal);
  taskModalCancel.addEventListener("click", closeTaskModal);
  taskForm.addEventListener("submit", handleTaskSubmit);

  searchInput.addEventListener("input", debounce(handleSearch, 300));
  statusFilter.addEventListener("change", handleFilterChange);
  priorityFilter.addEventListener("change", handleFilterChange);
  boardFilter.addEventListener("change", handleFilterChange);

  viewToggleBtns.forEach((btn) =>
    btn.addEventListener("click", () => toggleView(btn.dataset.view))
  );

  selectAllCheckbox.addEventListener("change", handleSelectAll);
  clearSelection.addEventListener("click", clearTaskSelection);
  bulkStatusUpdate.addEventListener("click", openBulkStatusModal);
  bulkDelete.addEventListener("click", handleBulkDelete);

  taskModal.addEventListener("click", (e) => {
    if (e.target === taskModal) closeTaskModal();
  });

  if (bulkStatusModal)
    bulkStatusModal.addEventListener("click", (e) => {
      if (e.target === bulkStatusModal) closeBulkStatusModal();
    });

  document.addEventListener("keydown", handleKeyboardShortcuts);
}

// Keyboard shortcuts
function handleKeyboardShortcuts(e) {
  if (e.ctrlKey || e.metaKey) {
    switch (e.key) {
      case "n":
        e.preventDefault();
        openAddTaskModal();
        break;
      case "f":
        e.preventDefault();
        searchInput.focus();
        break;
      case "Escape":
        closeAllModals();
        break;
    }
  }
}

// Sidebar
function toggleSidebar() {
  sidebar.classList.toggle("active");
  overlay.classList.toggle("active");
}
function closeSidebar() {
  sidebar.classList.remove("active");
  overlay.classList.remove("active");
}

// Logout
function logout() {
  localStorage.removeItem("token");
  window.location.href = "index.html";
}

// JWT Parser
function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch (e) {
    return null;
  }
}

// Fetch user
async function fetchUser() {
  try {
    const response = await fetch(`${API_BASE}/users/${payload.user_id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("Failed to fetch user");
    const data = await response.json();
    userEmail.textContent = `Welcome, ${data.email}`;
  } catch (error) {
    console.error(error);
    showError("Unable to fetch user info");
  }
}

// Fetch boards
async function fetchBoards() {
  try {
    const response = await fetch(`${API_BASE}/boards`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("Failed to fetch boards");
    allBoards = await response.json();
    if (allBoards.length) boardId = allBoards[0].id;
    populateBoardFilters();
    populateBoardSelect();
  } catch (error) {
    console.error(error);
    showError("Unable to fetch boards");
  }
}

function populateBoardFilters() {
  boardFilter.innerHTML = `<option value="">All Boards</option>`;
  allBoards.forEach((board) => {
    const opt = document.createElement("option");
    opt.value = board.id;
    opt.textContent = board.name;
    boardFilter.appendChild(opt);
  });
}

function populateBoardSelect() {
  taskBoardInput.innerHTML = "";
  allBoards.forEach((board) => {
    const opt = document.createElement("option");
    opt.value = board.id;
    opt.textContent = board.name;
    taskBoardInput.appendChild(opt);
  });
}

// Fetch tasks
async function fetchTasks() {
  if (!boardId) return;
  try {
    const response = await fetch(`${API_BASE}/boards/${boardId}/tasks`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("Failed to fetch tasks");
    allTasks = await response.json();
    filteredTasks = [...allTasks];
    renderTasks();
  } catch (error) {
    console.error(error);
    showError("Unable to fetch tasks");
  }
}

// Render tasks
function renderTasks() {
  renderTasksTable();
  renderTasksCards();
  updateStats();
  toggleEmptyState();
}

// Render table
function renderTasksTable() {
  tasksTableBody.innerHTML = "";
  filteredTasks.forEach((task) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><input type="checkbox" class="task-checkbox" data-id="${
        task.id
      }" /></td>
      <td><div class="task-info"><span class="task-title">${
        task.title
      }</span><span class="task-description">${
      task.description || ""
    }</span></div></td>
      <td><span class="status-badge status-${task.status
        .replace(" ", "-")
        .toLowerCase()}">${task.status}</span></td>
      <td><span class="priority-badge priority-${
        task.priority?.toLowerCase() || ""
      }">${task.priority || ""}</span></td>
      <td>${task.boardName || ""}</td>
      <td>${task.dueDate || ""}</td>
      <td>
        <button class="btn btn-secondary edit-btn" data-id="${
          task.id
        }"><i class="fas fa-edit"></i></button>
        <button class="btn btn-secondary delete-btn" data-id="${
          task.id
        }"><i class="fas fa-trash"></i></button>
      </td>
    `;
    tasksTableBody.appendChild(tr);
  });

  document
    .querySelectorAll(".task-checkbox")
    .forEach((cb) => cb.addEventListener("change", handleTaskSelection));
  document
    .querySelectorAll(".edit-btn")
    .forEach((btn) =>
      btn.addEventListener("click", () => openEditTaskModal(btn.dataset.id))
    );
  document
    .querySelectorAll(".delete-btn")
    .forEach((btn) =>
      btn.addEventListener("click", () => handleDeleteTask(btn.dataset.id))
    );
}

// Render mobile cards
function renderTasksCards() {
  tasksCardsContainer.innerHTML = "";
  filteredTasks.forEach((task) => {
    const card = document.createElement("div");
    card.className = "task-card";
    card.innerHTML = `
      <div class="task-card-header"><span class="task-title">${
        task.title
      }</span><span class="status-badge status-${task.status
      .replace(" ", "-")
      .toLowerCase()}">${task.status}</span></div>
      <p class="task-description">${task.description || ""}</p>
      <div class="task-card-footer"><span class="priority-badge priority-${
        task.priority?.toLowerCase() || ""
      }">${task.priority || ""}</span><span>${task.dueDate || ""}</span></div>
    `;
    tasksCardsContainer.appendChild(card);
  });
}

// Update stats
function updateStats() {
  totalTasks.textContent = allTasks.length;
  pendingTasks.textContent = allTasks.filter(
    (t) => t.status === "To Do"
  ).length;
  inProgressTasks.textContent = allTasks.filter(
    (t) => t.status === "In Progress"
  ).length;
  completedTasks.textContent = allTasks.filter(
    (t) => t.status === "Done"
  ).length;
}

// Empty state
function toggleEmptyState() {
  emptyState.style.display = filteredTasks.length === 0 ? "flex" : "none";
}

// Debounce utility
function debounce(fn, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

// Filters
function handleSearch() {
  applyFilters();
}
function handleFilterChange() {
  applyFilters();
}
function applyFilters() {
  const search = searchInput.value.toLowerCase();
  const status = statusFilter.value;
  const priority = priorityFilter.value;
  const board = boardFilter.value;

  filteredTasks = allTasks.filter((task) => {
    return (
      (!status || task.status === status) &&
      (!priority || task.priority === priority) &&
      (!board || task.boardId === board) &&
      (task.title.toLowerCase().includes(search) ||
        task.description?.toLowerCase().includes(search))
    );
  });
  renderTasks();
}

// View toggle
function toggleView(view) {
  currentView = view;
  desktopTable.style.display = view === "table" ? "table" : "none";
  mobileCards.style.display = view === "cards" ? "block" : "none";
}

// Task modal
function openAddTaskModal() {
  editingTaskId = null;
  taskModalTitle.textContent = "Add Task";
  taskForm.reset();
  taskModal.classList.add("active");
}
function openEditTaskModal(id) {
  editingTaskId = id;
  const task = allTasks.find((t) => t.id === id);
  if (!task) return;
  taskModalTitle.textContent = "Edit Task";
  taskTitleInput.value = task.title;
  taskDescInput.value = task.description || "";
  taskStatusInput.value = task.status;
  taskPriorityInput.value = task.priority || "";
  taskDueDateInput.value = task.dueDate || "";
  taskBoardInput.value = task.boardId;
  taskModal.classList.add("active");
}
function closeTaskModal() {
  taskModal.classList.remove("active");
}
function closeAllModals() {
  closeTaskModal();
  closeBulkStatusModal();
}

// Task form submit
async function handleTaskSubmit(e) {
  e.preventDefault();
  const taskData = {
    title: taskTitleInput.value,
    description: taskDescInput.value,
    status: taskStatusInput.value,
    priority: taskPriorityInput.value,
    dueDate: taskDueDateInput.value,
    boardId: taskBoardInput.value,
  };
  try {
    if (editingTaskId) await updateTask(editingTaskId, taskData);
    else await createTask(taskData);
    closeTaskModal();
    await fetchTasks();
  } catch (error) {
    console.error(error);
    showError("Failed to save task");
  }
}

// CRUD operations
async function createTask(data) {
  const response = await fetch(`${API_BASE}/boards/${data.boardId}/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create task");
}

async function updateTask(id, data) {
  const response = await fetch(
    `${API_BASE}/boards/${data.boardId}/tasks/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  );
  if (!response.ok) throw new Error("Failed to update task");
}

async function handleDeleteTask(id) {
  if (!confirm("Are you sure you want to delete this task?")) return;
  const task = allTasks.find((t) => t.id === id);
  const response = await fetch(
    `${API_BASE}/boards/${task.boardId}/tasks/${id}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  if (!response.ok) return showError("Failed to delete task");
  await fetchTasks();
}

// Task selection
function handleTaskSelection(e) {
  const id = e.target.dataset.id;
  if (e.target.checked) selectedTasks.add(id);
  else selectedTasks.delete(id);
  updateBulkBar();
}

function handleSelectAll(e) {
  selectedTasks.clear();
  const allCheckboxes = document.querySelectorAll(".task-checkbox");
  allCheckboxes.forEach((cb) => {
    cb.checked = e.target.checked;
    if (e.target.checked) selectedTasks.add(cb.dataset.id);
  });
  updateBulkBar();
}

function clearTaskSelection() {
  selectedTasks.clear();
  document
    .querySelectorAll(".task-checkbox")
    .forEach((cb) => (cb.checked = false));
  selectAllCheckbox.checked = false;
  updateBulkBar();
}

function updateBulkBar() {
  if (selectedTasks.size) {
    bulkActionsBar.classList.add("active");
    selectedCount.textContent = selectedTasks.size;
  } else {
    bulkActionsBar.classList.remove("active");
  }
}

// Bulk actions
function openBulkStatusModal() {
  if (!selectedTasks.size) return;
  bulkStatusModal.classList.add("active");
}

function closeBulkStatusModal() {
  bulkStatusModal.classList.remove("active");
}

async function handleBulkDelete() {
  if (!selectedTasks.size) return;
  if (!confirm(`Delete ${selectedTasks.size} selected tasks?`)) return;
  for (const id of selectedTasks) {
    const task = allTasks.find((t) => t.id === id);
    if (!task) continue;
    await fetch(`${API_BASE}/boards/${task.boardId}/tasks/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
  }
  clearTaskSelection();
  await fetchTasks();
}

async function handleBulkStatusUpdate(newStatus) {
  if (!selectedTasks.size) return;
  for (const id of selectedTasks) {
    const task = allTasks.find((t) => t.id === id);
    if (!task) continue;
    await fetch(`${API_BASE}/boards/${task.boardId}/tasks/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: newStatus }),
    });
  }
  clearTaskSelection();
  await fetchTasks();
}
document
  .getElementById("bulkStatusForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();
    const newStatus = document.getElementById("bulkStatusSelect").value;
    handleBulkStatusUpdate(newStatus);
  });
closeBulkStatusModal();

// Initial view setup
toggleView("table");
// Fetch tasks for the initial board
if (boardId) fetchTasks();
// End of tasks.js
