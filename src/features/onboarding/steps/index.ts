import type { OnboardingPayload } from '../types';
import { CompanyBasicsStep } from './CompanyBasicsStep';
import { TradesStep } from './TradesStep';
import { TeamSizeStep } from './TeamSizeStep';
import { LogoStep } from './LogoStep';
import { InviteTeamStep } from './InviteTeamStep';
import { SubscriptionStep } from './SubscriptionStep';
import { ReviewStep } from './ReviewStep';

export { CompanyBasicsStep, TradesStep, TeamSizeStep, LogoStep, InviteTeamStep, SubscriptionStep, ReviewStep };
export type { StepProps } from './types';

export const STEP_LABELS = ['Company', 'Trades', 'Team size', 'Logo', 'Invite', 'Plan', 'Review'];

export const OPTIONAL_STEPS = new Set([3, 4]);

export const STEP_COUNT = STEP_LABELS.length;

export function isStepValid(step: number, payload: OnboardingPayload): boolean {
  switch (step) {
    case 0:
      return payload.companyName.trim().length >= 2 && payload.province.length > 0;
    case 1:
      return payload.trades.length > 0;
    case 2:
      return payload.employeeCount !== null;
    case 3:
      return true;
    case 4:
      return true;
    case 5:
      return payload.subscriptionPlan !== null;
    case 6:
      return true;
    default:
      return false;
  }
}
