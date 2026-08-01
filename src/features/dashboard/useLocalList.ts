import { useCallback, useEffect, useState } from 'react';

import { storage } from '../../lib/storage';

export function useLocalList<T>(key: string) {
  const [items, setItems] = useState<T[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let mounted = true;
    storage.getItem(key).then((raw) => {
      if (!mounted) return;
      if (raw) {
        try {
          setItems(JSON.parse(raw) as T[]);
        } catch {
          setItems([]);
        }
      }
      setHydrated(true);
    });
    return () => {
      mounted = false;
    };
  }, [key]);

  const persist = useCallback(
    (next: T[]) => {
      setItems(next);
      storage.setItem(key, JSON.stringify(next));
    },
    [key]
  );

  return { items, hydrated, persist };
}
