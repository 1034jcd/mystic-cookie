export let soundEnabled = true;

export const setSoundEnabled = (val: boolean) => {
  soundEnabled = val;
};

export const isSoundEnabled = () => soundEnabled;

export const playCrackSound = () => {
  if (!soundEnabled) return;
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Crack sound (noise burst)
    const bufferSize = audioCtx.sampleRate * 0.1; // 100ms
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    
    const noiseFilter = audioCtx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.value = 1000;
    
    const noiseEnvelope = audioCtx.createGain();
    noiseEnvelope.gain.setValueAtTime(1, audioCtx.currentTime);
    noiseEnvelope.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
    
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseEnvelope);
    noiseEnvelope.connect(audioCtx.destination);
    
    // Snap sound (oscillator click)
    const osc = audioCtx.createOscillator();
    osc.type = 'triangle';
    
    const oscEnvelope = audioCtx.createGain();
    oscEnvelope.gain.setValueAtTime(1, audioCtx.currentTime);
    oscEnvelope.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);
    
    osc.frequency.setValueAtTime(600, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.05);
    
    osc.connect(oscEnvelope);
    oscEnvelope.connect(audioCtx.destination);
    
    noise.start();
    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
  } catch (e) {
    // Ignore audio errors
  }
};

export const playChimeSound = () => {
  if (!soundEnabled) return;
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(432, audioCtx.currentTime); // Mystical 432Hz
    
    const envelope = audioCtx.createGain();
    envelope.gain.setValueAtTime(0, audioCtx.currentTime);
    envelope.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.1);
    envelope.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 2);
    
    osc.connect(envelope);
    envelope.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 2);
  } catch (e) {
    // Ignore
  }
};

export const playPurchaseSound = () => {
  if (!soundEnabled) return;
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    // Coin jingle: 3 short ascending tones (C5=523Hz, E5=659Hz, G5=784Hz)
    const freqs = [523, 659, 784];
    freqs.forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      
      const startTime = audioCtx.currentTime + i * 0.12;
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.25, startTime + 0.02);
      // Each tone: 0.12s duration, slight envelope
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.12);
      
      osc.start(startTime);
      osc.stop(startTime + 0.12);
    });
  } catch (e) {
    // Ignore audio errors
  }
};

