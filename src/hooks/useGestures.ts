import { useRef, useCallback, useEffect } from 'react';

export interface GestureState {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  isDragging: boolean;
  direction: 'left' | 'right' | 'up' | 'down' | null;
  velocity: number;
  distance: number;
}

export interface GestureCallbacks {
  onSwipeLeft?: (distance: number, velocity: number) => void;
  onSwipeRight?: (distance: number, velocity: number) => void;
  onSwipeUp?: (distance: number, velocity: number) => void;
  onSwipeDown?: (distance: number, velocity: number) => void;
  onDragStart?: (state: GestureState) => void;
  onDragMove?: (state: GestureState) => void;
  onDragEnd?: (state: GestureState) => void;
  onTap?: (event: TouchEvent) => void;
  onLongPress?: (event: TouchEvent) => void;
}

export const useGestures = (
  elementRef: React.RefObject<HTMLElement>,
  callbacks: GestureCallbacks = {},
  options: {
    swipeThreshold?: number;
    longPressDelay?: number;
    enableDrag?: boolean;
    enableSwipe?: boolean;
    enableTap?: boolean;
    enableLongPress?: boolean;
  } = {}
) => {
  const {
    swipeThreshold = 50,
    longPressDelay = 500,
    enableDrag = true,
    enableSwipe = true,
    enableTap = true,
    enableLongPress = true
  } = options;

  const gestureState = useRef<GestureState>({
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    isDragging: false,
    direction: null,
    velocity: 0,
    distance: 0
  });

  const startTime = useRef<number>(0);
  const longPressTimer = useRef<number>();

  const calculateDistance = useCallback((x1: number, y1: number, x2: number, y2: number) => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }, []);

  const calculateVelocity = useCallback((distance: number, time: number) => {
    return time > 0 ? distance / time : 0;
  }, []);

  const getDirection = useCallback((deltaX: number, deltaY: number): 'left' | 'right' | 'up' | 'down' | null => {
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    if (absDeltaX > absDeltaY) {
      return deltaX > 0 ? 'right' : 'left';
    } else if (absDeltaY > absDeltaX) {
      return deltaY > 0 ? 'down' : 'up';
    }
    return null;
  }, []);

  const handleTouchStart = useCallback((event: TouchEvent) => {
    if (!elementRef.current) return;

    const touch = event.touches[0];
    gestureState.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      currentX: touch.clientX,
      currentY: touch.clientY,
      isDragging: false,
      direction: null,
      velocity: 0,
      distance: 0
    };
    startTime.current = Date.now();

    // Start long press timer
    if (enableLongPress) {
      longPressTimer.current = window.setTimeout(() => {
        if (callbacks.onLongPress) {
          callbacks.onLongPress(event);
        }
      }, longPressDelay);
    }

    if (callbacks.onDragStart) {
      callbacks.onDragStart(gestureState.current);
    }
  }, [callbacks, enableLongPress, longPressDelay]);

  const handleTouchMove = useCallback((event: TouchEvent) => {
    if (!elementRef.current) return;

    const touch = event.touches[0];
    const deltaX = touch.clientX - gestureState.current.startX;
    const deltaY = touch.clientY - gestureState.current.startY;
    const distance = calculateDistance(
      gestureState.current.startX,
      gestureState.current.startY,
      touch.clientX,
      touch.clientY
    );

    // Clear long press timer if moved
    if (distance > 10 && longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }

    if (!enableDrag && !enableSwipe) return;

    gestureState.current = {
      ...gestureState.current,
      currentX: touch.clientX,
      currentY: touch.clientY,
      isDragging: distance > 10,
      direction: getDirection(deltaX, deltaY),
      distance,
      velocity: calculateVelocity(distance, Date.now() - startTime.current)
    };

    if (callbacks.onDragMove) {
      callbacks.onDragMove(gestureState.current);
    }

    // Prevent default scrolling if dragging
    if (gestureState.current.isDragging) {
      event.preventDefault();
    }
  }, [callbacks, enableDrag, enableSwipe, calculateDistance, calculateVelocity, getDirection]);

  const handleTouchEnd = useCallback((event: TouchEvent) => {
    if (!elementRef.current) return;

    // Clear long press timer
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }

    const endTime = Date.now();
    const totalTime = endTime - startTime.current;
    const { distance, direction, velocity } = gestureState.current;

    // Handle tap
    if (enableTap && distance < 10 && totalTime < 200) {
      if (callbacks.onTap) {
        callbacks.onTap(event);
      }
    }

    // Handle swipe
    if (enableSwipe && distance > swipeThreshold && totalTime < 500) {
      switch (direction) {
        case 'left':
          if (callbacks.onSwipeLeft) {
            callbacks.onSwipeLeft(distance, velocity);
          }
          break;
        case 'right':
          if (callbacks.onSwipeRight) {
            callbacks.onSwipeRight(distance, velocity);
          }
          break;
        case 'up':
          if (callbacks.onSwipeUp) {
            callbacks.onSwipeUp(distance, velocity);
          }
          break;
        case 'down':
          if (callbacks.onSwipeDown) {
            callbacks.onSwipeDown(distance, velocity);
          }
          break;
      }
    }

    if (callbacks.onDragEnd) {
      callbacks.onDragEnd(gestureState.current);
    }

    // Reset state
    gestureState.current = {
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      isDragging: false,
      direction: null,
      velocity: 0,
      distance: 0
    };
  }, [callbacks, enableTap, enableSwipe, swipeThreshold]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Add touch event listeners
    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd);
    element.addEventListener('touchcancel', handleTouchEnd);

    // Cleanup
    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchcancel', handleTouchEnd);
      
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    };
  }, [elementRef, handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    gestureState: gestureState.current,
    isDragging: gestureState.current.isDragging,
    direction: gestureState.current.direction
  };
};
