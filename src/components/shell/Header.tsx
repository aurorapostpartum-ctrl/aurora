import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar, Text } from '../ui';
import { COMPANY } from '../../data/company';
import { useAuth } from '../../providers/AuthProvider';
import { colors, spacing } from '../../theme';

export const HEADER_HEIGHT = 60;

export interface HeaderProps {
  title: string;
  isSidebarLayout: boolean;
  unreadCount: number;
  onAvatarPress: () => void;
}

export function Header({ title, isSidebarLayout, unreadCount, onAvatarPress }: HeaderProps) {
  const { person } = useAuth();
  const insets = useSafeAreaInsets();

  if (!person) return null;

  return (
    <View style={[styles.root, { height: HEADER_HEIGHT + (isSidebarLayout ? 0 : insets.top), paddingTop: isSidebarLayout ? 0 : insets.top }]}>
      <View style={styles.left}>
        {!isSidebarLayout ? (
          <View style={styles.mobileBrand}>
            <View style={styles.brandMark}>
              <Ionicons name="folder" size={14} color={colors.textOnAccent} />
            </View>
            <View>
              <Text variant="headline">SiteVault</Text>
              <Text variant="caption2" color={colors.textTertiary}>
                {COMPANY.name}
              </Text>
            </View>
          </View>
        ) : (
          <Text variant="title3">{title}</Text>
        )}
      </View>

      <View style={styles.right}>
        <Pressable
          onPress={() => router.push('/(app)/(shell)/search' as never)}
          style={styles.iconButton}
          hitSlop={8}
          accessibilityLabel="Search"
        >
          <Ionicons name="search-outline" size={19} color={colors.textPrimary} />
        </Pressable>

        <Pressable
          onPress={() => router.push('/(app)/notifications')}
          style={styles.iconButton}
          hitSlop={8}
          accessibilityLabel="Notifications"
        >
          <Ionicons name="notifications-outline" size={19} color={colors.textPrimary} />
          {unreadCount > 0 ? (
            <View style={styles.badge}>
              <Text variant="caption2" color={colors.textOnAccent}>
                {unreadCount}
              </Text>
            </View>
          ) : null}
        </Pressable>

        <Pressable onPress={onAvatarPress} hitSlop={6}>
          <Avatar initials={person.initials} color={person.avatarColor} size={32} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
    backgroundColor: colors.background,
  },
  left: {
    flex: 1,
  },
  mobileBrand: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandMark: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.xs,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconButton: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -6,
    minWidth: 15,
    height: 15,
    borderRadius: 8,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
});
