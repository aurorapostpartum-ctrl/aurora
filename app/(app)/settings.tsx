import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Avatar, Button, GlassCard, Screen, StatusBadge, Text } from '../../src/components/ui';
import { COMPANY } from '../../src/data/company';
import { isSimulatedOffline, setSimulatedOffline, useOfflineVersion, useOverallSyncStatus } from '../../src/data/offlineStore';
import { useAuth } from '../../src/providers/AuthProvider';
import { colors, spacing } from '../../src/theme';

export default function SettingsScreen() {
  const { person, signOut } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

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

  if (!person) return null;

  return (
    <Screen glow={false}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backButton}>
          <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.inner}>
          <Animated.View entering={FadeInDown.duration(400)}>
            <Text variant="largeTitle" style={styles.title}>
              Settings
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(60)}>
            <GlassCard style={styles.profileCard}>
              <View style={styles.profileRow}>
                <Avatar initials={person.initials} color={person.avatarColor} size={52} />
                <View style={styles.profileText}>
                  <Text variant="headline" numberOfLines={1}>
                    {person.name}
                  </Text>
                  <Text variant="footnote" color={colors.textSecondary} numberOfLines={1}>
                    {person.title}
                  </Text>
                  <Text variant="footnote" color={colors.textTertiary} numberOfLines={1}>
                    {person.email}
                  </Text>
                </View>
                <StatusBadge
                  label={person.role === 'manager' ? 'Manager' : 'Employee'}
                  tone={person.role === 'manager' ? 'accent' : 'neutral'}
                />
              </View>
            </GlassCard>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(110)}>
            <Text variant="caption1" color={colors.textTertiary} style={styles.sectionLabel}>
              COMPANY
            </Text>
            <GlassCard style={styles.groupCard}>
              <View style={styles.row}>
                <View style={styles.rowIcon}>
                  <Ionicons name="business-outline" size={18} color={colors.textSecondary} />
                </View>
                <View style={styles.rowLabelText}>
                  <Text variant="body">{COMPANY.name}</Text>
                  <Text variant="footnote" color={colors.textTertiary}>
                    {COMPANY.trade} · {COMPANY.hqAddress}
                  </Text>
                </View>
              </View>
            </GlassCard>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(150)}>
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

          <Animated.View entering={FadeInDown.duration(400).delay(170)}>
            <Text variant="caption1" color={colors.textTertiary} style={styles.sectionLabel}>
              OFFLINE
            </Text>
            <GlassCard style={styles.groupCard}>
              <OfflineToggleRow />
            </GlassCard>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(190)} style={styles.signOutBlock}>
            <Button
              label="Sign Out"
              variant="destructive"
              onPress={handleSignOutPress}
              loading={signingOut}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(220)}>
            <Text variant="caption1" color={colors.textTertiary} style={styles.version}>
              SiteVault · v1.0.0
            </Text>
          </Animated.View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const SYNC_STATUS_LABEL: Record<ReturnType<typeof useOverallSyncStatus>['status'], string> = {
  offline: "You're offline right now",
  syncing: 'Syncing your work…',
  error: 'Some items failed to sync',
  synced: 'Everything is synced',
};

function OfflineToggleRow() {
  useOfflineVersion();
  const simulated = isSimulatedOffline();
  const { status } = useOverallSyncStatus();

  return (
    <View style={[styles.row, styles.rowLast]}>
      <View style={styles.rowIcon}>
        <Ionicons name="cloud-offline-outline" size={18} color={colors.textSecondary} />
      </View>
      <View style={styles.rowLabelFlex}>
        <Text variant="body">Simulate Offline Mode</Text>
        <Text variant="footnote" color={colors.textTertiary}>
          {simulated ? 'On — the app is acting as if there is no connection.' : SYNC_STATUS_LABEL[status]}
        </Text>
      </View>
      <Switch
        value={simulated}
        onValueChange={setSimulatedOffline}
        trackColor={{ false: colors.surfaceHighlight, true: colors.accent }}
        thumbColor={colors.textPrimary}
      />
    </View>
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
      <Text variant="body" style={styles.rowLabelFlex}>
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
  header: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xs,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
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
  rowLabelText: {
    flex: 1,
    marginLeft: spacing.xs,
  },
  rowLabelFlex: {
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
