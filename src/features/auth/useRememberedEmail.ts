import { useCallback, useEffect, useState } from 'react';

import { storage } from '../../lib/storage';

const STORAGE_KEY = 'auth.rememberedEmail';

export function useRememberedEmail() {
  const [rememberedEmail, setRememberedEmail] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  useEffect(() => {
    let mounted = true;
    storage.getItem(STORAGE_KEY).then((value) => {
      if (!mounted || !value) return;
      setRememberedEmail(value);
      setRememberMe(true);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const persistEmail = useCallback((email: string, remember: boolean) => {
    if (remember) {
      storage.setItem(STORAGE_KEY, email);
    } else {
      storage.removeItem(STORAGE_KEY);
    }
  }, []);

  return { rememberedEmail, rememberMe, setRememberMe, persistEmail };
}
