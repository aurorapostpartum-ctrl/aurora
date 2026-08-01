import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { SelectModal, Text, TextField } from '../../../components/ui';
import { colors, radius, spacing } from '../../../theme';
import { PROVINCES } from '../constants';
import type { StepProps } from './types';

export function CompanyBasicsStep({ payload, updatePayload }: StepProps) {
  const [pickerVisible, setPickerVisible] = useState(false);

  const provinceName = PROVINCES.find((p) => p.code === payload.province)?.name;

  return (
    <View>
      <Text variant="title2" style={styles.title}>
        Tell us about your company
      </Text>
      <Text variant="body" color={colors.textSecondary} style={styles.subtitle}>
        This helps us tailor your workspace and code references.
      </Text>

      <TextField
        label="Company name"
        placeholder="Acme Electrical Inc."
        autoCapitalize="words"
        autoComplete="organization"
        textContentType="organizationName"
        value={payload.companyName}
        onChangeText={(text) => updatePayload({ companyName: text })}
        returnKeyType="next"
      />

      <Text variant="footnote" color={colors.textSecondary} style={styles.fieldLabel}>
        Province
      </Text>
      <Pressable onPress={() => setPickerVisible(true)} style={styles.provinceField}>
        <Text
          variant="body"
          color={provinceName ? colors.textPrimary : colors.textTertiary}
          style={styles.provinceText}
        >
          {provinceName ?? 'Select your province'}
        </Text>
        <Ionicons name="chevron-down" size={18} color={colors.textTertiary} />
      </Pressable>

      <SelectModal
        visible={pickerVisible}
        title="Select province"
        options={PROVINCES.map((p) => ({ label: p.name, value: p.code }))}
        selectedValue={payload.province || null}
        onSelect={(value) => updatePayload({ province: value })}
        onClose={() => setPickerVisible(false)}
      />
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
  fieldLabel: {
    marginBottom: spacing.xs,
    marginLeft: spacing.xxs,
  },
  provinceField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 54,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.surfaceBorder,
    backgroundColor: colors.surface,
  },
  provinceText: {
    flex: 1,
  },
});
