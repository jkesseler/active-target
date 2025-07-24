import { useEffect, useRef, useState } from 'react';

type Options = {
  autoplay?: boolean;
  loop?: boolean;
};

export function useAudioPlayback(src: string, options: Options = {}) {
  const { autoplay = false, loop = false } = options;
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const bufferRef = useRef<AudioBuffer | null>(null);

  useEffect(() => {
    audioContextRef.current = new AudioContext();
    fetch(src)
      .then(response => response.arrayBuffer())
      .then(data => audioContextRef.current!.decodeAudioData(data))
      .then(buffer => {
        bufferRef.current = buffer;
        if (autoplay) play();
      })
      .catch(console.error);

    return () => {
      stop();
      audioContextRef.current?.close();
      audioContextRef.current = null;
    };
  }, [src, autoplay]);

  const play = () => {
    if (!audioContextRef.current || !bufferRef.current) {
      return;
    }
    
    stop();

    const source = audioContextRef.current.createBufferSource();
    source.buffer = bufferRef.current;
    source.connect(audioContextRef.current.destination);
    source.loop = loop;
    source.start();
    source.onended = () => setIsPlaying(false);
    sourceRef.current = source;
    setIsPlaying(true);
  };

  const pause = () => {
    stop();
  };

  const stop = () => {
    sourceRef.current?.stop();
    sourceRef.current = null;
    setIsPlaying(false);
  };

  return { play, pause, stop, isPlaying, file: src };
}

