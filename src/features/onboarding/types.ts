export type EmployeeRange = '1-5' | '6-20' | '21-50' | '51-200' | '200+';

export type SubscriptionPlanId = 'starter' | 'pro' | 'enterprise';

export interface OnboardingPayload {
  companyName: string;
  province: string;
  trades: string[];
  employeeCount: EmployeeRange | null;
  logoUri: string | null;
  inviteEmails: string[];
  subscriptionPlan: SubscriptionPlanId | null;
}

export const EMPTY_ONBOARDING_PAYLOAD: OnboardingPayload = {
  companyName: '',
  province: '',
  trades: [],
  employeeCount: null,
  logoUri: null,
  inviteEmails: [],
  subscriptionPlan: null,
};
