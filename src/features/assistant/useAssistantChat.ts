import { useCallback, useEffect, useRef, useState } from 'react';

import { storage } from '../../lib/storage';
import { streamAssistantReply, type StreamHandle } from './assistantEngine';
import type { ChatMessage, Conversation } from './types';

const STORAGE_KEY = 'assistant.conversations';

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function titleFromPrompt(prompt: string) {
  const trimmed = prompt.trim().replace(/\s+/g, ' ');
  return trimmed.length > 48 ? `${trimmed.slice(0, 48)}…` : trimmed;
}

export function useAssistantChat() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const streamRef = useRef<StreamHandle | null>(null);

  useEffect(() => {
    let mounted = true;
    storage.getItem(STORAGE_KEY).then((raw) => {
      if (!mounted) return;
      if (raw) {
        try {
          setConversations(JSON.parse(raw) as Conversation[]);
        } catch {
          setConversations([]);
        }
      }
      setHydrated(true);
    });
    return () => {
      mounted = false;
      streamRef.current?.cancel();
    };
  }, []);

  const persist = useCallback((next: Conversation[]) => {
    setConversations(next);
    storage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const activeConversation = conversations.find((c) => c.id === activeId) ?? null;

  const startNewConversation = useCallback(() => {
    streamRef.current?.cancel();
    setActiveId(null);
  }, []);

  const selectConversation = useCallback((id: string) => {
    streamRef.current?.cancel();
    setActiveId(id);
  }, []);

  const deleteConversation = useCallback(
    (id: string) => {
      persist(conversations.filter((c) => c.id !== id));
      if (activeId === id) setActiveId(null);
    },
    [conversations, activeId, persist]
  );

  const toggleBookmark = useCallback(
    (messageId: string) => {
      if (!activeId) return;
      persist(
        conversations.map((c) =>
          c.id !== activeId
            ? c
            : {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === messageId ? { ...m, bookmarked: !m.bookmarked } : m
                ),
              }
        )
      );
    },
    [activeId, conversations, persist]
  );

  const sendMessage = useCallback(
    (prompt: string) => {
      const trimmed = prompt.trim();
      if (!trimmed) return;

      const userMessage: ChatMessage = {
        id: makeId(),
        role: 'user',
        content: trimmed,
        createdAt: new Date().toISOString(),
        status: 'complete',
      };
      const assistantMessageId = makeId();
      const assistantPlaceholder: ChatMessage = {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        createdAt: new Date().toISOString(),
        status: 'streaming',
      };

      let conversationId = activeId;
      let workingList = conversations;

      if (!conversationId) {
        conversationId = makeId();
        const newConversation: Conversation = {
          id: conversationId,
          title: titleFromPrompt(trimmed),
          updatedAt: new Date().toISOString(),
          messages: [userMessage, assistantPlaceholder],
        };
        workingList = [newConversation, ...conversations];
        setActiveId(conversationId);
        persist(workingList);
      } else {
        workingList = conversations.map((c) =>
          c.id !== conversationId
            ? c
            : {
                ...c,
                updatedAt: new Date().toISOString(),
                messages: [...c.messages, userMessage, assistantPlaceholder],
              }
        );
        persist(workingList);
      }

      const finalConversationId = conversationId;

      streamRef.current?.cancel();
      streamRef.current = streamAssistantReply(
        trimmed,
        (textSoFar) => {
          setConversations((prev) =>
            prev.map((c) =>
              c.id !== finalConversationId
                ? c
                : {
                    ...c,
                    messages: c.messages.map((m) =>
                      m.id === assistantMessageId ? { ...m, content: textSoFar } : m
                    ),
                  }
            )
          );
        },
        (reply) => {
          setConversations((prev) => {
            const next = prev.map((c) =>
              c.id !== finalConversationId
                ? c
                : {
                    ...c,
                    messages: c.messages.map((m) =>
                      m.id === assistantMessageId
                        ? { ...m, content: reply.content, sources: reply.sources, status: 'complete' as const }
                        : m
                    ),
                  }
            );
            storage.setItem(STORAGE_KEY, JSON.stringify(next));
            return next;
          });
        }
      );
    },
    [activeId, conversations, persist]
  );

  return {
    hydrated,
    conversations,
    activeConversation,
    messages: activeConversation?.messages ?? [],
    sendMessage,
    startNewConversation,
    selectConversation,
    deleteConversation,
    toggleBookmark,
  };
}
