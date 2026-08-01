import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';

import { colors, radius, spacing } from '../../theme';
import { Text } from './Text';

export interface SelectModalOption {
  label: string;
  value: string;
}

export interface SelectModalProps {
  visible: boolean;
  title: string;
  options: SelectModalOption[];
  selectedValue: string | null;
  onSelect: (value: string) => void;
  onClose: () => void;
}

export function SelectModal({
  visible,
  title,
  options,
  selectedValue,
  onSelect,
  onClose,
}: SelectModalProps) {
  const handleSelect = (value: string) => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    onSelect(value);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
          <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(150)}
            style={styles.backdrop}
          />
        </Pressable>
        <Animated.View
          entering={SlideInDown.duration(320).springify().damping(20)}
          exiting={SlideOutDown.duration(220)}
          style={styles.sheet}
        >
          <View style={styles.handle} />
          <Text variant="title3" style={styles.title}>
            {title}
          </Text>
          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {options.map((option) => {
              const isSelected = option.value === selectedValue;
              return (
                <Pressable
                  key={option.value}
                  onPress={() => handleSelect(option.value)}
                  style={styles.row}
                >
                  <Text variant="body" color={isSelected ? colors.textPrimary : colors.textSecondary}>
                    {option.label}
                  </Text>
                  {isSelected ? (
                    <Ionicons name="checkmark" size={18} color={colors.accent} />
                  ) : null}
                </Pressable>
              );
            })}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.overlay,
  },
  sheet: {
    maxHeight: '70%',
    backgroundColor: colors.backgroundElevated2,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surfaceBorder,
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceHighlight,
    marginBottom: spacing.md,
  },
  title: {
    marginBottom: spacing.sm,
  },
  list: {
    marginTop: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
});
