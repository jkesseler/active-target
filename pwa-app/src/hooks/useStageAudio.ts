import { useEffect, useRef, useCallback, useState } from 'react';
import { Howl } from 'howler';

interface UseStageAudioOptions {
  preload?: boolean;
  autoplay?: boolean;
}

interface AudioState {
  isLoaded: boolean;
  isPlaying: boolean;
  error: string | null;
}

export function useStageAudio(soundPath: string, options: UseStageAudioOptions = {}) {
  const { preload = true, autoplay = false } = options;
  const soundRef = useRef<Howl | null>(null);
  const [audioState, setAudioState] = useState<AudioState>({
    isLoaded: false,
    isPlaying: false,
    error: null
  });

  // Initialize audio with preloading
  useEffect(() => {
    setAudioState(prev => ({ ...prev, error: null, isLoaded: false }));

    soundRef.current = new Howl({
      src: [soundPath],
      preload,
      html5: true,
      onload: () => {
        console.log('Stage audio loaded successfully:', soundPath);
        setAudioState(prev => ({ ...prev, isLoaded: true, error: null }));
        if (autoplay) {
          soundRef.current?.play();
        }
      },
      onloaderror: (id, error) => {
        const errorMessage = `Failed to load stage audio: ${error}`;
        console.error(errorMessage);
        setAudioState(prev => ({ ...prev, isLoaded: false, error: errorMessage }));
      },
      onplayerror: (id, error) => {
        const errorMessage = `Failed to play stage audio: ${error}`;
        console.error(errorMessage);
        setAudioState(prev => ({ ...prev, isPlaying: false, error: errorMessage }));
      },
      onplay: () => {
        setAudioState(prev => ({ ...prev, isPlaying: true }));
      },
      onend: () => {
        setAudioState(prev => ({ ...prev, isPlaying: false }));
      },
      onstop: () => {
        setAudioState(prev => ({ ...prev, isPlaying: false }));
      }
    });

    // Cleanup on unmount
    return () => {
      if (soundRef.current) {
        soundRef.current.unload();
        soundRef.current = null;
      }
    };
  }, [soundPath, preload, autoplay]);

  const playSound = useCallback(() => {
    if (!soundRef.current) {
      console.warn('Sound not loaded yet, cannot play');
      return;
    }

    try {
      // Stop any currently playing sound and play new one
      soundRef.current.stop();
      soundRef.current.play();
    } catch (error) {
      const errorMessage = `Error playing stage audio: ${error}`;
      console.error(errorMessage);
      setAudioState(prev => ({ ...prev, error: errorMessage }));
    }
  }, []); // Empty dependency array since we only use ref

  const stopSound = useCallback(() => {
    if (!soundRef.current) {
      return;
    }

    try {
      soundRef.current.stop();
    } catch (error) {
      console.error('Error stopping stage audio:', error);
    }
  }, []); // Empty dependency array since we only use ref

  return {
    playSound,
    stopSound,
    isLoaded: audioState.isLoaded,
    isPlaying: audioState.isPlaying,
    error: audioState.error
  };
}
