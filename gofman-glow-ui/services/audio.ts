
// A lightweight procedural audio synth for UI effects
class AudioSynth {
  private ctx: AudioContext | null = null;
  private isEnabled: boolean = false;

  private getContext(): AudioContext {
    if (!this.ctx) {
      // @ts-ignore - Handle WebKit prefix
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    return this.ctx;
  }

  // Must be called after a user gesture (click) to unlock audio
  public async init() {
    if (this.isEnabled) return;
    const ctx = this.getContext();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
    this.isEnabled = true;
  }

  public playHover() {
    if (!this.isEnabled) return;
    const ctx = this.getContext();
    const t = ctx.currentTime;

    // Oscillator 1: High tech blip
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(1200, t + 0.05);

    gain.gain.setValueAtTime(0.02, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    osc.start(t);
    osc.stop(t + 0.05);
  }

  public playShieldClick() {
    if (!this.isEnabled) return;
    const ctx = this.getContext();
    const t = ctx.currentTime;

    // 1. Sub Bass Impact
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.8); // Drop pitch

    // Low pass sweep
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, t);
    filter.frequency.exponentialRampToValueAtTime(100, t + 0.5);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);

    osc.start(t);
    osc.stop(t + 0.8);

    // 2. High Frequency Charge Up
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(200, t);
    osc2.frequency.linearRampToValueAtTime(800, t + 0.2);
    
    gain2.gain.setValueAtTime(0.05, t);
    gain2.gain.linearRampToValueAtTime(0, t + 0.2);
    
    osc2.start(t);
    osc2.stop(t + 0.2);
  }

  public playMelonClick() {
    if (!this.isEnabled) return;
    const ctx = this.getContext();
    const t = ctx.currentTime;

    // FM Synthesis for "Squishy/Glitchy" sound
    const carrier = ctx.createOscillator();
    const modulator = ctx.createOscillator();
    const modGain = ctx.createGain();
    const masterGain = ctx.createGain();

    modulator.connect(modGain);
    modGain.connect(carrier.frequency); // Modulate frequency of carrier
    carrier.connect(masterGain);
    masterGain.connect(ctx.destination);

    carrier.type = 'sine';
    carrier.frequency.setValueAtTime(400, t);
    
    modulator.type = 'square';
    modulator.frequency.setValueAtTime(50, t); // Fast modulation
    modulator.frequency.linearRampToValueAtTime(10, t + 0.3); // Slow down

    modGain.gain.setValueAtTime(500, t); // Modulation depth
    modGain.gain.exponentialRampToValueAtTime(10, t + 0.3);

    masterGain.gain.setValueAtTime(0.3, t);
    masterGain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

    carrier.start(t);
    modulator.start(t);
    carrier.stop(t + 0.4);
    modulator.stop(t + 0.4);
  }
}

export const audioSystem = new AudioSynth();
