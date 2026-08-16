import { Slot } from 'expo-router';

import { AppShell } from '../../../src/components/shell';

export default function ShellLayout() {
  return (
    <AppShell>
      <Slot />
    </AppShell>
  );
}
