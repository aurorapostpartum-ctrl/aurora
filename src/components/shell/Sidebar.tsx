import { Ionicons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '../ui';
import { COMPANY } from '../../data/company';
import type { NavItem } from '../../navigation/navConfig';
import { colors, radius, spacing } from '../../theme';

export const SIDEBAR_WIDTH = 248;

export interface SidebarProps {
  items: NavItem[];
}

export function Sidebar({ items }: SidebarProps) {
  const pathname = usePathname();

  return (
    <View style={styles.root}>
      <View style={styles.brandRow}>
        <View style={styles.brandMark}>
          <Ionicons name="folder" size={18} color={colors.textOnAccent} />
        </View>
        <View>
          <Text variant="headline">SiteVault</Text>
          <Text variant="caption2" color={colors.textTertiary}>
            {COMPANY.name}
          </Text>
        </View>
      </View>

      <View style={styles.nav}>
        {items.map((item) => {
          const active = matchesHref(pathname, item.href);
          return (
            <Pressable
              key={item.key}
              onPress={() => router.push(item.href as never)}
              style={[styles.navItem, active && styles.navItemActive]}
            >
              <Ionicons
                name={active ? item.iconActive : item.icon}
                size={19}
                color={active ? colors.accentStrong : colors.textSecondary}
              />
              <Text variant="subhead" color={active ? colors.textPrimary : colors.textSecondary} style={styles.navLabel}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function matchesHref(pathname: string, href: string) {
  const cleaned = href.replace('/(app)/(shell)', '') || '/';
  return pathname === cleaned || pathname.startsWith(`${cleaned}/`);
}

const styles = StyleSheet.create({
  root: {
    width: SIDEBAR_WIDTH,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: colors.divider,
    backgroundColor: colors.backgroundElevated,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.xs,
  },
  brandMark: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  nav: {
    gap: 2,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
  },
  navItemActive: {
    backgroundColor: colors.accentMuted,
  },
  navLabel: {
    marginLeft: spacing.sm,
  },
});
