import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { SlideInLeft, SlideInRight, SlideOutLeft, SlideOutRight } from 'react-native-reanimated';

import { AnimatedBackground, Button, ProgressSteps, Text } from '../../src/components/ui';
import { useAuth } from '../../src/providers/AuthProvider';
import { colors, spacing } from '../../src/theme';
import { EMPTY_ONBOARDING_PAYLOAD, type OnboardingPayload } from '../../src/features/onboarding/types';
import {
  CompanyBasicsStep,
  InviteTeamStep,
  LogoStep,
  OPTIONAL_STEPS,
  ReviewStep,
  STEP_COUNT,
  STEP_LABELS,
  SubscriptionStep,
  TeamSizeStep,
  TradesStep,
  isStepValid,
} from '../../src/features/onboarding/steps';

export default function OnboardingWizard() {
  const { user, completeOnboarding, signOut } = useAuth();

  const [payload, setPayload] = useState<OnboardingPayload>({
    ...EMPTY_ONBOARDING_PAYLOAD,
    companyName: (user?.user_metadata?.company_name as string | undefined) ?? '',
  });
  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const directionRef = useRef<1 | -1>(1);

  const updatePayload = (patch: Partial<OnboardingPayload>) => {
    setPayload((prev) => ({ ...prev, ...patch }));
  };

  const isLastStep = currentStep === STEP_COUNT - 1;
  const isOptional = OPTIONAL_STEPS.has(currentStep);
  const canContinue = isStepValid(currentStep, payload);

  const goToStep = (index: number) => {
    directionRef.current = index >= currentStep ? 1 : -1;
    setCurrentStep(index);
  };

  const handleBack = () => {
    if (currentStep === 0) return;
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    goToStep(currentStep - 1);
  };

  const handleContinue = async () => {
    if (isLastStep) {
      await handleCreateCompany();
      return;
    }

    if (!canContinue) {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
      return;
    }

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    goToStep(currentStep + 1);
  };

  const handleSkip = () => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    goToStep(currentStep + 1);
  };

  const handleCreateCompany = async () => {
    setFormError(null);
    setSubmitting(true);
    const { error } = await completeOnboarding(payload);
    setSubmitting(false);

    if (error) {
      setFormError(error);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      return;
    }

    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleSignOutPress = () => {
    Alert.alert('Sign out', 'You can finish setting up your company later.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => signOut() },
    ]);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <CompanyBasicsStep payload={payload} updatePayload={updatePayload} />;
      case 1:
        return <TradesStep payload={payload} updatePayload={updatePayload} />;
      case 2:
        return <TeamSizeStep payload={payload} updatePayload={updatePayload} />;
      case 3:
        return <LogoStep payload={payload} updatePayload={updatePayload} />;
      case 4:
        return <InviteTeamStep payload={payload} updatePayload={updatePayload} />;
      case 5:
        return <SubscriptionStep payload={payload} updatePayload={updatePayload} />;
      case 6:
        return (
          <ReviewStep
            payload={payload}
            updatePayload={updatePayload}
            onEditStep={goToStep}
            formError={formError}
          />
        );
      default:
        return null;
    }
  };

  const forward = directionRef.current === 1;

  return (
    <View style={styles.root}>
      <AnimatedBackground />
      <SafeAreaView style={styles.flex} edges={['top', 'bottom', 'left', 'right']}>
        <View style={styles.header}>
          <View style={styles.headerInner}>
            <View style={styles.headerTopRow}>
              {currentStep > 0 ? (
                <Pressable onPress={handleBack} hitSlop={8} style={styles.backButton}>
                  <Ionicons name="chevron-back" size={18} color={colors.textSecondary} />
                  <Text variant="subhead" color={colors.textSecondary}>
                    Back
                  </Text>
                </Pressable>
              ) : (
                <View />
              )}
              <Pressable onPress={handleSignOutPress} hitSlop={8}>
                <Text variant="footnote" color={colors.textTertiary}>
                  Sign out
                </Text>
              </Pressable>
            </View>
            <ProgressSteps
              total={STEP_COUNT}
              current={currentStep}
              stepTitle={STEP_LABELS[currentStep]}
            />
          </View>
        </View>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Animated.View
              key={currentStep}
              style={styles.stepInner}
              entering={forward ? SlideInRight.duration(340).springify().damping(22) : SlideInLeft.duration(340).springify().damping(22)}
              exiting={forward ? SlideOutLeft.duration(220) : SlideOutRight.duration(220)}
            >
              {renderStep()}
            </Animated.View>
          </ScrollView>

          <View style={styles.footer}>
            <View style={styles.footerInner}>
              {isOptional && !isLastStep ? (
                <Pressable onPress={handleSkip} style={styles.skipButton} hitSlop={8}>
                  <Text variant="subhead" color={colors.textSecondary}>
                    Skip for now
                  </Text>
                </Pressable>
              ) : null}
              <Button
                label={isLastStep ? 'Create Company' : 'Continue'}
                onPress={handleContinue}
                loading={submitting}
                disabled={!isLastStep && !canContinue}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    alignItems: 'center',
  },
  headerInner: {
    width: '100%',
    maxWidth: 560,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    minHeight: 24,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    alignItems: 'center',
  },
  stepInner: {
    width: '100%',
    maxWidth: 560,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    alignItems: 'center',
  },
  footerInner: {
    width: '100%',
    maxWidth: 560,
  },
  skipButton: {
    alignSelf: 'center',
    marginBottom: spacing.sm,
  },
});
