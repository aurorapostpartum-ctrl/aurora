import type { Ionicons } from '@expo/vector-icons';

import type { UserRole } from '../types/domain';

export interface NavItem {
  key: string;
  label: string;
  href: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
}

export const MANAGER_NAV_ITEMS: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', href: '/(app)/(shell)/dashboard', icon: 'grid-outline', iconActive: 'grid' },
  { key: 'jobs', label: 'Jobs', href: '/(app)/(shell)/jobs', icon: 'folder-open-outline', iconActive: 'folder-open' },
  { key: 'employees', label: 'Employees', href: '/(app)/(shell)/employees', icon: 'people-outline', iconActive: 'people' },
  { key: 'templates', label: 'Templates', href: '/(app)/(shell)/templates', icon: 'copy-outline', iconActive: 'copy' },
  { key: 'search', label: 'Search', href: '/(app)/(shell)/search', icon: 'search-outline', iconActive: 'search' },
];

export const EMPLOYEE_NAV_ITEMS: NavItem[] = [
  { key: 'home', label: 'Home', href: '/(app)/(shell)/home', icon: 'home-outline', iconActive: 'home' },
  { key: 'my-jobs', label: 'My Jobs', href: '/(app)/(shell)/my-jobs', icon: 'folder-open-outline', iconActive: 'folder-open' },
  { key: 'assessments', label: 'Assessments', href: '/(app)/(shell)/assessments', icon: 'clipboard-outline', iconActive: 'clipboard' },
  { key: 'more', label: 'More', href: '/(app)/(shell)/more', icon: 'ellipsis-horizontal-circle-outline', iconActive: 'ellipsis-horizontal-circle' },
];

export function navItemsForRole(role: UserRole): NavItem[] {
  return role === 'manager' ? MANAGER_NAV_ITEMS : EMPLOYEE_NAV_ITEMS;
}

export function landingRouteForRole(role: UserRole): string {
  return role === 'manager' ? MANAGER_NAV_ITEMS[0].href : EMPLOYEE_NAV_ITEMS[0].href;
}
