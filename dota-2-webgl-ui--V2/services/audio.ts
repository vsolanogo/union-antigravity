
export class AudioService {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = true; // Start muted by default for browser policy
  private initialized: boolean = false;
  private ambienceNodes: AudioNode[] = [];

  constructor() {
    // Lazy initialization
  }

  // Initialize Audio Context on first user gesture
  init() {
    if (this.initialized) return;
    
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
      this.masterGain.gain.value = 0.3; // Master volume
      
      this.initialized = true;
      this.isMuted = false;
      
      // Start background ambience immediately upon init
      this.startAmbience();
    } catch (e) {
      console.error("Audio initialization failed:", e);
    }
  }

  toggleMute() {
    if (!this.initialized) {
      this.init();
      return false; // Now unmuted
    }
    
    this.isMuted = !this.isMuted;
    
    if (this.masterGain && this.ctx) {
        const t = this.ctx.currentTime;
        // Smooth fade to avoid clicking artifacts
        this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : 0.3, t, 0.1);
    }
    
    return this.isMuted;
  }

  getMuted() {
      return this.isMuted;
  }

  private createOsc(type: OscillatorType, freq: number): OscillatorNode {
      if (!this.ctx) throw new Error("Audio not init");
      const osc = this.ctx.createOscillator();
      osc.type = type;
      osc.frequency.value = freq;
      return osc;
  }

  private createGain(val: number): GainNode {
      if (!this.ctx) throw new Error("Audio not init");
      const g = this.ctx.createGain();
      g.gain.value = val;
      return g;
  }

  // --- SOUND EFFECTS ---

  // Magical/Techy Hover Swish
  playHover() {
    if (!this.initialized || this.isMuted || !this.ctx) return;
    const t = this.ctx.currentTime;

    // Filtered noise-like sweep using high freq sine + filter modulation
    const osc = this.createOsc('triangle', 300);
    const gain = this.createGain(0);
    const filter = this.ctx.createBiquadFilter();
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, t);
    filter.frequency.exponentialRampToValueAtTime(1500, t + 0.15);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain!);
    
    osc.start(t);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.08, t + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    osc.stop(t + 0.2);
  }

  // Heavy Metallic Impact
  playClick() {
    if (!this.initialized || this.isMuted || !this.ctx) return;
    const t = this.ctx.currentTime;
    
    // 1. Low frequency "Kick"
    const kick = this.createOsc('sine', 150);
    const kickGain = this.createGain(0);
    
    kick.frequency.setValueAtTime(120, t);
    kick.frequency.exponentialRampToValueAtTime(40, t + 0.1);
    
    kick.connect(kickGain);
    kickGain.connect(this.masterGain!);
    
    kick.start(t);
    kickGain.gain.setValueAtTime(0.3, t);
    kickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    kick.stop(t + 0.25);

    // 2. Metallic 'Clank' overtone
    const metal = this.createOsc('square', 600);
    const metalGain = this.createGain(0);
    
    // Quick dissonance
    metal.frequency.setValueAtTime(500, t);
    metal.frequency.linearRampToValueAtTime(300, t + 0.05);
    
    metal.connect(metalGain);
    metalGain.connect(this.masterGain!);
    
    metal.start(t);
    metalGain.gain.setValueAtTime(0.05, t);
    metalGain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    metal.stop(t + 0.15);
  }

  // Hero Selection Chords
  playHeroSelect(type: 'STR' | 'AGI' | 'INT') {
    if (!this.initialized || this.isMuted || !this.ctx) return;
    const t = this.ctx.currentTime;
    
    // Define base frequencies and waveforms based on attribute
    const baseFreq = type === 'STR' ? 80 : type === 'AGI' ? 220 : 330;
    const wave: OscillatorType = type === 'STR' ? 'sawtooth' : type === 'INT' ? 'sine' : 'triangle';
    
    // Create a triad chord (Root, Major 3rd, Perfect 5th)
    const ratios = [1, 1.25, 1.5];
    
    ratios.forEach((ratio, i) => {
        const osc = this.createOsc(wave, baseFreq * ratio);
        const gain = this.createGain(0);
        
        // Add some detuning for thickness
        osc.detune.value = (Math.random() - 0.5) * 10;
        
        osc.connect(gain);
        gain.connect(this.masterGain!);
        
        osc.start(t);
        
        // Staggered attack (strumming effect)
        const attackTime = t + (i * 0.03);
        
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.1, attackTime + 0.05);
        // Long decay for dramatic effect
        gain.gain.exponentialRampToValueAtTime(0.001, attackTime + 1.5);
        
        osc.stop(t + 2.0);
    });

    // Add a heavy thud underneath
    this.playClick();
  }

  // Background Ambience (Drone)
  private startAmbience() {
      if (!this.ctx || this.ambienceNodes.length > 0) return;
      
      const t = this.ctx.currentTime;
      
      // Two detuned sine waves for a "beating" low drone
      const osc1 = this.createOsc('sine', 55); // A1
      const osc2 = this.createOsc('sine', 58); // Detuned A1
      const gain = this.createGain(0);
      
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.masterGain!);
      
      osc1.start(t);
      osc2.start(t);
      
      // Slow fade in
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.08, t + 2.0);
      
      this.ambienceNodes.push(osc1, osc2, gain);
  }
}

export const audio = new AudioService();
