export const colors = {
  background: '#141210',
  backgroundElevated: '#1C1916',
  backgroundElevated2: '#25211C',

  surface: 'rgba(250,245,235,0.05)',
  surfaceBorder: 'rgba(250,245,235,0.10)',
  surfaceHighlight: 'rgba(250,245,235,0.14)',

  // Warm, paper-like surface used for the Job Folder concept, document
  // previews, and other places that should feel like physical site paperwork.
  paper: '#F3EDE0',
  paperElevated: '#FAF7EF',
  paperBorder: 'rgba(29,24,16,0.12)',
  ink: '#221D15',
  inkSecondary: 'rgba(34,29,21,0.64)',
  inkTertiary: 'rgba(34,29,21,0.42)',

  accent: '#C4813C',
  accentMuted: 'rgba(196,129,60,0.16)',
  accentBorder: 'rgba(196,129,60,0.38)',
  accentStrong: '#E0954A',

  success: '#4FA968',
  successMuted: 'rgba(79,169,104,0.16)',
  warning: '#DDA52B',
  warningMuted: 'rgba(221,165,43,0.16)',
  danger: '#E15C42',
  dangerMuted: 'rgba(225,92,66,0.15)',

  textPrimary: '#F6F1E7',
  textSecondary: 'rgba(246,241,231,0.64)',
  textTertiary: 'rgba(246,241,231,0.40)',
  textOnAccent: '#191410',

  divider: 'rgba(246,241,231,0.09)',
  overlay: 'rgba(10,8,6,0.60)',
} as const;

export type ColorToken = keyof typeof colors;
