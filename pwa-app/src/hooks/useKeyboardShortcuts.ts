import { useEffect } from 'react';

export function useKeyboardShortcuts(callbacks: {
  onStartStop?: () => void;
  onReset?: () => void;
  onSimulateShot?: () => void;
  onToggleTimer?: () => void;
  onShowHelp?: () => void;
}) {
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (event.key.toLowerCase()) {
        case ' ': // Spacebar - Start/Stop simulation
          event.preventDefault();
          callbacks.onStartStop?.();
          break;
        case 'r': // R - Reset
          event.preventDefault();
          callbacks.onReset?.();
          break;
        case 's': // S - Single shot
          event.preventDefault();
          callbacks.onSimulateShot?.();
          break;
        case 't': // T - Toggle timer
          event.preventDefault();
          callbacks.onToggleTimer?.();
          break;
        case 'h': // H - Show help
          event.preventDefault();
          callbacks.onShowHelp?.();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [callbacks]);
}
