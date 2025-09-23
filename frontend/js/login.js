// Tabs & Forms
const loginTab = document.getElementById("loginTab");
const registerTab = document.getElementById("registerTab");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const tabIndicator = document.getElementById("tabIndicator");

loginTab.addEventListener("click", () => {
  loginForm.classList.remove("hidden");
  registerForm.classList.add("hidden");
  tabIndicator.style.transform = "translateX(0%)";
  loginTab.classList.add("border-purple-500");
  registerTab.classList.remove("border-purple-500");
});

registerTab.addEventListener("click", () => {
  registerForm.classList.remove("hidden");
  loginForm.classList.add("hidden");
  tabIndicator.style.transform = "translateX(100%)";
  registerTab.classList.add("border-purple-500");
  loginTab.classList.remove("border-purple-500");
});

// Toggle Password Visibility
function setupPasswordToggle(toggleId, inputId) {
  const toggleBtn = document.getElementById(toggleId);
  const input = document.getElementById(inputId);
  toggleBtn.addEventListener("click", () => {
    input.type = input.type === "password" ? "text" : "password";
  });
}
setupPasswordToggle("toggleLoginPassword", "loginPassword");
setupPasswordToggle("toggleRegisterPassword", "registerPassword");

// Toast Helper
function showToast(message, type = "error") {
  Toastify({
    text: message,
    duration: 3000,
    close: true,
    gravity: "top",
    position: "right",
    backgroundColor:
      type === "success"
        ? "linear-gradient(to right, #00b09b, #96c93d)"
        : "linear-gradient(to right, #ff416c, #ff4b2b)",
  }).showToast();
}

// Login
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;
  const btn = document.getElementById("loginBtn");
  const spinner = document.getElementById("loginSpinner");

  if (!email || !password) return showToast("All fields are required!");

  try {
    btn.disabled = true;
    spinner.classList.remove("hidden");

    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);

    const res = await fetch("http://localhost:8000/login", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) {
      let message =
        typeof data.detail === "string"
          ? data.detail
          : JSON.stringify(data.detail);
      showToast(message);
    } else {
      localStorage.setItem("token", data.access_token);
      showToast("Login successful!", "success");
      setTimeout(() => (window.location.href = "/dashboard.html"), 1500);
    }
  } catch (err) {
    showToast("Server error!");
  } finally {
    btn.disabled = false;
    spinner.classList.add("hidden");
  }
});

// Register
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("registerName").value.trim();
  const email = document.getElementById("registerEmail").value.trim();
  const password = document.getElementById("registerPassword").value;

  const btn = document.getElementById("registerBtn");
  const spinner = document.getElementById("registerSpinner");

  if (!name || !email || !password)
    return showToast("All fields are required!");

  try {
    btn.disabled = true;
    spinner.classList.remove("hidden");

    const res = await fetch("http://localhost:8000/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      let message =
        typeof data.detail === "string"
          ? data.detail
          : JSON.stringify(data.detail);
      showToast(message);
    } else {
      showToast("Registration successful! Redirecting...", "success");
      registerForm.reset();
      setTimeout(() => (window.location.href = "/index.html"), 1500);
    }
  } catch (err) {
    showToast("Server error! Please try again.");
  } finally {
    btn.disabled = false;
    spinner.classList.add("hidden");
  }
});
