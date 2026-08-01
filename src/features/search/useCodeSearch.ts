import { useCallback, useMemo, useRef, useState } from 'react';

import { useLocalList } from '../dashboard/useLocalList';
import type { RecentSearch, SavedCode } from '../dashboard/types';
import { searchCodes } from './searchEngine';
import type { CodeEntry, SearchFilters } from './types';
import { EMPTY_FILTERS } from './types';

const RECENT_SEARCHES_KEY = 'dashboard.recentSearches';
const SAVED_CODES_KEY = 'dashboard.savedCodes';
const MAX_RECENT = 8;
// Give a tap on a suggestion/result time to register before the text input's
// blur event unmounts the list it lives in — otherwise the blur wins the race
// and the press never fires. Standard fix for this exact class of bug.
const BLUR_DELAY_MS = 150;

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function useCodeSearch() {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>(EMPTY_FILTERS);
  const lastLoggedQuery = useRef<string | null>(null);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { items: recentSearches, persist: persistRecent } =
    useLocalList<RecentSearch>(RECENT_SEARCHES_KEY);
  const { items: savedCodes, persist: persistSaved } = useLocalList<SavedCode>(SAVED_CODES_KEY);

  const results = useMemo(() => searchCodes(query, filters), [query, filters]);
  const suggestions = useMemo(() => results.slice(0, 6), [results]);

  const bookmarkedIds = useMemo(() => new Set(savedCodes.map((s) => s.id)), [savedCodes]);

  const clearBlurTimer = useCallback(() => {
    if (blurTimer.current) {
      clearTimeout(blurTimer.current);
      blurTimer.current = null;
    }
  }, []);

  const handleFocus = useCallback(() => {
    clearBlurTimer();
    setFocused(true);
  }, [clearBlurTimer]);

  const handleBlur = useCallback(() => {
    blurTimer.current = setTimeout(() => setFocused(false), BLUR_DELAY_MS);
  }, []);

  const logRecentSearch = useCallback(
    (term: string) => {
      const trimmed = term.trim();
      if (!trimmed || lastLoggedQuery.current === trimmed) return;
      lastLoggedQuery.current = trimmed;

      const withoutDuplicate = recentSearches.filter(
        (r) => r.query.toLowerCase() !== trimmed.toLowerCase()
      );
      const next: RecentSearch[] = [
        { id: makeId(), query: trimmed, searchedAt: new Date().toISOString() },
        ...withoutDuplicate,
      ].slice(0, MAX_RECENT);
      persistRecent(next);
    },
    [recentSearches, persistRecent]
  );

  const commitSearch = useCallback(
    (term?: string) => {
      const next = term ?? query;
      clearBlurTimer();
      if (term !== undefined) setQuery(term);
      setFocused(false);
      logRecentSearch(next);
    },
    [query, logRecentSearch, clearBlurTimer]
  );

  const clearQuery = useCallback(() => {
    setQuery('');
    lastLoggedQuery.current = null;
  }, []);

  const setFilter = useCallback((key: keyof SearchFilters, value: string | null) => {
    setFilters((prev) => ({ ...prev, [key]: prev[key] === value ? null : value }));
  }, []);

  const clearFilters = useCallback(() => setFilters(EMPTY_FILTERS), []);

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const toggleBookmark = useCallback(
    (entry: CodeEntry) => {
      if (bookmarkedIds.has(entry.id)) {
        persistSaved(savedCodes.filter((s) => s.id !== entry.id));
      } else {
        const saved: SavedCode = {
          id: entry.id,
          code: entry.sectionRef,
          title: entry.title,
          trade: entry.trade,
        };
        persistSaved([saved, ...savedCodes]);
      }
    },
    [bookmarkedIds, savedCodes, persistSaved]
  );

  const removeRecentSearch = useCallback(
    (id: string) => {
      persistRecent(recentSearches.filter((r) => r.id !== id));
    },
    [recentSearches, persistRecent]
  );

  return {
    query,
    setQuery,
    focused,
    handleFocus,
    handleBlur,
    filters,
    setFilter,
    clearFilters,
    activeFilterCount,
    results,
    suggestions,
    recentSearches,
    removeRecentSearch,
    commitSearch,
    clearQuery,
    bookmarkedIds,
    toggleBookmark,
  };
}
