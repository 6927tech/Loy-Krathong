/**
 * SoundManager: Web Audio API sound synthesis for:
 * 1. Traditional Thai Khim/Ranat instrumental pentatonic melody (BGM)
 * 2. River water flow ambient noise (Water SFX)
 * 3. Firework explosions & water splashes
 *
 * Each audio channel has completely independent mute/play controls.
 */
export class SoundManager {
  constructor() {
    this.ctx = null;
    this.bgmPlaying = true;
    this.waterPlaying = true;
    this.isInitialized = false;

    // Audio Nodes
    this.bgmGain = null;
    this.waterGain = null;
    this.sfxGain = null;

    // Melody sequencer loop timer
    this.melodyTimer = null;
    this.currentNoteIndex = 0;

    // Traditional Thai Pentatonic scale notes (frequencies in Hz)
    // C4, D4, E4, G4, A4, C5, D5, E5
    this.thaiScale = [
      261.63, 293.66, 329.63, 392.00, 440.00,
      523.25, 587.33, 659.25
    ];

    // Traditional melody sequence (Motif reminiscent of Lao Duang Deuan & Loy Krathong)
    this.melodySequence = [
      { note: 2, dur: 0.5 }, { note: 3, dur: 0.5 }, { note: 4, dur: 1.0 },
      { note: 3, dur: 0.5 }, { note: 2, dur: 0.5 }, { note: 1, dur: 1.0 },
      { note: 0, dur: 0.5 }, { note: 1, dur: 0.5 }, { note: 2, dur: 1.0 },
      { note: 4, dur: 0.5 }, { note: 5, dur: 0.5 }, { note: 4, dur: 1.0 },
      { note: 3, dur: 0.5 }, { note: 2, dur: 0.5 }, { note: 1, dur: 1.0 },
      { note: 2, dur: 0.5 }, { note: 3, dur: 0.5 }, { note: 2, dur: 1.0 },
      { note: 1, dur: 0.5 }, { note: 0, dur: 0.5 }, { note: 1, dur: 1.5 },
      { note: -1, dur: 0.5 } // rest
    ];
  }

  init() {
    if (this.isInitialized) return;
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContextClass();

      // Master BGM gain
      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.setValueAtTime(this.bgmPlaying ? 0.35 : 0.0, this.ctx.currentTime);
      this.bgmGain.connect(this.ctx.destination);

      // Master Water Ambient gain
      this.waterGain = this.ctx.createGain();
      this.waterGain.gain.setValueAtTime(this.waterPlaying ? 0.4 : 0.0, this.ctx.currentTime);
      this.waterGain.connect(this.ctx.destination);

      // Master SFX gain
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
      this.sfxGain.connect(this.ctx.destination);

      this.startWaterAmbientSynth();
      this.startThaiMelodySequencer();

      this.isInitialized = true;
    } catch (e) {
      console.warn('Web Audio initialization error:', e);
    }
  }

  ensureContextRunning() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  startWaterAmbientSynth() {
    if (!this.ctx) return;

    // Generate 5-second buffer of Pink/Brown noise
    const bufferSize = this.ctx.sampleRate * 5;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.02 * white) / 1.02; // Brown/pink filter
      lastOut = output[i];
      output[i] *= 3.5;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Resonant bandpass filter (simulating river flow body)
    const bandpass = this.ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(450, this.ctx.currentTime);
    bandpass.Q.setValueAtTime(1.2, this.ctx.currentTime);

    // LFO to modulate water wave crests and ripples
    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.18, this.ctx.currentTime);

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(180, this.ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(bandpass.frequency);

    whiteNoise.connect(bandpass);
    bandpass.connect(this.waterGain);

    whiteNoise.start();
    lfo.start();
  }

  startThaiMelodySequencer() {
    if (!this.ctx) return;

    const playNextNote = () => {
      if (!this.bgmPlaying || !this.ctx) {
        this.melodyTimer = setTimeout(playNextNote, 800);
        return;
      }

      const item = this.melodySequence[this.currentNoteIndex];
      this.currentNoteIndex = (this.currentNoteIndex + 1) % this.melodySequence.length;

      if (item.note >= 0) {
        this.playKhimNote(this.thaiScale[item.note], item.dur * 0.9);
      }

      this.melodyTimer = setTimeout(playNextNote, item.dur * 650);
    };

    playNextNote();
  }

  playKhimNote(freq, duration) {
    if (!this.ctx || !this.bgmPlaying) return;

    const t = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const noteGain = this.ctx.createGain();

    // Khim timbre: Triangle fundamental + soft overtone
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, t);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2.01, t); // Slight detuned harmonic

    // Plucked string envelope
    noteGain.gain.setValueAtTime(0.001, t);
    noteGain.gain.exponentialRampToValueAtTime(0.35, t + 0.02);
    noteGain.gain.exponentialRampToValueAtTime(0.001, t + duration * 1.8);

    osc1.connect(noteGain);
    osc2.connect(noteGain);
    noteGain.connect(this.bgmGain);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + duration * 1.9);
    osc2.stop(t + duration * 1.9);
  }

  playWaterSplash() {
    if (!this.ctx) return;
    this.ensureContextRunning();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.35);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.4);
  }

  playFireworkBurst() {
    if (!this.ctx) return;
    this.ensureContextRunning();

    const t = this.ctx.currentTime;

    // 1. Low muffled boom
    const boomOsc = this.ctx.createOscillator();
    const boomGain = this.ctx.createGain();
    boomOsc.type = 'sine';
    boomOsc.frequency.setValueAtTime(140, t);
    boomOsc.frequency.exponentialRampToValueAtTime(35, t + 0.5);

    boomGain.gain.setValueAtTime(0.4, t);
    boomGain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

    boomOsc.connect(boomGain);
    boomGain.connect(this.sfxGain);

    boomOsc.start(t);
    boomOsc.stop(t + 0.65);
  }

  toggleBgm() {
    this.bgmPlaying = !this.bgmPlaying;
    if (this.bgmGain && this.ctx) {
      this.bgmGain.gain.setValueAtTime(this.bgmPlaying ? 0.35 : 0.0, this.ctx.currentTime);
    }
    return this.bgmPlaying;
  }

  toggleWater() {
    this.waterPlaying = !this.waterPlaying;
    if (this.waterGain && this.ctx) {
      this.waterGain.gain.setValueAtTime(this.waterPlaying ? 0.4 : 0.0, this.ctx.currentTime);
    }
    return this.waterPlaying;
  }
}
