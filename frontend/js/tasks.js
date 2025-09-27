// DOM Elements
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");
const mobileMenuToggle = document.getElementById("mobileMenuToggle");
const logoutBtn = document.getElementById("logoutBtn");
const userEmail = document.getElementById("userEmail");
const boardTitle = document.getElementById("boardTitle");

// Task elements
const tasksTableBody = document.getElementById("tasksTableBody");
const tasksCardsContainer = document.getElementById("tasksCardsContainer");
const addTaskBtn = document.getElementById("addTaskBtn");
const emptyStateAddBtn = document.getElementById("emptyStateAddBtn");
const emptyState = document.getElementById("emptyState");
const tasksTableContainer = document.getElementById("tasksTableContainer");

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

// Filter elements
const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");
const priorityFilter = document.getElementById("priorityFilter");

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
const bulkStatusModalClose = document.getElementById("bulkStatusModalClose");
const bulkStatusCancel = document.getElementById("bulkStatusCancel");
const bulkStatusForm = document.getElementById("bulkStatusForm");

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
let filteredTasks = [];
let selectedTasks = new Set();
let currentView = "table";
let currentBoardId = null;
let currentBoardName = "";

// API Base URL
const API_BASE = "https://taskmanager-tj4l.onrender.com";

// Initialize application
document.addEventListener("DOMContentLoaded", async () => {
  console.log("Application starting...");

  if (!token) {
    alert("No authentication token found. Please login.");
    window.location.href = "index.html";
    return;
  }

  // Get board ID from URL - this is required now
  const urlParams = new URLSearchParams(window.location.search);
  const boardIdFromUrl = urlParams.get("boardId");

  if (!boardIdFromUrl) {
    alert("No board selected. Redirecting to boards page.");
    window.location.href = "board.html";
    return;
  }

  currentBoardId = parseInt(boardIdFromUrl);
  console.log("Working with board ID:", currentBoardId);

  await initializeApp();
});

// Initialize app
async function initializeApp() {
  try {
    showLoading();

    console.log("Fetching user...");
    await fetchUser();

    console.log("Fetching board info...");
    await fetchBoardInfo();

    console.log("Fetching tasks for board:", currentBoardId);
    await fetchTasks();

    setupEventListeners();
    hideLoading();

    console.log("App initialization complete");
  } catch (error) {
    console.error("Failed to initialize app:", error);
    hideLoading();
    showError("Failed to load application data: " + error.message);
  }
}

// Show loading state
function showLoading() {
  let loadingOverlay = document.getElementById("loadingOverlay");
  if (loadingOverlay) return; // Already showing

  loadingOverlay = document.createElement("div");
  loadingOverlay.className = "loading-overlay";
  loadingOverlay.id = "loadingOverlay";
  loadingOverlay.innerHTML = `
    <div class="loading-spinner"></div>
    <span>Loading tasks...</span>
  `;
  document.body.appendChild(loadingOverlay);
}

// Hide loading state
function hideLoading() {
  const loadingOverlay = document.getElementById("loadingOverlay");
  if (loadingOverlay) loadingOverlay.remove();
}

// Show error
function showError(message) {
  console.error("Error:", message);
  const errorDiv = document.createElement("div");
  errorDiv.className = "error-message";
  errorDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #e74c3c;
    color: white;
    padding: 1rem;
    border-radius: 0.5rem;
    z-index: 3000;
    box-shadow: 0 4px 10px rgba(0,0,0,0.3);
    max-width: 300px;
  `;
  errorDiv.innerHTML = `
    <i class="fas fa-exclamation-circle"></i> ${message} 
    <button onclick="this.parentElement.remove()" 
      style="background:none;border:none;color:white;margin-left:1rem;cursor:pointer;">
      <i class="fas fa-times"></i>
    </button>
  `;
  document.body.appendChild(errorDiv);
  setTimeout(() => errorDiv.remove(), 8000);
}

// Show success message
function showSuccess(message) {
  console.log("Success:", message);
  const successDiv = document.createElement("div");
  successDiv.className = "success-message";
  successDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #27ae60;
    color: white;
    padding: 1rem;
    border-radius: 0.5rem;
    z-index: 3000;
    box-shadow: 0 4px 10px rgba(0,0,0,0.3);
  `;
  successDiv.innerHTML = `
    <i class="fas fa-check-circle"></i> ${message} 
    <button onclick="this.parentElement.remove()" 
      style="background:none;border:none;color:white;margin-left:1rem;cursor:pointer;">
      <i class="fas fa-times"></i>
    </button>
  `;
  document.body.appendChild(successDiv);
  setTimeout(() => successDiv.remove(), 3000);
}

// Setup event listeners
function setupEventListeners() {
  // Basic navigation
  mobileMenuToggle?.addEventListener("click", toggleSidebar);
  overlay?.addEventListener("click", closeSidebar);
  logoutBtn?.addEventListener("click", logout);

  // Task actions
  addTaskBtn?.addEventListener("click", openAddTaskModal);
  emptyStateAddBtn?.addEventListener("click", openAddTaskModal);

  // Modal controls
  taskModalClose?.addEventListener("click", closeTaskModal);
  taskModalCancel?.addEventListener("click", closeTaskModal);
  taskForm?.addEventListener("submit", handleTaskSubmit);

  // Bulk status modal
  bulkStatusModalClose?.addEventListener("click", closeBulkStatusModal);
  bulkStatusCancel?.addEventListener("click", closeBulkStatusModal);
  bulkStatusForm?.addEventListener("submit", handleBulkStatusSubmit);

  // Filters
  searchInput?.addEventListener("input", debounce(handleSearch, 300));
  statusFilter?.addEventListener("change", handleFilterChange);
  priorityFilter?.addEventListener("change", handleFilterChange);

  // View toggle
  viewToggleBtns.forEach((btn) =>
    btn.addEventListener("click", () => toggleView(btn.dataset.view))
  );

  // Bulk actions
  selectAllCheckbox?.addEventListener("change", handleSelectAll);
  clearSelection?.addEventListener("click", clearTaskSelection);
  bulkStatusUpdate?.addEventListener("click", openBulkStatusModal);
  bulkDelete?.addEventListener("click", handleBulkDelete);

  // Modal click outside to close
  taskModal?.addEventListener("click", (e) => {
    if (e.target === taskModal) closeTaskModal();
  });

  bulkStatusModal?.addEventListener("click", (e) => {
    if (e.target === bulkStatusModal) closeBulkStatusModal();
  });

  // Keyboard shortcuts
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
        searchInput?.focus();
        break;
    }
  }
  if (e.key === "Escape") {
    closeAllModals();
  }
}

// Sidebar functions
function toggleSidebar() {
  sidebar?.classList.toggle("active");
  overlay?.classList.toggle("active");
}

function closeSidebar() {
  sidebar?.classList.remove("active");
  overlay?.classList.remove("active");
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
    console.error("Failed to parse JWT:", e);
    return null;
  }
}

// Fetch user
async function fetchUser() {
  try {
    const response = await fetch(`${API_BASE}/users/${payload.user_id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to fetch user`);
    }

    const data = await response.json();
    console.log("User data:", data);

    if (userEmail) {
      userEmail.textContent = `Welcome, ${
        data.name || data.username || data.email || "User"
      }`;
    }
  } catch (error) {
    console.error("Error fetching user:", error);
    showError("Unable to fetch user info");
  }
}

// Fetch board info to get board name
async function fetchBoardInfo() {
  try {
    const response = await fetch(`${API_BASE}/boards/${currentBoardId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to fetch board info`);
    }

    const boardData = await response.json();
    console.log("Board data:", boardData);

    currentBoardName = boardData.name || `Board ${currentBoardId}`;

    // Update the page title
    if (boardTitle) {
      boardTitle.textContent = `${currentBoardName} - Tasks`;
    }
  } catch (error) {
    console.error("Error fetching board info:", error);
    currentBoardName = `Board ${currentBoardId}`;
    if (boardTitle) {
      boardTitle.textContent = `${currentBoardName} - Tasks`;
    }
  }
}

// Fetch tasks for the current board
async function fetchTasks() {
  try {
    const url = `${API_BASE}/boards/${currentBoardId}/tasks`;
    console.log("Fetching from URL:", url);

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log("Tasks response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Tasks fetch error:", errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const tasks = await response.json();
    console.log("Raw tasks data:", tasks);

    // Process tasks - no need for board info since we're on a specific board
    allTasks = Array.isArray(tasks) ? tasks : [];
    console.log("Processed tasks:", allTasks);

    filteredTasks = [...allTasks];
    renderTasks();
  } catch (error) {
    console.error("Error fetching tasks:", error);
    showError("Unable to fetch tasks: " + error.message);
    allTasks = [];
    filteredTasks = [];
    renderTasks();
  }
}

// Format date for display
function formatDate(dateString) {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  } catch (error) {
    console.error("Date formatting error:", error);
    return "";
  }
}

// Format date for input
function formatDateForInput(dateString) {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  } catch (error) {
    console.error("Date formatting error:", error);
    return "";
  }
}

// Render tasks
function renderTasks() {
  console.log("Rendering tasks:", filteredTasks);
  renderTasksTable();
  renderTasksCards();
  updateStats();
  toggleEmptyState();
  updateBulkActionsVisibility();
}

// Render tasks table (removed board column)
function renderTasksTable() {
  if (!tasksTableBody) return;

  tasksTableBody.innerHTML = "";

  filteredTasks.forEach((task) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>
        <input type="checkbox" class="task-checkbox" data-id="${task.id}" />
      </td>
      <td>
        <div class="task-info">
          <div class="task-title">${task.title || "Untitled Task"}</div>
          <div class="task-description">${
            task.description || "No description"
          }</div>
        </div>
      </td>
      <td>
        <span class="status-badge status-${(task.status || "To Do")
          .replace(/\s+/g, "-")
          .toLowerCase()}">
          ${task.status || "To Do"}
        </span>
      </td>
      <td>
        <span class="priority-badge priority-${(
          task.priority || "none"
        ).toLowerCase()}">
          ${task.priority || "None"}
        </span>
      </td>
      <td>
        <span class="due-date">${formatDate(task.due_date)}</span>
      </td>
      <td>
        <div class="table-actions">
          <button class="action-btn-sm action-btn-edit" data-id="${task.id}">
            <i class="fas fa-edit"></i>
          </button>
          <button class="action-btn-sm action-btn-delete" data-id="${task.id}">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </td>
    `;
    tasksTableBody.appendChild(tr);
  });

  // Add event listeners for checkboxes and buttons
  document
    .querySelectorAll(".task-checkbox")
    .forEach((cb) => cb.addEventListener("change", handleTaskSelection));
  document.querySelectorAll(".action-btn-edit").forEach((btn) =>
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      openEditTaskModal(btn.dataset.id);
    })
  );
  document.querySelectorAll(".action-btn-delete").forEach((btn) =>
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      handleDeleteTask(btn.dataset.id);
    })
  );
}

// Render mobile cards (removed board info)
function renderTasksCards() {
  if (!tasksCardsContainer) return;

  tasksCardsContainer.innerHTML = "";

  filteredTasks.forEach((task) => {
    const card = document.createElement("div");
    card.className = "task-mobile-card";
    card.dataset.id = task.id;

    card.innerHTML = `
      <div class="card-header">
        <h4 class="card-title">${task.title || "Untitled Task"}</h4>
        <input type="checkbox" class="card-checkbox task-checkbox" data-id="${
          task.id
        }" />
      </div>
      <div class="card-description">${
        task.description || "No description"
      }</div>
      <div class="card-body">
        <div class="card-row">
          <span class="card-label">Status:</span>
          <span class="status-badge status-${(task.status || "To Do")
            .replace(/\s+/g, "-")
            .toLowerCase()}">
            ${task.status || "To Do"}
          </span>
        </div>
        <div class="card-row">
          <span class="card-label">Priority:</span>
          <span class="priority-badge priority-${(
            task.priority || "none"
          ).toLowerCase()}">
            ${task.priority || "None"}
          </span>
        </div>
        <div class="card-row">
          <span class="card-label">Due Date:</span>
          <span class="due-date">${formatDate(task.due_date)}</span>
        </div>
      </div>
      <div class="card-footer">
        <div class="card-actions">
          <button class="action-btn-sm action-btn-edit" data-id="${task.id}">
            <i class="fas fa-edit"></i> Edit
          </button>
          <button class="action-btn-sm action-btn-delete" data-id="${task.id}">
            <i class="fas fa-trash"></i> Delete
          </button>
        </div>
      </div>
    `;

    tasksCardsContainer.appendChild(card);
  });

  // Add event listeners for mobile cards
  document
    .querySelectorAll(".card-checkbox")
    .forEach((cb) => cb.addEventListener("change", handleTaskSelection));
  document.querySelectorAll(".action-btn-edit").forEach((btn) =>
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      openEditTaskModal(btn.dataset.id);
    })
  );
  document.querySelectorAll(".action-btn-delete").forEach((btn) =>
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      handleDeleteTask(btn.dataset.id);
    })
  );
}

// Update statistics
function updateStats() {
  const total = allTasks.length;
  const pending = allTasks.filter((t) => t.status === "To Do").length;
  const inProgress = allTasks.filter((t) => t.status === "In Progress").length;
  const completed = allTasks.filter((t) => t.status === "Done").length;

  if (totalTasks) totalTasks.textContent = total;
  if (pendingTasks) pendingTasks.textContent = pending;
  if (inProgressTasks) inProgressTasks.textContent = inProgress;
  if (completedTasks) completedTasks.textContent = completed;
}

// Toggle empty state
function toggleEmptyState() {
  if (!emptyState) return;

  const hasNoTasks = filteredTasks.length === 0;
  const hasNoResults = allTasks.length > 0 && filteredTasks.length === 0;

  if (hasNoTasks) {
    emptyState.style.display = "block";
    emptyState.querySelector("h3").textContent = hasNoResults
      ? "No tasks match your filters"
      : "No tasks found";
    emptyState.querySelector("p").textContent = hasNoResults
      ? "Try adjusting your search or filters"
      : "Create your first task to get started";
  } else {
    emptyState.style.display = "none";
  }

  if (tasksTableContainer) {
    tasksTableContainer.style.display = hasNoTasks ? "none" : "block";
  }
}

// Debounce utility
function debounce(fn, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

// Filter handlers - simplified without board filtering
function handleSearch() {
  applyFilters();
}

function handleFilterChange() {
  applyFilters();
}

// Apply filters - removed board filtering
function applyFilters() {
  const search = searchInput?.value.toLowerCase() || "";
  const status = statusFilter?.value || "";
  const priority = priorityFilter?.value || "";

  console.log("Applying filters:", { search, status, priority });

  filteredTasks = allTasks.filter((task) => {
    const matchesSearch =
      !search ||
      (task.title && task.title.toLowerCase().includes(search)) ||
      (task.description && task.description.toLowerCase().includes(search));

    const matchesStatus = !status || task.status === status;
    const matchesPriority = !priority || task.priority === priority;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  console.log(
    `Filtered ${allTasks.length} tasks to ${filteredTasks.length} results`
  );
  renderTasks();
}

// View toggle
function toggleView(view) {
  currentView = view;

  // Update button states
  viewToggleBtns.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.view === view);
  });

  // Show/hide appropriate view
  if (desktopTable) {
    desktopTable.style.display = view === "table" ? "block" : "none";
  }
  if (mobileCards) {
    mobileCards.style.display = view === "cards" ? "block" : "none";
  }
}

// Task modal functions - simplified without board selection
function openAddTaskModal() {
  console.log("Opening add task modal");
  editingTaskId = null;
  if (taskModalTitle) taskModalTitle.textContent = "Add Task";
  if (taskForm) taskForm.reset();
  if (taskModal) taskModal.classList.add("show");
}

function openEditTaskModal(id) {
  console.log("Opening edit task modal for ID:", id);
  const task = allTasks.find((t) => t.id == id);
  if (!task) {
    console.error("Task not found for ID:", id);
    showError("Task not found");
    return;
  }

  console.log("Editing task:", task);
  editingTaskId = id;
  if (taskModalTitle) taskModalTitle.textContent = "Edit Task";

  if (taskTitleInput) taskTitleInput.value = task.title || "";
  if (taskDescInput) taskDescInput.value = task.description || "";
  if (taskStatusInput) taskStatusInput.value = task.status || "To Do";
  if (taskPriorityInput) taskPriorityInput.value = task.priority || "";
  if (taskDueDateInput)
    taskDueDateInput.value = formatDateForInput(task.due_date) || "";

  if (taskModal) taskModal.classList.add("show");
}

function closeTaskModal() {
  if (taskModal) taskModal.classList.remove("show");
  editingTaskId = null;
}

function closeAllModals() {
  closeTaskModal();
  closeBulkStatusModal();
}

// Task form submission - simplified without board selection
async function handleTaskSubmit(e) {
  e.preventDefault();
  console.log("Handling task submit");

  if (!taskTitleInput?.value.trim()) {
    showError("Task title is required");
    return;
  }

  const taskData = {
    title: taskTitleInput.value.trim(),
    description: taskDescInput?.value.trim() || "",
    status: taskStatusInput?.value || "To Do",
    priority: taskPriorityInput?.value || "",
    due_date: taskDueDateInput?.value || null,
  };

  console.log("Task data:", taskData, "Board ID:", currentBoardId);

  try {
    showLoading();

    if (editingTaskId) {
      console.log("Updating existing task:", editingTaskId);
      await updateTask(editingTaskId, taskData);
      showSuccess("Task updated successfully");
    } else {
      console.log("Creating new task");
      await createTask(taskData);
      showSuccess("Task created successfully");
    }

    closeTaskModal();
    await fetchTasks();
    hideLoading();
  } catch (error) {
    console.error("Error saving task:", error);
    hideLoading();
    showError("Failed to save task: " + error.message);
  }
}

// CRUD operations - simplified to always use currentBoardId
async function createTask(data) {
  console.log("Creating task:", data, "for board:", currentBoardId);
  const response = await fetch(`${API_BASE}/boards/${currentBoardId}/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("Create task error:", errorData);
    throw new Error(
      errorData.detail || `HTTP ${response.status}: Failed to create task`
    );
  }

  return await response.json();
}

async function updateTask(id, data) {
  console.log("Updating task:", id, data, "for board:", currentBoardId);
  const response = await fetch(
    `${API_BASE}/boards/${currentBoardId}/tasks/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("Update task error:", errorData);
    throw new Error(
      errorData.detail || `HTTP ${response.status}: Failed to update task`
    );
  }

  return await response.json();
}

async function handleDeleteTask(id) {
  if (!confirm("Are you sure you want to delete this task?")) return;

  const task = allTasks.find((t) => t.id == id);
  if (!task) {
    showError("Task not found");
    return;
  }

  console.log("Deleting task:", id, "from board:", currentBoardId);

  try {
    showLoading();

    const response = await fetch(
      `${API_BASE}/boards/${currentBoardId}/tasks/${id}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Delete task error:", errorData);
      throw new Error(
        errorData.detail || `HTTP ${response.status}: Failed to delete task`
      );
    }

    showSuccess("Task deleted successfully");
    await fetchTasks();
    hideLoading();
  } catch (error) {
    console.error("Error deleting task:", error);
    hideLoading();
    showError("Failed to delete task: " + error.message);
  }
}

// Task selection functions
function handleTaskSelection(e) {
  const id = e.target.dataset.id;
  if (e.target.checked) {
    selectedTasks.add(id);
  } else {
    selectedTasks.delete(id);
  }
  updateBulkActionsVisibility();
  updateSelectAllState();
}

function handleSelectAll(e) {
  selectedTasks.clear();
  const allCheckboxes = document.querySelectorAll(".task-checkbox");

  allCheckboxes.forEach((cb) => {
    cb.checked = e.target.checked;
    if (e.target.checked) {
      selectedTasks.add(cb.dataset.id);
    }
  });

  updateBulkActionsVisibility();
}

function clearTaskSelection() {
  selectedTasks.clear();
  document.querySelectorAll(".task-checkbox").forEach((cb) => {
    cb.checked = false;
  });
  if (selectAllCheckbox) selectAllCheckbox.checked = false;
  updateBulkActionsVisibility();
}

function updateSelectAllState() {
  if (!selectAllCheckbox) return;

  const allCheckboxes = document.querySelectorAll(".task-checkbox");
  const checkedCheckboxes = document.querySelectorAll(".task-checkbox:checked");

  if (checkedCheckboxes.length === 0) {
    selectAllCheckbox.checked = false;
    selectAllCheckbox.indeterminate = false;
  } else if (checkedCheckboxes.length === allCheckboxes.length) {
    selectAllCheckbox.checked = true;
    selectAllCheckbox.indeterminate = false;
  } else {
    selectAllCheckbox.checked = false;
    selectAllCheckbox.indeterminate = true;
  }
}

function updateBulkActionsVisibility() {
  if (!bulkActionsBar || !selectedCount) return;

  const hasSelection = selectedTasks.size > 0;

  if (hasSelection) {
    bulkActionsBar.classList.add("show");
    selectedCount.textContent = selectedTasks.size;
  } else {
    bulkActionsBar.classList.remove("show");
  }
}

// Bulk operations
function openBulkStatusModal() {
  if (selectedTasks.size === 0) {
    showError("No tasks selected");
    return;
  }
  if (bulkStatusModal) bulkStatusModal.classList.add("show");
}

function closeBulkStatusModal() {
  if (bulkStatusModal) bulkStatusModal.classList.remove("show");
}

async function handleBulkStatusSubmit(e) {
  e.preventDefault();

  const bulkStatusSelect = document.getElementById("bulkStatusSelect");
  if (!bulkStatusSelect) return;

  const newStatus = bulkStatusSelect.value;
  if (!newStatus) {
    showError("Please select a status");
    return;
  }

  console.log(
    "Bulk updating status to:",
    newStatus,
    "for tasks:",
    selectedTasks
  );

  try {
    showLoading();

    for (const taskId of selectedTasks) {
      const task = allTasks.find((t) => t.id == taskId);
      if (task) {
        await updateTask(taskId, { ...task, status: newStatus });
      }
    }

    showSuccess(`Updated ${selectedTasks.size} tasks`);
    closeBulkStatusModal();
    clearTaskSelection();
    await fetchTasks();
    hideLoading();
  } catch (error) {
    console.error("Error updating tasks:", error);
    hideLoading();
    showError("Failed to update tasks: " + error.message);
  }
}

async function handleBulkDelete() {
  if (selectedTasks.size === 0) {
    showError("No tasks selected");
    return;
  }

  if (
    !confirm(
      `Are you sure you want to delete ${selectedTasks.size} selected tasks?`
    )
  ) {
    return;
  }

  console.log("Bulk deleting tasks:", selectedTasks);

  try {
    showLoading();

    for (const taskId of selectedTasks) {
      const response = await fetch(
        `${API_BASE}/boards/${currentBoardId}/tasks/${taskId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        console.error(`Failed to delete task ${taskId}`);
      }
    }

    showSuccess(`Deleted ${selectedTasks.size} tasks`);
    clearTaskSelection();
    await fetchTasks();
    hideLoading();
  } catch (error) {
    console.error("Error deleting tasks:", error);
    hideLoading();
    showError("Failed to delete tasks: " + error.message);
  }
}

// Initialize view on load
document.addEventListener("DOMContentLoaded", () => {
  toggleView("table"); // Set default view
});
