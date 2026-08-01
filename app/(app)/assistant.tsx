import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Text, Toast } from '../../src/components/ui';
import { colors, radius, spacing } from '../../src/theme';
import { useAssistantChat } from '../../src/features/assistant/useAssistantChat';
import { ChatBubble } from '../../src/features/assistant/components/ChatBubble';
import { ChatComposer } from '../../src/features/assistant/components/ChatComposer';
import { SuggestedPrompts } from '../../src/features/assistant/components/SuggestedPrompts';
import { ConversationHistoryModal } from '../../src/features/assistant/components/ConversationHistoryModal';
import type { ChatMessage } from '../../src/features/assistant/types';

export default function AssistantScreen() {
  const {
    conversations,
    activeConversation,
    messages,
    sendMessage,
    startNewConversation,
    selectConversation,
    deleteConversation,
    toggleBookmark,
  } = useAssistantChat();

  const [historyVisible, setHistoryVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  const isStreaming = messages.some((m) => m.status === 'streaming');

  const handleCopy = useCallback(async (message: ChatMessage) => {
    await Clipboard.setStringAsync(message.content);
    setToastMessage('Copied to clipboard');
  }, []);

  const handleVoiceUnsupported = useCallback(() => {
    setToastMessage(
      Platform.OS === 'web'
        ? "Voice input isn't supported in this browser"
        : "Voice input isn't available on this device yet"
    );
  }, []);

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.flex} edges={['top', 'bottom', 'left', 'right']}>
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={8}
            style={styles.headerButton}
            accessibilityRole="button"
            accessibilityLabel="Close assistant"
          >
            <Ionicons name="chevron-down" size={22} color={colors.textSecondary} />
          </Pressable>
          <View style={styles.headerTitle}>
            <Text variant="headline">AI Assistant</Text>
            <Text variant="caption1" color={colors.textTertiary}>
              CodeBook Canada Pro
            </Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable onPress={startNewConversation} hitSlop={8} style={styles.headerButton}>
              <Ionicons name="create-outline" size={20} color={colors.textSecondary} />
            </Pressable>
            <Pressable
              onPress={() => setHistoryVisible(true)}
              hitSlop={8}
              style={styles.headerButton}
            >
              <Ionicons name="time-outline" size={20} color={colors.textSecondary} />
            </Pressable>
          </View>
        </View>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {messages.length === 0 ? (
            <ScrollView
              contentContainerStyle={styles.welcomeContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.inner}>
                <Animated.View entering={FadeInDown.duration(400)} style={styles.welcomeHeader}>
                  <View style={styles.welcomeAvatar}>
                    <Ionicons name="sparkles" size={26} color="#FFFFFF" />
                  </View>
                  <Text variant="title2" style={styles.welcomeTitle}>
                    Ask me anything
                  </Text>
                  <Text variant="body" color={colors.textSecondary} style={styles.welcomeSubtitle}>
                    Code lookups, calculations, and checklists — with sources you can verify.
                  </Text>
                </Animated.View>
                <SuggestedPrompts onSelect={sendMessage} />
              </View>
            </ScrollView>
          ) : (
            <ScrollView
              ref={scrollRef}
              contentContainerStyle={styles.messagesContent}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.inner}>
                {messages.map((message) => (
                  <ChatBubble
                    key={message.id}
                    message={message}
                    onCopy={handleCopy}
                    onToggleBookmark={toggleBookmark}
                  />
                ))}
              </View>
            </ScrollView>
          )}

          <View style={styles.composerOuter}>
            <View style={styles.composerWrap}>
              <ChatComposer
                onSend={sendMessage}
                disabled={isStreaming}
                onVoiceUnsupported={handleVoiceUnsupported}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <ConversationHistoryModal
        visible={historyVisible}
        conversations={conversations}
        activeId={activeConversation?.id ?? null}
        onSelect={selectConversation}
        onNewChat={startNewConversation}
        onDelete={deleteConversation}
        onClose={() => setHistoryVisible(false)}
      />

      {toastMessage ? <Toast message={toastMessage} onHide={() => setToastMessage(null)} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  headerButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
  },
  headerTitle: {
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
  },
  inner: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
  },
  welcomeContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    alignItems: 'center',
  },
  welcomeHeader: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  welcomeAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  welcomeTitle: {
    marginBottom: spacing.xs,
  },
  welcomeSubtitle: {
    textAlign: 'center',
    maxWidth: 320,
  },
  messagesContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    alignItems: 'center',
  },
  composerOuter: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    alignItems: 'center',
  },
  composerWrap: {
    width: '100%',
    maxWidth: 720,
  },
});
