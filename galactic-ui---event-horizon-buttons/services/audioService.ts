
export class AudioService {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private ambienceOscillators: OscillatorNode[] = [];
  private isMuted: boolean = false;

  constructor() {}

  // Initialize Audio Context (must be called after user interaction)
  init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return;
    }

    const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
    this.ctx = new AudioContextClass();
    
    if (!this.ctx) return;

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.4; // Master volume
    this.masterGain.connect(this.ctx.destination);

    this.startAmbience();
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(
        this.isMuted ? 0 : 0.4, 
        this.ctx!.currentTime, 
        0.1
      );
    }
    return this.isMuted;
  }

  // Deep space drone sound
  private startAmbience() {
    if (!this.ctx || !this.masterGain) return;

    // Create a deep drone using two detuned oscillators
    const freq = 55; // Low A
    
    [freq, freq * 1.01].forEach(f => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.value = f;
      
      // Lowpass filter to make it dull and distant
      const filter = this.ctx!.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 120;

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain!);
      
      gain.gain.value = 0.05; // Quiet background
      
      osc.start();
      this.ambienceOscillators.push(osc);
    });

    // Add some "pink noise" rumble
    this.createNoiseRumble();
  }

  private createNoiseRumble() {
    if (!this.ctx || !this.masterGain) return;
    
    const bufferSize = 2 * this.ctx.sampleRate;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.02 * white)) / 1.02; // Brownish noise
      lastOut = output[i];
      output[i] *= 3.5; 
    }
    
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    
    const gain = this.ctx.createGain();
    gain.gain.value = 0.03;
    
    noise.connect(gain);
    gain.connect(this.masterGain);
    noise.start();
  }

  // High-tech UI hover chirp
  playHover() {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    // Quick sine chirp
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(1200, t + 0.05);
    
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.1, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    
    osc.start();
    osc.stop(t + 0.1);
  }

  // Heavy mechanical click/confirm
  playClick() {
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    
    // 1. Low thud
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.connect(gain1);
    gain1.connect(this.masterGain);
    
    osc1.type = 'square';
    osc1.frequency.setValueAtTime(150, t);
    osc1.frequency.exponentialRampToValueAtTime(40, t + 0.2);
    
    gain1.gain.setValueAtTime(0.3, t);
    gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    
    osc1.start();
    osc1.stop(t + 0.2);

    // 2. High frequency sparkle/data sound
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(this.masterGain);
    
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(2000, t);
    osc2.frequency.linearRampToValueAtTime(1000, t + 0.1);
    
    gain2.gain.setValueAtTime(0.1, t);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    
    osc2.start();
    osc2.stop(t + 0.1);
  }
  
  // Data load success sound
  playSuccess() {
      if (!this.ctx || !this.masterGain || this.isMuted) return;
      const t = this.ctx.currentTime;
      
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.connect(gain);
      gain.connect(this.masterGain);
      
      // Major chord arpeggio effect
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, t); // A4
      osc.frequency.setValueAtTime(554, t + 0.1); // C#5
      osc.frequency.setValueAtTime(659, t + 0.2); // E5
      
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.2, t + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
      
      osc.start();
      osc.stop(t + 0.6);
  }
}

let lastOut = 0; // for brown noise generation

export const audioManager = new AudioService();
