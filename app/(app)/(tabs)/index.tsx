import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Screen, Text, Toast } from '../../../src/components/ui';
import { useAuth } from '../../../src/providers/AuthProvider';
import { colors, spacing, TAB_BAR_HEIGHT } from '../../../src/theme';
import { ACTION_CARDS, FEATURED_ACTION } from '../../../src/features/dashboard/actionCards';
import { ActionCard } from '../../../src/features/dashboard/ActionCard';
import { FeaturedCard } from '../../../src/features/dashboard/FeaturedCard';
import { RecentSearchesSection } from '../../../src/features/dashboard/RecentSearchesSection';
import { SavedCodesSection } from '../../../src/features/dashboard/SavedCodesSection';
import { PinnedDocumentsSection } from '../../../src/features/dashboard/PinnedDocumentsSection';
import { NotificationsSection } from '../../../src/features/dashboard/NotificationsSection';
import { TodaysUpdatesSection } from '../../../src/features/dashboard/TodaysUpdatesSection';
import { useNotifications } from '../../../src/features/dashboard/useNotifications';

export default function DashboardScreen() {
  const { user } = useAuth();
  const { refetch, isRefetching } = useNotifications();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const firstName = useMemo(() => {
    const fullName = (user?.user_metadata?.full_name as string | undefined)?.trim();
    if (fullName) return fullName.split(' ')[0];
    return user?.email?.split('@')[0] ?? 'there';
  }, [user]);

  const companyName = user?.user_metadata?.company_name as string | undefined;

  const showComingSoon = useCallback((title: string) => {
    setToastMessage(`${title} is coming soon`);
  }, []);

  const handleActionPress = useCallback(
    (cardId: string, title: string) => {
      if (cardId === 'search-codes') {
        router.push('/search');
        return;
      }
      showComingSoon(title);
    },
    [showComingSoon]
  );

  return (
    <Screen edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }
      >
        <View style={styles.inner}>
          <Animated.View entering={FadeInDown.duration(400)} style={styles.greetingBlock}>
            <Text variant="footnote" color={colors.textSecondary}>
              Welcome back
            </Text>
            <Text variant="largeTitle" style={styles.greetingName}>
              {firstName}
            </Text>
            {companyName ? (
              <Text variant="subhead" color={colors.textTertiary} style={styles.companyName}>
                {companyName}
              </Text>
            ) : null}
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(60)} style={styles.section}>
            <FeaturedCard
              config={FEATURED_ACTION}
              onPress={() => router.push('/assistant')}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(100)} style={styles.grid}>
            {ACTION_CARDS.map((card) => (
              <ActionCard
                key={card.id}
                config={card}
                onPress={() => handleActionPress(card.id, card.title)}
              />
            ))}
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(140)}>
            <RecentSearchesSection />
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(180)}>
            <SavedCodesSection />
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(220)}>
            <NotificationsSection />
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(260)}>
            <PinnedDocumentsSection />
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(300)}>
            <TodaysUpdatesSection />
          </Animated.View>
        </View>
      </ScrollView>

      {toastMessage ? (
        <Toast
          message={toastMessage}
          onHide={() => setToastMessage(null)}
          bottomOffset={TAB_BAR_HEIGHT}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
    alignItems: 'center',
  },
  inner: {
    width: '100%',
    maxWidth: 720,
  },
  greetingBlock: {
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  greetingName: {
    marginTop: 2,
  },
  companyName: {
    marginTop: spacing.xxs,
  },
  section: {
    marginBottom: spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
});
