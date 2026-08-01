import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { storage } from '../../lib/storage';

export function useLocalList<T>(key: string) {
  const [items, setItems] = useState<T[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const hydrate = useCallback(async () => {
    const raw = await storage.getItem(key);
    if (!raw) {
      setItems([]);
      setHydrated(true);
      return;
    }
    try {
      setItems(JSON.parse(raw) as T[]);
    } catch {
      setItems([]);
    }
    setHydrated(true);
  }, [key]);

  // Re-read on every focus, not just on mount — screens inside a tab
  // navigator stay mounted in the background, so a plain mount-only effect
  // would miss updates made by another screen (e.g. a bookmark added from
  // search) while this one was offscreen.
  useFocusEffect(
    useCallback(() => {
      hydrate();
    }, [hydrate])
  );

  const persist = useCallback(
    (next: T[]) => {
      setItems(next);
      storage.setItem(key, JSON.stringify(next));
    },
    [key]
  );

  return { items, hydrated, persist };
}
