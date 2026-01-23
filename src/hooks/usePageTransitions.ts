import { useState, useCallback } from 'react';

export interface TransitionState {
  isTransitioning: boolean;
  transitionClass: string;
  direction: 'forward' | 'backward';
}

export const usePageTransitions = () => {
  const [transitionState, setTransitionState] = useState<TransitionState>({
    isTransitioning: false,
    transitionClass: '',
    direction: 'forward'
  });

  const [previousPage, setPreviousPage] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<string>('reader');

  const startTransition = useCallback((newPage: string, direction: 'forward' | 'backward' = 'forward') => {
    setTransitionState({
      isTransitioning: true,
      transitionClass: 'page-transition-exit-active',
      direction
    });

    // Exit phase
    setTimeout(() => {
      setPreviousPage(currentPage);
      setCurrentPage(newPage);
      setTransitionState({
        isTransitioning: true,
        transitionClass: 'page-transition-enter',
        direction
      });

      // Enter phase
      setTimeout(() => {
        setTransitionState({
          isTransitioning: true,
          transitionClass: 'page-transition-enter-active',
          direction
        });

        // Complete transition
        setTimeout(() => {
          setTransitionState({
            isTransitioning: false,
            transitionClass: '',
            direction
          });
        }, 500);
      }, 50);
    }, 300);
  }, [currentPage]);

  const navigateToPage = useCallback((page: string) => {
    const pageOrder = ['reader', 'manager'];
    const currentIndex = pageOrder.indexOf(currentPage);
    const newIndex = pageOrder.indexOf(page);
    
    const direction = newIndex > currentIndex ? 'forward' : 'backward';
    startTransition(page, direction);
  }, [currentPage, startTransition]);

  return {
    currentPage,
    previousPage,
    isTransitioning: transitionState.isTransitioning,
    transitionClass: transitionState.transitionClass,
    direction: transitionState.direction,
    navigateToPage,
    startTransition
  };
};
