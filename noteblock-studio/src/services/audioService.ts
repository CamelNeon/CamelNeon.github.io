import * as Tone from 'tone';
import { InstrumentType } from '../types';

// Minecraft pitches are F#3 to F#5
// 0 = F#3, 12 = F#4, 24 = F#5
const PITCH_MAP: Record<number, string> = {
  0: "F#3", 1: "G3", 2: "G#3", 3: "A3", 4: "A#3", 5: "B3", 6: "C4", 7: "C#4", 8: "D4", 9: "D#4", 10: "E4", 11: "F4", 12: "F#4",
  13: "G4", 14: "G#4", 15: "A4", 16: "A#4", 17: "B4", 18: "C5", 19: "C#5", 20: "D5", 21: "D#5", 22: "E5", 23: "F5", 24: "F#5"
};

class AudioService {
  private initialized = false;

  async init() {
    if (this.initialized) return;
    this.initialized = true;
    await Tone.start();
  }

  private getInstrument(type: InstrumentType): any {
    // For simplicity and reliability in this environment, I'll use Synths configured to sound like the instruments.
    
    switch (type) {
      case 'harp':
        return new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: 'triangle' },
          envelope: { attack: 0.005, decay: 0.3, sustain: 0, release: 0.1 }
        }).toDestination();
      case 'bass':
        return new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: 'sine' },
          envelope: { attack: 0.01, decay: 0.4, sustain: 0, release: 0.2 }
        }).toDestination();
      case 'basedrum':
        return new Tone.MembraneSynth({
          pitchDecay: 0.05,
          octaves: 10,
          oscillator: { type: 'sine' }
        }).toDestination();
      case 'snare':
        return new Tone.NoiseSynth({
          noise: { type: 'white' },
          envelope: { attack: 0.001, decay: 0.1, release: 0.1 }
        }).toDestination();
      case 'hat':
        return new Tone.NoiseSynth({
          noise: { type: 'white' },
          envelope: { attack: 0.001, decay: 0.01, release: 0.01 }
        }).toDestination();
      case 'flute':
        return new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: 'sine' },
          envelope: { attack: 0.05, decay: 0.2, sustain: 0.2, release: 0.1 }
        }).toDestination();
      case 'bell':
        return new Tone.PolySynth(Tone.FMSynth, {
          harmonicity: 3.01,
          modulationIndex: 14,
          oscillator: { type: 'sine' },
          envelope: { attack: 0.001, decay: 0.5, sustain: 0, release: 0.5 },
          modulation: { type: 'square' },
          modulationEnvelope: { attack: 0.01, decay: 0.5, sustain: 0, release: 0.5 }
        }).toDestination();
      case 'chime':
        return new Tone.PolySynth(Tone.FMSynth, {
          harmonicity: 2,
          modulationIndex: 10,
          oscillator: { type: 'sine' },
          envelope: { attack: 0.001, decay: 0.4, sustain: 0, release: 0.4 }
        }).toDestination();
      case 'guitar':
        return new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: 'sawtooth' },
          envelope: { attack: 0.01, decay: 0.3, sustain: 0, release: 0.1 }
        }).toDestination();
      case 'xylophone':
        return new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: 'sine' },
          envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.1 }
        }).toDestination();
      case 'iron_xylophone':
        return new Tone.PolySynth(Tone.FMSynth, {
          harmonicity: 1.5,
          modulationIndex: 5,
          oscillator: { type: 'sine' },
          envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.2 }
        }).toDestination();
      case 'cow_bell':
        return new Tone.PolySynth(Tone.FMSynth, {
          harmonicity: 0.5,
          modulationIndex: 20,
          oscillator: { type: 'sine' },
          envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.1 }
        }).toDestination();
      case 'didgeridoo':
        return new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: 'sawtooth' },
          envelope: { attack: 0.1, decay: 0.5, sustain: 0.5, release: 0.2 }
        }).toDestination();
      case 'bit':
        return new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: 'square' },
          envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.1 }
        }).toDestination();
      case 'banjo':
        return new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: 'sawtooth' },
          envelope: { attack: 0.01, decay: 0.2, sustain: 0, release: 0.1 }
        }).toDestination();
      case 'pling':
        return new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: 'sine' },
          envelope: { attack: 0.001, decay: 0.5, sustain: 0, release: 0.2 }
        }).toDestination();
      default:
        return new Tone.PolySynth().toDestination();
    }
  }

  private instrumentCache: Partial<Record<InstrumentType, any>> = {};

  playNote(type: InstrumentType, pitch: number, time?: number) {
    if (!this.instrumentCache[type]) {
      this.instrumentCache[type] = this.getInstrument(type);
    }
    const inst = this.instrumentCache[type]!;
    const noteName = PITCH_MAP[pitch];
    
    if (inst instanceof Tone.NoiseSynth) {
      inst.triggerAttackRelease("16n", time);
    } else if (inst instanceof Tone.MembraneSynth) {
      inst.triggerAttackRelease(noteName, "16n", time);
    } else {
      inst.triggerAttackRelease(noteName, "16n", time);
    }
  }
}

export const audioService = new AudioService();
