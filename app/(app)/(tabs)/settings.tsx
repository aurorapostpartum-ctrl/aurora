import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useMemo, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Button, GlassCard, Screen, Text } from '../../../src/components/ui';
import { useAuth } from '../../../src/providers/AuthProvider';
import { colors, spacing } from '../../../src/theme';

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  const initials = useMemo(() => {
    const fullName = (user?.user_metadata?.full_name as string | undefined)?.trim();
    const source = fullName || user?.email || '?';
    return source
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('');
  }, [user]);

  const fullName = (user?.user_metadata?.full_name as string | undefined) ?? 'Your Account';

  const handleSignOutPress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: performSignOut },
    ]);
  };

  const performSignOut = async () => {
    setSigningOut(true);
    await signOut();
    setSigningOut(false);
  };

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.inner}>
          <Animated.View entering={FadeInDown.duration(400)}>
            <Text variant="largeTitle" style={styles.title}>
              Settings
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(60)}>
            <GlassCard style={styles.profileCard}>
              <View style={styles.profileRow}>
                <View style={styles.avatar}>
                  <Text variant="headline">{initials || '?'}</Text>
                </View>
                <View style={styles.profileText}>
                  <Text variant="headline" numberOfLines={1}>
                    {fullName}
                  </Text>
                  <Text variant="footnote" color={colors.textSecondary} numberOfLines={1}>
                    {user?.email}
                  </Text>
                </View>
              </View>
            </GlassCard>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(120)}>
            <Text variant="caption1" color={colors.textTertiary} style={styles.sectionLabel}>
              ACCOUNT
            </Text>
            <GlassCard style={styles.groupCard}>
              <SettingsRow icon="notifications-outline" label="Notifications" />
              <Divider />
              <SettingsRow icon="shield-checkmark-outline" label="Privacy & Security" />
              <Divider />
              <SettingsRow icon="help-circle-outline" label="Help & Support" last />
            </GlassCard>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(180)} style={styles.signOutBlock}>
            <Button
              label="Sign Out"
              variant="destructive"
              onPress={handleSignOutPress}
              loading={signingOut}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(220)}>
            <Text variant="caption1" color={colors.textTertiary} style={styles.version}>
              CodeBook Canada Pro · v1.0.0
            </Text>
          </Animated.View>
        </View>
      </ScrollView>
    </Screen>
  );
}

function SettingsRow({
  icon,
  label,
  last = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.row, last && styles.rowLast]}>
      <View style={styles.rowIcon}>
        <Ionicons name={icon} size={18} color={colors.textSecondary} />
      </View>
      <Text variant="body" style={styles.rowLabel}>
        {label}
      </Text>
      <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxxl,
    alignItems: 'center',
  },
  inner: {
    width: '100%',
    maxWidth: 720,
  },
  title: {
    marginBottom: spacing.lg,
  },
  profileCard: {
    marginBottom: spacing.lg,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.accentMuted,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.accentBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileText: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  sectionLabel: {
    marginBottom: spacing.xs,
    marginLeft: spacing.xxs,
  },
  groupCard: {
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  rowLast: {},
  rowIcon: {
    width: 28,
    alignItems: 'flex-start',
  },
  rowLabel: {
    flex: 1,
    marginLeft: spacing.xs,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.divider,
    marginLeft: spacing.md + 28,
  },
  signOutBlock: {
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  version: {
    textAlign: 'center',
  },
});
