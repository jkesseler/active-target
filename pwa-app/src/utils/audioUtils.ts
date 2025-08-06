/**
 * Audio utilities for generating synthetic audio signals
 * Used for system notifications and stage activation alerts
 */

let audioContext: AudioContext | null = null;

/**
 * Get or create a shared AudioContext instance
 * Browsers limit the number of concurrent audio contexts, so we reuse them
 */
function getAudioContext(): AudioContext {
  if (!audioContext || audioContext.state === 'closed') {
    audioContext = new AudioContext();
  }
  return audioContext;
}

/**
 * Generate a beep sound using Web Audio API
 * @param volume - Volume level (0-100)
 * @param frequency - Frequency in Hz
 * @param duration - Duration in milliseconds
 */
export function beep(volume: number, frequency: number, duration: number): void {
  try {
    const context = getAudioContext();

    // Create oscillator for tone generation
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    // Connect audio nodes
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    // Configure oscillator
    oscillator.frequency.value = frequency;
    oscillator.type = 'square';

    // Configure gain (volume)
    gainNode.gain.value = volume * 0.01;

    // Schedule audio playback
    const currentTime = context.currentTime;
    oscillator.start(currentTime);
    oscillator.stop(currentTime + duration * 0.001);
  } catch (error) {
    console.error('Failed to play beep sound:', error);
  }
}

/**
 * Play the standard stage activation beep
 * 2800Hz square wave for 433ms at moderate volume
 */
export function playStageActivationBeep(): void {
  beep(50, 2800, 433);
}

/**
 * Clean up audio resources
 * Should be called when the application is closing
 */
export function closeAudioContext(): void {
  if (audioContext && audioContext.state !== 'closed') {
    audioContext.close();
    audioContext = null;
  }
}
