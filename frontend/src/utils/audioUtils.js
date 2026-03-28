/**
 * Utilidad para alertas sonoras de riesgo crítico sin necesidad de librerías externas
 */
export const playCriticalAlertSound = (frequency = 880, duration = 0.5) => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime); 
    oscillator.frequency.exponentialRampToValueAtTime(frequency / 2, audioCtx.currentTime + duration);
    
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + duration);
  } catch (e) {
    console.warn('Audio feedback not supported in this browser', e);
  }
};
