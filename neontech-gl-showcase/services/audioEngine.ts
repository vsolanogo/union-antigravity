
export class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;

  constructor() {
    // Lazy initialization to respect browser autoplay policies
  }

  private init() {
    if (!this.ctx) {
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass({ sampleRate: 24000 }); // 24k matches Gemini TTS output often, but it handles resampling
      this.masterGain = this.ctx!.createGain();
      this.masterGain.connect(this.ctx!.destination);
      this.masterGain.gain.value = 0.3; // Default volume
    }
    if (this.ctx?.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMute(mute: boolean) {
    this.isMuted = mute;
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(mute ? 0 : 0.3, this.ctx!.currentTime);
    }
  }

  public getMute() {
    return this.isMuted;
  }

  // --- UI SOUND SYNTHESIS ---

  public playHover() {
    if (this.isMuted) return;
    this.init();
    const t = this.ctx!.currentTime;
    const osc = this.ctx!.createOscillator();
    const gain = this.ctx!.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.exponentialRampToValueAtTime(800, t + 0.05);

    gain.gain.setValueAtTime(0.05, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    osc.connect(gain);
    gain.connect(this.masterGain!);
    osc.start(t);
    osc.stop(t + 0.05);
  }

  public playClick() {
    if (this.isMuted) return;
    this.init();
    const t = this.ctx!.currentTime;
    
    // Impact
    const osc = this.ctx!.createOscillator();
    const gain = this.ctx!.createGain();
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.1);
    
    gain.gain.setValueAtTime(0.1, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    
    osc.connect(gain);
    gain.connect(this.masterGain!);
    osc.start(t);
    osc.stop(t + 0.1);

    // High frequency chirp
    const osc2 = this.ctx!.createOscillator();
    const gain2 = this.ctx!.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(2000, t);
    osc2.frequency.linearRampToValueAtTime(1000, t + 0.05);
    gain2.gain.setValueAtTime(0.02, t);
    gain2.gain.linearRampToValueAtTime(0, t + 0.05);
    
    osc2.connect(gain2);
    gain2.connect(this.masterGain!);
    osc2.start(t);
    osc2.stop(t + 0.05);
  }

  public playSuccessChime() {
    if (this.isMuted) return;
    this.init();
    const t = this.ctx!.currentTime;
    
    const freqs = [523.25, 659.25, 783.99, 1046.50]; // C Major arpeggio
    
    freqs.forEach((f, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        const start = t + i * 0.05;
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, start);
        
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.05, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.4);
        
        osc.connect(gain);
        gain.connect(this.masterGain!);
        osc.start(start);
        osc.stop(start + 0.5);
    });
  }

  // --- TTS DECODING & PLAYBACK ---

  public async playPCM(base64Data: string) {
    if (this.isMuted) return;
    this.init();
    
    try {
      const audioBuffer = await this.decodeAudioData(
        this.base64ToBytes(base64Data),
        this.ctx!,
        24000, // Gemini TTS usually defaults to 24k
        1
      );
      
      const source = this.ctx!.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.masterGain!);
      source.start();
    } catch (e) {
      console.error("Audio playback error:", e);
    }
  }

  private base64ToBytes(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  private async decodeAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number
  ): Promise<AudioBuffer> {
    // Check if we have a proper header or raw PCM. Gemini returns raw PCM.
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        // Convert Int16 to Float32 [-1.0, 1.0]
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  }
}

export const audioEngine = new AudioEngine();
