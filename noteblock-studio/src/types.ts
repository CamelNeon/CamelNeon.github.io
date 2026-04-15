export type InstrumentType = 
  | 'harp' 
  | 'bass' 
  | 'snare' 
  | 'hat' 
  | 'bd' 
  | 'bell' 
  | 'flute' 
  | 'icechime' 
  | 'guitar' 
  | 'xylobone' 
  | 'iron_xylophone' 
  | 'cow_bell' 
  | 'didgeridoo' 
  | 'bit' 
  | 'banjo' 
  | 'pling';

export interface Note {
  id: string;
  instrument: InstrumentType;
  pitch: number; // 0-24
  tick: number;
  layer: number;
}

export interface Song {
  name: string;
  author: string;
  tempo: number; // Ticks per second (standard is 10)
  notes: Note[];
  layers: Layer[];
}

export interface Layer {
  id: number;
  name: string;
  volume: number;
  muted: boolean;
  soloed: boolean;
}

export const INSTRUMENTS: { type: InstrumentType; name: string; block: string; color: string }[] = [
  { type: 'harp', name: 'Piano (Harp)', block: 'Any', color: '#4ade80' },
  { type: 'bass', name: 'Bass Guitar', block: 'Wood', color: '#facc15' },
  { type: 'bd', name: 'Bass Drum', block: 'Stone', color: '#94a3b8' },
  { type: 'snare', name: 'Snare Drum', block: 'Sand', color: '#fbbf24' },
  { type: 'hat', name: 'Clicks', block: 'Glass', color: '#38bdf8' },
  { type: 'flute', name: 'Flute', block: 'Clay', color: '#f472b6' },
  { type: 'bell', name: 'Bell', block: 'Gold Block', color: '#fb923c' },
  { type: 'icechime', name: 'Chime', block: 'Packed Ice', color: '#2dd4bf' },
  { type: 'xylobone', name: 'Xylophone', block: 'Bone Block', color: '#e879f9' },
  { type: 'iron_xylophone', name: 'Iron Xylophone', block: 'Iron Block', color: '#cbd5e1' },
  { type: 'cow_bell', name: 'Cow Bell', block: 'Soul Sand', color: '#a78bfa' },
  { type: 'didgeridoo', name: 'Didgeridoo', block: 'Pumpkin', color: '#fb7185' },
  { type: 'bit', name: 'Bit', block: 'Emerald Block', color: '#4ade80' },
  { type: 'banjo', name: 'Banjo', block: 'Hay Bale', color: '#fde047' },
  { type: 'pling', name: 'Pling', block: 'Glowstone', color: '#60a5fa' },
];

export const MIN_PITCH = 0;
export const MAX_PITCH = 24;
export const TICKS_PER_SECOND_OPTIONS = [2.5, 5, 10, 20];
