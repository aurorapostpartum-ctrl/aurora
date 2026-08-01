import type { Ionicons } from '@expo/vector-icons';

type IconName = keyof typeof Ionicons.glyphMap;

export interface ActionCardConfig {
  id: string;
  title: string;
  subtitle: string;
  icon: IconName;
  tint: string;
}

export const FEATURED_ACTION: ActionCardConfig = {
  id: 'ai-assistant',
  title: 'AI Assistant',
  subtitle: 'Ask a code question and get a cited answer in seconds',
  icon: 'sparkles',
  tint: '#2F80FF',
};

export const ACTION_CARDS: ActionCardConfig[] = [
  {
    id: 'search-codes',
    title: 'Search Codes',
    subtitle: 'National & provincial code books',
    icon: 'search-outline',
    tint: '#2F80FF',
  },
  {
    id: 'calculators',
    title: 'Calculators',
    subtitle: 'Load, wire size & conduit fill',
    icon: 'calculator-outline',
    tint: '#30D158',
  },
  {
    id: 'checklists',
    title: 'Checklists',
    subtitle: 'Inspection & safety checklists',
    icon: 'checkbox-outline',
    tint: '#FFB020',
  },
  {
    id: 'company-library',
    title: 'Company Library',
    subtitle: 'Shared docs & specifications',
    icon: 'library-outline',
    tint: '#A855F7',
  },
  {
    id: 'training',
    title: 'Training',
    subtitle: 'Courses & certification prep',
    icon: 'school-outline',
    tint: '#22D3EE',
  },
];
