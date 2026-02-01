import { useState, useEffect } from 'react';

// Hook to detect screen size
export const useScreenSize = () => {
  const [screenSize, setScreenSize] = useState<'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | null>(null);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;

      if (width < 640) setScreenSize('xs');
      else if (width >= 640 && width < 768) setScreenSize('sm');
      else if (width >= 768 && width < 1024) setScreenSize('md');
      else if (width >= 1024 && width < 1280) setScreenSize('lg');
      else if (width >= 1280 && width < 1536) setScreenSize('xl');
      else setScreenSize('2xl');
    };

    // Initial check
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return screenSize;
};

// Breakpoint constants
export const BREAKPOINTS = {
  xs: 0,      // Extra small: 0px+
  sm: 640,    // Small: 640px+
  md: 768,    // Medium: 768px+
  lg: 1024,   // Large: 1024px+
  xl: 1280,   // Extra large: 1280px+
  '2xl': 1536 // Double extra large: 1536px+
};

// Utility function to check if screen size matches or exceeds a breakpoint
export const isScreenSize = (size: keyof typeof BREAKPOINTS): boolean => {
  return window.innerWidth >= BREAKPOINTS[size];
};