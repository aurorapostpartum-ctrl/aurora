import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { BottomSheet, Text } from '../../components/ui';
import { duplicateChecklistTemplate, setChecklistTemplateArchived } from '../../data/mockStore';
import { colors, radius, spacing } from '../../theme';
import type { ChecklistTemplate } from '../../types/domain';

export interface TemplateActionsSheetProps {
  visible: boolean;
  onClose: () => void;
  template: ChecklistTemplate;
  actorId: string;
}

export function TemplateActionsSheet({ visible, onClose, template, actorId }: TemplateActionsSheetProps) {
  const handleEdit = () => {
    onClose();
    router.push(`/(app)/checklist-template-edit/${template.id}` as never);
  };

  const handleDuplicate = () => {
    const copy = duplicateChecklistTemplate(template.id, actorId);
    onClose();
    if (copy) router.push(`/(app)/checklist-template-edit/${copy.id}` as never);
  };

  const handleToggleArchived = () => {
    setChecklistTemplateArchived(template.id, !template.archived);
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
