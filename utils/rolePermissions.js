// Role-based Access Control (RBAC) System

// Role Constants
export const ROLES = {
  CUSTOMER: 'C',
  ADMIN: 'A',
  SUPER_ADMIN: 'S',
  CASHIER: 'T',
  PACKAGE_HANDLER: 'H',
  TRANSFER_PERSONNEL: 'D',
  FRONT_DESK: 'F'
};

// Role Display Names
export const ROLE_NAMES = {
  [ROLES.CUSTOMER]: 'Customer',
  [ROLES.ADMIN]: 'Administrator',
  [ROLES.SUPER_ADMIN]: 'Super Administrator',
  [ROLES.CASHIER]: 'Cashier',
  [ROLES.PACKAGE_HANDLER]: 'Package Handler',
  [ROLES.TRANSFER_PERSONNEL]: 'Transfer Personnel',
  [ROLES.FRONT_DESK]: 'Front Desk'
};

// Staff roles (non-customer roles)
export const STAFF_ROLES = [
  ROLES.ADMIN,
  ROLES.SUPER_ADMIN,
  ROLES.CASHIER,
  ROLES.PACKAGE_HANDLER,
  ROLES.TRANSFER_PERSONNEL,
  ROLES.FRONT_DESK
];

// Permissions for different tabs/features
export const PERMISSIONS = {
  // Admin Dashboard Tabs
  VIEW_CUSTOMERS_TAB: 'view_customers_tab',
  VIEW_PACKAGES_TAB: 'view_packages_tab',
  VIEW_DELIVERIES_TAB: 'view_deliveries_tab',

  // Customer Tab Actions
  CONFIRM_PREALERT: 'confirm_prealert',
  VIEW_CUSTOMER_DETAILS: 'view_customer_details',

  // Package Tab Actions
  CHANGE_PACKAGE_STATUS: 'change_package_status',
  VIEW_PACKAGES: 'view_packages',
  CREATE_PACKAGE: 'create_package',

  // Transfer Actions
  VIEW_TRANSFERS: 'view_transfers',
  CREATE_TRANSFER: 'create_transfer',
  MANAGE_TRANSFERS: 'manage_transfers',

  // Admin Tools
  VIEW_ADMIN_TOOLS: 'view_admin_tools',
  ACCESS_SUPER_ADMIN: 'access_super_admin'
};

// Role-Permission Mapping
export const ROLE_PERMISSIONS = {
  // Cashier - Only Deliveries Tab
  [ROLES.CASHIER]: [
    PERMISSIONS.VIEW_DELIVERIES_TAB
  ],

  // Package Handler - Customers, Packages, Transfers
  [ROLES.PACKAGE_HANDLER]: [
    PERMISSIONS.VIEW_CUSTOMERS_TAB,
    PERMISSIONS.VIEW_CUSTOMER_DETAILS,
    PERMISSIONS.CONFIRM_PREALERT,
    PERMISSIONS.VIEW_PACKAGES_TAB,
    PERMISSIONS.VIEW_PACKAGES,
    PERMISSIONS.CHANGE_PACKAGE_STATUS,
    PERMISSIONS.CREATE_PACKAGE,
    PERMISSIONS.VIEW_TRANSFERS,
    PERMISSIONS.CREATE_TRANSFER,
    PERMISSIONS.MANAGE_TRANSFERS
  ],

  // Transfer Personnel - Only Transfers
  [ROLES.TRANSFER_PERSONNEL]: [
    PERMISSIONS.VIEW_TRANSFERS,
    PERMISSIONS.CREATE_TRANSFER,
    PERMISSIONS.MANAGE_TRANSFERS
  ],

  // Front Desk - Full access to Customers, View-only for Packages
  [ROLES.FRONT_DESK]: [
    PERMISSIONS.VIEW_CUSTOMERS_TAB,
    PERMISSIONS.VIEW_CUSTOMER_DETAILS,
    PERMISSIONS.CONFIRM_PREALERT,
    PERMISSIONS.VIEW_PACKAGES_TAB,
    PERMISSIONS.VIEW_PACKAGES
    // Note: CHANGE_PACKAGE_STATUS is NOT included
  ],

  // Admin - Full access to dashboard tabs
  [ROLES.ADMIN]: [
    PERMISSIONS.VIEW_CUSTOMERS_TAB,
    PERMISSIONS.VIEW_CUSTOMER_DETAILS,
    PERMISSIONS.CONFIRM_PREALERT,
    PERMISSIONS.VIEW_PACKAGES_TAB,
    PERMISSIONS.VIEW_PACKAGES,
    PERMISSIONS.CHANGE_PACKAGE_STATUS,
    PERMISSIONS.CREATE_PACKAGE,
    PERMISSIONS.VIEW_DELIVERIES_TAB,
    PERMISSIONS.VIEW_TRANSFERS,
    PERMISSIONS.CREATE_TRANSFER,
    PERMISSIONS.MANAGE_TRANSFERS,
    PERMISSIONS.VIEW_ADMIN_TOOLS
  ],

  // Super Admin - Everything
  [ROLES.SUPER_ADMIN]: [
    PERMISSIONS.VIEW_CUSTOMERS_TAB,
    PERMISSIONS.VIEW_CUSTOMER_DETAILS,
    PERMISSIONS.CONFIRM_PREALERT,
    PERMISSIONS.VIEW_PACKAGES_TAB,
    PERMISSIONS.VIEW_PACKAGES,
    PERMISSIONS.CHANGE_PACKAGE_STATUS,
    PERMISSIONS.CREATE_PACKAGE,
    PERMISSIONS.VIEW_DELIVERIES_TAB,
    PERMISSIONS.VIEW_TRANSFERS,
    PERMISSIONS.CREATE_TRANSFER,
    PERMISSIONS.MANAGE_TRANSFERS,
    PERMISSIONS.VIEW_ADMIN_TOOLS,
    PERMISSIONS.ACCESS_SUPER_ADMIN
  ]
};

// Helper Functions

/**
 * Check if a user has a specific permission
 * @param {string} userRole - The user's role (e.g., 'A', 'T', 'H', etc.)
 * @param {string} permission - The permission to check
 * @returns {boolean} - True if user has permission
 */
export const hasPermission = (userRole, permission) => {
  if (!userRole) return false;
  const permissions = ROLE_PERMISSIONS[userRole] || [];
  return permissions.includes(permission);
};

/**
 * Check if user has any of the specified permissions
 * @param {string} userRole - The user's role
 * @param {Array<string>} permissions - Array of permissions to check
 * @returns {boolean} - True if user has at least one permission
 */
export const hasAnyPermission = (userRole, permissions) => {
  return permissions.some(permission => hasPermission(userRole, permission));
};

/**
 * Check if user has all of the specified permissions
 * @param {string} userRole - The user's role
 * @param {Array<string>} permissions - Array of permissions to check
 * @returns {boolean} - True if user has all permissions
 */
export const hasAllPermissions = (userRole, permissions) => {
  return permissions.every(permission => hasPermission(userRole, permission));
};

/**
 * Get all permissions for a role
 * @param {string} userRole - The user's role
 * @returns {Array<string>} - Array of permissions
 */
export const getRolePermissions = (userRole) => {
  return ROLE_PERMISSIONS[userRole] || [];
};

/**
 * Check if role is a staff role (non-customer)
 * @param {string} userRole - The user's role
 * @returns {boolean} - True if user is staff
 */
export const isStaffRole = (userRole) => {
  return STAFF_ROLES.includes(userRole);
};

/**
 * Get available tabs for a user based on their role
 * @param {string} userRole - The user's role
 * @returns {Array<string>} - Array of tab names the user can access
 */
export const getAvailableTabs = (userRole) => {
  const tabs = [];

  if (hasPermission(userRole, PERMISSIONS.VIEW_CUSTOMERS_TAB)) {
    tabs.push('customers');
  }
  if (hasPermission(userRole, PERMISSIONS.VIEW_PACKAGES_TAB)) {
    tabs.push('packages');
  }
  if (hasPermission(userRole, PERMISSIONS.VIEW_DELIVERIES_TAB)) {
    tabs.push('deliveries');
  }

  return tabs;
};

/**
 * Get default tab for a user based on their role
 * @param {string} userRole - The user's role
 * @returns {string} - Default tab name
 */
export const getDefaultTab = (userRole) => {
  const tabs = getAvailableTabs(userRole);
  return tabs[0] || 'customers'; // Return first available tab or default to customers
};

/**
 * Get role display name
 * @param {string} userRole - The user's role
 * @returns {string} - Human-readable role name
 */
export const getRoleName = (userRole) => {
  return ROLE_NAMES[userRole] || 'Unknown Role';
};

/**
 * Check if user should see the Transfers page link
 * @param {string} userRole - The user's role
 * @returns {boolean} - True if user can access transfers
 */
export const canAccessTransfers = (userRole) => {
  return hasPermission(userRole, PERMISSIONS.VIEW_TRANSFERS);
};

/**
 * Check if user should see admin tools section
 * @param {string} userRole - The user's role
 * @returns {boolean} - True if user can access admin tools
 */
export const canAccessAdminTools = (userRole) => {
  return hasPermission(userRole, PERMISSIONS.VIEW_ADMIN_TOOLS);
};
