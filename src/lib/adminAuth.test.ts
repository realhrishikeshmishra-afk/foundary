import { afterEach, describe, expect, it } from 'vitest';
import { loginAdmin, logoutAdmin, isAdminAuthenticated } from '@/lib/adminAuth';

describe('admin auth helpers', () => {
  afterEach(() => {
    logoutAdmin();
  });

  it('stores admin authentication in localStorage', () => {
    const result = loginAdmin('admin@foundarly.com', 'admin1234');

    expect(result.success).toBe(true);
    expect(isAdminAuthenticated()).toBe(true);
  });

  it('rejects invalid admin credentials', () => {
    const result = loginAdmin('wrong@example.com', 'wrong-password');

    expect(result.success).toBe(false);
    expect(isAdminAuthenticated()).toBe(false);
  });
});
