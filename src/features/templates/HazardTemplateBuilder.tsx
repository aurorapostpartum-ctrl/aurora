import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';

import { Button, Chip, Screen, Text, TextField } from '../../components/ui';
import { createHazardTemplate, updateHazardTemplate } from '../../data/mockStore';
import { colors, radius, spacing } from '../../theme';
import type { HazardAssessmentTemplate, TemplateVisibility } from '../../types/domain';
import {
  TRADE_OPTIONS,
  createDraftHazardItem,
  createDraftHazardSection,
  templateToDraftHazardSections,
  type DraftHazardItem,
  type DraftHazardSection,
} from './hazardTemplateMeta';

export interface HazardTemplateBuilderProps {
  mode: 'create' | 'edit';
  template?: HazardAssessmentTemplate;
  actorId: string;
}

export function HazardTemplateBuilder({ mode, template, actorId }: HazardTemplateBuilderProps) {
  const [name, setName] = useState(template?.name ?? '');
  const [trade, setTrade] = useState(template?.trade ?? '');
  const [description, setDescription] = useState(template?.description ?? '');
  const [visibility, setVisibility] = useState<TemplateVisibility>(template?.visibility ?? 'company');
  const [requiresSignature, setRequiresSignature] = useState(template?.requiresSignature ?? true);
  const [sections, setSections] = useState<DraftHazardSection[]>(() => {
    if (!template) return [createDraftHazardSection('')];
    const draft = templateToDraftHazardSections(template);
    // A template uploaded from a file starts with no sections (nothing to flatten yet) —
    // give the builder one blank section to start from instead of an empty screen.
    return draft.length > 0 ? draft : [createDraftHazardSection('')];
  });
  const [error, setError] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);

  const totalItemCount = sections.reduce((sum, s) => sum + s.items.length, 0);

  const addSection = () => setSections((prev) => [...prev, createDraftHazardSection('')]);
  const removeSection = (key: string) => setSections((prev) => prev.filter((s) => s.key !== key));
  const moveSection = (key: string, dir: -1 | 1) => {
    setSections((prev) => {
      const idx = prev.findIndex((s) => s.key === key);
      const next = idx + dir;
      if (idx === -1 || next < 0 || next >= prev.length) return prev;
      const copy = [...prev];
      [copy[idx], copy[next]] = [copy[next], copy[idx]];
      return copy;
    });
  };
  const updateSectionName = (key: string, value: string) =>
    setSections((prev) => prev.map((s) => (s.key === key ? { ...s, name: value } : s)));

  const addItem = (sectionKey: string) =>
    setSections((prev) =>
      prev.map((s) => (s.key === sectionKey ? { ...s, items: [...s.items, createDraftHazardItem()] } : s))
    );
  const removeItem = (sectionKey: string, itemKey: string) =>
    setSections((prev) =>
      prev.map((s) => (s.key === sectionKey ? { ...s, items: s.items.filter((i) => i.key !== itemKey) } : s))
    );
  const moveItem = (sectionKey: string, itemKey: string, dir: -1 | 1) => {
    setSections((prev) =>
      prev.map((s) => {
        if (s.key !== sectionKey) return s;
        const idx = s.items.findIndex((i) => i.key === itemKey);
        const next = idx + dir;
        if (idx === -1 || next < 0 || next >= s.items.length) return s;
        const items = [...s.items];
        [items[idx], items[next]] = [items[next], items[idx]];
        return { ...s, items };
      })
    );
  };
  const updateItem = (sectionKey: string, itemKey: string, patch: Partial<DraftHazardItem>) =>
    setSections((prev) =>
      prev.map((s) =>
        s.key !== sectionKey ? s : { ...s, items: s.items.map((i) => (i.key === itemKey ? { ...i, ...patch } : i)) }
      )
    );

  const handleSubmit = () => {
    if (!name.trim()) {
      setError('Enter a template name');
      return;
    }
    const cleanedSections = sections
      .map((s) => ({ name: s.name, items: s.items.filter((i) => i.hazard.trim().length > 0) }))
      .filter((s) => s.items.length > 0);
    if (cleanedSections.length === 0) {
      setError('Add at least one hazard');
      return;
    }
    setError(undefined);
    setSubmitting(true);

    const payload = {
      name,
      trade,
      description,
      visibility,
      requiresSignature,
      sections: cleanedSections.map((s) => ({
        name: s.name,
        items: s.items.map((i) => ({
          hazard: i.hazard,
          controlMeasure: i.controlMeasure,
          required: i.required,
          requiresPhoto: i.requiresPhoto,
          notes: i.notes,
        })),
      })),
    };

    const result =
      mode === 'create'
        ? createHazardTemplate({ ...payload, createdBy: actorId })
        : updateHazardTemplate(template!.id, payload);

    setSubmitting(false);
    if (result) router.replace(`/(app)/hazard-template/${result.id}` as never);
  };

  return (
    <Screen glow={false}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backButton}>
          <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.inner}>
          <Text variant="largeTitle" style={styles.title}>
            {mode === 'create' ? 'New Hazard Assessment Template' : 'Edit Hazard Assessment Template'}
          </Text>
          <Text variant="body" color={colors.textSecondary} style={styles.subtitle}>
            Build a reusable hazard assessment. Crews generate their own job-specific copy from it — this
            template itself never gets marked complete.
          </Text>

          <TextField
            label="Assessment Name"
            placeholder="e.g. Commercial Roofing Assessment"
            value={name}
            onChangeText={(t) => {
              setName(t);
              if (error) setError(undefined);
            }}
          />

          <Text variant="footnote" color={colors.textSecondary} style={styles.fieldLabel}>
            Trade / Category
          </Text>
          <View style={styles.chipRow}>
            {TRADE_OPTIONS.map((option) => (
              <Chip key={option} label={option} selected={trade === option} onPress={() => setTrade(option)} />
            ))}
          </View>
          <TextField label="" placeholder="Trade or category" value={trade} onChangeText={setTrade} style={styles.tradeInput} />

          <TextField
            label="Description"
            placeholder="What work does this assessment cover?"
            value={description}
            onChangeText={setDescription}
            multiline
          />

          <Text variant="footnote" color={colors.textSecondary} style={styles.fieldLabel}>
            Visibility
          </Text>
          <View style={styles.chipRow}>
            <Chip label="Company Template" selected={visibility === 'company'} onPress={() => setVisibility('company')} />
            <Chip label="Private (My Templates)" selected={visibility === 'private'} onPress={() => setVisibility('private')} />
          </View>

          <Text variant="footnote" color={colors.textSecondary} style={styles.fieldLabel}>
            Sign-Off
          </Text>
          <View style={styles.chipRow}>
            <Chip
              label="Requires crew signature"
              selected={requiresSignature}
              onPress={() => setRequiresSignature((v) => !v)}
            />
          </View>

          <View style={styles.sectionsHeaderRow}>
            <Text variant="caption1" color={colors.textTertiary} style={styles.sectionsLabel}>
              SECTIONS
            </Text>
            <Text variant="caption1" color={colors.textTertiary}>
              {sections.length} section{sections.length === 1 ? '' : 's'} · {totalItemCount} hazard
              {totalItemCount === 1 ? '' : 's'}
            </Text>
          </View>

          {sections.map((section, sectionIndex) => (
            <Animated.View key={section.key} layout={LinearTransition.duration(220)} style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Ionicons name="reorder-three-outline" size={18} color={colors.textTertiary} style={styles.grip} />
                <TextField
                  label=""
                  placeholder="Section name (e.g. FALL HAZARDS)"
                  value={section.name}
                  onChangeText={(t) => updateSectionName(section.key, t)}
                  style={styles.sectionNameInput}
                />
                <ReorderControls
                  onUp={() => moveSection(section.key, -1)}
                  onDown={() => moveSection(section.key, 1)}
                  upDisabled={sectionIndex === 0}
                  downDisabled={sectionIndex === sections.length - 1}
                />
                <Pressable
                  onPress={() => removeSection(section.key)}
                  hitSlop={8}
                  style={styles.deleteButton}
                  accessibilityLabel="Remove section"
                >
                  <Ionicons name="trash-outline" size={16} color={colors.danger} />
                </Pressable>
              </View>

              {section.items.map((item, itemIndex) => (
                <ItemRow
                  key={item.key}
                  item={item}
                  isFirst={itemIndex === 0}
                  isLast={itemIndex === section.items.length - 1}
                  onChange={(patch) => updateItem(section.key, item.key, patch)}
                  onMoveUp={() => moveItem(section.key, item.key, -1)}
                  onMoveDown={() => moveItem(section.key, item.key, 1)}
                  onRemove={() => removeItem(section.key, item.key)}
                />
              ))}

              <Pressable onPress={() => addItem(section.key)} style={styles.addItemButton}>
                <Ionicons name="add-circle-outline" size={16} color={colors.accentStrong} />
                <Text variant="subhead" color={colors.accentStrong} style={styles.addItemLabel}>
                  Add Hazard
                </Text>
              </Pressable>
            </Animated.View>
          ))}

          {error ? (
            <Text variant="footnote" color={colors.danger} style={styles.errorText}>
              {error}
            </Text>
          ) : null}

          <Pressable onPress={addSection} style={styles.addSectionButton}>
            <Ionicons name="add-circle-outline" size={18} color={colors.textPrimary} />
            <Text variant="headline" style={styles.addSectionLabel}>
              Add Section
            </Text>
          </Pressable>

          <Button
            label={mode === 'create' ? 'Save Template' : 'Save Changes'}
            onPress={handleSubmit}
            loading={submitting}
            style={styles.submitButton}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

function ReorderControls({
  onUp,
  onDown,
  upDisabled,
  downDisabled,
}: {
  onUp: () => void;
  onDown: () => void;
  upDisabled: boolean;
  downDisabled: boolean;
}) {
  return (
    <View style={styles.reorderGroup}>
      <Pressable onPress={onUp} disabled={upDisabled} hitSlop={6} style={styles.reorderButton} accessibilityLabel="Move up">
        <Ionicons name="chevron-up" size={14} color={upDisabled ? colors.textTertiary : colors.textPrimary} />
      </Pressable>
      <Pressable onPress={onDown} disabled={downDisabled} hitSlop={6} style={styles.reorderButton} accessibilityLabel="Move down">
        <Ionicons name="chevron-down" size={14} color={downDisabled ? colors.textTertiary : colors.textPrimary} />
      </Pressable>
    </View>
  );
}

function ItemRow({
  item,
  isFirst,
  isLast,
  onChange,
  onMoveUp,
  onMoveDown,
  onRemove,
}: {
  item: DraftHazardItem;
  isFirst: boolean;
  isLast: boolean;
  onChange: (patch: Partial<DraftHazardItem>) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
}) {
  const [notesOpen, setNotesOpen] = useState(item.notes.length > 0);

  return (
    <Animated.View layout={LinearTransition.duration(220)} style={styles.itemRow}>
      <View style={styles.itemHeaderRow}>
        <Ionicons name="reorder-three-outline" size={16} color={colors.textTertiary} style={styles.grip} />
        <Ionicons name="warning-outline" size={14} color={colors.warning} style={styles.hazardIcon} />
        <Text variant="footnote" color={colors.textTertiary} style={styles.itemHeaderLabel}>
          Hazard
        </Text>
        <ReorderControls onUp={onMoveUp} onDown={onMoveDown} upDisabled={isFirst} downDisabled={isLast} />
        <Pressable onPress={onRemove} hitSlop={8} style={styles.deleteButton} accessibilityLabel="Remove hazard">
          <Ionicons name="close" size={16} color={colors.textTertiary} />
        </Pressable>
      </View>

      <TextField
        label=""
        placeholder="Hazard — e.g. Fall from unprotected edge"
        value={item.hazard}
        onChangeText={(t) => onChange({ hazard: t })}
        style={styles.hazardInput}
      />
      <TextField
        label=""
        placeholder="Control measure — e.g. Guardrails or fall arrest system required"
        value={item.controlMeasure}
        onChangeText={(t) => onChange({ controlMeasure: t })}
        style={styles.controlInput}
      />

      <View style={styles.itemMetaRow}>
        <Chip label="Required" selected={item.required} onPress={() => onChange({ required: !item.required })} />
        <Chip
          label="Requires Photo"
          selected={item.requiresPhoto}
          onPress={() => onChange({ requiresPhoto: !item.requiresPhoto })}
        />
        <Pressable onPress={() => setNotesOpen((v) => !v)} style={styles.noteToggle}>
          <Ionicons name="document-text-outline" size={14} color={colors.textSecondary} />
          <Text variant="footnote" color={colors.textSecondary} style={styles.noteToggleLabel}>
            {notesOpen ? 'Hide note' : item.notes ? 'Edit note' : 'Add note'}
          </Text>
        </Pressable>
      </View>

      {notesOpen ? (
        <TextField
          label=""
          placeholder="Optional guidance for whoever completes this item"
          value={item.notes}
          onChangeText={(t) => onChange({ notes: t })}
          style={styles.notesInput}
        />
      ) : null}
    </Animated.View>
  );
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
    maxWidth: 640,
  },
  title: {
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  subtitle: {
    marginBottom: spacing.lg,
  },
  fieldLabel: {
    marginBottom: spacing.xs,
    marginLeft: spacing.xxs,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  tradeInput: {
    marginBottom: spacing.md,
  },
  sectionsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  sectionsLabel: {
    letterSpacing: 1.2,
  },
  section: {
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  grip: {
    marginRight: spacing.xs,
  },
  sectionNameInput: {
    flex: 1,
    marginBottom: 0,
    marginRight: spacing.xs,
  },
  reorderGroup: {
    flexDirection: 'column',
    marginRight: spacing.xs,
  },
  reorderButton: {
    width: 22,
    height: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemRow: {
    backgroundColor: colors.backgroundElevated,
    borderRadius: radius.sm,
    padding: spacing.xs,
    marginBottom: spacing.xs,
  },
  itemHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xxs,
  },
  hazardIcon: {
    marginRight: 4,
  },
  itemHeaderLabel: {
    flex: 1,
  },
  hazardInput: {
    marginBottom: spacing.xxs,
  },
  controlInput: {
    marginBottom: 0,
  },
  itemMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  noteToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
    paddingVertical: 4,
  },
  noteToggleLabel: {
    marginLeft: 4,
  },
  notesInput: {
    marginTop: spacing.xs,
    marginBottom: 0,
  },
  addItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: spacing.xxs,
    marginLeft: 24,
    padding: spacing.xxs,
  },
  addItemLabel: {
    marginLeft: spacing.xxs,
  },
  errorText: {
    marginBottom: spacing.sm,
    marginLeft: spacing.xxs,
  },
  addSectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.surfaceBorder,
    borderStyle: 'dashed',
    marginBottom: spacing.lg,
  },
  addSectionLabel: {
    marginLeft: spacing.xs,
  },
  submitButton: {
    marginBottom: spacing.lg,
  },
});
