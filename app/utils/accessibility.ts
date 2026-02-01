// Accessibility utilities

// Focus management
export const focusElement = (element: HTMLElement | null) => {
  if (element) {
    element.focus();
  }
};

export const focusFirstFocusableElement = (container: HTMLElement) => {
  const firstFocusable = container.querySelector(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  ) as HTMLElement;
  if (firstFocusable) {
    firstFocusable.focus();
  }
};

export const trapFocus = (container: HTMLElement, event: KeyboardEvent) => {
  if (event.key !== 'Tab') return;

  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  ) as NodeListOf<HTMLElement>;
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  if (event.shiftKey) {
    if (document.activeElement === firstElement) {
      lastElement.focus();
      event.preventDefault();
    }
  } else {
    if (document.activeElement === lastElement) {
      firstElement.focus();
      event.preventDefault();
    }
  }
};

// ARIA attributes management
export const setAriaHidden = (element: HTMLElement, hidden: boolean) => {
  element.setAttribute('aria-hidden', hidden.toString());
};

export const setAriaExpanded = (element: HTMLElement, expanded: boolean) => {
  element.setAttribute('aria-expanded', expanded.toString());
};

export const setAriaLabelledby = (element: HTMLElement, id: string) => {
  element.setAttribute('aria-labelledby', id);
};

export const setAriaDescribedby = (element: HTMLElement, id: string) => {
  element.setAttribute('aria-describedby', id);
};

// Keyboard navigation
export const handleKeyboardNavigation = (
  event: KeyboardEvent,
  items: HTMLElement[],
  currentIndex: number,
  setCurrentIndex: (index: number) => void
) => {
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      const nextIndex = (currentIndex + 1) % items.length;
      setCurrentIndex(nextIndex);
      items[nextIndex].focus();
      break;
    case 'ArrowUp':
      event.preventDefault();
      const prevIndex = (currentIndex - 1 + items.length) % items.length;
      setCurrentIndex(prevIndex);
      items[prevIndex].focus();
      break;
    case 'Home':
      event.preventDefault();
      setCurrentIndex(0);
      items[0].focus();
      break;
    case 'End':
      event.preventDefault();
      const lastIndex = items.length - 1;
      setCurrentIndex(lastIndex);
      items[lastIndex].focus();
      break;
  }
};

// Screen reader announcements
export const announceToScreenReader = (message: string) => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove after announcing
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

// Skip to content functionality
export const setupSkipLinks = () => {
  const skipLink = document.querySelector('[data-skip-link]');
  if (skipLink) {
    skipLink.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(skipLink.getAttribute('href') || '');
      if (target) {
        (target as HTMLElement).focus();
        (target as HTMLElement).scrollIntoView({ behavior: 'smooth' });
      }
    });
  }
};

// Color contrast utilities
export const calculateContrastRatio = (color1: string, color2: string): number => {
  const luminance = (hexColor: string) => {
    const hex = hexColor.replace(/[^0-9A-F]/gi, '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;

    const sRGB = (val: number) => val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);

    return 0.2126 * sRGB(r) + 0.7152 * sRGB(g) + 0.0722 * sRGB(b);
  };

  const lum1 = luminance(color1);
  const lum2 = luminance(color2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
};

// Check if contrast ratio meets WCAG standards
export const meetsWCAGContrast = (color1: string, color2: string, largeText: boolean = false): boolean => {
  const ratio = calculateContrastRatio(color1, color2);
  return largeText ? ratio >= 3.0 : ratio >= 4.5; // AA standard
};

// High contrast mode detection
export const isHighContrastMode = (): boolean => {
  if (typeof window === 'undefined') return false;

  const style = window.getComputedStyle(document.body, ':before');
  return Boolean(style.content && style.content !== 'normal' && style.content !== 'none');
};

// Reduced motion preference detection
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;

  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Focus indicator management
export const setupFocusIndicator = () => {
  let keyboardNav = false;

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Tab') {
      keyboardNav = true;
      document.body.classList.add('keyboard-nav');
    }
  };

  const handleMouseDown = () => {
    keyboardNav = false;
    document.body.classList.remove('keyboard-nav');
  };

  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('mousedown', handleMouseDown);

  return () => {
    document.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('mousedown', handleMouseDown);
  };
};

// Accessibility checker utility
export const checkAccessibility = (element: HTMLElement) => {
  const issues: string[] = [];

  // Check for alt text on images
  const images = element.querySelectorAll('img');
  images.forEach(img => {
    if (!img.hasAttribute('alt')) {
      issues.push(`Image missing alt attribute: ${img.src}`);
    }
  });

  // Check for proper heading structure
  const headings = element.querySelectorAll('h1, h2, h3, h4, h5, h6');
  let lastHeadingLevel = 0;
  headings.forEach(heading => {
    const level = parseInt(heading.tagName.charAt(1));
    if (level > lastHeadingLevel + 1) {
      issues.push(`Skipped heading level from ${lastHeadingLevel} to ${level}`);
    }
    lastHeadingLevel = level;
  });

  // Check for focusable elements
  const focusable = element.querySelectorAll('input, select, textarea, button, [tabindex]');
  focusable.forEach(el => {
    const computedStyle = window.getComputedStyle(el as HTMLElement);
    if (computedStyle.visibility === 'hidden' || computedStyle.display === 'none') {
      issues.push(`Focusable element is visually hidden: ${el.tagName}`);
    }
  });

  return issues;
};