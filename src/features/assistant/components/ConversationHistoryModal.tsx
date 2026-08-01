import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';

import { Button, Text } from '../../../components/ui';
import { colors, radius, spacing } from '../../../theme';
import type { Conversation } from '../types';

function formatRelativeTime(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export function ConversationHistoryModal({
  visible,
  conversations,
  activeId,
  onSelect,
  onNewChat,
  onDelete,
  onClose,
}: {
  visible: boolean;
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}) {
  const handleSelect = (id: string) => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    onSelect(id);
    onClose();
  };

  const handleNewChat = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onNewChat();
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
          <View style={styles.header}>
            <Text variant="title3">Conversations</Text>
          </View>

          <View style={styles.newChatWrap}>
            <Button label="New Chat" variant="secondary" onPress={handleNewChat} />
          </View>

          {conversations.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Text variant="subhead" color={colors.textSecondary}>
                Your past conversations will show up here.
              </Text>
            </View>
          ) : (
            <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
              {conversations.map((conversation) => {
                const isActive = conversation.id === activeId;
                return (
                  <Pressable
                    key={conversation.id}
                    onPress={() => handleSelect(conversation.id)}
                    style={[styles.row, isActive && styles.rowActive]}
                  >
                    <View style={styles.rowText}>
                      <Text variant="subhead" numberOfLines={1}>
                        {conversation.title || 'New conversation'}
                      </Text>
                      <Text variant="caption1" color={colors.textTertiary}>
                        {formatRelativeTime(conversation.updatedAt)}
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => onDelete(conversation.id)}
                      hitSlop={10}
                      style={styles.deleteButton}
                    >
                      <Ionicons name="trash-outline" size={16} color={colors.textTertiary} />
                    </Pressable>
                  </Pressable>
                );
              })}
            </ScrollView>
          )}
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
    maxHeight: '75%',
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
  header: {
    marginBottom: spacing.md,
  },
  newChatWrap: {
    marginBottom: spacing.md,
  },
  emptyWrap: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  list: {
    marginTop: spacing.xxs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  rowActive: {
    backgroundColor: colors.accentMuted,
    marginHorizontal: -spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    borderBottomWidth: 0,
  },
  rowText: {
    flex: 1,
    marginRight: spacing.sm,
  },
  deleteButton: {
    padding: spacing.xxs,
  },
});
