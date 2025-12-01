
export class SoundManager {
  ctx: AudioContext | null = null;
  masterGain: GainNode | null = null;
  private _initialized = false;

  init() {
    if (this._initialized) return;
    
    try {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.4; // Master volume
      this.masterGain.connect(this.ctx.destination);
      this._initialized = true;
    } catch (e) {
      console.error("AudioContext not supported");
    }
  }

  ensureContext() {
    if (!this.ctx) this.init();
    if (this.ctx?.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // --- PRIMITIVES ---

  private createNoiseBuffer(): AudioBuffer | null {
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * 2.0; // 2 seconds of noise
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  // --- SPECIFIC SOUND EFFECTS ---

  playHover(variant: string) {
    this.ensureContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    gain.connect(this.masterGain);
    osc.connect(gain);

    if (variant === 'TESLA') {
      // High pitch electric buzz
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, t);
      osc.frequency.linearRampToValueAtTime(150, t + 0.1);
      gain.gain.setValueAtTime(0.05, t);
      gain.gain.linearRampToValueAtTime(0, t + 0.1);
    } else if (variant === 'BRASS') {
      // Low mechanical rumble
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(40, t);
      gain.gain.setValueAtTime(0.05, t);
      gain.gain.linearRampToValueAtTime(0, t + 0.08);
    } else {
      // Subtle static
      osc.type = 'sine';
      osc.frequency.setValueAtTime(80, t);
      gain.gain.setValueAtTime(0.03, t);
      gain.gain.linearRampToValueAtTime(0, t + 0.05);
    }

    osc.start(t);
    osc.stop(t + 0.1);
  }

  playEdisonIgnite() {
    this.ensureContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;

    // 1. The "Ping" (Glass bulb sound)
    const ping = this.ctx.createOscillator();
    const pingGain = this.ctx.createGain();
    ping.type = 'sine';
    ping.frequency.setValueAtTime(2200, t);
    ping.frequency.exponentialRampToValueAtTime(1800, t + 0.1);
    pingGain.gain.setValueAtTime(0.2, t);
    pingGain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    ping.connect(pingGain);
    pingGain.connect(this.masterGain);
    ping.start(t);
    ping.stop(t + 0.3);

    // 2. The 60Hz Electrical Hum (The power warming up)
    const hum = this.ctx.createOscillator();
    const humGain = this.ctx.createGain();
    hum.type = 'sine';
    hum.frequency.setValueAtTime(60, t); // Mains hum
    
    // Add some harmonics for "dirty" electricity
    const hum2 = this.ctx.createOscillator();
    hum2.type = 'square';
    hum2.frequency.setValueAtTime(120, t);
    hum2.connect(humGain);

    humGain.gain.setValueAtTime(0.0, t);
    humGain.gain.linearRampToValueAtTime(0.3, t + 0.1); // Swell in
    humGain.gain.exponentialRampToValueAtTime(0.001, t + 1.5); // Fade out
    
    hum.connect(humGain);
    humGain.connect(this.masterGain);
    hum.start(t);
    hum.stop(t + 1.5);
    hum2.start(t);
    hum2.stop(t + 1.5);
  }

  playTeslaDischarge() {
    this.ensureContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;

    // Create noise burst
    const bufferSize = this.ctx.sampleRate * 0.5;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    
    // Bandpass filter sweep (The "ZAP" sound)
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 10;
    filter.frequency.setValueAtTime(200, t);
    filter.frequency.exponentialRampToValueAtTime(8000, t + 0.15); // Sweep up rapidly
    
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.5, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    
    noise.start(t);
    noise.stop(t + 0.4);

    // Underlying "Buzz"
    const saw = this.ctx.createOscillator();
    saw.type = 'sawtooth';
    saw.frequency.setValueAtTime(50, t);
    saw.frequency.linearRampToValueAtTime(10, t + 0.3);
    const sawGain = this.ctx.createGain();
    sawGain.gain.setValueAtTime(0.3, t);
    sawGain.gain.linearRampToValueAtTime(0, t + 0.3);
    
    saw.connect(sawGain);
    sawGain.connect(this.masterGain);
    saw.start(t);
    saw.stop(t + 0.4);
  }

  playRadiumActivate() {
    this.ensureContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;

    // Sci-fi / Eerie Resonance
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, t);
    // Wobble
    osc.frequency.setValueCurveAtTime(new Float32Array([880, 1200, 880, 440]), t, 0.4);
    
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.1, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.0);

    // Delay effect
    const delay = this.ctx.createDelay();
    delay.delayTime.value = 0.1;
    const feedback = this.ctx.createGain();
    feedback.gain.value = 0.3;

    osc.connect(gain);
    gain.connect(this.masterGain);
    gain.connect(delay);
    delay.connect(feedback);
    feedback.connect(delay);
    delay.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 1.0);

    // Geiger clicks
    const clickCount = 4;
    for(let i=0; i<clickCount; i++) {
        const time = t + Math.random() * 0.3;
        const click = this.ctx.createOscillator();
        const clickGain = this.ctx.createGain();
        click.type = 'square';
        click.frequency.value = 100 + Math.random() * 50;
        clickGain.gain.setValueAtTime(0.1, time);
        clickGain.gain.exponentialRampToValueAtTime(0.001, time + 0.01);
        click.connect(clickGain);
        clickGain.connect(this.masterGain);
        click.start(time);
        click.stop(time + 0.02);
    }
  }

  playBrassEngage() {
    this.ensureContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;

    // Heavy Mechanical Clunk
    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(80, t);
    osc.frequency.exponentialRampToValueAtTime(10, t + 0.1);
    
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.8, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.2);

    // Metallic Latch "Click"
    const metal = this.ctx.createOscillator();
    metal.type = 'square';
    metal.frequency.setValueAtTime(2000, t + 0.05);
    const metalGain = this.ctx.createGain();
    metalGain.gain.setValueAtTime(0.1, t + 0.05);
    metalGain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    
    metal.connect(metalGain);
    metalGain.connect(this.masterGain);
    metal.start(t + 0.05);
    metal.stop(t + 0.15);
  }
}

export const soundManager = new SoundManager();
