import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { Text, TextField } from '../../../components/ui';
import { colors, radius, spacing } from '../../../theme';
import { isValidEmail } from '../../../lib/validation';
import type { StepProps } from './types';

export function InviteTeamStep({ payload, updatePayload }: StepProps) {
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);

  const addEmail = () => {
    const trimmed = draft.trim().toLowerCase();
    if (!trimmed) return;

    if (!isValidEmail(trimmed)) {
      setError('Enter a valid email address');
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
      return;
    }

    if (payload.inviteEmails.includes(trimmed)) {
      setError('Already added');
      return;
    }

    updatePayload({ inviteEmails: [...payload.inviteEmails, trimmed] });
    setDraft('');
    setError(null);
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
  };

  const removeEmail = (email: string) => {
    updatePayload({ inviteEmails: payload.inviteEmails.filter((e) => e !== email) });
  };

  return (
    <View>
      <Text variant="title2" style={styles.title}>
        Invite your team
      </Text>
      <Text variant="body" color={colors.textSecondary} style={styles.subtitle}>
        We'll email an invite once your company is created. You can add more people later.
      </Text>

      <TextField
        label="Email address"
        placeholder="teammate@company.com"
        autoCapitalize="none"
        keyboardType="email-address"
        textContentType="emailAddress"
        value={draft}
        onChangeText={(text) => {
          setDraft(text);
          if (error) setError(null);
        }}
        error={error ?? undefined}
        returnKeyType="done"
        onSubmitEditing={addEmail}
        rightElement={
          <Pressable onPress={addEmail} hitSlop={8}>
            <Text variant="footnote" color={colors.accent}>
              Add
            </Text>
          </Pressable>
        }
      />

      {payload.inviteEmails.length > 0 ? (
        <View style={styles.list}>
          {payload.inviteEmails.map((email) => (
            <View key={email} style={styles.row}>
              <View style={styles.avatar}>
                <Ionicons name="person-outline" size={14} color={colors.textSecondary} />
              </View>
              <Text variant="subhead" style={styles.email} numberOfLines={1}>
                {email}
              </Text>
              <Pressable onPress={() => removeEmail(email)} hitSlop={8}>
                <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    marginBottom: spacing.xxs,
  },
  subtitle: {
    marginBottom: spacing.xl,
  },
  list: {
    marginTop: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
    marginBottom: spacing.xs,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.xs,
  },
  email: {
    flex: 1,
  },
});
