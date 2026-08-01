import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { Avatar, StatusBadge, Text } from '../ui';
import { useAuth } from '../../providers/AuthProvider';
import { colors, radius, shadows, spacing } from '../../theme';

export interface ProfileMenuProps {
  onClose: () => void;
  top: number;
}

export function ProfileMenu({ onClose, top }: ProfileMenuProps) {
  const { person, signOut } = useAuth();
  if (!person) return null;

  const go = (href: string) => {
    onClose();
    router.push(href as never);
  };

  const handleSignOut = async () => {
    onClose();
    await signOut();
  };

  return (
    <>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      <Animated.View
        entering={FadeIn.duration(140)}
        exiting={FadeOut.duration(100)}
        style={[styles.panel, shadows.lg, { top }]}
      >
        <View style={styles.header}>
          <Avatar initials={person.initials} color={person.avatarColor} size={38} />
          <View style={styles.headerText}>
            <Text variant="subhead" numberOfLines={1}>
              {person.name}
            </Text>
            <Text variant="caption1" color={colors.textTertiary} numberOfLines={1}>
              {person.email}
            </Text>
          </View>
        </View>
        <View style={styles.badgeRow}>
          <StatusBadge label={person.role === 'manager' ? 'Manager' : 'Employee'} tone={person.role === 'manager' ? 'accent' : 'neutral'} />
        </View>

        <View style={styles.divider} />

        <MenuRow icon="settings-outline" label="Settings" onPress={() => go('/(app)/settings')} />
        <MenuRow icon="help-circle-outline" label="Help & Support" onPress={onClose} />

        <View style={styles.divider} />

        <MenuRow icon="log-out-outline" label="Sign Out" tone={colors.danger} onPress={handleSignOut} />
      </Animated.View>
    </>
  );
}

function MenuRow({
  icon,
  label,
  onPress,
  tone = colors.textPrimary,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  tone?: string;
}) {
  return (
    <Pressable onPress={onPress} style={styles.row}>
      <Ionicons name={icon} size={17} color={tone} />
      <Text variant="subhead" color={tone} style={styles.rowLabel}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  panel: {
    position: 'absolute',
    right: spacing.lg,
    width: 248,
    backgroundColor: colors.backgroundElevated2,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
    paddingVertical: spacing.sm,
    zIndex: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  headerText: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  badgeRow: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.divider,
    marginVertical: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  rowLabel: {
    marginLeft: spacing.sm,
  },
});
