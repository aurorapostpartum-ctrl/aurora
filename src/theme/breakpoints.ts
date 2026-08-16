// Layout breakpoints in logical pixels. `laptop` is the point at which the
// persistent sidebar navigation replaces the mobile bottom nav.
export const breakpoints = {
  mobile: 0,
  tablet: 768,
  laptop: 1024,
  desktop: 1440,
} as const;

export type BreakpointToken = keyof typeof breakpoints;
