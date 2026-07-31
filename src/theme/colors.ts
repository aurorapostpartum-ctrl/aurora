export const colors = {
  background: '#0B0B0D',
  backgroundElevated: '#131316',
  backgroundElevated2: '#1B1B1F',

  surface: 'rgba(255,255,255,0.06)',
  surfaceBorder: 'rgba(255,255,255,0.10)',
  surfaceHighlight: 'rgba(255,255,255,0.14)',

  accent: '#2F80FF',
  accentMuted: 'rgba(47,128,255,0.16)',
  accentBorder: 'rgba(47,128,255,0.35)',

  success: '#30D158',
  warning: '#FFB020',
  danger: '#FF453A',
  dangerMuted: 'rgba(255,69,58,0.14)',

  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255,255,255,0.62)',
  textTertiary: 'rgba(255,255,255,0.38)',
  textOnAccent: '#FFFFFF',

  divider: 'rgba(255,255,255,0.08)',
  overlay: 'rgba(0,0,0,0.55)',
} as const;

export type ColorToken = keyof typeof colors;
