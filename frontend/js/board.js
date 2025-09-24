// DOM elements
const boardsContainer = document.getElementById("boardsContainer");
const addBoardBtn = document.getElementById("addBoardBtn");
const boardModal = document.getElementById("boardModal");
const boardNameInput = document.getElementById("boardNameInput");
const boardDescInput = document.getElementById("boardDescInput");
const boardModalCancel = document.getElementById("boardModalCancel");
const boardModalSave = document.getElementById("boardModalSave");
const boardModalTitle = document.getElementById("boardModalTitle");

const logoutBtn = document.getElementById("logoutBtn");
const welcomeUser = document.getElementById("userEmail");

// JWT Token
const token = localStorage.getItem("token");

// State
let editingBoardId = null;

// Logout
document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("token");
      window.location.href = "index.html"; // points to index.html
    });
  }
});

// Decode JWT payload
function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch (e) {
    return null;
  }
}

// Fetch user info
async function fetchUser() {
  if (!token) return;

  const payload = parseJwt(token);
  if (!payload || !payload.user_id) return;

  try {
    const res = await fetch(`http://localhost:8000/users/${payload.user_id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Failed to fetch user info");

    const data = await res.json();
    welcomeUser.textContent = `Welcome, ${data.name || data.email || "User"}`;
  } catch (err) {
    console.error("Error fetching user:", err);
    welcomeUser.textContent = "Welcome, User";
  }
}

// Fetch boards
async function fetchBoards() {
  try {
    const res = await fetch("http://localhost:8000/boards", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to fetch boards");
    const boards = await res.json();
    renderBoards(boards);
  } catch (err) {
    console.error("Error loading boards:", err);
    boardsContainer.innerHTML =
      "<p class='text-red-500'>Failed to load boards</p>";
  }
}

// Render boards
function renderBoards(boards) {
  boardsContainer.innerHTML = "";
  boards.forEach((board) => {
    const div = document.createElement("div");
    div.classList.add(
      "bg-white",
      "p-4",
      "rounded-lg",
      "shadow",
      "hover:shadow-lg",
      "flex",
      "justify-between",
      "items-center",
      "cursor-pointer"
    );

    div.innerHTML = `
      <div>
        <h4 class="font-bold text-gray-800">${board.title}</h4>
        <p class="text-gray-500 text-sm">${board.description || ""}</p>
      </div>
      <div class="flex gap-2">
        <button class="editBtn bg-yellow-500 px-2 py-1 rounded text-white hover:bg-yellow-600">Edit</button>
        <button class="deleteBtn bg-red-500 px-2 py-1 rounded text-white hover:bg-red-600">Delete</button>
      </div>
    `;

    // Click board → go to tasks page
    div.addEventListener("click", (e) => {
      if (
        !e.target.classList.contains("editBtn") &&
        !e.target.classList.contains("deleteBtn")
      ) {
        window.location.href = `tasks.html?boardId=${board.id}`;
      }
    });

    // Edit
    div.querySelector(".editBtn").addEventListener("click", (e) => {
      e.stopPropagation();
      editingBoardId = board.id;
      boardNameInput.value = board.title;
      boardDescInput.value = board.description || "";
      boardModalTitle.textContent = "Edit Board";
      boardModal.classList.remove("hidden");
    });

    // Delete
    div.querySelector(".deleteBtn").addEventListener("click", async (e) => {
      e.stopPropagation();
      if (confirm(`Delete board "${board.title}"?`)) {
        try {
          await fetch(`http://localhost:8000/boards/${board.id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
          fetchBoards();
        } catch (err) {
          console.error(err);
        }
      }
    });

    boardsContainer.appendChild(div);
  });
}

// Modal events
addBoardBtn.addEventListener("click", () => {
  editingBoardId = null;
  boardNameInput.value = "";
  boardDescInput.value = "";
  boardModalTitle.textContent = "Add Board";
  boardModal.classList.remove("hidden");
});

boardModalCancel.addEventListener("click", () => {
  boardModal.classList.add("hidden");
});

boardModalSave.addEventListener("click", async () => {
  const title = boardNameInput.value.trim();
  const description = boardDescInput.value.trim();

  if (!title || !description)
    return alert("Both title and description are required");

  try {
    if (editingBoardId) {
      // Update board
      await fetch(`http://localhost:8000/boards/${editingBoardId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, description }),
      });
    } else {
      // Create board
      await fetch("http://localhost:8000/boards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, description }),
      });
    }
    boardModal.classList.add("hidden");
    boardNameInput.value = "";
    boardDescInput.value = "";
    fetchBoards();
  } catch (err) {
    console.error(err);
  }
});

// Navigation buttons
document.getElementById("dashboardBtn").onclick = () =>
  (window.location.href = "dashboard.html");
document.getElementById("boardsBtn").onclick = () =>
  (window.location.href = "board.html");
document.getElementById("tasksBtn").onclick = () =>
  (window.location.href = "tasks.html");

// Initialize
fetchUser();
fetchBoards();
