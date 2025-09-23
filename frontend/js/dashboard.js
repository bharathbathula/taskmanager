// ----------------- JS -----------------
const token = localStorage.getItem("token");
if (!token) window.location.href = "/";

const boardsContainer = document.getElementById("boards");
const tasksContainer = document.getElementById("tasks");
const logoutBtn = document.getElementById("logoutBtn");
const userEmail = document.getElementById("userEmail");

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = "/";
});

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch (e) {
    return null;
  }
}

async function fetchUser() {
  const payload = parseJwt(token);
  if (!payload?.user_id) return;
  try {
    const res = await fetch(`http://localhost:8000/users/${payload.user_id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    userEmail.textContent = `Welcome, ${
      data.name || data.username || data.email || "User"
    }`;
  } catch (err) {
    console.error(err);
    userEmail.textContent = "Welcome, User";
  }
}

async function fetchBoards() {
  try {
    const res = await fetch("http://localhost:8000/boards", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const boards = await res.json();
    if (!boards.length) {
      boardsContainer.innerHTML =
        "<p class='text-gray-400'>No boards found. Add one!</p>";
      return;
    }
    boardsContainer.innerHTML = boards
      .map(
        (b) =>
          `<div class="board-card" onclick="fetchTasks(${b.id})">
        <h4>${b.title}</h4>
        <p>${b.description || ""}</p>
      </div>`
      )
      .join("");
  } catch (err) {
    console.error(err);
    boardsContainer.innerHTML =
      "<p class='text-red-500'>Failed to load boards</p>";
  }
}

async function fetchTasks(boardId) {
  try {
    const res = await fetch(`http://localhost:8000/boards/${boardId}/tasks`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const tasks = await res.json();
    if (!tasks.length) {
      tasksContainer.innerHTML =
        "<p class='text-gray-400'>No tasks in this board yet.</p>";
      return;
    }
    tasksContainer.innerHTML = tasks
      .map(
        (t) =>
          `<div class="task-card">
        <h5>${t.title}</h5>
        <p>${t.description || ""}</p>
        <p class="text-gray-400 text-xs mt-2">Status: ${
          t.status || "Pending"
        }</p>
      </div>`
      )
      .join("");
  } catch (err) {
    console.error(err);
    tasksContainer.innerHTML =
      "<p class='text-red-500'>Failed to load tasks</p>";
  }
}

// Initial fetch
fetchUser();
fetchBoards();
