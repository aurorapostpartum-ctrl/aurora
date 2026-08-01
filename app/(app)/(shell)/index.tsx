import { Redirect } from 'expo-router';

import { landingRouteForRole } from '../../../src/navigation/navConfig';
import { useAuth } from '../../../src/providers/AuthProvider';

export default function ShellIndex() {
  const { person } = useAuth();
  if (!person) return null;
  return <Redirect href={landingRouteForRole(person.role) as never} />;
}
