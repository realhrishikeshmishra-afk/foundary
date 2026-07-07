const STORAGE_KEY = 'foundarly_admin_auth';
const ADMIN_EMAIL = 'admin@foundarly.com';
const ADMIN_PASSWORD = 'admin1234';

interface AdminAuthResult {
  success: boolean;
  message: string;
}

export function loginAdmin(email: string, password: string): AdminAuthResult {
  const isValid = email.trim().toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD;

  if (!isValid) {
    return { success: false, message: 'Invalid admin credentials.' };
  }

  localStorage.setItem(STORAGE_KEY, 'true');
  return { success: true, message: 'Admin authenticated.' };
}

export function logoutAdmin() {
  localStorage.removeItem(STORAGE_KEY);
}

export function isAdminAuthenticated() {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(STORAGE_KEY) === 'true';
}
