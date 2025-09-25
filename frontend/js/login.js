// DOM Elements
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const showRegisterBtn = document.getElementById("showRegister");
const showLoginBtn = document.getElementById("showLogin");
const loginFormElement = document.getElementById("loginFormElement");
const registerFormElement = document.getElementById("registerFormElement");
const passwordToggles = document.querySelectorAll(".password-toggle");

// Backend API URL
const API_BASE_URL = "https://taskmanager-tj4l.onrender.com";

// Form switching functionality
showRegisterBtn.addEventListener("click", () => {
  switchToRegister();
});

showLoginBtn.addEventListener("click", () => {
  switchToLogin();
});

function switchToRegister() {
  // Clear any existing classes
  loginForm.className = "form-container";
  registerForm.className = "form-container hidden";

  // Start login slide out animation
  loginForm.classList.add("slide-out-left");

  setTimeout(() => {
    // Hide login form completely
    loginForm.classList.add("hidden");
    loginForm.classList.remove("slide-out-left");

    // Show register form with slide in animation
    registerForm.classList.remove("hidden");
    registerForm.classList.add("slide-in-right");

    // Remove slide-in class after animation
    setTimeout(() => {
      registerForm.classList.remove("slide-in-right");
    }, 400);
  }, 200);
}

function switchToLogin() {
  // Clear any existing classes
  registerForm.className = "form-container";
  loginForm.className = "form-container hidden";

  // Start register slide out animation
  registerForm.classList.add("slide-out-right");

  setTimeout(() => {
    // Hide register form completely
    registerForm.classList.add("hidden");
    registerForm.classList.remove("slide-out-right");

    // Show login form with slide in animation
    loginForm.classList.remove("hidden");
    loginForm.classList.add("slide-in-left");

    // Remove slide-in class after animation
    setTimeout(() => {
      loginForm.classList.remove("slide-in-left");
    }, 400);
  }, 200);
}

// Password toggle functionality
passwordToggles.forEach((toggle) => {
  toggle.addEventListener("click", function () {
    const targetId = this.getAttribute("data-target");
    const targetInput = document.getElementById(targetId);

    if (targetInput.type === "password") {
      targetInput.type = "text";
      this.classList.remove("fa-eye");
      this.classList.add("fa-eye-slash");
      this.classList.add("active");
    } else {
      targetInput.type = "password";
      this.classList.remove("fa-eye-slash");
      this.classList.add("fa-eye");
      this.classList.remove("active");
    }
  });
});

// Login form submission
loginFormElement.addEventListener("submit", async function (e) {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;
  const submitBtn = this.querySelector(".btn-primary");

  if (!email || !password) {
    showNotification("All fields are required!", "error");
    return;
  }

  // Add loading state
  submitBtn.classList.add("loading");
  submitBtn.textContent = "";
  submitBtn.disabled = true;

  try {
    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);

    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      let message =
        typeof data.detail === "string"
          ? data.detail
          : JSON.stringify(data.detail);
      showNotification(message, "error");
    } else {
      localStorage.setItem("token", data.access_token);
      showNotification("Login successful! Redirecting...", "success");

      // Reset form
      this.reset();

      // Redirect to dashboard after delay
      setTimeout(() => {
        window.location.href = "/dashboard.html";
      }, 1500);
    }
  } catch (error) {
    console.error("Login error:", error);
    showNotification("Server error! Please try again.", "error");
  } finally {
    // Remove loading state
    submitBtn.classList.remove("loading");
    submitBtn.textContent = "Sign In";
    submitBtn.disabled = false;
  }
});

// Register form submission
registerFormElement.addEventListener("submit", async function (e) {
  e.preventDefault();

  const username = document.getElementById("registerUsername").value.trim();
  const email = document.getElementById("registerEmail").value.trim();
  const password = document.getElementById("registerPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const submitBtn = this.querySelector(".btn-primary");

  // Validation
  if (!username || !email || !password) {
    showNotification("All fields are required!", "error");
    return;
  }

  if (password !== confirmPassword) {
    showNotification("Passwords do not match!", "error");
    return;
  }

  if (password.length < 6) {
    showNotification("Password must be at least 6 characters long!", "error");
    return;
  }

  // Add loading state
  submitBtn.classList.add("loading");
  submitBtn.textContent = "";
  submitBtn.disabled = true;

  try {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: username,
        email: email,
        password: password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      let message =
        typeof data.detail === "string"
          ? data.detail
          : JSON.stringify(data.detail);
      showNotification(message, "error");
    } else {
      showNotification("Registration successful! Please sign in.", "success");

      // Reset form and switch to login
      this.reset();

      setTimeout(() => {
        switchToLogin();
      }, 1500);
    }
  } catch (error) {
    console.error("Registration error:", error);
    showNotification("Server error! Please try again.", "error");
  } finally {
    // Remove loading state
    submitBtn.classList.remove("loading");
    submitBtn.textContent = "Create Account";
    submitBtn.disabled = false;
  }
});

// Notification system
function showNotification(message, type) {
  // Remove existing notification
  const existingNotification = document.querySelector(".notification");
  if (existingNotification) {
    existingNotification.remove();
  }

  // Create notification element
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${
              type === "success" ? "fa-check-circle" : "fa-exclamation-circle"
            }"></i>
            <span>${message}</span>
        </div>
    `;

  // Add notification styles
  notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === "success" ? "#48bb78" : "#f56565"};
        color: white;
        padding: 16px 20px;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        z-index: 1000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 300px;
        font-weight: 500;
    `;

  notification.querySelector(".notification-content").style.cssText = `
        display: flex;
        align-items: center;
        gap: 10px;
    `;

  document.body.appendChild(notification);

  // Animate in
  setTimeout(() => {
    notification.style.transform = "translateX(0)";
  }, 100);

  // Auto remove after 4 seconds
  setTimeout(() => {
    notification.style.transform = "translateX(100%)";
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 4000);
}

// Input validation and real-time feedback
document.querySelectorAll("input").forEach((input) => {
  input.addEventListener("blur", function () {
    validateInput(this);
  });

  input.addEventListener("input", function () {
    // Remove error state when user starts typing
    this.style.borderColor = "#e2e8f0";
  });
});

function validateInput(input) {
  const value = input.value.trim();
  let isValid = true;

  // Email validation
  if (input.type === "email" && value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    isValid = emailRegex.test(value);
  }

  // Password validation
  if (input.type === "password" && value) {
    if (input.id === "confirmPassword") {
      const password = document.getElementById("registerPassword").value;
      isValid = value === password;
    } else {
      isValid = value.length >= 6;
    }
  }

  // Username validation
  if (input.id === "registerUsername" && value) {
    isValid = value.length >= 3;
  }

  // Apply visual feedback
  if (!isValid && value) {
    input.style.borderColor = "#f56565";
    input.style.boxShadow = "0 0 0 3px rgba(245, 101, 101, 0.1)";
  } else {
    input.style.borderColor = "#e2e8f0";
    input.style.boxShadow = "none";
  }
}

// Initialize app
document.addEventListener("DOMContentLoaded", function () {
  // Add smooth animations to inputs
  document.querySelectorAll("input").forEach((input) => {
    input.addEventListener("focus", function () {
      this.parentElement.style.transform = "scale(1.02)";
    });

    input.addEventListener("blur", function () {
      this.parentElement.style.transform = "scale(1)";
    });
  });

  console.log("TaskFlow login system initialized with backend integration");
  console.log("Backend API:", API_BASE_URL);
});

// Keyboard shortcuts
document.addEventListener("keydown", function (e) {
  // Switch forms with Tab when no input is focused
  if (e.key === "Tab" && !document.activeElement.matches("input, button")) {
    e.preventDefault();
    if (loginForm.classList.contains("hidden")) {
      switchToLogin();
    } else {
      switchToRegister();
    }
  }
});
