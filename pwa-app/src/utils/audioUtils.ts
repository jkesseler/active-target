/**
 * Audio utility functions for use outside React components
 * These functions can be safely used in Redux middleware and other non-React contexts
 */

let audioContext: AudioContext | null = null
let isAudioInitialized = false
let hasUserInteracted = false

/**
 * Mark that user has interacted with the page (for browser audio policy compliance)
 */
export function markUserInteraction(): void {
  hasUserInteracted = true
}

/**
 * Initialize the audio context
 * Must be called after user interaction for browsers to allow audio
 */
export function initializeAudioContext(): void {
  if (!hasUserInteracted) {
    console.warn('Cannot initialize audio context without user interaction')
    return
  }

  if (!audioContext || audioContext.state === 'closed') {
    try {
      audioContext = new AudioContext()
      isAudioInitialized = true
      console.log('Audio context initialized successfully')
    }
    catch (error) {
      console.error('Failed to initialize audio context:', error)
      isAudioInitialized = false
    }
  }
}

/**
 * Check if audio context is ready to play sounds
 */
export function isAudioReady(): boolean {
  return isAudioInitialized && audioContext !== null && audioContext.state !== 'closed'
}

/**
 * Play a beep sound with specified frequency and duration
 * @param frequency - Frequency in Hz (default: 2800)
 * @param duration - Duration in milliseconds (default: 433)
 * @param volume - Volume as a percentage between 0 and 100 (default: 100)
 */
export function playBeep(frequency = 2800, duration = 433, volume = 100): void {
  if (!isAudioReady()) {
    console.warn('Audio context not ready. User interaction required to initialize audio.')
    return
  }

  try {
    const oscillator = audioContext!.createOscillator()
    const gainNode = audioContext!.createGain()

    // Configure oscillator
    oscillator.frequency.value = frequency
    oscillator.type = 'square'

    // Configure gain
    gainNode.gain.value = volume * 0.01 // Convert to appropriate volume level

    // Connect nodes
    oscillator.connect(gainNode)
    gainNode.connect(audioContext!.destination)

    // Play the beep
    const currentTime = audioContext!.currentTime
    oscillator.start(currentTime)
    oscillator.stop(currentTime + duration * 0.001)
  }
  catch (error) {
    console.error('Failed to play beep:', error)
  }
}

/**
 * Get the current audio context state
 */
export function getAudioContextState(): AudioContextState | null {
  return audioContext?.state || null
}
