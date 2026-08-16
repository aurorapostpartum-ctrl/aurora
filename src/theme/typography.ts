// Display tier (largeTitle/title1/title2/title3) uses Big Shoulders Display —
// a bold condensed industrial gothic in the Chicago-signage lineage — for
// headlines and section titles. Everything read or scanned (headline down
// through caption2) uses IBM Plex Sans, an engineered, documentation-grade
// humanist sans. `mono` is IBM Plex Mono, for job codes, revision stamps,
// and timestamps — the "stamped" details throughout the app. Weight lives in
// the specific font file loaded (see app/_layout.tsx), not in `fontWeight`,
// since RN can't reliably synthesize weight on top of a custom static font.

const display = 'BigShouldersDisplay_800ExtraBold';
const displayBold = 'BigShouldersDisplay_700Bold';
const sans = 'IBMPlexSans_400Regular';
const sansMedium = 'IBMPlexSans_500Medium';
const sansSemiBold = 'IBMPlexSans_600SemiBold';
const mono = 'IBMPlexMono_400Regular';
const monoMedium = 'IBMPlexMono_500Medium';

export const typography = {
  fontFamily: sans,
  largeTitle: {
    fontFamily: display,
    fontSize: 34,
    lineHeight: 38,
    fontWeight: '400' as const,
    letterSpacing: 0.1,
  },
  title1: {
    fontFamily: display,
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '400' as const,
    letterSpacing: 0.1,
  },
  title2: {
    fontFamily: displayBold,
    fontSize: 22,
    lineHeight: 25,
    fontWeight: '400' as const,
    letterSpacing: 0.1,
  },
  title3: {
    fontFamily: displayBold,
    fontSize: 20,
    lineHeight: 23,
    fontWeight: '400' as const,
    letterSpacing: 0.1,
  },
  headline: {
    fontFamily: sansSemiBold,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '400' as const,
    letterSpacing: -0.1,
  },
  body: {
    fontFamily: sans,
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '400' as const,
    letterSpacing: 0,
  },
  callout: {
    fontFamily: sans,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '400' as const,
    letterSpacing: 0,
  },
  subhead: {
    fontFamily: sans,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '400' as const,
    letterSpacing: 0,
  },
  footnote: {
    fontFamily: sans,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400' as const,
    letterSpacing: 0,
  },
  caption1: {
    fontFamily: sansMedium,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400' as const,
    letterSpacing: 0.02,
  },
  caption2: {
    fontFamily: sansSemiBold,
    fontSize: 11,
    lineHeight: 13,
    fontWeight: '400' as const,
    letterSpacing: 0.08,
  },
  // Data tier — job numbers, revision stamps, timestamps, codes. Not part of
  // the reading hierarchy above; used selectively where content is genuinely
  // "stamped" data rather than prose.
  mono: {
    fontFamily: mono,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400' as const,
    letterSpacing: 0.02,
  },
  monoLabel: {
    fontFamily: monoMedium,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '400' as const,
    letterSpacing: 0.1,
  },
} as const;

export type TypographyToken = keyof Omit<typeof typography, 'fontFamily'>;
