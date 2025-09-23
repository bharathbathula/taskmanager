/**
 * TaskFlow Pro - Professional User Management
 * Advanced user administration with modern UX patterns
 */

// Users Application State
const UsersApp = {
  currentUser: null,
  users: [],
  filteredUsers: [],
  selectedUsers: new Set(),
  currentView: "card",
  filters: {
    search: "",
    role: "",
    status: "",
    department: "",
  },
  managers: [],
  isEditMode: false,
  currentUserId: null,
  sortBy: "name",
  sortOrder: "asc",
};

// DOM Elements Cache
const elements = {
  // Search and Filters
  searchUsers: document.getElementById("searchUsers"),
  roleFilter: document.getElementById("roleFilter"),
  statusFilter: document.getElementById("statusFilter"),
  departmentFilter: document.getElementById("departmentFilter"),

  // View Toggle
  cardViewBtn: document.getElementById("cardViewBtn"),
  tableViewBtn: document.getElementById("tableViewBtn"),

  // Views
  usersCardView: document.getElementById("usersCardView"),
  usersTableView: document.getElementById("usersTableView"),
  usersLoading: document.getElementById("usersLoading"),
  usersTableBody: document.getElementById("usersTableBody"),

  // Statistics
  totalUsers: document.getElementById("totalUsers"),
  activeUsers: document.getElementById("activeUsers"),
  adminUsers: document.getElementById("adminUsers"),
  pendingInvites: document.getElementById("pendingInvites"),

  // User Menu
  userMenuBtn: document.getElementById("userMenuBtn"),
  userMenu: document.getElementById("userMenu"),
  logoutBtn: document.getElementById("logoutBtn"),
  userName: document.getElementById("userName"),
  userInitials: document.getElementById("userInitials"),
  menuUserName: document.getElementById("menuUserName"),
  menuUserEmail: document.getElementById("menuUserEmail"),

  // Actions
  addUserBtn: document.getElementById("addUserBtn"),
  exportUsersBtn: document.getElementById("exportUsersBtn"),

  // User Modal
  userModal: document.getElementById("userModal"),
  closeUserModal: document.getElementById("closeUserModal"),
  userModalTitle: document.getElementById("userModalTitle"),
  userForm: document.getElementById("userForm"),
  userFirstName: document.getElementById("userFirstName"),
  userLastName: document.getElementById("userLastName"),
  userEmail: document.getElementById("userEmail"),
  userPhone: document.getElementById("userPhone"),
  userRole: document.getElementById("userRole"),
  userDepartment: document.getElementById("userDepartment"),
  userJobTitle: document.getElementById("userJobTitle"),
  userManager: document.getElementById("userManager"),
  sendInviteEmail: document.getElementById("sendInviteEmail"),
  canCreateBoards: document.getElementById("canCreateBoards"),
  canDeleteTasks: document.getElementById("canDeleteTasks"),
  canManageTeam: document.getElementById("canManageTeam"),
  canViewReports: document.getElementById("canViewReports"),
  cancelUser: document.getElementById("cancelUser"),
  saveUser: document.getElementById("saveUser"),
  saveUserText: document.getElementById("saveUserText"),
  saveUserSpinner: document.getElementById("saveUserSpinner"),

  // Sidebar
  userDetailSidebar: document.getElementById("userDetailSidebar"),
  closeSidebar: document.getElementById("closeSidebar"),
  sidebarContent: document.getElementById("sidebarContent"),

  // Bulk Actions
  bulkActionsModal: document.getElementById("bulkActionsModal"),
  cancelBulkActions: document.getElementById("cancelBulkActions"),
  selectedCount: document.getElementById("selectedCount"),
};

/**
 * Initialize Users Application
 */
document.addEventListener("DOMContentLoaded", async function () {
  try {
    await initializeUsers();
  } catch (error) {
    console.error("Users initialization failed:", error);
    showToast("Failed to initialize users page", "error");
  }
});

/**
 * Initialize users management
 */
async function initializeUsers() {
  // Check authentication and admin access
  if (!checkAdminAuthentication()) return;

  // Load user info
  loadCurrentUserInfo();

  // Setup event listeners
  setupEventListeners();

  // Load users data
  await loadUsersData();

  // Setup real-time updates
  setupRealTimeUpdates();
}

/**
 * Check admin authentication
 */
function checkAdminAuthentication() {
  // Mock authentication check - replace with actual auth logic
  const user = localStorage.getItem("currentUser");
  if (!user) {
    window.location.href = "index.html";
    return false;
  }

  try {
    const userData = JSON.parse(user);
    if (userData.role !== "admin") {
      showToast("Access denied. Admin privileges required.", "error");
      window.location.href = "dashboard.html";
      return false;
    }

    UsersApp.currentUser = userData;
    return true;
  } catch (error) {
    window.location.href = "index.html";
    return false;
  }
}

/**
 * Load current user information
 */
function loadCurrentUserInfo() {
  const user = UsersApp.currentUser;

  elements.userName.textContent = user.name;
  elements.menuUserName.textContent = user.name;
  elements.menuUserEmail.textContent = user.email;

  // Set user initials
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
  elements.userInitials.textContent = initials;
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // Search and filters
  elements.searchUsers.addEventListener("input", debounce(handleSearch, 300));
  elements.roleFilter.addEventListener("change", handleFilterChange);
  elements.statusFilter.addEventListener("change", handleFilterChange);
  elements.departmentFilter.addEventListener("change", handleFilterChange);

  // View toggle
  elements.cardViewBtn.addEventListener("click", () => switchView("card"));
  elements.tableViewBtn.addEventListener("click", () => switchView("table"));

  // User menu
  elements.userMenuBtn.addEventListener("click", toggleUserMenu);
  elements.logoutBtn.addEventListener("click", handleLogout);

  // Actions
  elements.addUserBtn.addEventListener("click", openUserModal);
  elements.exportUsersBtn.addEventListener("click", exportUsers);

  // User modal
  elements.closeUserModal.addEventListener("click", closeUserModal);
  elements.cancelUser.addEventListener("click", closeUserModal);
  elements.userForm.addEventListener("submit", handleUserSubmit);

  // Sidebar
  elements.closeSidebar.addEventListener("click", closeSidebar);

  // Bulk actions
  if (elements.cancelBulkActions) {
    elements.cancelBulkActions.addEventListener("click", closeBulkActionsModal);
  }

  // Close modals on outside click
  elements.userModal.addEventListener("click", (e) => {
    if (e.target === elements.userModal) {
      closeUserModal();
    }
  });

  // Close dropdowns on outside click
  document.addEventListener("click", handleOutsideClick);

  // Keyboard shortcuts
  document.addEventListener("keydown", handleKeyboardShortcuts);
}

/**
 * Load users data
 */
async function loadUsersData() {
  try {
    showLoading(true);

    // Mock data - replace with actual API calls
    const mockUsers = [
      {
        id: "1",
        first_name: "John",
        last_name: "Doe",
        name: "John Doe",
        email: "john.doe@taskflow.com",
        phone: "+1-555-0123",
        role: "admin",
        department: "engineering",
        job_title: "Senior Developer",
        status: "active",
        avatar: null,
        last_active: "2025-01-21T14:30:00Z",
        created_at: "2024-01-15T10:00:00Z",
        boards_count: 5,
        tasks_count: 23,
        completed_tasks: 18,
        manager_id: null,
        manager: null,
        permissions: {
          can_create_boards: true,
          can_delete_tasks: true,
          can_manage_team: true,
          can_view_reports: true,
        },
      },
      {
        id: "2",
        first_name: "Jane",
        last_name: "Smith",
        name: "Jane Smith",
        email: "jane.smith@taskflow.com",
        phone: "+1-555-0124",
        role: "manager",
        department: "design",
        job_title: "Design Manager",
        status: "active",
        avatar: null,
        last_active: "2025-01-21T13:45:00Z",
        created_at: "2024-02-01T09:00:00Z",
        boards_count: 3,
        tasks_count: 15,
        completed_tasks: 12,
        manager_id: "1",
        manager: { id: "1", name: "John Doe" },
        permissions: {
          can_create_boards: true,
          can_delete_tasks: false,
          can_manage_team: true,
          can_view_reports: true,
        },
      },
      {
        id: "3",
        first_name: "Mike",
        last_name: "Johnson",
        name: "Mike Johnson",
        email: "mike.johnson@taskflow.com",
        phone: "+1-555-0125",
        role: "user",
        department: "marketing",
        job_title: "Content Writer",
        status: "active",
        avatar: null,
        last_active: "2025-01-21T12:20:00Z",
        created_at: "2024-03-10T14:00:00Z",
        boards_count: 2,
        tasks_count: 8,
        completed_tasks: 6,
        manager_id: "2",
        manager: { id: "2", name: "Jane Smith" },
        permissions: {
          can_create_boards: false,
          can_delete_tasks: false,
          can_manage_team: false,
          can_view_reports: false,
        },
      },
      {
        id: "4",
        first_name: "Sarah",
        last_name: "Wilson",
        name: "Sarah Wilson",
        email: "sarah.wilson@taskflow.com",
        phone: "+1-555-0126",
        role: "user",
        department: "sales",
        job_title: "Sales Representative",
        status: "inactive",
        avatar: null,
        last_active: "2025-01-18T16:00:00Z",
        created_at: "2024-04-05T11:00:00Z",
        boards_count: 1,
        tasks_count: 4,
        completed_tasks: 2,
        manager_id: "1",
        manager: { id: "1", name: "John Doe" },
        permissions: {
          can_create_boards: false,
          can_delete_tasks: false,
          can_manage_team: false,
          can_view_reports: false,
        },
      },
    ];

    const mockStats = {
      total_users: 4,
      active_users: 3,
      admin_users: 1,
      pending_invites: 2,
    };

    const mockManagers = [
      { id: "1", name: "John Doe" },
      { id: "2", name: "Jane Smith" },
    ];

    UsersApp.users = mockUsers;
    UsersApp.managers = mockManagers;
    UsersApp.filteredUsers = [...UsersApp.users];

    // Update UI
    updateStatistics(mockStats);
    populateManagers();
    renderUsers();
  } catch (error) {
    console.error("Failed to load users data:", error);
    showToast("Failed to load users data", "error");
    showEmptyState();
  } finally {
    showLoading(false);
  }
}

/**
 * Show/hide loading state
 */
function showLoading(show) {
  elements.usersLoading.classList.toggle("hidden", !show);
  elements.usersCardView.classList.toggle(
    "hidden",
    show || UsersApp.currentView !== "card"
  );
  elements.usersTableView.classList.toggle(
    "hidden",
    show || UsersApp.currentView !== "table"
  );
}

/**
 * Show empty state
 */
function showEmptyState() {
  const emptyStateHTML = `
        <div class="empty-state">
            <svg class="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"></path>
            </svg>
            <h3>No users found</h3>
            <p>No users match your current filters. Try adjusting your search criteria.</p>
            <button onclick="clearFilters()" class="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                Clear Filters
            </button>
        </div>
    `;

  if (UsersApp.currentView === "card") {
    elements.usersCardView.innerHTML = emptyStateHTML;
    elements.usersCardView.classList.remove("hidden");
  } else {
    elements.usersTableView.innerHTML = emptyStateHTML;
    elements.usersTableView.classList.remove("hidden");
  }
}

/**
 * Hide empty state
 */
function hideEmptyState() {
  // Content will be replaced by renderUsers functions
}

/**
 * Update statistics
 */
function updateStatistics(stats) {
  animateCounter(elements.totalUsers, stats.total_users);
  animateCounter(elements.activeUsers, stats.active_users);
  animateCounter(elements.adminUsers, stats.admin_users);
  animateCounter(elements.pendingInvites, stats.pending_invites);
}

/**
 * Animate counter
 */
function animateCounter(element, target) {
  const current = parseInt(element.textContent) || 0;
  const increment = target > current ? 1 : -1;
  const duration = Math.min(Math.abs(target - current) * 50, 1000);
  const steps = Math.abs(target - current);

  if (steps === 0) return;

  const stepDuration = duration / steps;
  let currentValue = current;

  const timer = setInterval(() => {
    currentValue += increment;
    element.textContent = currentValue;

    if (currentValue === target) {
      clearInterval(timer);
    }
  }, stepDuration);
}

/**
 * Populate managers dropdown
 */
function populateManagers() {
  elements.userManager.innerHTML = '<option value="">Select Manager</option>';

  UsersApp.managers.forEach((manager) => {
    const option = document.createElement("option");
    option.value = manager.id;
    option.textContent = manager.name;
    elements.userManager.appendChild(option);
  });
}

/**
 * Handle search
 */
function handleSearch() {
  UsersApp.filters.search = elements.searchUsers.value.toLowerCase().trim();
  applyFilters();
  renderUsers();
}

/**
 * Handle filter changes
 */
function handleFilterChange() {
  UsersApp.filters.role = elements.roleFilter.value;
  UsersApp.filters.status = elements.statusFilter.value;
  UsersApp.filters.department = elements.departmentFilter.value;

  applyFilters();
  renderUsers();
}

/**
 * Clear all filters
 */
function clearFilters() {
  UsersApp.filters = {
    search: "",
    role: "",
    status: "",
    department: "",
  };

  elements.searchUsers.value = "";
  elements.roleFilter.value = "";
  elements.statusFilter.value = "";
  elements.departmentFilter.value = "";

  applyFilters();
  renderUsers();
}

/**
 * Apply filters to users
 */
function applyFilters() {
  let filtered = [...UsersApp.users];

  // Search filter
  if (UsersApp.filters.search) {
    filtered = filtered.filter(
      (user) =>
        user.name.toLowerCase().includes(UsersApp.filters.search) ||
        user.email.toLowerCase().includes(UsersApp.filters.search) ||
        (user.job_title &&
          user.job_title.toLowerCase().includes(UsersApp.filters.search))
    );
  }

  // Role filter
  if (UsersApp.filters.role) {
    filtered = filtered.filter((user) => user.role === UsersApp.filters.role);
  }

  // Status filter
  if (UsersApp.filters.status) {
    filtered = filtered.filter(
      (user) => user.status === UsersApp.filters.status
    );
  }

  // Department filter
  if (UsersApp.filters.department) {
    filtered = filtered.filter(
      (user) => user.department === UsersApp.filters.department
    );
  }

  // Sort users
  filtered.sort((a, b) => {
    const aValue = a[UsersApp.sortBy] || "";
    const bValue = b[UsersApp.sortBy] || "";

    const comparison = aValue.localeCompare(bValue);
    return UsersApp.sortOrder === "asc" ? comparison : -comparison;
  });

  UsersApp.filteredUsers = filtered;
}

/**
 * Switch view between card and table
 */
function switchView(view) {
  UsersApp.currentView = view;

  // Update button states
  elements.cardViewBtn.classList.toggle("bg-white", view === "card");
  elements.cardViewBtn.classList.toggle("shadow-sm", view === "card");
  elements.cardViewBtn.classList.toggle("text-gray-900", view === "card");
  elements.cardViewBtn.classList.toggle("text-gray-600", view !== "card");

  elements.tableViewBtn.classList.toggle("bg-white", view === "table");
  elements.tableViewBtn.classList.toggle("shadow-sm", view === "table");
  elements.tableViewBtn.classList.toggle("text-gray-900", view === "table");
  elements.tableViewBtn.classList.toggle("text-gray-600", view !== "table");

  // Show/hide views
  elements.usersCardView.classList.toggle("hidden", view !== "card");
  elements.usersTableView.classList.toggle("hidden", view !== "table");

  renderUsers();
}

/**
 * Render users based on current view
 */
function renderUsers() {
  if (UsersApp.filteredUsers.length === 0) {
    showEmptyState();
    return;
  }

  hideEmptyState();

  if (UsersApp.currentView === "card") {
    renderUsersCards();
  } else {
    renderUsersTable();
  }
}

/**
 * Render users in card view
 */
function renderUsersCards() {
  elements.usersCardView.innerHTML = "";
  elements.usersCardView.classList.remove("hidden");

  UsersApp.filteredUsers.forEach((user, index) => {
    const userCard = createUserCard(user, index);
    elements.usersCardView.appendChild(userCard);
  });
}

/**
 * Render users in table view
 */
function renderUsersTable() {
  elements.usersTableBody.innerHTML = "";
  elements.usersTableView.classList.remove("hidden");

  UsersApp.filteredUsers.forEach((user, index) => {
    const userRow = createUserRow(user, index);
    elements.usersTableBody.appendChild(userRow);
  });
}

/**
 * Create user card
 */
function createUserCard(user, index) {
  const card = document.createElement("div");
  card.className = `user-card ${user.role} group`;
  card.dataset.userId = user.id;
  card.style.animationDelay = `${index * 0.1}s`;

  const lastActive = user.last_active
    ? formatRelativeTime(new Date(user.last_active))
    : "Never";
  const statusClass = getStatusClass(user.last_active);

  card.innerHTML = `
        <div class="user-avatar ${statusClass}" data-tooltip="${user.name}">
            ${
              user.avatar
                ? `<img src="${user.avatar}" alt="${user.name}">`
                : getInitials(user.name)
            }
        </div>
        
        <h3 class="user-name">${escapeHtml(user.name)}</h3>
        <p class="user-email">${escapeHtml(user.email)}</p>
        
        <div class="flex justify-center mb-3">
            <span class="user-role ${user.role}">${user.role}</span>
        </div>
        
        ${
          user.department
            ? `
            <div class="flex justify-center mb-3">
                <span class="department-badge ${user.department}">${user.department}</span>
            </div>
        `
            : ""
        }
        
        <div class="user-stats">
            <div class="user-stat">
                <span class="user-stat-number">${user.boards_count || 0}</span>
                <span>Boards</span>
            </div>
            <div class="user-stat">
                <span class="user-stat-number">${user.tasks_count || 0}</span>
                <span>Tasks</span>
            </div>
            <div class="user-stat">
                <span class="user-stat-number">${
                  user.completed_tasks || 0
                }</span>
                <span>Done</span>
            </div>
        </div>
        
        <div class="mt-4 pt-4 border-t border-gray-100">
            <div class="flex justify-between items-center">
                <span class="status-badge ${user.status}">${user.status}</span>
                <span class="text-xs text-gray-500">${lastActive}</span>
            </div>
        </div>
        
        <div class="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <button class="user-menu-btn p-1 text-gray-400 hover:text-gray-600 rounded" data-user-id="${
              user.id
            }">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
                </svg>
            </button>
        </div>
    `;

  // Add event listeners
  card.addEventListener("click", (e) => {
    if (!e.target.closest(".user-menu-btn")) {
      openUserDetail(user.id);
    }
  });

  const menuBtn = card.querySelector(".user-menu-btn");
  menuBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    showUserContextMenu(e, user.id);
  });

  return card;
}

/**
 * Create user table row
 */
function createUserRow(user, index) {
  const row = document.createElement("tr");
  row.className = "user-row hover:bg-gray-50 transition-colors";
  row.dataset.userId = user.id;
  row.style.animationDelay = `${index * 0.05}s`;

  const lastActive = user.last_active
    ? formatRelativeTime(new Date(user.last_active))
    : "Never";
  const statusClass = getStatusClass(user.last_active);

  row.innerHTML = `
        <td>
            <div class="table-user-info">
                <div class="table-user-avatar ${statusClass}">
                    ${
                      user.avatar
                        ? `<img src="${user.avatar}" alt="${user.name}" class="w-full h-full object-cover rounded-full">`
                        : getInitials(user.name)
                    }
                </div>
                <div class="table-user-details">
                    <h4>${escapeHtml(user.name)}</h4>
                    <p>${escapeHtml(user.email)}</p>
                    ${
                      user.job_title
                        ? `<p class="text-xs text-gray-500">${escapeHtml(
                            user.job_title
                          )}</p>`
                        : ""
                    }
                </div>
            </div>
        </td>
        <td>
            <span class="user-role ${user.role}">${user.role}</span>
        </td>
        <td>
            ${
              user.department
                ? `<span class="department-badge ${user.department}">${user.department}</span>`
                : '<span class="text-gray-400">-</span>'
            }
        </td>
        <td>
            <span class="status-badge ${user.status}">${user.status}</span>
        </td>
        <td>
            <span class="text-sm text-gray-600">${lastActive}</span>
        </td>
        <td>
            <div class="flex items-center space-x-2">
                <button class="action-btn edit" data-action="edit" data-user-id="${
                  user.id
                }" data-tooltip="Edit user">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                </button>
                ${
                  user.status === "active"
                    ? `
                    <button class="action-btn deactivate" data-action="deactivate" data-user-id="${user.id}" data-tooltip="Deactivate user">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"></path>
                        </svg>
                    </button>
                `
                    : `
                    <button class="action-btn activate" data-action="activate" data-user-id="${user.id}" data-tooltip="Activate user">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </button>
                `
                }
                <button class="action-btn delete" data-action="delete" data-user-id="${
                  user.id
                }" data-tooltip="Delete user">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                </button>
            </div>
        </td>
    `;

  // Add event listeners
  row.addEventListener("click", (e) => {
    if (!e.target.closest("button")) {
      openUserDetail(user.id);
    }
  });

  // Action buttons
  row.querySelectorAll("[data-action]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const action = btn.dataset.action;
      const userId = btn.dataset.userId;
      handleUserAction(action, userId);
    });
  });

  return row;
}

/**
 * Handle user actions
 */
async function handleUserAction(action, userId) {
  const user = UsersApp.users.find((u) => u.id === userId);
  if (!user) return;

  switch (action) {
    case "edit":
      editUser(userId);
      break;
    case "activate":
      await toggleUserStatus(userId, "active");
      break;
    case "deactivate":
      await toggleUserStatus(userId, "inactive");
      break;
    case "delete":
      await deleteUser(userId);
      break;
  }
}

/**
 * Open user modal
 */
function openUserModal() {
  UsersApp.isEditMode = false;
  UsersApp.currentUserId = null;

  elements.userModalTitle.textContent = "Add New User";
  elements.saveUserText.textContent = "Create User";

  // Reset form
  elements.userForm.reset();
  elements.sendInviteEmail.checked = true;

  // Show modal
  elements.userModal.classList.remove("hidden");
  elements.userFirstName.focus();

  // Animate modal
  const modal = elements.userModal.querySelector(".bg-white");
  modal.style.transform = "scale(0.95)";
  modal.style.opacity = "0";

  requestAnimationFrame(() => {
    modal.style.transform = "scale(1)";
    modal.style.opacity = "1";
    modal.style.transition = "all 0.2s ease-out";
  });
}

/**
 * Close user modal
 */
function closeUserModal() {
  const modal = elements.userModal.querySelector(".bg-white");
  modal.style.transform = "scale(0.95)";
  modal.style.opacity = "0";

  setTimeout(() => {
    elements.userModal.classList.add("hidden");
    modal.style.transform = "";
    modal.style.opacity = "";
    modal.style.transition = "";
  }, 200);
}

/**
 * Handle user form submission
 */
async function handleUserSubmit(event) {
  event.preventDefault();

  const formData = {
    first_name: elements.userFirstName.value.trim(),
    last_name: elements.userLastName.value.trim(),
    email: elements.userEmail.value.trim(),
    phone: elements.userPhone.value.trim(),
    role: elements.userRole.value,
    department: elements.userDepartment.value,
    job_title: elements.userJobTitle.value.trim(),
    manager_id: elements.userManager.value || null,
    send_invite: elements.sendInviteEmail.checked,
    permissions: {
      can_create_boards: elements.canCreateBoards.checked,
      can_delete_tasks: elements.canDeleteTasks.checked,
      can_manage_team: elements.canManageTeam.checked,
      can_view_reports: elements.canViewReports.checked,
    },
  };

  // Validation
  if (
    !formData.first_name ||
    !formData.last_name ||
    !formData.email ||
    !formData.role
  ) {
    showToast("Please fill in all required fields", "error");
    return;
  }

  if (!isValidEmail(formData.email)) {
    showToast("Please enter a valid email address", "error");
    elements.userEmail.focus();
    return;
  }

  setUserFormLoading(true);

  try {
    if (UsersApp.isEditMode && UsersApp.currentUserId) {
      // Update existing user
      const userIndex = UsersApp.users.findIndex(
        (u) => u.id === UsersApp.currentUserId
      );
      if (userIndex !== -1) {
        const updatedUser = {
          ...UsersApp.users[userIndex],
          ...formData,
          name: `${formData.first_name} ${formData.last_name}`,
          updated_at: new Date().toISOString(),
        };

        // Find manager object if manager_id is provided
        if (formData.manager_id) {
          const manager = UsersApp.managers.find(
            (m) => m.id === formData.manager_id
          );
          updatedUser.manager = manager || null;
        } else {
          updatedUser.manager = null;
        }

        UsersApp.users[userIndex] = updatedUser;
      }

      showToast("User updated successfully!", "success");
    } else {
      // Create new user
      const newUser = {
        id: Date.now().toString(),
        ...formData,
        name: `${formData.first_name} ${formData.last_name}`,
        status: "active",
        avatar: null,
        last_active: new Date().toISOString(),
        created_at: new Date().toISOString(),
        boards_count: 0,
        tasks_count: 0,
        completed_tasks: 0,
      };

      // Find manager object if manager_id is provided
      if (formData.manager_id) {
        const manager = UsersApp.managers.find(
          (m) => m.id === formData.manager_id
        );
        newUser.manager = manager || null;
      } else {
        newUser.manager = null;
      }

      UsersApp.users.unshift(newUser);
      showToast("User created successfully!", "success");
    }

    // Update UI
    applyFilters();
    renderUsers();
    closeUserModal();
  } catch (error) {
    console.error("Failed to save user:", error);
    if (error.message && error.message.includes("email already exists")) {
      showToast("A user with this email already exists", "error");
      elements.userEmail.focus();
    } else {
      showToast("Failed to save user. Please try again.", "error");
    }
  } finally {
    setUserFormLoading(false);
  }
}

/**
 * Set user form loading state
 */
function setUserFormLoading(loading) {
  elements.saveUser.disabled = loading;
  elements.userFirstName.disabled = loading;
  elements.userLastName.disabled = loading;
  elements.userEmail.disabled = loading;
  elements.userRole.disabled = loading;

  elements.saveUserText.textContent = loading
    ? UsersApp.isEditMode
      ? "Updating..."
      : "Creating..."
    : UsersApp.isEditMode
    ? "Update User"
    : "Create User";
  elements.saveUserSpinner.classList.toggle("hidden", !loading);
}

/**
 * Edit user
 */
function editUser(userId) {
  const user = UsersApp.users.find((u) => u.id === userId);
  if (!user) return;

  UsersApp.isEditMode = true;
  UsersApp.currentUserId = userId;

  elements.userModalTitle.textContent = "Edit User";
  elements.saveUserText.textContent = "Update User";

  // Fill form with user data
  elements.userFirstName.value = user.first_name || "";
  elements.userLastName.value = user.last_name || "";
  elements.userEmail.value = user.email;
  elements.userPhone.value = user.phone || "";
  elements.userRole.value = user.role;
  elements.userDepartment.value = user.department || "";
  elements.userJobTitle.value = user.job_title || "";
  elements.userManager.value = user.manager_id || "";

  // Set permissions
  elements.canCreateBoards.checked =
    user.permissions?.can_create_boards || false;
  elements.canDeleteTasks.checked = user.permissions?.can_delete_tasks || false;
  elements.canManageTeam.checked = user.permissions?.can_manage_team || false;
  elements.canViewReports.checked = user.permissions?.can_view_reports || false;

  // Show modal
  elements.userModal.classList.remove("hidden");
  elements.userFirstName.focus();
}

/**
 * Toggle user status
 */
async function toggleUserStatus(userId, newStatus) {
  const user = UsersApp.users.find((u) => u.id === userId);
  if (!user) return;

  const action = newStatus === "active" ? "activate" : "deactivate";
  const confirmMessage = `Are you sure you want to ${action} ${user.name}?`;

  if (!confirm(confirmMessage)) return;

  try {
    // Update user in local data
    user.status = newStatus;

    // Re-render
    applyFilters();
    renderUsers();

    showToast(`User ${action}d successfully`, "success");
  } catch (error) {
    console.error(`Failed to ${action} user:`, error);
    showToast(`Failed to ${action} user`, "error");
  }
}

/**
 * Delete user
 */
async function deleteUser(userId) {
  const user = UsersApp.users.find((u) => u.id === userId);
  if (!user) return;

  if (
    !confirm(
      `Are you sure you want to delete ${user.name}? This action cannot be undone.`
    )
  ) {
    return;
  }

  try {
    // Remove user from local data
    UsersApp.users = UsersApp.users.filter((u) => u.id !== userId);

    // Re-render
    applyFilters();
    renderUsers();

    showToast("User deleted successfully", "success");
  } catch (error) {
    console.error("Failed to delete user:", error);
    showToast("Failed to delete user", "error");
  }
}

/**
 * Open user detail sidebar
 */
function openUserDetail(userId) {
  const user = UsersApp.users.find((u) => u.id === userId);
  if (!user) return;

  // Populate sidebar content
  elements.sidebarContent.innerHTML = createUserDetailHTML(user);

  // Show sidebar
  elements.userDetailSidebar.classList.remove("hidden");
  elements.userDetailSidebar.classList.add("open");
}

/**
 * Close user detail sidebar
 */
function closeSidebar() {
  elements.userDetailSidebar.classList.remove("open");
  setTimeout(() => {
    elements.userDetailSidebar.classList.add("hidden");
  }, 300);
}

/**
 * Create user detail HTML
 */
function createUserDetailHTML(user) {
  const lastActive = user.last_active
    ? formatRelativeTime(new Date(user.last_active))
    : "Never";
  const createdAt = formatDate(new Date(user.created_at));

  return `
        <div class="sidebar-section">
            <div class="text-center">
                <div class="user-avatar mx-auto mb-4" style="width: 80px; height: 80px; font-size: 28px;">
                    ${
                      user.avatar
                        ? `<img src="${user.avatar}" alt="${user.name}" class="w-full h-full object-cover rounded-full">`
                        : getInitials(user.name)
                    }
                </div>
                <h3 class="text-xl font-bold text-gray-900">${escapeHtml(
                  user.name
                )}</h3>
                <p class="text-gray-600">${escapeHtml(user.email)}</p>
                <div class="flex justify-center items-center space-x-2 mt-2">
                    <span class="status-badge ${user.status}">${
    user.status
  }</span>
                    <span class="user-role ${user.role}">${user.role}</span>
                </div>
            </div>
        </div>
        
        <div class="sidebar-section">
            <h4>Contact Information</h4>
            <div class="space-y-3">
                <div class="sidebar-detail">
                    <span class="label">Email:</span>
                    <span class="value">${escapeHtml(user.email)}</span>
                </div>
                ${
                  user.phone
                    ? `
                    <div class="sidebar-detail">
                        <span class="label">Phone:</span>
                        <span class="value">${escapeHtml(user.phone)}</span>
                    </div>
                `
                    : ""
                }
            </div>
        </div>
        
        <div class="sidebar-section">
            <h4>Professional Details</h4>
            <div class="space-y-3">
                <div class="sidebar-detail">
                    <span class="label">Role:</span>
                    <span class="value">${user.role}</span>
                </div>
                ${
                  user.department
                    ? `
                    <div class="sidebar-detail">
                        <span class="label">Department:</span>
                        <span class="value">${user.department}</span>
                    </div>
                `
                    : ""
                }
                ${
                  user.job_title
                    ? `
                    <div class="sidebar-detail">
                        <span class="label">Job Title:</span>
                        <span class="value">${escapeHtml(user.job_title)}</span>
                    </div>
                `
                    : ""
                }
                ${
                  user.manager
                    ? `
                    <div class="sidebar-detail">
                        <span class="label">Manager:</span>
                        <span class="value">${escapeHtml(
                          user.manager.name
                        )}</span>
                    </div>
                `
                    : ""
                }
            </div>
        </div>
        
        <div class="sidebar-section">
            <h4>Activity Stats</h4>
            <div class="grid grid-cols-2 gap-4">
                <div class="text-center">
                    <div class="text-2xl font-bold text-blue-600">${
                      user.boards_count || 0
                    }</div>
                    <div class="text-sm text-gray-600">Boards</div>
                </div>
                <div class="text-center">
                    <div class="text-2xl font-bold text-green-600">${
                      user.tasks_count || 0
                    }</div>
                    <div class="text-sm text-gray-600">Tasks</div>
                </div>
                <div class="text-center">
                    <div class="text-2xl font-bold text-purple-600">${
                      user.completed_tasks || 0
                    }</div>
                    <div class="text-sm text-gray-600">Completed</div>
                </div>
                <div class="text-center">
                    <div class="text-2xl font-bold text-orange-600">${Math.round(
                      ((user.completed_tasks || 0) /
                        Math.max(user.tasks_count || 1, 1)) *
                        100
                    )}%</div>
                    <div class="text-sm text-gray-600">Success Rate</div>
                </div>
            </div>
        </div>
        
        ${
          user.permissions
            ? `
            <div class="sidebar-section">
                <h4>Permissions</h4>
                <div class="space-y-2">
                    <div class="permission-chip ${
                      user.permissions.can_create_boards ? "active" : ""
                    }">
                        Create Boards ${
                          user.permissions.can_create_boards ? "✓" : "✗"
                        }
                    </div>
                    <div class="permission-chip ${
                      user.permissions.can_delete_tasks ? "active" : ""
                    }">
                        Delete Tasks ${
                          user.permissions.can_delete_tasks ? "✓" : "✗"
                        }
                    </div>
                    <div class="permission-chip ${
                      user.permissions.can_manage_team ? "active" : ""
                    }">
                        Manage Team ${
                          user.permissions.can_manage_team ? "✓" : "✗"
                        }
                    </div>
                    <div class="permission-chip ${
                      user.permissions.can_view_reports ? "active" : ""
                    }">
                        View Reports ${
                          user.permissions.can_view_reports ? "✓" : "✗"
                        }
                    </div>
                </div>
            </div>
        `
            : ""
        }
        
        <div class="sidebar-section">
            <h4>Account Information</h4>
            <div class="space-y-3">
                <div class="sidebar-detail">
                    <span class="label">Last Active:</span>
                    <span class="value">${lastActive}</span>
                </div>
                <div class="sidebar-detail">
                    <span class="label">Created:</span>
                    <span class="value">${createdAt}</span>
                </div>
                <div class="sidebar-detail">
                    <span class="label">Status:</span>
                    <span class="status-badge ${user.status}">${
    user.status
  }</span>
                </div>
            </div>
        </div>
        
        <div class="sidebar-section">
            <div class="flex space-x-3">
                <button onclick="editUser('${
                  user.id
                }')" class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Edit User
                </button>
                <button onclick="toggleUserStatus('${user.id}', '${
    user.status === "active" ? "inactive" : "active"
  }')" class="px-4 py-2 border ${
    user.status === "active"
      ? "border-orange-300 text-orange-700 hover:bg-orange-50"
      : "border-green-300 text-green-700 hover:bg-green-50"
  } rounded-lg transition-colors">
                    ${user.status === "active" ? "Deactivate" : "Activate"}
                </button>
            </div>
        </div>
    `;
}

/**
 * Show user context menu
 */
function showUserContextMenu(event, userId) {
  const user = UsersApp.users.find((u) => u.id === userId);
  if (!user) return;

  // Create context menu
  const menu = document.createElement("div");
  menu.className =
    "fixed bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 min-w-48";
  menu.style.left = event.pageX + "px";
  menu.style.top = event.pageY + "px";

  menu.innerHTML = `
        <button class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors" data-action="view">
            <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
            </svg>
            View Details
        </button>
        <button class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors" data-action="edit">
            <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
            </svg>
            Edit User
        </button>
        <button class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors" data-action="reset-password">
            <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v-2l-4.257-4.257A6 6 0 0117 9z"></path>
            </svg>
            Reset Password
        </button>
        <div class="border-t border-gray-100 mt-2"></div>
        <button class="flex items-center w-full px-4 py-2 text-sm ${
          user.status === "active"
            ? "text-orange-600 hover:bg-orange-50"
            : "text-green-600 hover:bg-green-50"
        } transition-colors" data-action="toggle-status">
            <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${
                  user.status === "active"
                    ? "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636"
                    : "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                }"></path>
            </svg>
            ${user.status === "active" ? "Deactivate" : "Activate"} User
        </button>
        <button class="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors" data-action="delete">
            <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
            Delete User
        </button>
    `;

  document.body.appendChild(menu);

  // Handle menu actions
  menu.addEventListener("click", async (e) => {
    const action = e.target.closest("button")?.dataset.action;
    if (!action) return;

    document.body.removeChild(menu);

    switch (action) {
      case "view":
        openUserDetail(userId);
        break;
      case "edit":
        editUser(userId);
        break;
      case "reset-password":
        await resetUserPassword(userId);
        break;
      case "toggle-status":
        await toggleUserStatus(
          userId,
          user.status === "active" ? "inactive" : "active"
        );
        break;
      case "delete":
        await deleteUser(userId);
        break;
    }
  });

  // Remove menu when clicking outside
  const removeMenu = (e) => {
    if (!menu.contains(e.target)) {
      document.body.removeChild(menu);
      document.removeEventListener("click", removeMenu);
    }
  };

  setTimeout(() => {
    document.addEventListener("click", removeMenu);
  }, 10);
}

/**
 * Reset user password
 */
async function resetUserPassword(userId) {
  const user = UsersApp.users.find((u) => u.id === userId);
  if (!user) return;

  if (!confirm(`Send password reset email to ${user.name} (${user.email})?`)) {
    return;
  }

  try {
    showToast("Password reset email sent successfully", "success");
  } catch (error) {
    console.error("Failed to reset password:", error);
    showToast("Failed to send password reset email", "error");
  }
}

/**
 * Export users
 */
async function exportUsers() {
  try {
    // Create CSV content
    const headers = [
      "Name",
      "Email",
      "Role",
      "Department",
      "Status",
      "Last Active",
      "Created",
    ];
    const csvContent = [
      headers.join(","),
      ...UsersApp.filteredUsers.map((user) =>
        [
          `"${user.name}"`,
          `"${user.email}"`,
          `"${user.role}"`,
          `"${user.department || ""}"`,
          `"${user.status}"`,
          `"${
            user.last_active ? formatDate(new Date(user.last_active)) : "Never"
          }"`,
          `"${formatDate(new Date(user.created_at))}"`,
        ].join(",")
      ),
    ].join("\n");

    // Create and download CSV file
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `users-export-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    showToast("Users exported successfully", "success");
  } catch (error) {
    console.error("Failed to export users:", error);
    showToast("Failed to export users", "error");
  }
}

/**
 * Toggle user menu
 */
function toggleUserMenu() {
  elements.userMenu.classList.toggle("hidden");
}

/**
 * Handle logout
 */
function handleLogout() {
  if (confirm("Are you sure you want to sign out?")) {
    localStorage.removeItem("currentUser");
    window.location.href = "index.html";
  }
}

/**
 * Close bulk actions modal
 */
function closeBulkActionsModal() {
  if (elements.bulkActionsModal) {
    elements.bulkActionsModal.classList.add("hidden");
  }
}

/**
 * Handle keyboard shortcuts
 */
function handleKeyboardShortcuts(event) {
  // Cmd/Ctrl + K - Focus search
  if ((event.metaKey || event.ctrlKey) && event.key === "k") {
    event.preventDefault();
    elements.searchUsers.focus();
    elements.searchUsers.select();
  }

  // Cmd/Ctrl + N - New user
  if ((event.metaKey || event.ctrlKey) && event.key === "n") {
    event.preventDefault();
    openUserModal();
  }

  // Escape - Close modals
  if (event.key === "Escape") {
    if (!elements.userModal.classList.contains("hidden")) {
      closeUserModal();
    }
    if (elements.userDetailSidebar.classList.contains("open")) {
      closeSidebar();
    }
    if (
      elements.bulkActionsModal &&
      !elements.bulkActionsModal.classList.contains("hidden")
    ) {
      closeBulkActionsModal();
    }
  }

  // V - Toggle view
  if (event.key === "v" && !event.target.matches("input, textarea, select")) {
    event.preventDefault();
    switchView(UsersApp.currentView === "card" ? "table" : "card");
  }
}

/**
 * Handle outside clicks
 */
function handleOutsideClick(event) {
  // Close user menu
  if (
    !elements.userMenuBtn.contains(event.target) &&
    !elements.userMenu.contains(event.target)
  ) {
    elements.userMenu.classList.add("hidden");
  }

  // Close modal
  if (event.target === elements.userModal) {
    closeUserModal();
  }
}

/**
 * Setup real-time updates
 */
function setupRealTimeUpdates() {
  // Implement WebSocket connection for real-time updates if available
  // For now, use periodic polling (disabled for demo)
  /*
    setInterval(async () => {
        try {
            const response = await apiCall('/admin/users/updates');
            
            if (response.data.has_updates) {
                // Reload users if there are updates
                await loadUsersData();
            }
        } catch (error) {
            // Silently fail for background updates
            console.debug('Background user update failed:', error);
        }
    }, 30000); // Check every 30 seconds
    */
}

/**
 * Utility Functions
 */

/**
 * Show toast notification
 */
function showToast(message, type = "info") {
  // Remove existing toast
  const existingToast = document.querySelector(".toast");
  if (existingToast) {
    existingToast.remove();
  }

  const toast = document.createElement("div");
  toast.className = `toast fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg max-w-sm`;

  // Set colors based on type
  switch (type) {
    case "success":
      toast.className += " bg-green-500 text-white";
      break;
    case "error":
      toast.className += " bg-red-500 text-white";
      break;
    case "warning":
      toast.className += " bg-yellow-500 text-white";
      break;
    default:
      toast.className += " bg-blue-500 text-white";
  }

  toast.innerHTML = `
        <div class="flex items-center justify-between">
            <span class="font-medium">${escapeHtml(message)}</span>
            <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-white hover:text-gray-200">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        </div>
    `;

  document.body.appendChild(toast);

  // Auto remove after 5 seconds
  setTimeout(() => {
    if (toast.parentElement) {
      toast.remove();
    }
  }, 5000);
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Format date for display
 */
function formatDate(date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

/**
 * Format relative time
 */
function formatRelativeTime(date) {
  const now = new Date();
  const diff = now - date;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
}

/**
 * Get status class based on last active time
 */
function getStatusClass(lastActive) {
  if (!lastActive) return "offline";

  const now = new Date();
  const lastActiveDate = new Date(lastActive);
  const diff = now - lastActiveDate;
  const hours = diff / (1000 * 60 * 60);

  if (hours < 1) return "online";
  if (hours < 24) return "away";
  return "offline";
}

/**
 * Get user initials
 */
function getInitials(name) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
}

/**
 * Validate email address
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Debounce function
 */
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

/**
 * Generate random ID
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

/**
 * Sort users by field
 */
function sortUsers(field, order = "asc") {
  UsersApp.sortBy = field;
  UsersApp.sortOrder = order;
  applyFilters();
  renderUsers();
}

/**
 * Toggle sort order
 */
function toggleSortOrder(field) {
  if (UsersApp.sortBy === field) {
    UsersApp.sortOrder = UsersApp.sortOrder === "asc" ? "desc" : "asc";
  } else {
    UsersApp.sortBy = field;
    UsersApp.sortOrder = "asc";
  }
  applyFilters();
  renderUsers();
}

/**
 * Bulk select users
 */
function toggleUserSelection(userId) {
  if (UsersApp.selectedUsers.has(userId)) {
    UsersApp.selectedUsers.delete(userId);
  } else {
    UsersApp.selectedUsers.add(userId);
  }

  updateBulkActionsUI();
}

/**
 * Select all users
 */
function selectAllUsers() {
  UsersApp.filteredUsers.forEach((user) => {
    UsersApp.selectedUsers.add(user.id);
  });
  updateBulkActionsUI();
}

/**
 * Deselect all users
 */
function deselectAllUsers() {
  UsersApp.selectedUsers.clear();
  updateBulkActionsUI();
}

/**
 * Update bulk actions UI
 */
function updateBulkActionsUI() {
  const selectedCount = UsersApp.selectedUsers.size;

  if (selectedCount > 0) {
    // Show bulk actions bar
    let bulkBar = document.querySelector(".bulk-actions-bar");
    if (!bulkBar) {
      bulkBar = document.createElement("div");
      bulkBar.className = "bulk-actions-bar";
      bulkBar.innerHTML = `
                <div class="bulk-actions-info">
                    <span class="count">${selectedCount}</span>
                    <span>users selected</span>
                </div>
                <div class="bulk-actions-buttons">
                    <button onclick="bulkActivateUsers()" class="bulk-action-btn primary">Activate</button>
                    <button onclick="bulkDeactivateUsers()" class="bulk-action-btn primary">Deactivate</button>
                    <button onclick="bulkDeleteUsers()" class="bulk-action-btn secondary">Delete</button>
                    <button onclick="deselectAllUsers()" class="clear-selection">Clear selection</button>
                </div>
            `;
      document
        .querySelector("main")
        .insertBefore(bulkBar, document.querySelector("#usersLoading"));
    }

    bulkBar.querySelector(".count").textContent = selectedCount;
    bulkBar.classList.add("show");
  } else {
    // Hide bulk actions bar
    const bulkBar = document.querySelector(".bulk-actions-bar");
    if (bulkBar) {
      bulkBar.classList.remove("show");
    }
  }

  // Update checkboxes
  document.querySelectorAll(".user-checkbox").forEach((checkbox) => {
    const userId = checkbox.dataset.userId;
    checkbox.checked = UsersApp.selectedUsers.has(userId);
  });
}

/**
 * Bulk activate users
 */
async function bulkActivateUsers() {
  const selectedUsers = Array.from(UsersApp.selectedUsers);
  if (selectedUsers.length === 0) return;

  if (!confirm(`Activate ${selectedUsers.length} selected users?`)) return;

  try {
    selectedUsers.forEach((userId) => {
      const user = UsersApp.users.find((u) => u.id === userId);
      if (user) user.status = "active";
    });

    deselectAllUsers();
    applyFilters();
    renderUsers();

    showToast(
      `${selectedUsers.length} users activated successfully`,
      "success"
    );
  } catch (error) {
    console.error("Failed to bulk activate users:", error);
    showToast("Failed to activate users", "error");
  }
}

/**
 * Bulk deactivate users
 */
async function bulkDeactivateUsers() {
  const selectedUsers = Array.from(UsersApp.selectedUsers);
  if (selectedUsers.length === 0) return;

  if (!confirm(`Deactivate ${selectedUsers.length} selected users?`)) return;

  try {
    selectedUsers.forEach((userId) => {
      const user = UsersApp.users.find((u) => u.id === userId);
      if (user) user.status = "inactive";
    });

    deselectAllUsers();
    applyFilters();
    renderUsers();

    showToast(
      `${selectedUsers.length} users deactivated successfully`,
      "success"
    );
  } catch (error) {
    console.error("Failed to bulk deactivate users:", error);
    showToast("Failed to deactivate users", "error");
  }
}

/**
 * Bulk delete users
 */
async function bulkDeleteUsers() {
  const selectedUsers = Array.from(UsersApp.selectedUsers);
  if (selectedUsers.length === 0) return;

  if (
    !confirm(
      `Delete ${selectedUsers.length} selected users? This action cannot be undone.`
    )
  )
    return;

  try {
    UsersApp.users = UsersApp.users.filter(
      (user) => !selectedUsers.includes(user.id)
    );

    deselectAllUsers();
    applyFilters();
    renderUsers();

    showToast(`${selectedUsers.length} users deleted successfully`, "success");
  } catch (error) {
    console.error("Failed to bulk delete users:", error);
    showToast("Failed to delete users", "error");
  }
}

/**
 * Search and highlight results
 */
function highlightSearchResults(text, searchTerm) {
  if (!searchTerm) return escapeHtml(text);

  const regex = new RegExp(`(${escapeHtml(searchTerm)})`, "gi");
  return escapeHtml(text).replace(
    regex,
    '<span class="search-highlight">$1</span>'
  );
}

/**
 * Advanced filter toggle
 */
function toggleAdvancedFilters() {
  const panel = document.querySelector(".advanced-filters");
  if (panel) {
    panel.classList.toggle("show");
  }
}

/**
 * Apply advanced filters
 */
function applyAdvancedFilters(filters) {
  Object.assign(UsersApp.filters, filters);
  applyFilters();
  renderUsers();
}

/**
 * Reset all filters
 */
function resetAllFilters() {
  clearFilters();

  // Reset advanced filters if they exist
  const advancedPanel = document.querySelector(".advanced-filters");
  if (advancedPanel) {
    advancedPanel.querySelectorAll(".filter-chip").forEach((chip) => {
      chip.classList.remove("active");
    });
  }
}

/**
 * Toggle compact mode
 */
function toggleCompactMode() {
  document.body.classList.toggle("compact-mode");
  localStorage.setItem(
    "usersCompactMode",
    document.body.classList.contains("compact-mode")
  );
}

/**
 * Load user preferences
 */
function loadUserPreferences() {
  // Load compact mode preference
  const compactMode = localStorage.getItem("usersCompactMode") === "true";
  if (compactMode) {
    document.body.classList.add("compact-mode");
  }

  // Load view preference
  const savedView = localStorage.getItem("usersView") || "card";
  switchView(savedView);

  // Load sort preferences
  const savedSort = localStorage.getItem("usersSort");
  if (savedSort) {
    const { sortBy, sortOrder } = JSON.parse(savedSort);
    UsersApp.sortBy = sortBy;
    UsersApp.sortOrder = sortOrder;
  }
}

/**
 * Save user preferences
 */
function saveUserPreferences() {
  localStorage.setItem("usersView", UsersApp.currentView);
  localStorage.setItem(
    "usersSort",
    JSON.stringify({
      sortBy: UsersApp.sortBy,
      sortOrder: UsersApp.sortOrder,
    })
  );
}

/**
 * Initialize user preferences
 */
function initializePreferences() {
  loadUserPreferences();

  // Save preferences when they change
  window.addEventListener("beforeunload", saveUserPreferences);
}

/**
 * Handle print functionality
 */
function printUsers() {
  const printWindow = window.open("", "_blank");
  const printContent = generatePrintContent();

  printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>TaskFlow Pro - Users Report</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .user-table { width: 100%; border-collapse: collapse; }
                .user-table th, .user-table td { border: 1px solid #ccc; padding: 8px; text-align: left; }
                .user-table th { background-color: #f5f5f5; font-weight: bold; }
                .status { padding: 2px 6px; border-radius: 4px; font-size: 12px; }
                .status.active { background-color: #d1fae5; color: #059669; }
                .status.inactive { background-color: #fee2e2; color: #dc2626; }
                @media print { .no-print { display: none !important; } }
            </style>
        </head>
        <body>
            ${printContent}
        </body>
        </html>
    `);

  printWindow.document.close();
  printWindow.print();
}

/**
 * Generate print content
 */
function generatePrintContent() {
  const now = new Date().toLocaleString();

  return `
        <div class="header">
            <h1>TaskFlow Pro - Users Report</h1>
            <p>Generated on: ${now}</p>
            <p>Total Users: ${UsersApp.filteredUsers.length}</p>
        </div>
        
        <table class="user-table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Department</th>
                    <th>Status</th>
                    <th>Last Active</th>
                </tr>
            </thead>
            <tbody>
                ${UsersApp.filteredUsers
                  .map(
                    (user) => `
                    <tr>
                        <td>${escapeHtml(user.name)}</td>
                        <td>${escapeHtml(user.email)}</td>
                        <td>${user.role}</td>
                        <td>${user.department || "-"}</td>
                        <td><span class="status ${user.status}">${
                      user.status
                    }</span></td>
                        <td>${
                          user.last_active
                            ? formatDate(new Date(user.last_active))
                            : "Never"
                        }</td>
                    </tr>
                `
                  )
                  .join("")}
            </tbody>
        </table>
    `;
}

// Initialize preferences when the script loads
document.addEventListener("DOMContentLoaded", () => {
  initializePreferences();
});

// Global functions for onclick handlers
window.editUser = editUser;
window.toggleUserStatus = toggleUserStatus;
window.deleteUser = deleteUser;
window.clearFilters = clearFilters;
window.toggleUserSelection = toggleUserSelection;
window.selectAllUsers = selectAllUsers;
window.deselectAllUsers = deselectAllUsers;
window.bulkActivateUsers = bulkActivateUsers;
window.bulkDeactivateUsers = bulkDeactivateUsers;
window.bulkDeleteUsers = bulkDeleteUsers;
window.toggleAdvancedFilters = toggleAdvancedFilters;
window.toggleCompactMode = toggleCompactMode;
window.printUsers = printUsers;

// Export for global use
window.UsersApp = UsersApp;
