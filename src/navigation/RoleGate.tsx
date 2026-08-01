import { Redirect } from 'expo-router';

import { useAuth } from '../providers/AuthProvider';
import type { UserRole } from '../types/domain';
import { landingRouteForRole } from './navConfig';

export interface RoleGateProps {
  allow: UserRole[];
  children: React.ReactNode;
}

/**
 * Route-level guard: renders children only when the signed-in person's role
 * is permitted here, otherwise redirects to that role's own landing route.
 * This is the enforcement half of the nav config — navConfig decides what a
 * role *sees*, RoleGate decides what a role can actually *reach*.
 */
export function RoleGate({ allow, children }: RoleGateProps) {
  const { person } = useAuth();

  if (!person) return null;
  if (!allow.includes(person.role)) {
    return <Redirect href={landingRouteForRole(person.role) as never} />;
  }
  return <>{children}</>;
}
