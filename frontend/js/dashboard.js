// -------------------- Authentication & Initial Setup --------------------
const token = localStorage.getItem("token");
if (!token) window.location.href = "/";

// DOM Elements
const boardsTableBody = document.getElementById("boardsTableBody");
const boardsMobileCards = document.getElementById("boardsMobileCards");
const tasksTableBody = document.getElementById("tasksTableBody");
const tasksMobileCards = document.getElementById("tasksMobileCards");
const tasksSection = document.getElementById("tasksSection");
const selectedBoardName = document.getElementById("selectedBoardName");
const closeTasksBtn = document.getElementById("closeTasksBtn");
const logoutBtn = document.getElementById("logoutBtn");
const userEmail = document.getElementById("userEmail");
const mobileMenuToggle = document.getElementById("mobileMenuToggle");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");

// Stats elements
const totalBoards = document.getElementById("totalBoards");
const totalTasks = document.getElementById("totalTasks");
const pendingTasks = document.getElementById("pendingTasks");
const completedTasks = document.getElementById("completedTasks");

// Global variables
let allBoards = [];
let allTasks = [];
let currentBoardId = null;

// -------------------- Utility Functions --------------------
function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch (e) {
    return null;
  }
}

function formatDate(dateString) {
  if (!dateString) return "Not set";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getStatusBadgeClass(status) {
  if (!status) return "status-pending";
  switch (status.toLowerCase()) {
    case "completed":
    case "done":
      return "status-completed";
    case "in progress":
    case "in-progress":
    case "doing":
      return "status-in-progress";
    default:
      return "status-pending";
  }
}

function getPriorityBadgeClass(priority) {
  if (!priority) return "priority-low";
  switch (priority.toLowerCase()) {
    case "high":
    case "urgent":
      return "priority-high";
    case "medium":
    case "normal":
      return "priority-medium";
    default:
      return "priority-low";
  }
}

function animateNumber(element, targetNumber, duration = 1000) {
  const startNumber = 0;
  const startTime = performance.now();

  function updateNumber(currentTime) {
    const elapsedTime = currentTime - startTime;
    const progress = Math.min(elapsedTime / duration, 1);

    // Easing function for smooth animation
    const easeOutCubic = 1 - Math.pow(1 - progress, 3);
    const currentNumber = Math.round(
      startNumber + (targetNumber - startNumber) * easeOutCubic
    );

    element.textContent = currentNumber;

    if (progress < 1) {
      requestAnimationFrame(updateNumber);
    }
  }

  requestAnimationFrame(updateNumber);
}

// -------------------- Mobile Menu Functionality --------------------
mobileMenuToggle.addEventListener("click", () => {
  sidebar.classList.toggle("active");
  overlay.classList.toggle("active");
});

overlay.addEventListener("click", () => {
  sidebar.classList.remove("active");
  overlay.classList.remove("active");
});

// Close mobile menu when clicking nav items
document.querySelectorAll(".nav-item").forEach((item) => {
  item.addEventListener("click", () => {
    sidebar.classList.remove("active");
    overlay.classList.remove("active");
  });
});

// -------------------- Authentication Functions --------------------
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = "/";
});

async function fetchUser() {
  const payload = parseJwt(token);
  if (!payload?.user_id) return;

  try {
    const res = await fetch(
      `https://taskmanager-tj4l.onrender.com/users/${payload.user_id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (res.ok) {
      const data = await res.json();
      userEmail.textContent = `Welcome, ${
        data.name || data.username || data.email || "User"
      }`;
    } else {
      userEmail.textContent = "Welcome, User";
    }
  } catch (err) {
    console.error("Error fetching user:", err);
    userEmail.textContent = "Welcome, User";
  }
}

// -------------------- Data Fetching Functions --------------------
async function fetchBoards() {
  try {
    showBoardsLoading();

    const res = await fetch("https://taskmanager-tj4l.onrender.com/boards", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    allBoards = await res.json();

    if (!allBoards || allBoards.length === 0) {
      showNoBoardsMessage();
      updateStats();
      return;
    }

    // Fetch task counts for each board
    await Promise.all(
      allBoards.map(async (board) => {
        try {
          const tasksRes = await fetch(
            `https://taskmanager-tj4l.onrender.com/boards/${board.id}/tasks`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (tasksRes.ok) {
            const tasks = await tasksRes.json();
            board.taskCount = tasks.length || 0;
            board.tasks = tasks;
          } else {
            board.taskCount = 0;
            board.tasks = [];
          }
        } catch (err) {
          console.error(`Error fetching tasks for board ${board.id}:`, err);
          board.taskCount = 0;
          board.tasks = [];
        }
      })
    );

    renderBoards();
    updateStats();
  } catch (err) {
    console.error("Error fetching boards:", err);
    showBoardsError();
  }
}

async function fetchTasks(boardId, boardName) {
  try {
    currentBoardId = boardId;
    selectedBoardName.textContent = boardName;

    showTasksLoading();

    const res = await fetch(
      `https://taskmanager-tj4l.onrender.com/boards/${boardId}/tasks`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const tasks = await res.json();

    if (!tasks || tasks.length === 0) {
      showNoTasksMessage();
    } else {
      renderTasks(tasks);
    }

    // Show tasks section with animation
    tasksSection.style.display = "block";
    setTimeout(() => {
      tasksSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  } catch (err) {
    console.error("Error fetching tasks:", err);
    showTasksError();
  }
}

// -------------------- Rendering Functions --------------------
function renderBoards() {
  // Desktop table
  boardsTableBody.innerHTML = allBoards
    .map(
      (board) => `
        <tr onclick="fetchTasks(${board.id}, '${board.title}')" tabindex="0" 
            onkeydown="handleBoardKeydown(event, ${board.id}, '${board.title}')"
            role="button" aria-label="View tasks for ${board.title}">
          <td class="board-name">${board.title}</td>
          <td>${formatDate(board.created_at)}</td>
          <td>
            <span class="task-count">${board.taskCount}</span>
          </td>
          <td>
            <button class="action-btn" onclick="event.stopPropagation(); fetchTasks(${
              board.id
            }, '${board.title}')">
              View Tasks
            </button>
          </td>
        </tr>
      `
    )
    .join("");

  // Mobile cards
  boardsMobileCards.innerHTML = allBoards
    .map(
      (board) => `
        <div class="board-mobile-card" onclick="fetchTasks(${board.id}, '${
        board.title
      }')" 
             tabindex="0" onkeydown="handleBoardKeydown(event, ${board.id}, '${
        board.title
      }')"
             role="button" aria-label="View tasks for ${board.title}">
          <div class="card-header">
            <h4 class="card-title">${board.title}</h4>
            <span class="task-count">${board.taskCount}</span>
          </div>
          <div class="card-body">
            <div class="card-row">
              <span class="card-label">Created Date:</span>
              <span class="card-value">${formatDate(board.created_at)}</span>
            </div>
            <div class="card-row">
              <span class="card-label">Tasks:</span>
              <span class="card-value">${board.taskCount} tasks</span>
            </div>
            ${
              board.description
                ? `
              <div class="card-row">
                <span class="card-label">Description:</span>
                <span class="card-value">${board.description}</span>
              </div>
            `
                : ""
            }
          </div>
        </div>
      `
    )
    .join("");
}

function renderTasks(tasks) {
  // Desktop table
  tasksTableBody.innerHTML = tasks
    .map(
      (task) => `
        <tr tabindex="0" role="row" aria-label="Task: ${task.title}">
          <td>${task.title}</td>
          <td>
            <span class="status-badge ${getStatusBadgeClass(task.status)}">
              ${task.status || "Pending"}
            </span>
          </td>
          <td>${formatDate(task.due_date)}</td>
          <td>
            <span class="priority-badge ${getPriorityBadgeClass(
              task.priority
            )}">
              ${task.priority || "Low"}
            </span>
          </td>
        </tr>
      `
    )
    .join("");

  // Mobile cards
  tasksMobileCards.innerHTML = tasks
    .map(
      (task) => `
        <div class="task-mobile-card" tabindex="0" role="button" aria-label="Task: ${
          task.title
        }">
          <div class="card-header">
            <h4 class="card-title">${task.title}</h4>
            <span class="status-badge ${getStatusBadgeClass(task.status)}">
              ${task.status || "Pending"}
            </span>
          </div>
          <div class="card-body">
            <div class="card-row">
              <span class="card-label">Due Date:</span>
              <span class="card-value">${formatDate(task.due_date)}</span>
            </div>
            <div class="card-row">
              <span class="card-label">Priority:</span>
              <span class="priority-badge ${getPriorityBadgeClass(
                task.priority
              )}">
                ${task.priority || "Low"}
              </span>
            </div>
            ${
              task.description
                ? `
              <div class="card-row">
                <span class="card-label">Description:</span>
                <span class="card-value">${task.description}</span>
              </div>
            `
                : ""
            }
          </div>
        </div>
      `
    )
    .join("");
}

// -------------------- Loading and Error States --------------------
function showBoardsLoading() {
  boardsTableBody.innerHTML = `
    <tr>
      <td colspan="4" class="loading-cell">
        <div class="loading-spinner"></div>
        Loading boards...
      </td>
    </tr>
  `;

  boardsMobileCards.innerHTML = `
    <div class="loading-card">
      <div class="loading-spinner"></div>
      <p>Loading boards...</p>
    </div>
  `;
}

function showTasksLoading() {
  tasksTableBody.innerHTML = `
    <tr>
      <td colspan="4" class="loading-cell">
        <div class="loading-spinner"></div>
        Loading tasks...
      </td>
    </tr>
  `;

  tasksMobileCards.innerHTML = `
    <div class="loading-card">
      <div class="loading-spinner"></div>
      <p>Loading tasks...</p>
    </div>
  `;
}

function showNoBoardsMessage() {
  boardsTableBody.innerHTML = `
    <tr>
      <td colspan="4" class="loading-cell">
        <i class="fas fa-clipboard-list" style="font-size: 2rem; margin-bottom: 1rem; color: var(--text-light);"></i>
        <p>No boards found. Create your first board to get started!</p>
      </td>
    </tr>
  `;

  boardsMobileCards.innerHTML = `
    <div class="loading-card">
      <i class="fas fa-clipboard-list" style="font-size: 2rem; margin-bottom: 1rem; color: var(--text-light);"></i>
      <p>No boards found. Create your first board to get started!</p>
    </div>
  `;
}

function showNoTasksMessage() {
  tasksTableBody.innerHTML = `
    <tr>
      <td colspan="4" class="loading-cell">
        <i class="fas fa-tasks" style="font-size: 2rem; margin-bottom: 1rem; color: var(--text-light);"></i>
        <p>No tasks found in this board yet.</p>
      </td>
    </tr>
  `;

  tasksMobileCards.innerHTML = `
    <div class="loading-card">
      <i class="fas fa-tasks" style="font-size: 2rem; margin-bottom: 1rem; color: var(--text-light);"></i>
      <p>No tasks found in this board yet.</p>
    </div>
  `;
}

function showBoardsError() {
  boardsTableBody.innerHTML = `
    <tr>
      <td colspan="4" class="loading-cell">
        <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem; color: var(--error);"></i>
        <p>Failed to load boards. Please try refreshing the page.</p>
      </td>
    </tr>
  `;

  boardsMobileCards.innerHTML = `
    <div class="loading-card">
      <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem; color: var(--error);"></i>
      <p>Failed to load boards. Please try refreshing the page.</p>
    </div>
  `;
}

function showTasksError() {
  tasksTableBody.innerHTML = `
    <tr>
      <td colspan="4" class="loading-cell">
        <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem; color: var(--error);"></i>
        <p>Failed to load tasks. Please try again.</p>
      </td>
    </tr>
  `;

  tasksMobileCards.innerHTML = `
    <div class="loading-card">
      <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem; color: var(--error);"></i>
      <p>Failed to load tasks. Please try again.</p>
    </div>
  `;
}

// -------------------- Stats Update Function --------------------
function updateStats() {
  const boardCount = allBoards.length;

  // Calculate task statistics
  let taskCount = 0;
  let pending = 0;
  let completed = 0;

  allBoards.forEach((board) => {
    if (board.tasks) {
      taskCount += board.tasks.length;
      board.tasks.forEach((task) => {
        const status = (task.status || "").toLowerCase();
        if (status === "completed" || status === "done") {
          completed++;
        } else {
          pending++;
        }
      });
    }
  });

  // Animate the numbers
  animateNumber(totalBoards, boardCount);
  animateNumber(totalTasks, taskCount);
  animateNumber(pendingTasks, pending);
  animateNumber(completedTasks, completed);
}

// -------------------- Event Handlers --------------------
function handleBoardKeydown(event, boardId, boardName) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    fetchTasks(boardId, boardName);
  }
}

closeTasksBtn.addEventListener("click", () => {
  tasksSection.style.display = "none";
  currentBoardId = null;
});

// -------------------- Keyboard Navigation --------------------
document.addEventListener("keydown", (event) => {
  // ESC key to close tasks section
  if (event.key === "Escape" && tasksSection.style.display === "block") {
    tasksSection.style.display = "none";
    currentBoardId = null;
  }

  // ESC key to close mobile menu
  if (event.key === "Escape" && sidebar.classList.contains("active")) {
    sidebar.classList.remove("active");
    overlay.classList.remove("active");
  }
});

// -------------------- Responsive Behavior --------------------
function handleResize() {
  // Close mobile menu on resize to desktop
  if (window.innerWidth > 768) {
    sidebar.classList.remove("active");
    overlay.classList.remove("active");
  }
}

window.addEventListener("resize", handleResize);

// -------------------- Accessibility Enhancements --------------------
// Add ARIA live region for dynamic content updates
const liveRegion = document.createElement("div");
liveRegion.setAttribute("aria-live", "polite");
liveRegion.setAttribute("aria-atomic", "true");
liveRegion.style.position = "absolute";
liveRegion.style.left = "-10000px";
liveRegion.style.width = "1px";
liveRegion.style.height = "1px";
liveRegion.style.overflow = "hidden";
document.body.appendChild(liveRegion);

function announceToScreenReader(message) {
  liveRegion.textContent = message;
}

// -------------------- Performance Optimization --------------------
// Debounce resize events
let resizeTimeout;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(handleResize, 100);
});

// -------------------- Error Handling & Retry Logic --------------------
let retryCount = 0;
const maxRetries = 3;

async function fetchWithRetry(url, options, attempt = 1) {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response;
  } catch (error) {
    if (attempt < maxRetries) {
      console.warn(`Attempt ${attempt} failed, retrying...`);
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      return fetchWithRetry(url, options, attempt + 1);
    }
    throw error;
  }
}

// -------------------- Service Worker for Offline Support --------------------
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("SW registered: ", registration);
      })
      .catch((registrationError) => {
        console.log("SW registration failed: ", registrationError);
      });
  });
}

// -------------------- Initial Load --------------------
document.addEventListener("DOMContentLoaded", async () => {
  // Show loading state immediately
  showBoardsLoading();

  try {
    // Fetch user info and boards in parallel
    await Promise.all([fetchUser(), fetchBoards()]);

    announceToScreenReader("Dashboard loaded successfully");
  } catch (error) {
    console.error("Error during initial load:", error);
    announceToScreenReader("Error loading dashboard");
  }
});

// -------------------- Export functions for testing --------------------
window.dashboardFunctions = {
  fetchBoards,
  fetchTasks,
  updateStats,
  formatDate,
  getStatusBadgeClass,
  getPriorityBadgeClass,
};
