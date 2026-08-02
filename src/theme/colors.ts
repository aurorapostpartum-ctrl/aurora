export const colors = {
  background: '#121212',
  backgroundElevated: '#1A1A1A',
  backgroundElevated2: '#242424',

  surface: 'rgba(255,255,255,0.05)',
  surfaceBorder: 'rgba(255,255,255,0.10)',
  surfaceHighlight: 'rgba(255,255,255,0.14)',

  // Neutral paper-white surface used for the Job Folder concept, document
  // previews, and other places that should feel like physical site paperwork.
  paper: '#F2F2F2',
  paperElevated: '#FFFFFF',
  paperBorder: 'rgba(17,17,17,0.12)',
  ink: '#141414',
  inkSecondary: 'rgba(20,20,20,0.64)',
  inkTertiary: 'rgba(20,20,20,0.62)',

  accent: '#2F6FED',
  accentMuted: 'rgba(47,111,237,0.16)',
  accentBorder: 'rgba(47,111,237,0.38)',
  accentStrong: '#5B93FF',

  success: '#22C55E',
  successMuted: 'rgba(34,197,94,0.16)',
  warning: '#F59E0B',
  warningMuted: 'rgba(245,158,11,0.16)',
  danger: '#EF4444',
  dangerMuted: 'rgba(239,68,68,0.15)',

  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255,255,255,0.64)',
  textTertiary: 'rgba(255,255,255,0.46)',
  textOnAccent: '#FFFFFF',

  divider: 'rgba(255,255,255,0.09)',
  overlay: 'rgba(0,0,0,0.60)',
} as const;

export type ColorToken = keyof typeof colors;
