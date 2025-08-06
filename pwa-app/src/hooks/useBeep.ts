import { useRef, useState, useCallback } from 'react';

export const useBeep = () => {
  const [isAudioReady, setIsAudioReady] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  const initializeAudioContext = useCallback(() => {
    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
      audioContextRef.current = new AudioContext();
      setIsAudioReady(true);
    }
  }, []);

  const beep = useCallback(() => {
    const context = audioContextRef.current;
    if (!context || !isAudioReady) {
      console.warn('Audio context not ready. Call initializeAudioContext first.');
      return;
    }

    try {
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();

      // Configure oscillator
      oscillator.frequency.value = 2800;
      oscillator.type = 'square';

      // Configure gain
      gainNode.gain.value = 100 * 0.01;

      // Connect nodes
      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      // Play the beep
      const currentTime = context.currentTime;
      oscillator.start(currentTime);
      oscillator.stop(currentTime + 433 * 0.001);
    } catch (error) {
      console.error('Failed to play beep:', error);
    }
  }, [isAudioReady]);

  return { initializeAudioContext, beep, audioReady: isAudioReady };
};
