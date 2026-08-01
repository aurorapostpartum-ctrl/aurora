import type { OnboardingPayload } from '../types';

export interface StepProps {
  payload: OnboardingPayload;
  updatePayload: (patch: Partial<OnboardingPayload>) => void;
}
