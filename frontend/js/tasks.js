// DOM Elements
const tasksContainer = document.getElementById("tasksContainer");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskModal = document.getElementById("taskModal");
const taskTitleInput = document.getElementById("taskTitleInput");
const taskDescInput = document.getElementById("taskDescInput");
const taskStatusInput = document.getElementById("taskStatusInput");
const taskPriorityInput = document.getElementById("taskPriorityInput");
const taskDueDateInput = document.getElementById("taskDueDateInput");
const taskBoardInput = document.getElementById("taskBoardInput");
const taskModalCancel = document.getElementById("taskModalCancel");
const taskModalSave = document.getElementById("taskModalSave");
const taskModalTitle = document.getElementById("taskModalTitle");

const logoutBtn = document.getElementById("logoutBtn");
const userEmail = document.getElementById("userEmail");

// JWT Token
const token = localStorage.getItem("token");
let editingTaskId = null;

// ✅ Get boardId from URL
const urlParams = new URLSearchParams(window.location.search);
const currentBoardId = urlParams.get("boardId");

// Check if user is logged in
if (!token) {
  alert("No authentication token found. Please login.");
  window.location.href = "login.html";
}

// Logout
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = "login.html";
});

// Decode JWT
function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch (e) {
    console.error("Error parsing JWT:", e);
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
    if (!res.ok) return;
    const data = await res.json();
    userEmail.textContent = `Welcome, ${data.name || data.email || "User"}`;
  } catch (err) {
    console.error(err);
  }
}

// Fetch all boards for task dropdown
async function fetchBoards() {
  try {
    const res = await fetch("http://localhost:8000/boards", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to fetch boards");
    const boards = await res.json();
    taskBoardInput.innerHTML = boards
      .map((b) => `<option value="${b.id}">${b.title}</option>`)
      .join("");

    // Select board from URL if exists
    if (currentBoardId) {
      taskBoardInput.value = currentBoardId;
      fetchTasks(currentBoardId);
    } else if (boards.length > 0) {
      taskBoardInput.value = boards[0].id;
      fetchTasks(boards[0].id);
    }
  } catch (err) {
    console.error(err);
    tasksContainer.innerHTML =
      "<p class='text-red-500'>Failed to load boards</p>";
  }
}

// Fetch tasks for a specific board
async function fetchTasks(boardId) {
  if (!boardId) return;
  try {
    const res = await fetch(`http://localhost:8000/boards/${boardId}/tasks/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to fetch tasks");
    const tasks = await res.json();
    renderTasks(tasks, boardId);
  } catch (err) {
    tasksContainer.innerHTML =
      "<p class='text-red-500'>Failed to load tasks</p>";
    console.error(err);
  }
}

// Render tasks
function renderTasks(tasks, boardId) {
  tasksContainer.innerHTML = "";
  if (!tasks || tasks.length === 0) {
    tasksContainer.innerHTML =
      "<p class='text-gray-400'>No tasks found for this board.</p>";
    return;
  }

  tasks.forEach((task) => {
    const div = document.createElement("div");
    div.classList.add(
      "bg-white/10",
      "p-4",
      "rounded-lg",
      "shadow",
      "hover:shadow-lg",
      "flex",
      "justify-between",
      "items-center",
      "backdrop-blur-sm"
    );

    div.innerHTML = `
      <div>
        <h4 class="font-bold text-white">${task.title}</h4>
        <p class="text-gray-300 text-sm">${
          task.description || "No description"
        }</p>
        <p class="text-gray-400 text-xs mt-1">Status: ${task.status}</p>
        <p class="text-gray-400 text-xs mt-1">Board: ${task.board_id}</p>
        <p class="text-gray-400 text-xs mt-1">Priority: ${
          task.priority || "Not set"
        }</p>
        <p class="text-gray-400 text-xs mt-1">Due Date: ${
          task.due_date ? new Date(task.due_date).toLocaleDateString() : "N/A"
        }</p>
      </div>
      <div class="flex gap-2">
        <button class="editBtn bg-yellow-500 px-2 py-1 rounded text-white hover:bg-yellow-600">Edit</button>
        <button class="deleteBtn bg-red-500 px-2 py-1 rounded text-white hover:bg-red-600">Delete</button>
      </div>
    `;

    // Edit Task
    div.querySelector(".editBtn").addEventListener("click", () => {
      editingTaskId = task.id;
      taskTitleInput.value = task.title;
      taskDescInput.value = task.description;
      taskStatusInput.value = task.status;
      taskPriorityInput.value = task.priority || "";
      taskDueDateInput.value = task.due_date ? task.due_date.split("T")[0] : "";
      taskBoardInput.value = task.board_id;
      taskModalTitle.textContent = "Edit Task";
      taskModal.classList.remove("hidden");
    });

    // Delete Task
    div.querySelector(".deleteBtn").addEventListener("click", async () => {
      if (confirm(`Delete task "${task.title}"?`)) {
        try {
          await fetch(
            `http://localhost:8000/boards/${boardId}/tasks/${task.id}/`,
            {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          fetchTasks(boardId);
        } catch (err) {
          console.error(err);
          alert("Failed to delete task");
        }
      }
    });

    tasksContainer.appendChild(div);
  });
}

// Modal events
addTaskBtn.addEventListener("click", () => {
  editingTaskId = null;
  taskTitleInput.value = "";
  taskDescInput.value = "";
  taskStatusInput.value = "To Do";
  taskPriorityInput.value = "";
  taskDueDateInput.value = "";
  taskBoardInput.value = currentBoardId || taskBoardInput.value;
  taskModalTitle.textContent = "Add Task";
  taskModal.classList.remove("hidden");
});

taskModalCancel.addEventListener("click", () => {
  taskModal.classList.add("hidden");
});

// Save Task
taskModalSave.addEventListener("click", async () => {
  const title = taskTitleInput.value.trim();
  const description = taskDescInput.value.trim() || "No description provided";
  const status = taskStatusInput.value;
  const priority = taskPriorityInput.value || null;
  const due_date = taskDueDateInput.value || null;
  const boardId = taskBoardInput.value;

  if (!title || !boardId) return alert("Title and Board are required");

  try {
    const taskData = { title, description, status, priority, due_date };
    let res;

    if (editingTaskId) {
      res = await fetch(
        `http://localhost:8000/boards/${boardId}/tasks/${editingTaskId}/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(taskData),
        }
      );
    } else {
      res = await fetch(`http://localhost:8000/boards/${boardId}/tasks/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(taskData),
      });
    }

    if (res.ok) {
      taskModal.classList.add("hidden");
      await fetchTasks(boardId);
    } else {
      const errorText = await res.text();
      console.error("Failed to save task:", res.status, errorText);
      alert("Failed to save task");
    }
  } catch (err) {
    console.error(err);
    alert("Error saving task");
  }
});

// Board selection change
taskBoardInput.addEventListener("change", async (e) => {
  const selectedBoardId = e.target.value;
  if (selectedBoardId) await fetchTasks(selectedBoardId);
});

// Initialize
async function initialize() {
  await fetchUser();
  await fetchBoards();
}

initialize();
