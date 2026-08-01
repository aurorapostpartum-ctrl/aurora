import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState, Text, Toast } from '../../src/components/ui';
import { colors, spacing } from '../../src/theme';
import { useCodeSearch } from '../../src/features/search/useCodeSearch';
import { SearchBar } from '../../src/features/search/components/SearchBar';
import { FilterBar } from '../../src/features/search/components/FilterBar';
import { SuggestionsList } from '../../src/features/search/components/SuggestionsList';
import { SearchResultCard } from '../../src/features/search/components/SearchResultCard';
import { RecentPopularSearches } from '../../src/features/search/components/RecentPopularSearches';
import type { CodeEntry } from '../../src/features/search/types';

export default function SearchScreen() {
  const {
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
  } = useCodeSearch();

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 260);
    return () => clearTimeout(timer);
  }, []);

  const handleSelectSuggestion = useCallback(
    (entry: CodeEntry) => {
      commitSearch(entry.title);
    },
    [commitSearch]
  );

  const handleVoiceUnsupported = useCallback(() => {
    setToastMessage(
      Platform.OS === 'web'
        ? "Voice input isn't supported in this browser"
        : "Voice input isn't available on this device yet"
    );
  }, []);

  const showBrowsing = query.length === 0;
  const showSuggestions = !showBrowsing && focused;
  const showResults = !showBrowsing && !focused;

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.flex} edges={['top', 'bottom', 'left', 'right']}>
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={8}
            style={styles.headerButton}
            accessibilityRole="button"
            accessibilityLabel="Close search"
          >
            <Ionicons name="chevron-down" size={22} color={colors.textSecondary} />
          </Pressable>
          <View style={styles.headerTitle}>
            <Text variant="headline">Search Codes</Text>
            <Text variant="caption1" color={colors.textTertiary}>
              CodeBook Canada Pro
            </Text>
          </View>
          <View style={styles.headerButton} />
        </View>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.searchArea}>
            <View style={styles.inner}>
              <SearchBar
                ref={inputRef}
                value={query}
                onChangeText={setQuery}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onSubmit={() => commitSearch()}
                onClear={clearQuery}
                onVoiceUnsupported={handleVoiceUnsupported}
              />
              <View style={styles.filterBarWrap}>
                <FilterBar
                  filters={filters}
                  onSetFilter={setFilter}
                  onClearFilters={clearFilters}
                  activeFilterCount={activeFilterCount}
                />
              </View>
            </View>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.inner}>
              {showBrowsing ? (
                <RecentPopularSearches
                  recentSearches={recentSearches}
                  onSelect={(term) => commitSearch(term)}
                  onRemoveRecent={removeRecentSearch}
                />
              ) : showSuggestions ? (
                <SuggestionsList suggestions={suggestions} onSelect={handleSelectSuggestion} />
              ) : showResults ? (
                results.length === 0 ? (
                  <EmptyState
                    icon="search-outline"
                    title="No matches"
                    message={
                      activeFilterCount > 0
                        ? 'Try clearing a filter or searching a different term.'
                        : 'Try a different search term.'
                    }
                    actionLabel={activeFilterCount > 0 ? 'Clear filters' : undefined}
                    onAction={activeFilterCount > 0 ? clearFilters : undefined}
                  />
                ) : (
                  <>
                    <Text variant="footnote" color={colors.textTertiary} style={styles.resultsLabel}>
                      {results.length} {results.length === 1 ? 'RESULT' : 'RESULTS'}
                    </Text>
                    {results.map((entry, index) => (
                      <SearchResultCard
                        key={entry.id}
                        entry={entry}
                        bookmarked={bookmarkedIds.has(entry.id)}
                        onToggleBookmark={toggleBookmark}
                        index={index}
                      />
                    ))}
                  </>
                )
              ) : null}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

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
  },
  headerTitle: {
    alignItems: 'center',
  },
  inner: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
  },
  searchArea: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    alignItems: 'center',
  },
  filterBarWrap: {
    marginTop: spacing.sm,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    alignItems: 'center',
  },
  resultsLabel: {
    marginBottom: spacing.sm,
    marginLeft: spacing.xxs,
  },
});
