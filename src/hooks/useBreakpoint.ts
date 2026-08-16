import { useWindowDimensions } from 'react-native';

import { breakpoints } from '../theme/breakpoints';

export interface BreakpointInfo {
  width: number;
  isMobile: boolean;
  isTablet: boolean;
  isLaptop: boolean;
  isDesktop: boolean;
  /** True once there is room for the persistent sidebar shell instead of the bottom nav. */
  isSidebarLayout: boolean;
}

export function useBreakpoint(): BreakpointInfo {
  const { width } = useWindowDimensions();

  return {
    width,
    isMobile: width < breakpoints.tablet,
    isTablet: width >= breakpoints.tablet && width < breakpoints.laptop,
    isLaptop: width >= breakpoints.laptop && width < breakpoints.desktop,
    isDesktop: width >= breakpoints.desktop,
    isSidebarLayout: width >= breakpoints.laptop,
  };
}
