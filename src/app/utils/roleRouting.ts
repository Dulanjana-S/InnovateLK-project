export function normalizeRole(role?: string | null) {
  return String(role || '').trim().toLowerCase();
}

export function isAdminRole(role?: string | null) {
  return normalizeRole(role) === 'admin';
}

export function getDashboardPathForRole(role?: string | null) {
  const normalizedRole = normalizeRole(role);
  if (normalizedRole === 'innovator') return '/innovator-dashboard';
  if (normalizedRole === 'investor') return '/investor-dashboard';
  if (normalizedRole === 'manufacturer') return '/manufacturer-dashboard';
  if (normalizedRole === 'admin') return '/admin';
  return '/login';
}
