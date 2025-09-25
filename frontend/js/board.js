// DOM Elements
const boardsTableBody = document.getElementById("boardsTableBody");
const boardsMobileCards = document.getElementById("boardsMobileCards");
const addBoardBtn = document.getElementById("addBoardBtn");
const boardModal = document.getElementById("boardModal");
const boardModalClose = document.getElementById("boardModalClose");
const boardModalCancel = document.getElementById("boardModalCancel");
const boardModalSave = document.getElementById("boardModalSave");
const boardModalTitle = document.getElementById("boardModalTitle");
const boardNameInput = document.getElementById("boardNameInput");
const boardDescInput = document.getElementById("boardDescInput");
const emptyState = document.getElementById("emptyState");
const searchInput = document.getElementById("searchInput");
const logoutBtn = document.getElementById("logoutBtn");
const toastContainer = document.getElementById("toastContainer");
const mobileMenuToggle = document.getElementById("mobileMenuToggle");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");
const userEmail = document.getElementById("userEmail");

// JWT token
const token = localStorage.getItem("token");

// State
let boardsData = [];
let filteredBoards = [];
let editingBoardId = null;

// Backend API
const API_BASE = "https://taskmanager-tj4l.onrender.com";

// Initialize app
document.addEventListener("DOMContentLoaded", async () => {
  if (!token) {
    alert("No authentication token found. Please login.");
    window.location.href = "index.html";
    return;
  }

  await initializeApp();
});

async function initializeApp() {
  try {
    showLoading();
    await fetchUser();
    await fetchBoards();
    setupEventListeners();
    hideLoading();
  } catch (error) {
    console.error("Failed to initialize app:", error);
    hideLoading();
    showToast("Failed to load application data", "error");
  }
}

function showLoading() {
  const loadingOverlay = document.createElement("div");
  loadingOverlay.className = "loading-overlay";
  loadingOverlay.id = "loadingOverlay";
  loadingOverlay.innerHTML = `<div class="loading-spinner"></div><span>Loading boards...</span>`;
  loadingOverlay.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.5); display: flex; align-items: center;
    justify-content: center; z-index: 9999; color: white;
  `;
  document.body.appendChild(loadingOverlay);
}

function hideLoading() {
  const loadingOverlay = document.getElementById("loadingOverlay");
  if (loadingOverlay) loadingOverlay.remove();
}

function setupEventListeners() {
  // Modal events
  addBoardBtn.addEventListener("click", openAddBoardModal);
  boardModalClose.addEventListener("click", () => closeModal(boardModal));
  boardModalCancel.addEventListener("click", () => closeModal(boardModal));
  boardModalSave.addEventListener("click", handleBoardSave);

  // Search
  // (Removed duplicate search event listener)

  // Logout
  logoutBtn.addEventListener("click", logout);

  // Mobile menu
  mobileMenuToggle.addEventListener("click", toggleSidebar);
  overlay.addEventListener("click", closeSidebar);

  // Modal click outside to close
  boardModal.addEventListener("click", (e) => {
    if (e.target === boardModal) closeModal(boardModal);
  });

  // Keyboard shortcuts
  document.addEventListener("keydown", handleKeyboardShortcuts);
}

function handleKeyboardShortcuts(e) {
  if (e.ctrlKey || e.metaKey) {
    switch (e.key) {
      case "n":
        e.preventDefault();
        openAddBoardModal();
        break;
      case "f":
        e.preventDefault();
        searchInput.focus();
        break;
      case "Escape":
        closeModal(boardModal);
        break;
    }
  }
}

function toggleSidebar() {
  sidebar.classList.toggle("active");
  overlay.classList.toggle("active");
}

function closeSidebar() {
  sidebar.classList.remove("active");
  overlay.classList.remove("active");
}

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

// Show toast
function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.style.cssText = `
    padding: 1rem; margin-bottom: 0.5rem; border-radius: 0.5rem;
    background: ${
      type === "error" ? "#e74c3c" : type === "success" ? "#27ae60" : "#3498db"
    };
    color: white; animation: slideIn 0.3s ease-out;
  `;
  toast.textContent = message;
  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = "slideOut 0.3s ease-in";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Fetch user info
async function fetchUser() {
  if (!token) return;

  try {
    const payload = parseJwt(token);
    if (!payload) throw new Error("Invalid token");

    const response = await fetch(`${API_BASE}/users/${payload.user_id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error("Failed to fetch user");

    const data = await response.json();
    userEmail.textContent = `Welcome, ${data.name || data.email || "User"}`;
  } catch (error) {
    console.error("Fetch user error:", error);
    userEmail.textContent = "Welcome, User";
  }
}

// Fetch boards
async function fetchBoards() {
  try {
    const response = await fetch(`${API_BASE}/boards`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Fetch boards error:", response.status, errorText);
      throw new Error(`Failed to fetch boards: ${response.status}`);
    }

    boardsData = await response.json();

    // Add task count to each board (if not provided by backend)
    boardsData = boardsData.map((board) => ({
      ...board,
      taskCount: Array.isArray(board.tasks)
        ? board.tasks.length
        : board.taskCount || 0,
    }));

    filteredBoards = [...boardsData];

    renderBoards(filteredBoards);
  } catch (error) {
    console.error("Fetch boards error:", error);
    showToast("Failed to fetch boards", "error");
    renderBoards([]); // Show empty state
  }
}

// Render boards (table + mobile cards)
function renderBoards(data) {
  // Empty state
  if (data.length === 0) {
    emptyState.style.display = "block";
    document.querySelector(".desktop-table").style.display = "none";
    boardsMobileCards.style.display = "none";
    return;
  }

  emptyState.style.display = "none";
  document.querySelector(".desktop-table").style.display = "block";
  boardsMobileCards.style.display = "block";

  // Clear previous boards to avoid duplicates
  boardsTableBody.innerHTML = "";
  boardsMobileCards.innerHTML = "";

  // Desktop Table
  data.forEach((board) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="board-name">${escapeHtml(board.title)}</td>
      <td class="board-description">${escapeHtml(board.description || "")}</td>
      <td class="board-date">${formatDate(board.created_at)}</td>
      <td><span class="task-count-badge">${board.taskCount}</span></td>
      <td>
        <div class="action-buttons-group">
          <button class="action-btn edit-btn" title="Edit Board">
            <i class="fas fa-edit"></i> Edit
          </button>
          <button class="action-btn delete-btn" title="Delete Board">
            <i class="fas fa-trash"></i> Delete
          </button>
        </div>
      </td>
    `;

    // Row click -> open tasks page (but not when clicking action buttons)
    tr.addEventListener("click", (e) => {
      if (!e.target.closest(".action-btn")) {
        window.location.href = `tasks.html?boardId=${board.id}`;
      }
    });

    // Edit button
    const editBtn = tr.querySelector(".edit-btn");
    editBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      openEditBoardModal(board);
    });

    // Delete button
    const deleteBtn = tr.querySelector(".delete-btn");
    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      handleDeleteBoard(board);
    });

    boardsTableBody.appendChild(tr);
  });

  // Mobile Cards
  data.forEach((board) => {
    const card = document.createElement("div");
    card.className = "board-mobile-card";
    card.innerHTML = `
      <div class="card-header">
        <h4 class="card-title">${escapeHtml(board.title)}</h4>
        <span class="task-count-badge">${board.taskCount}</span>
      </div>
      <div class="card-body">
        <p class="card-description">${escapeHtml(board.description || "")}</p>
        <div class="card-row">
          <span class="card-label">Created:</span>
          <span class="card-value">${formatDate(board.created_at)}</span>
        </div>
      </div>
      <div class="card-actions">
        <button class="action-btn edit-btn">
          <i class="fas fa-edit"></i> Edit
        </button>
        <button class="action-btn delete-btn">
          <i class="fas fa-trash"></i> Delete
        </button>
      </div>
    `;

    // Edit button
    const editBtn = card.querySelector(".edit-btn");
    editBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      openEditBoardModal(board);
    });

    // Delete button
    const deleteBtn = card.querySelector(".delete-btn");
    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      handleDeleteBoard(board);
    });

    // Card click -> open tasks page (but not when clicking action buttons)
    card.addEventListener("click", (e) => {
      if (!e.target.closest(".action-btn")) {
        window.location.href = `tasks.html?boardId=${board.id}`;
      }
    });

    boardsMobileCards.appendChild(card);
  });
}
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function formatDate(dateString) {
  try {
    return new Date(dateString).toLocaleDateString();
  } catch {
    return "Invalid Date";
  }
}

// -------------------- Modals -------------------- //
function showModal(modal) {
  modal.style.display = "flex";
  setTimeout(() => modal.classList.add("show"), 10);

  // Focus on first input
  const firstInput = modal.querySelector("input, textarea");
  if (firstInput) {
    setTimeout(() => firstInput.focus(), 100);
  }
}

function closeModal(modal) {
  modal.classList.remove("show");
  setTimeout(() => {
    modal.style.display = "none";
    // Reset form
    if (modal === boardModal) {
      resetBoardForm();
    }
  }, 300);
}

function openAddBoardModal() {
  editingBoardId = null;
  boardModalTitle.textContent = "Add Board";
  resetBoardForm();
  showModal(boardModal);
}

function openEditBoardModal(board) {
  editingBoardId = board.id;
  boardModalTitle.textContent = "Edit Board";
  boardNameInput.value = board.title;
  boardDescInput.value = board.description || "";
  showModal(boardModal);
}

function resetBoardForm() {
  boardNameInput.value = "";
  boardDescInput.value = "";
  clearFieldErrors();
}

function clearFieldErrors() {
  const errorElements = document.querySelectorAll(".field-error");
  errorElements.forEach((el) => (el.textContent = ""));
}

function validateBoardForm() {
  clearFieldErrors();
  let isValid = true;

  const title = boardNameInput.value.trim();
  const description = boardDescInput.value.trim();

  if (!title) {
    document.getElementById("nameError").textContent = "Board name is required";
    isValid = false;
  } else if (title.length < 3) {
    document.getElementById("nameError").textContent =
      "Board name must be at least 3 characters";
    isValid = false;
  }

  if (!description) {
    document.getElementById("descError").textContent =
      "Description is required";
    isValid = false;
  } else if (description.length < 10) {
    document.getElementById("descError").textContent =
      "Description must be at least 10 characters";
    isValid = false;
  }

  return isValid;
}

// Add/Edit Board
async function handleBoardSave() {
  if (!validateBoardForm()) return;

  const title = boardNameInput.value.trim();
  const description = boardDescInput.value.trim();

  const boardData = { title, description };

  try {
    boardModalSave.disabled = true;
    boardModalSave.innerHTML =
      '<i class="fas fa-spinner fa-spin"></i> Saving...';

    let response;

    if (editingBoardId) {
      // Update existing board
      response = await fetch(`${API_BASE}/boards/${editingBoardId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(boardData),
      });
    } else {
      // Create new board
      response = await fetch(`${API_BASE}/boards`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(boardData),
      });
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Save board error:", response.status, errorText);
      throw new Error(`Failed to save board: ${response.status}`);
    }

    const savedBoard = await response.json();

    showToast(
      editingBoardId
        ? "Board updated successfully"
        : "Board created successfully",
      "success"
    );

    closeModal(boardModal);
    await fetchBoards(); // Refresh the list
  } catch (error) {
    console.error("Save board error:", error);
    showToast("Failed to save board", "error");
  } finally {
    boardModalSave.disabled = false;
    boardModalSave.innerHTML =
      '<i class="fas fa-save"></i> <span>Save Board</span>';
  }
}

// Delete Board
async function handleDeleteBoard(board) {
  const confirmMessage = `Delete board "${board.title}"?\n\nThis action cannot be undone and will delete all tasks in this board.`;

  if (!confirm(confirmMessage)) return;

  try {
    const response = await fetch(`${API_BASE}/boards/${board.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Delete board error:", response.status, errorText);
      throw new Error(`Failed to delete board: ${response.status}`);
    }

    showToast("Board deleted successfully", "success");
    await fetchBoards(); // Refresh the list
  } catch (error) {
    console.error("Delete board error:", error);
    showToast("Failed to delete board", "error");
  }
}

// -------------------- Search -------------------- //
function handleSearch() {
  const searchTerm = searchInput.value.toLowerCase();

  if (!searchTerm) {
    filteredBoards = [...boardsData];
  } else {
    filteredBoards = boardsData.filter(
      (board) =>
        board.title.toLowerCase().includes(searchTerm) ||
        (board.description &&
          board.description.toLowerCase().includes(searchTerm))
    );
  }

  renderBoards(filteredBoards);
}

// Debounce search for better performance
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Use debounced search
searchInput.addEventListener("input", debounce(handleSearch, 300));
