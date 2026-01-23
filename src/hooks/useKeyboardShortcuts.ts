import { useEffect, useCallback, useState } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
  description: string;
  action: () => void;
}

export const useKeyboardShortcuts = (shortcuts: KeyboardShortcut[]) => {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Ignore shortcuts when user is typing in input fields
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
      return;
    }

    for (const shortcut of shortcuts) {
      const {
        key,
        ctrlKey = false,
        altKey = false,
        shiftKey = false,
        metaKey = false,
        action
      } = shortcut;

      if (
        event.key.toLowerCase() === key.toLowerCase() &&
        event.ctrlKey === ctrlKey &&
        event.altKey === altKey &&
        event.shiftKey === shiftKey &&
        event.metaKey === metaKey
      ) {
        event.preventDefault();
        event.stopPropagation();
        action();
        break;
      }
    }
  }, [shortcuts]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
};

// Common RSS reader shortcuts
export const createRSSShortcuts = (actions: {
  navigateToReader?: () => void;
  navigateToManager?: () => void;
  toggleTheme?: () => void;
  focusSearch?: () => void;
  refreshFeeds?: () => void;
  toggleBookmarks?: () => void;
  goToNextItem?: () => void;
  goToPreviousItem?: () => void;
  openCurrentItem?: () => void;
  bookmarkCurrentItem?: () => void;
  showHelp?: () => void;
}): KeyboardShortcut[] => {
  const shortcuts: KeyboardShortcut[] = [];

  if (actions.navigateToReader) {
    shortcuts.push({
      key: '1',
      description: 'Navigate to Feed Reader',
      action: actions.navigateToReader
    });
  }

  if (actions.navigateToManager) {
    shortcuts.push({
      key: '2',
      description: 'Navigate to Feed Manager',
      action: actions.navigateToManager
    });
  }

  if (actions.toggleTheme) {
    shortcuts.push({
      key: 't',
      description: 'Toggle theme',
      action: actions.toggleTheme
    });
  }

  if (actions.focusSearch) {
    shortcuts.push({
      key: '/',
      description: 'Focus search',
      action: actions.focusSearch
    });
  }

  if (actions.refreshFeeds) {
    shortcuts.push({
      key: 'r',
      ctrlKey: true,
      description: 'Refresh feeds',
      action: actions.refreshFeeds
    });
  }

  if (actions.toggleBookmarks) {
    shortcuts.push({
      key: 'b',
      description: 'Toggle bookmarks',
      action: actions.toggleBookmarks
    });
  }

  if (actions.goToNextItem) {
    shortcuts.push({
      key: 'j',
      description: 'Go to next item',
      action: actions.goToNextItem
    });
  }

  if (actions.goToPreviousItem) {
    shortcuts.push({
      key: 'k',
      description: 'Go to previous item',
      action: actions.goToPreviousItem
    });
  }

  if (actions.openCurrentItem) {
    shortcuts.push({
      key: 'Enter',
      description: 'Open current item',
      action: actions.openCurrentItem
    });
  }

  if (actions.bookmarkCurrentItem) {
    shortcuts.push({
      key: 's',
      description: 'Bookmark current item',
      action: actions.bookmarkCurrentItem
    });
  }

  if (actions.showHelp) {
    shortcuts.push({
      key: '?',
      description: 'Show keyboard shortcuts',
      action: actions.showHelp
    });
  }

  return shortcuts;
};

// Hook for managing help modal
export const useKeyboardShortcutsHelp = () => {
  const [isOpen, setIsOpen] = useState(false);

  const openHelp = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeHelp = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    isOpen,
    openHelp,
    closeHelp
  };
};
