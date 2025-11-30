
import { EffectType } from '../types';

class SoundSystem {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  // Default to unmuted so sound is "on" by default.
  // Note: AudioContext still needs a user gesture (click) to start physically playing.
  private isMuted: boolean = false;

  constructor() {
    // Lazy initialization handled in init() or first interaction
  }

  public init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return;
    }

    const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
    this.ctx = new AudioContextClass();
    this.masterGain = this.ctx.createGain();
    this.masterGain.connect(this.ctx.destination);
    // Set initial volume based on muted state
    this.masterGain.gain.value = this.isMuted ? 0 : 0.3;
  }

  public toggleMute(): boolean {
    if (!this.ctx) {
        this.init();
    }
    
    this.isMuted = !this.isMuted;
    
    if (this.masterGain && this.ctx) {
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.3, this.ctx.currentTime);
        if (!this.isMuted && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }
    return this.isMuted;
  }

  public getMutedState(): boolean {
      return this.isMuted;
  }

  private createOscillator(type: OscillatorType, freq: number, startTime: number, duration: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    return { osc, gain };
  }

  private createNoiseBuffer() {
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * 2; // 2 seconds
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  public playHover(effect: EffectType) {
    // Hover cannot typically start AudioContext due to browser autoplay policies,
    // so we only play if context is already active.
    if (this.isMuted || !this.ctx) return;
    
    if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
    }

    const t = this.ctx.currentTime;

    switch (effect) {
      case EffectType.SPECTRAL_MIST:
        // Eerie wind sweep
        const noiseParams = this.createNoiseSource();
        if (noiseParams) {
          const { source, gain, filter } = noiseParams;
          filter.type = 'bandpass';
          filter.Q.value = 5;
          filter.frequency.setValueAtTime(400, t);
          filter.frequency.linearRampToValueAtTime(800, t + 0.5);
          
          gain.gain.setValueAtTime(0, t);
          gain.gain.linearRampToValueAtTime(0.2, t + 0.2);
          gain.gain.linearRampToValueAtTime(0, t + 0.6);
          
          source.start(t);
          source.stop(t + 0.6);
        }
        break;

      case EffectType.CURSED_GOLD:
        // Metallic shimmer
        [500, 1000, 1500].forEach((freq, i) => {
           const nodes = this.createOscillator('sine', freq, t, 0.3);
           if (nodes) {
             nodes.gain.gain.setValueAtTime(0, t);
             nodes.gain.gain.linearRampToValueAtTime(0.05, t + 0.05);
             nodes.gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3 + (i * 0.1));
             nodes.osc.start(t);
             nodes.osc.stop(t + 0.5);
           }
        });
        break;

      case EffectType.BIOLUMINESCENCE:
        // Sonar ping / Bubble
        const bio = this.createOscillator('sine', 800, t, 0.2);
        if (bio) {
            bio.osc.frequency.exponentialRampToValueAtTime(400, t + 0.2);
            bio.gain.gain.setValueAtTime(0.1, t);
            bio.gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
            bio.osc.start(t);
            bio.osc.stop(t + 0.2);
        }
        break;

      case EffectType.KRAKEN_STORM:
        // Low rumble
        const rumble = this.createOscillator('sawtooth', 50, t, 0.4);
        if (rumble) {
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 150;
            rumble.osc.disconnect();
            rumble.osc.connect(filter);
            filter.connect(rumble.gain);
            
            rumble.gain.gain.setValueAtTime(0, t);
            rumble.gain.gain.linearRampToValueAtTime(0.2, t + 0.1);
            rumble.gain.gain.linearRampToValueAtTime(0, t + 0.4);
            rumble.osc.start(t);
            rumble.osc.stop(t + 0.4);
        }
        break;
    }
  }

  public playClick(effect: EffectType) {
    // Click is a user gesture, so we can initialize/resume AudioContext here if needed.
    if (!this.ctx) {
        this.init();
    } else if (this.ctx.state === 'suspended') {
        this.ctx.resume();
    }

    if (this.isMuted || !this.ctx) return;
    
    const t = this.ctx.currentTime;

    switch (effect) {
        case EffectType.SPECTRAL_MIST:
            // Ghostly wail (Theremin-ish)
            const wail = this.createOscillator('sine', 600, t, 1.5);
            if (wail) {
                wail.osc.frequency.linearRampToValueAtTime(1200, t + 0.8);
                wail.gain.gain.setValueAtTime(0.2, t);
                wail.gain.gain.exponentialRampToValueAtTime(0.001, t + 1.5);
                wail.osc.start(t);
                wail.osc.stop(t + 1.5);
            }
            break;

        case EffectType.CURSED_GOLD:
            // Coin drop / Cash register
            const ping = this.createOscillator('square', 2000, t, 0.5);
            if (ping) {
                ping.gain.gain.setValueAtTime(0.1, t);
                ping.gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
                ping.osc.start(t);
                ping.osc.stop(t + 0.5);
            }
            break;

        case EffectType.BIOLUMINESCENCE:
            // Deep water drop
             const drop = this.createOscillator('sine', 1200, t, 0.5);
             if (drop) {
                 drop.osc.frequency.exponentialRampToValueAtTime(200, t + 0.3);
                 drop.gain.gain.setValueAtTime(0.3, t);
                 drop.gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
                 drop.osc.start(t);
                 drop.osc.stop(t + 0.3);
             }
             break;

        case EffectType.KRAKEN_STORM:
            // Thunder crack
            const noise = this.createNoiseSource();
            if (noise) {
                noise.filter.frequency.setValueAtTime(1000, t);
                noise.filter.frequency.exponentialRampToValueAtTime(100, t + 0.5);
                noise.gain.gain.setValueAtTime(0.8, t);
                noise.gain.gain.exponentialRampToValueAtTime(0.001, t + 1.0);
                noise.source.start(t);
                noise.source.stop(t + 1.0);
            }
            break;
    }
  }

  private createNoiseSource() {
    if (!this.ctx || !this.masterGain) return null;
    const buffer = this.createNoiseBuffer();
    if (!buffer) return null;

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    return { source, filter, gain };
  }
}

export const soundSystem = new SoundSystem();
