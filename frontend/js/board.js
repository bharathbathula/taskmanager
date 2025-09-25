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
let editingBoardId = null;

// Backend API
const API_BASE = "https://taskmanager-tj4l.onrender.com";

// -------------------- Functions -------------------- //

// Show toast
function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// Fetch user info
async function fetchUser() {
  if (!token) return;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const res = await fetch(`${API_BASE}/users/${payload.user_id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    userEmail.textContent = `Welcome, ${data.name || data.email || "User"}`;
  } catch {
    userEmail.textContent = "Welcome, User";
  }
}

// Fetch boards
async function fetchBoards() {
  try {
    const res = await fetch(`${API_BASE}/boards`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    boardsData = await res.json();
    renderBoards(boardsData);
  } catch (e) {
    console.error(e);
    showToast("Failed to fetch boards", "error");
  }
}

// Render boards (table + mobile cards)
function renderBoards(data) {
  // Empty state
  if (data.length === 0) {
    emptyState.style.display = "block";
    boardsTableBody.innerHTML = "";
    boardsMobileCards.innerHTML = "";
    return;
  }
  emptyState.style.display = "none";

  // Desktop Table
  boardsTableBody.innerHTML = "";
  data.forEach((board) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="board-name">${board.title}</td>
      <td class="board-description">${board.description || ""}</td>
      <td class="board-date">${new Date(
        board.createdAt
      ).toLocaleDateString()}</td>
      <td><span class="task-count-badge">${board.tasks?.length || 0}</span></td>
      <td>
        <div class="action-buttons-group">
          <button class="action-btn edit-btn">Edit</button>
          <button class="action-btn delete-btn">Delete</button>
        </div>
      </td>
    `;
    // Row click -> open tasks page
    tr.addEventListener("click", (e) => {
      if (!e.target.closest(".edit-btn") && !e.target.closest(".delete-btn")) {
        window.location.href = `tasks.html?boardId=${board.id}`;
      }
    });
    // Edit button
    tr.querySelector(".edit-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      editingBoardId = board.id;
      boardNameInput.value = board.title;
      boardDescInput.value = board.description || "";
      boardModalTitle.textContent = "Edit Board";
      showModal(boardModal);
    });
    // Delete button
    tr.querySelector(".delete-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      deleteBoard(board);
    });
    boardsTableBody.appendChild(tr);
  });

  // Mobile Cards
  boardsMobileCards.innerHTML = "";
  data.forEach((board) => {
    const card = document.createElement("div");
    card.className = "board-mobile-card";
    card.innerHTML = `
      <div class="card-header">
        <h4 class="card-title">${board.title}</h4>
        <span class="task-count-badge">${board.tasks?.length || 0}</span>
      </div>
      <div class="card-body">
        <p class="card-description">${board.description || ""}</p>
        <div class="card-row">
          <span class="card-label">Created:</span>
          <span class="card-value">${new Date(
            board.createdAt
          ).toLocaleDateString()}</span>
        </div>
      </div>
      <div class="card-actions">
        <button class="action-btn edit-btn">Edit</button>
        <button class="action-btn delete-btn">Delete</button>
      </div>
    `;
    card.querySelector(".edit-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      editingBoardId = board.id;
      boardNameInput.value = board.title;
      boardDescInput.value = board.description || "";
      boardModalTitle.textContent = "Edit Board";
      showModal(boardModal);
    });
    card.querySelector(".delete-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      deleteBoard(board);
    });
    card.addEventListener("click", (e) => {
      if (!e.target.closest(".edit-btn") && !e.target.closest(".delete-btn")) {
        window.location.href = `tasks.html?boardId=${board.id}`;
      }
    });
    boardsMobileCards.appendChild(card);
  });
}

// -------------------- Modals -------------------- //
function showModal(modal) {
  modal.style.display = "flex";
  setTimeout(() => modal.classList.add("show"), 10);
}
function closeModal(modal) {
  modal.classList.remove("show");
  setTimeout(() => (modal.style.display = "none"), 300);
}

boardModalClose.addEventListener("click", () => closeModal(boardModal));
boardModalCancel.addEventListener("click", () => closeModal(boardModal));

// Add/Edit Board
boardModalSave.addEventListener("click", async () => {
  const title = boardNameInput.value.trim();
  const description = boardDescInput.value.trim();
  if (!title || !description)
    return showToast("Title & Description required", "warning");

  try {
    if (editingBoardId) {
      await fetch(`${API_BASE}/boards/${editingBoardId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, description }),
      });
      showToast("Board updated successfully", "success");
    } else {
      await fetch(`${API_BASE}/boards`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, description }),
      });
      showToast("Board created successfully", "success");
    }
    closeModal(boardModal);
    fetchBoards();
  } catch (e) {
    console.error(e);
    showToast("Failed to save board", "error");
  }
});

// Delete Board
async function deleteBoard(board) {
  if (!confirm(`Delete board "${board.title}"? This action cannot be undone.`))
    return;
  try {
    await fetch(`${API_BASE}/boards/${board.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    showToast("Board deleted successfully", "success");
    fetchBoards();
  } catch (e) {
    console.error(e);
    showToast("Failed to delete board", "error");
  }
}

// -------------------- Search -------------------- //
searchInput.addEventListener("input", () => {
  const filtered = boardsData.filter((b) =>
    b.title.toLowerCase().includes(searchInput.value.toLowerCase())
  );
  renderBoards(filtered);
});

// -------------------- Logout -------------------- //
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = "index.html";
});

// -------------------- Mobile Menu -------------------- //
mobileMenuToggle.addEventListener("click", () => {
  sidebar.classList.toggle("active");
  overlay.classList.toggle("active");
});

overlay.addEventListener("click", () => {
  sidebar.classList.remove("active");
  overlay.classList.remove("active");
});

// -------------------- Initialize -------------------- //
fetchUser();
fetchBoards();
