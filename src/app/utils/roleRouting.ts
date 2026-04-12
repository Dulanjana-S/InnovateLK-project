export function getDashboardPathForRole(role?: string | null) {
  if (role === 'Innovator') return '/innovator-dashboard';
  if (role === 'Investor') return '/investor-dashboard';
  if (role === 'Manufacturer') return '/manufacturer-dashboard';
  if (role === 'Admin') return '/admin';
  return '/login';
}
