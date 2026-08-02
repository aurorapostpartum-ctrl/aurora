import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { BottomSheet, Text } from '../../components/ui';
import { duplicateHazardTemplate, setHazardTemplateArchived } from '../../data/mockStore';
import { colors, radius, spacing } from '../../theme';
import type { HazardAssessmentTemplate } from '../../types/domain';

export interface HazardTemplateActionsSheetProps {
  visible: boolean;
  onClose: () => void;
  template: HazardAssessmentTemplate;
  actorId: string;
}

export function HazardTemplateActionsSheet({ visible, onClose, template, actorId }: HazardTemplateActionsSheetProps) {
  const handleEdit = () => {
    onClose();
    router.push(`/(app)/hazard-template-edit/${template.id}` as never);
  };

  const handleDuplicate = () => {
    const copy = duplicateHazardTemplate(template.id, actorId);
    onClose();
    if (copy) router.push(`/(app)/hazard-template-edit/${copy.id}` as never);
  };

  const handleToggleArchived = () => {
    setHazardTemplateArchived(template.id, !template.archived);
    onClose();
  };

  return (
    <BottomSheet visible={visible} title="Template Actions" onClose={onClose}>
      <View style={styles.list}>
        <Pressable onPress={handleEdit} style={styles.row}>
          <Ionicons name="pencil-outline" size={18} color={colors.textPrimary} />
          <Text variant="subhead" style={styles.rowLabel}>
            Edit Template
          </Text>
        </Pressable>
        <Pressable onPress={handleDuplicate} style={styles.row}>
          <Ionicons name="copy-outline" size={18} color={colors.textPrimary} />
          <Text variant="subhead" style={styles.rowLabel}>
            Duplicate Template
          </Text>
        </Pressable>
        <Pressable onPress={handleToggleArchived} style={styles.row}>
          <Ionicons
            name={template.archived ? 'refresh-outline' : 'archive-outline'}
            size={18}
            color={template.archived ? colors.textPrimary : colors.danger}
          />
          <Text variant="subhead" color={template.archived ? colors.textPrimary : colors.danger} style={styles.rowLabel}>
            {template.archived ? 'Restore Template' : 'Archive Template'}
          </Text>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    marginBottom: spacing.xs,
  },
  rowLabel: {
    flex: 1,
    marginLeft: spacing.sm,
  },
});
