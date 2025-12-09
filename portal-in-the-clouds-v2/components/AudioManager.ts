import * as THREE from 'three';

class AudioManager {
  ctx: AudioContext | null = null;
  masterGain: GainNode | null = null;
  
  // Drone Nodes
  oscDrone1: OscillatorNode | null = null;
  oscDrone2: OscillatorNode | null = null;
  droneGain: GainNode | null = null;

  // Portal Interaction Nodes
  oscPortal: OscillatorNode | null = null;
  portalGain: GainNode | null = null;
  portalPanner: StereoPannerNode | null = null;

  // Wind/Movement Nodes
  noiseNode: AudioBufferSourceNode | null = null;
  windFilter: BiquadFilterNode | null = null;
  windGain: GainNode | null = null;

  isInitialized = false;

  constructor() {
    // Singleton instance
  }

  init() {
    if (this.isInitialized) return;

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    this.ctx = new AudioContextClass();
    
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.5; // Overall volume
    this.masterGain.connect(this.ctx.destination);

    this.setupDrone();
    this.setupPortalSynth();
    this.setupWind();

    this.isInitialized = true;
  }

  setupDrone() {
    if (!this.ctx || !this.masterGain) return;

    this.droneGain = this.ctx.createGain();
    this.droneGain.gain.value = 0.15;
    this.droneGain.connect(this.masterGain);

    // Deep space drone - 55Hz (A1)
    this.oscDrone1 = this.ctx.createOscillator();
    this.oscDrone1.type = 'sine';
    this.oscDrone1.frequency.value = 55;
    this.oscDrone1.connect(this.droneGain);
    this.oscDrone1.start();

    // Detuned slightly for binaural beat texture
    this.oscDrone2 = this.ctx.createOscillator();
    this.oscDrone2.type = 'sine';
    this.oscDrone2.frequency.value = 57; // 2Hz beat
    this.oscDrone2.connect(this.droneGain);
    this.oscDrone2.start();
  }

  setupPortalSynth() {
    if (!this.ctx || !this.masterGain) return;

    this.portalGain = this.ctx.createGain();
    this.portalGain.gain.value = 0; // Starts silent
    
    this.portalPanner = this.ctx.createStereoPanner();
    this.portalGain.connect(this.portalPanner);
    this.portalPanner.connect(this.masterGain);

    // Ethereal high pitch
    this.oscPortal = this.ctx.createOscillator();
    this.oscPortal.type = 'triangle';
    this.oscPortal.frequency.value = 220; // Starts at A3
    this.oscPortal.connect(this.portalGain);
    this.oscPortal.start();
  }

  setupWind() {
    if (!this.ctx || !this.masterGain) return;

    // Create 2 seconds of pinkish noise
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    let lastOut = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5; // Compensate for gain loss
    }

    this.noiseNode = this.ctx.createBufferSource();
    this.noiseNode.buffer = buffer;
    this.noiseNode.loop = true;

    this.windFilter = this.ctx.createBiquadFilter();
    this.windFilter.type = 'lowpass';
    this.windFilter.frequency.value = 200; 

    this.windGain = this.ctx.createGain();
    this.windGain.gain.value = 0.0;

    this.noiseNode.connect(this.windFilter);
    this.windFilter.connect(this.windGain);
    this.windGain.connect(this.masterGain);
    
    this.noiseNode.start();
  }

  async resume() {
    if (!this.ctx) this.init();
    if (this.ctx?.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  update(mouse: THREE.Vector2, velocity: number) {
    if (!this.ctx) return;

    const time = this.ctx.currentTime;
    
    // 1. Calculate Proximity to Portal Center
    // mouse is [-1, 1], so center is (0,0).
    // Correct for aspect ratio if needed, but raw is fine for sound feel
    const dist = Math.sqrt(mouse.x * mouse.x + mouse.y * mouse.y);
    const inPortal = 1.0 - Math.min(dist * 1.5, 1.0); // 1.0 at center, 0.0 at edges

    // 2. Modulate Portal Synth (The "Singing" Sound)
    if (this.portalGain && this.oscPortal && this.portalPanner) {
        // Volume: Higher when closer to center
        this.portalGain.gain.setTargetAtTime(inPortal * 0.2, time, 0.1);
        
        // Frequency: Higher pitch at center (Harmonic series: 220 -> 440 -> 880)
        // Lerp between base and octave
        const targetFreq = 220 + (inPortal * 220) + (Math.sin(time * 4) * 5); // Slight vibrato
        this.oscPortal.frequency.setTargetAtTime(targetFreq, time, 0.1);

        // Pan: Follows mouse X
        this.portalPanner.pan.setTargetAtTime(mouse.x * 0.8, time, 0.1);
    }

    // 3. Modulate Wind (Movement Sound)
    if (this.windFilter && this.windGain) {
        // Cutoff: Opens up with velocity
        const targetCutoff = 100 + (velocity * 3000);
        this.windFilter.frequency.setTargetAtTime(targetCutoff, time, 0.1);
        
        // Volume: Louder with velocity
        const targetVol = Math.min(velocity * 5.0, 0.4); 
        this.windGain.gain.setTargetAtTime(targetVol, time, 0.1);
    }

    // 4. Modulate Drone (Background Ambience)
    if (this.droneGain && this.oscDrone1) {
       // Slight pitch bend based on mouse Y for tension
       const detune = mouse.y * 10;
       this.oscDrone1.detune.setTargetAtTime(detune, time, 0.5);
    }
  }
}

export const audioManager = new AudioManager();