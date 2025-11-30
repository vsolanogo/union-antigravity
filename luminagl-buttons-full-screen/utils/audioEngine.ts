
export class AudioEngine {
  ctx: AudioContext | null = null;
  masterGain: GainNode | null = null;
  ambienceNodes: AudioNode[] = [];
  isMuted: boolean = false; // Default to on
  initialized: boolean = false;

  constructor() {
    // We defer actual context creation, but configuration is ready
  }

  init() {
    if (this.initialized) return;
    
    try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        this.ctx = new AudioContextClass();
        this.masterGain = this.ctx.createGain();
        this.masterGain.connect(this.ctx.destination);
        this.masterGain.gain.value = 0.4; // Master volume

        this.initialized = true;
        this.isMuted = false;
        this.startAmbience();

        // Autoplay Policy Handling:
        // If context is suspended (common on page load), resume it on first interaction.
        if (this.ctx.state === 'suspended') {
            const unlock = () => {
                this.ctx?.resume().then(() => {
                    // Remove listeners once unlocked
                    window.removeEventListener('click', unlock);
                    window.removeEventListener('keydown', unlock);
                    window.removeEventListener('touchstart', unlock);
                });
            };
            window.addEventListener('click', unlock);
            window.addEventListener('keydown', unlock);
            window.addEventListener('touchstart', unlock);
        }
    } catch (e) {
        console.error("Audio initialization failed:", e);
    }
  }

  toggleMute() {
    if (!this.initialized) {
        this.init();
        return;
    }
    
    this.isMuted = !this.isMuted;
    if (this.ctx && this.masterGain) {
        const target = this.isMuted ? 0 : 0.4;
        this.masterGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.1);
    }
    
    // Resume context if it was suspended by browser policy
    if (this.ctx?.state === 'suspended') {
        this.ctx.resume();
    }
  }

  private startAmbience() {
    if (!this.ctx || !this.masterGain) return;

    // 1. Low Drone (Sawtooth -> Lowpass)
    const osc1 = this.ctx.createOscillator();
    osc1.type = 'sawtooth';
    osc1.frequency.value = 50; // Deep bass

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 120;
    filter.Q.value = 1;

    // LFO for filter movement (Throbbing effect)
    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.2; // Slow pulse
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 50; // Modulate filter by +/- 50Hz

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    const droneGain = this.ctx.createGain();
    droneGain.gain.value = 0.3;

    osc1.connect(filter);
    filter.connect(droneGain);
    droneGain.connect(this.masterGain);

    osc1.start();
    lfo.start();
    this.ambienceNodes.push(osc1, lfo, lfoGain, droneGain, filter);

    // 2. Space Wind (Pink Noise approximation using buffer)
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5; // Compensate for gain loss
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.value = 800;
    
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.value = 0.05;

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    noise.start();
    this.ambienceNodes.push(noise, noiseFilter, noiseGain);
  }

  // Effect: "Power Up" (Rising Sine)
  playHoverSystem() {
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    
    // Ensure context is running (sometimes it suspends if tab is backgrounded)
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.connect(gain);
    gain.connect(this.masterGain);

    const now = this.ctx.currentTime;
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.3);
    
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 0.1);
    gain.gain.linearRampToValueAtTime(0, now + 0.3);

    osc.start(now);
    osc.stop(now + 0.3);
  }

  // Effect: "Data Scan" (Random Bleeps)
  playHoverScan() {
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const now = this.ctx.currentTime;
    const gain = this.ctx.createGain();
    gain.connect(this.masterGain);
    
    // Create a few quick random tones
    for(let i=0; i<3; i++) {
        const osc = this.ctx.createOscillator();
        osc.type = 'square';
        osc.connect(gain);
        
        const time = now + (i * 0.05);
        osc.frequency.setValueAtTime(800 + Math.random() * 1000, time);
        osc.start(time);
        osc.stop(time + 0.04);
    }

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
  }

  // Effect: "Mechanical Click"
  playClick() {
    if (this.isMuted || !this.ctx || !this.masterGain) return;

    if (this.ctx.state === 'suspended') this.ctx.resume();

    const now = this.ctx.currentTime;

    // 1. Thump (Low Sine)
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.1);
    
    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    osc.start(now);
    osc.stop(now + 0.1);

    // 2. High frequency click (Noise burst)
    const bufferSize = this.ctx.sampleRate * 0.01; // 10ms
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.value = 0.3;
    
    noise.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    noise.start(now);
  }
}

export const audio = new AudioEngine();
