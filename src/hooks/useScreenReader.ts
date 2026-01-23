import { useRef, useCallback } from 'react';

export interface AnnouncementOptions {
  politeness?: 'polite' | 'assertive' | 'off';
  timeout?: number;
  clearPrevious?: boolean;
}

export const useScreenReader = () => {
  const politeRef = useRef<HTMLDivElement | null>(null);
  const assertiveRef = useRef<HTMLDivElement | null>(null);

  // Create live regions if they don't exist
  const ensureLiveRegions = useCallback(() => {
    if (!politeRef.current) {
      const politeElement = document.createElement('div');
      politeElement.setAttribute('aria-live', 'polite');
      politeElement.setAttribute('aria-atomic', 'true');
      politeElement.className = 'sr-only live-region-polite';
      document.body.appendChild(politeElement);
      politeRef.current = politeElement;
    }

    if (!assertiveRef.current) {
      const assertiveElement = document.createElement('div');
      assertiveElement.setAttribute('aria-live', 'assertive');
      assertiveElement.setAttribute('aria-atomic', 'true');
      assertiveElement.className = 'sr-only live-region-assertive';
      document.body.appendChild(assertiveElement);
      assertiveRef.current = assertiveElement;
    }
  }, []);

  // Announce message to screen reader
  const announce = useCallback((message: string, options: AnnouncementOptions = {}) => {
    const {
      politeness = 'polite',
      timeout = 0,
      clearPrevious = true
    } = options;

    ensureLiveRegions();

    const liveRegion = politeness === 'assertive' ? assertiveRef.current : politeRef.current;
    
    if (!liveRegion) return;

    // Clear previous announcement if requested
    if (clearPrevious) {
      liveRegion.textContent = '';
    }

    // Add new announcement
    liveRegion.textContent = message;

    // Clear announcement after timeout if specified
    if (timeout > 0) {
      setTimeout(() => {
        if (liveRegion.textContent === message) {
          liveRegion.textContent = '';
        }
      }, timeout);
    }
  }, [ensureLiveRegions]);

  // Announce page changes
  const announcePageChange = useCallback((pageName: string) => {
    announce(`Navigated to ${pageName}`, { politeness: 'assertive' });
  }, [announce]);

  // Announce loading states
  const announceLoading = useCallback((action: string) => {
    announce(`${action}...`, { politeness: 'polite' });
  }, [announce]);

  // Announce completion
  const announceComplete = useCallback((action: string) => {
    announce(`${action} completed`, { politeness: 'polite' });
  }, [announce]);

  // Announce errors
  const announceError = useCallback((error: string) => {
    announce(`Error: ${error}`, { politeness: 'assertive' });
  }, [announce]);

  // Announce success messages
  const announceSuccess = useCallback((action: string) => {
    announce(`${action} successful`, { politeness: 'polite' });
  }, [announce]);

  // Announce list changes
  const announceListChange = useCallback((itemCount: number, itemType: string) => {
    const message = itemCount === 0 
      ? `No ${itemType} available`
      : itemCount === 1 
      ? `1 ${itemType} available`
      : `${itemCount} ${itemType}s available`;
    
    announce(message, { politeness: 'polite' });
  }, [announce]);

  // Announce search results
  const announceSearchResults = useCallback((resultCount: number, query: string) => {
    const message = resultCount === 0
      ? `No results found for ${query}`
      : resultCount === 1
      ? `1 result found for ${query}`
      : `${resultCount} results found for ${query}`;
    
    announce(message, { politeness: 'polite' });
  }, [announce]);

  // Announce form validation errors
  const announceValidationErrors = useCallback((errors: string[]) => {
    const message = errors.length === 1
      ? `Form error: ${errors[0]}`
      : `Form has ${errors.length} errors: ${errors.join(', ')}`;
    
    announce(message, { politeness: 'assertive' });
  }, [announce]);

  // Announce focus changes
  const announceFocus = useCallback((element: string) => {
    announce(`Focused on ${element}`, { politeness: 'polite', timeout: 1000 });
  }, [announce]);

  // Clean up live regions
  const cleanup = useCallback(() => {
    if (politeRef.current && politeRef.current.parentNode) {
      politeRef.current.parentNode.removeChild(politeRef.current);
      politeRef.current = null;
    }

    if (assertiveRef.current && assertiveRef.current.parentNode) {
      assertiveRef.current.parentNode.removeChild(assertiveRef.current);
      assertiveRef.current = null;
    }
  }, []);

  return {
    announce,
    announcePageChange,
    announceLoading,
    announceComplete,
    announceError,
    announceSuccess,
    announceListChange,
    announceSearchResults,
    announceValidationErrors,
    announceFocus,
    cleanup
  };
};
