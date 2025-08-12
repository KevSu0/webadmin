import { useState, useEffect } from 'react';

/**
 * A custom hook to check if a media query matches.
 * @param query - The media query string (e.g., '(max-width: 768px)')
 * @returns boolean - True if the query matches, false otherwise.
 */
export function useMediaQuery(query: string): boolean {
  const getMatches = (query: string): boolean => {
    // Prevents SSR issues
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  };

  const [matches, setMatches] = useState<boolean>(getMatches(query));

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query);
    const listener = (event: MediaQueryListEvent) => setMatches(event.matches);

    // Using addEventListener for modern browsers, with a fallback for older ones.
    if (mediaQueryList.addEventListener) {
      mediaQueryList.addEventListener('change', listener);
    } else {
      // addListener is deprecated but included for backward-compatibility
      mediaQueryList.addListener(listener);
    }

    // Re-check on mount in case the query has changed since initial state was set
    setMatches(mediaQueryList.matches);

    return () => {
      if (mediaQueryList.removeEventListener) {
        mediaQueryList.removeEventListener('change', listener);
      } else {
        mediaQueryList.removeListener(listener);
      }
    };
  }, [query]);

  return matches;
}
