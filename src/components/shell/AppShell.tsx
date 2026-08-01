import { usePathname } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomNav } from './BottomNav';
import { Header, HEADER_HEIGHT } from './Header';
import { ProfileMenu } from './ProfileMenu';
import { Sidebar } from './Sidebar';
import { notificationsForPerson } from '../../data/selectors';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { navItemsForRole } from '../../navigation/navConfig';
import { useAuth } from '../../providers/AuthProvider';
import { colors } from '../../theme';

export interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { person } = useAuth();
  const { isSidebarLayout } = useBreakpoint();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const items = useMemo(() => (person ? navItemsForRole(person.role) : []), [person]);

  const activeItem = useMemo(() => {
    return items.find((item) => {
      const cleaned = item.href.replace('/(app)/(shell)', '') || '/';
      return pathname === cleaned || pathname.startsWith(`${cleaned}/`);
    });
  }, [items, pathname]);

  const unreadCount = useMemo(() => {
    if (!person) return 0;
    return notificationsForPerson(person.id).filter((n) => !n.read).length;
  }, [person]);

  if (!person) return null;

  const headerTop = HEADER_HEIGHT + (isSidebarLayout ? 0 : insets.top);

  return (
    <View style={styles.root}>
      <View style={styles.body}>
        {isSidebarLayout ? <Sidebar items={items} /> : null}
        <View style={styles.main}>
          <Header
            title={activeItem?.label ?? 'SiteVault'}
            isSidebarLayout={isSidebarLayout}
            unreadCount={unreadCount}
            onAvatarPress={() => setProfileMenuOpen((v) => !v)}
          />
          <View style={styles.content}>{children}</View>
        </View>
      </View>

      {!isSidebarLayout ? <BottomNav items={items} /> : null}

      {profileMenuOpen ? <ProfileMenu onClose={() => setProfileMenuOpen(false)} top={headerTop} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  body: {
    flex: 1,
    flexDirection: 'row',
  },
  main: {
    flex: 1,
    minWidth: 0,
  },
  content: {
    flex: 1,
  },
});
