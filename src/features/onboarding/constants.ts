import type { Ionicons } from '@expo/vector-icons';

import type { EmployeeRange, SubscriptionPlanId } from './types';

type IconName = keyof typeof Ionicons.glyphMap;

export const PROVINCES: { code: string; name: string }[] = [
  { code: 'AB', name: 'Alberta' },
  { code: 'BC', name: 'British Columbia' },
  { code: 'MB', name: 'Manitoba' },
  { code: 'NB', name: 'New Brunswick' },
  { code: 'NL', name: 'Newfoundland and Labrador' },
  { code: 'NS', name: 'Nova Scotia' },
  { code: 'NT', name: 'Northwest Territories' },
  { code: 'NU', name: 'Nunavut' },
  { code: 'ON', name: 'Ontario' },
  { code: 'PE', name: 'Prince Edward Island' },
  { code: 'QC', name: 'Quebec' },
  { code: 'SK', name: 'Saskatchewan' },
  { code: 'YT', name: 'Yukon' },
];

export const TRADES: { id: string; label: string; icon: IconName }[] = [
  { id: 'electrical', label: 'Electrical', icon: 'flash-outline' },
  { id: 'plumbing', label: 'Plumbing', icon: 'water-outline' },
  { id: 'hvac', label: 'HVAC', icon: 'thermometer-outline' },
  { id: 'carpentry', label: 'Carpentry', icon: 'hammer-outline' },
  { id: 'general_contracting', label: 'General Contracting', icon: 'construct-outline' },
  { id: 'concrete', label: 'Concrete', icon: 'cube-outline' },
  { id: 'roofing', label: 'Roofing', icon: 'home-outline' },
  { id: 'welding', label: 'Welding', icon: 'flame-outline' },
  { id: 'gas_fitting', label: 'Gas Fitting', icon: 'flame-outline' },
  { id: 'excavation', label: 'Excavation', icon: 'trail-sign-outline' },
  { id: 'landscaping', label: 'Landscaping', icon: 'leaf-outline' },
  { id: 'other', label: 'Other', icon: 'ellipsis-horizontal-outline' },
];

export const EMPLOYEE_RANGES: { id: EmployeeRange; label: string; sublabel: string }[] = [
  { id: '1-5', label: '1–5', sublabel: 'Just getting started' },
  { id: '6-20', label: '6–20', sublabel: 'Small crew' },
  { id: '21-50', label: '21–50', sublabel: 'Growing team' },
  { id: '51-200', label: '51–200', sublabel: 'Established company' },
  { id: '200+', label: '200+', sublabel: 'Enterprise operation' },
];

export interface SubscriptionPlan {
  id: SubscriptionPlanId;
  name: string;
  price: string;
  cadence: string;
  tagline: string;
  features: string[];
  highlighted?: boolean;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: '$0',
    cadence: 'free forever',
    tagline: 'For small crews getting organized',
    features: ['Up to 5 team members', 'Core code references', 'Basic project tracking'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$49',
    cadence: 'per month',
    tagline: 'For growing teams that need more',
    features: [
      'Up to 50 team members',
      'Full national code library',
      'Advanced project tracking',
      'Priority support',
    ],
    highlighted: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    cadence: 'contact sales',
    tagline: 'For established, multi-site operations',
    features: [
      'Unlimited team members',
      'Dedicated account manager',
      'Custom integrations',
      'SLA-backed support',
    ],
  },
];
