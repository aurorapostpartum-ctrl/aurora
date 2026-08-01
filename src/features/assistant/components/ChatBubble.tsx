import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { GlassCard, Text } from '../../../components/ui';
import { colors, radius, spacing } from '../../../theme';
import type { ChatMessage } from '../types';
import { SourceChip } from './SourceChip';
import { StreamingCursor } from './StreamingCursor';
import { TypingIndicator } from './TypingIndicator';

export function ChatBubble({
  message,
  onCopy,
  onToggleBookmark,
}: {
  message: ChatMessage;
  onCopy: (message: ChatMessage) => void;
  onToggleBookmark: (messageId: string) => void;
}) {
  const isUser = message.role === 'user';
  const isStreaming = message.status === 'streaming';
  const isThinking = isStreaming && message.content.length === 0;

  const handleCopy = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onCopy(message);
  };

  const handleBookmark = () => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    onToggleBookmark(message.id);
  };

  if (isUser) {
    return (
      <Animated.View entering={FadeInUp.duration(280)} style={styles.userRow}>
        <LinearGradient
          colors={['#2F80FF', '#1C63E0']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.userBubble}
        >
          <Text variant="body" color="#FFFFFF">
            {message.content}
          </Text>
        </LinearGradient>
      </Animated.View>
    );
  }

  return (
    <Animated.View entering={FadeInUp.duration(280)} style={styles.assistantRow}>
      <View style={styles.avatar}>
        <Ionicons name="sparkles" size={14} color="#FFFFFF" />
      </View>
      <View style={styles.assistantColumn}>
        <GlassCard radiusToken="md" style={styles.assistantBubble}>
          <View style={styles.assistantInner}>
            {isThinking ? (
              <TypingIndicator />
            ) : (
              <View style={styles.textRow}>
                <Text variant="body" color={colors.textPrimary}>
                  {message.content}
                </Text>
                {isStreaming ? <StreamingCursor /> : null}
              </View>
            )}
          </View>
        </GlassCard>

        {!isThinking && message.sources && message.sources.length > 0 ? (
          <View style={styles.sourcesWrap}>
            {message.sources.map((source) => (
              <SourceChip key={source.id} source={source} />
            ))}
          </View>
        ) : null}

        {message.status === 'complete' ? (
          <View style={styles.actionsRow}>
            <Pressable onPress={handleCopy} hitSlop={8} style={styles.actionButton}>
              <Ionicons name="copy-outline" size={15} color={colors.textTertiary} />
              <Text variant="caption1" color={colors.textTertiary} style={styles.actionLabel}>
                Copy
              </Text>
            </Pressable>
            <Pressable onPress={handleBookmark} hitSlop={8} style={styles.actionButton}>
              <Ionicons
                name={message.bookmarked ? 'bookmark' : 'bookmark-outline'}
                size={15}
                color={message.bookmarked ? colors.accent : colors.textTertiary}
              />
              <Text
                variant="caption1"
                color={message.bookmarked ? colors.accent : colors.textTertiary}
                style={styles.actionLabel}
              >
                {message.bookmarked ? 'Saved' : 'Save'}
              </Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  userRow: {
    alignItems: 'flex-end',
    marginBottom: spacing.md,
  },
  userBubble: {
    maxWidth: '82%',
    borderRadius: radius.lg,
    borderBottomRightRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  assistantRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    maxWidth: '92%',
  },
  avatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.xs,
    marginTop: 2,
  },
  assistantColumn: {
    flexShrink: 1,
  },
  assistantBubble: {
    borderRadius: radius.lg,
    alignSelf: 'flex-start',
  },
  assistantInner: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  textRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
  },
  sourcesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.xs,
  },
  actionsRow: {
    flexDirection: 'row',
    marginTop: spacing.xxs,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.md,
    paddingVertical: spacing.xxs,
  },
  actionLabel: {
    marginLeft: 4,
  },
});
