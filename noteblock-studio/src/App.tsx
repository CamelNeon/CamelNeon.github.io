/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as Tone from 'tone';
import { 
  Play, 
  Pause, 
  Square, 
  Plus, d
  Trash2, 
  Download, 
  Music, 
  Settings, 
  Layers, 
  ChevronRight, 
  ChevronLeft,
  Save,
  FileJson,
  Box,
  Volume2,
  VolumeX
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { audioService } from './services/audioService';
import { 
  InstrumentType, 
  Note, 
  Song, 
  Layer, 
  INSTRUMENTS, 
  MIN_PITCH, 
  MAX_PITCH, 
  TICKS_PER_SECOND_OPTIONS 
} from './types';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

const DEFAULT_SONG: Song = {
  name: "My New Song",
  author: "Player",
  tempo: 10,
  notes: [],
  layers: [
    { id: 0, name: "Layer 1", volume: 100, muted: false, soloed: false }
  ]
};

const GRID_SIZE = 40;
const EMPTY_ARRAY: Note[] = [];

const GridCell = React.memo(({ 
  tick, 
  pitch, 
  notes, 
  selectedLayer, 
  onAddNote 
}: { 
  tick: number, 
  pitch: number, 
  notes: Note[], 
  selectedLayer: number,
  onAddNote: (tick: number, pitch: number) => void
}) => {
  const currentLayerNote = notes.find(n => n.layer === selectedLayer);
  const otherLayersNotes = notes.filter(n => n.layer !== selectedLayer);
  
  const displayNote = currentLayerNote || otherLayersNotes[0];
  const inst = displayNote ? INSTRUMENTS.find(ins => ins.type === displayNote.instrument) : null;
  const isGhost = !currentLayerNote && otherLayersNotes.length > 0;

  return (
    <div
      onClick={() => onAddNote(tick, pitch)}
      className={cn(
        "flex-shrink-0 border-r border-b border-white/5 cursor-crosshair transition-colors group relative",
        tick % 4 === 0 ? "bg-white/[0.02]" : ""
      )}
      style={{ width: GRID_SIZE }}
    >
      {displayNote && (
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: isGhost ? 0.3 : 1 }}
          className="w-full h-full p-1"
        >
          <div 
            className="w-full h-full rounded shadow-lg flex items-center justify-center relative"
            style={{ backgroundColor: inst?.color || '#fff' }}
          >
            {notes.length > 1 && (
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-white rounded-full border border-black/20 z-20" />
            )}
            <div className="w-1 h-1 bg-black/20 rounded-full" />
          </div>
        </motion.div>
      )}
      {!displayNote && (
        <div className="w-full h-full opacity-0 group-hover:opacity-100 bg-white/5 flex items-center justify-center">
          <div className="w-1 h-1 bg-white/20 rounded-full" />
        </div>
      )}
    </div>
  );
});

GridCell.displayName = 'GridCell';

export default function App() {
  const [song, setSong] = useState<Song>(DEFAULT_SONG);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedInstrument, setSelectedInstrument] = useState<InstrumentType>('harp');
  const [selectedLayer, setSelectedLayer] = useState(0);
  const [showBlueprint, setShowBlueprint] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 32 });

  const playbackRef = useRef<number | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const tickDisplayRef = useRef<HTMLSpanElement>(null);
  const currentTickRef = useRef(0);

  // Pre-calculate note map for O(1) lookup
  const noteMap = React.useMemo(() => {
    const map: Record<string, Note[]> = {};
    song.notes.forEach(note => {
      const key = `${note.tick}-${note.pitch}`;
      if (!map[key]) map[key] = [];
      map[key].push(note);
    });
    return map;
  }, [song.notes]);

  // Pre-calculate notes by tick for playback
  const notesByTick = React.useMemo(() => {
    const map: Record<number, Note[]> = {};
    song.notes.forEach(note => {
      if (!map[note.tick]) map[note.tick] = [];
      map[note.tick].push(note);
    });
    return map;
  }, [song.notes]);

  const getNotesAt = useCallback((tick: number, pitch: number) => {
    return noteMap[`${tick}-${pitch}`] || EMPTY_ARRAY;
  }, [noteMap]);

  // Update visible range on scroll
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const start = Math.floor(container.scrollLeft / GRID_SIZE);
      const count = Math.ceil(container.clientWidth / GRID_SIZE);
      setVisibleRange({ 
        start: Math.max(0, start - 5), 
        end: Math.min(1000, start + count + 5) 
      });
    };

    container.addEventListener('scroll', handleScroll);
    // Initial calculation
    handleScroll();
    
    const resizeObserver = new ResizeObserver(handleScroll);
    resizeObserver.observe(container);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      resizeObserver.disconnect();
    };
  }, []);

  // Initialize audio on first interaction
  const initAudio = async () => {
    await audioService.init();
  };

  const stopPlayback = useCallback(() => {
    if (playbackRef.current) clearInterval(playbackRef.current);
    setIsPlaying(false);
    currentTickRef.current = 0;
    if (cursorRef.current) cursorRef.current.style.left = '0px';
    if (tickDisplayRef.current) tickDisplayRef.current.textContent = '0';
  }, []);

  const togglePlay = async () => {
    if (!isPlaying) {
      await initAudio();
      setIsPlaying(true);
      
      playbackRef.current = window.setInterval(() => {
        const next = currentTickRef.current + 1;
        currentTickRef.current = next;

        if (next >= 1000) {
          stopPlayback();
          return;
        }
        
        // Update DOM directly for performance
        if (cursorRef.current) {
          cursorRef.current.style.left = `${next * GRID_SIZE}px`;
        }
        if (tickDisplayRef.current) {
          tickDisplayRef.current.textContent = next.toString();
        }
        
        // Play notes at this tick
        const notesAtTick = notesByTick[next] || [];
        notesAtTick.forEach(n => {
          const layer = song.layers.find(l => l.id === n.layer);
          if (layer && !layer.muted) {
            audioService.playNote(n.instrument, n.pitch);
          }
        });
        
        // Auto-scroll
        if (scrollContainerRef.current) {
          const container = scrollContainerRef.current;
          const scrollLeft = container.scrollLeft;
          const width = container.clientWidth;
          const cursorX = next * GRID_SIZE;
          
          if (cursorX > scrollLeft + width - 100) {
            container.scrollLeft = cursorX - 100;
          }
        }
      }, 1000 / song.tempo);
    } else {
      stopPlayback();
    }
  };

  const addNote = useCallback(async (tick: number, pitch: number) => {
    try {
      await initAudio();
      setSong(prev => {
        const existingNoteIndex = prev.notes.findIndex(n => n.tick === tick && n.pitch === pitch && n.layer === selectedLayer);
        
        if (existingNoteIndex >= 0) {
          // Remove note
          const newNotes = [...prev.notes];
          newNotes.splice(existingNoteIndex, 1);
          return { ...prev, notes: newNotes };
        } else {
          // Add note
          const newNote: Note = {
            id: Math.random().toString(36).substr(2, 9),
            instrument: selectedInstrument,
            pitch,
            tick,
            layer: selectedLayer
          };
          audioService.playNote(selectedInstrument, pitch);
          return { ...prev, notes: [...prev.notes, newNote] };
        }
      });
    } catch (error) {
      console.error("Failed to add note:", error);
    }
  }, [selectedInstrument, selectedLayer]);

  const addLayer = () => {
    const newId = song.layers.length > 0 ? Math.max(...song.layers.map(l => l.id)) + 1 : 0;
    const newLayer: Layer = {
      id: newId,
      name: `Layer ${newId + 1}`,
      volume: 100,
      muted: false,
      soloed: false
    };
    setSong({ ...song, layers: [...song.layers, newLayer] });
    setSelectedLayer(newId);
  };

  const toggleMuteLayer = (id: number) => {
    setSong({
      ...song,
      layers: song.layers.map(l => l.id === id ? { ...l, muted: !l.muted } : l)
    });
  };

  const generateBlueprint = () => {
    const ticksWithNotes: number[] = Array.from(new Set(song.notes.map(n => n.tick))).sort((a: number, b: number) => a - b) as number[];
    if (ticksWithNotes.length === 0) return "No notes to build!";

    let blueprint = `BUILDING GUIDE FOR: ${song.name.toUpperCase()}\n`;
    blueprint += `==========================================\n`;
    blueprint += `Tempo: ${song.tempo} ticks/sec\n`;
    blueprint += `Total Notes: ${song.notes.length}\n`;
    blueprint += `==========================================\n\n`;
    
    // Group notes by tick
    const tickGroups: Record<number, Note[]> = ticksWithNotes.reduce((acc: Record<number, Note[]>, tick: number) => {
      acc[tick] = song.notes.filter(n => n.tick === tick);
      return acc;
    }, {} as Record<number, Note[]>);

    const firstTick = ticksWithNotes[0];
    const firstNotes = tickGroups[firstTick];
    blueprint += `TICK ${firstTick}: `;
    firstNotes.forEach((n, idx) => {
      const inst = INSTRUMENTS.find(ins => ins.type === n.instrument);
      blueprint += `[${inst?.name} | Pitch: ${n.pitch}]${idx < firstNotes.length - 1 ? ' + ' : ''}`;
    });
    blueprint += `\n`;
    
    for (let i = 1; i < ticksWithNotes.length; i++) {
      const currentTick: number = ticksWithNotes[i];
      const prevTick: number = ticksWithNotes[i-1];
      const diff: number = currentTick - prevTick;
      
      // Calculate repeaters
      let repeaters = "";
      let remainingTicks = diff;
      while (remainingTicks > 0) {
        const delay = Math.min(remainingTicks, 4);
        repeaters += `[Repeater:${delay}] `;
        remainingTicks -= delay;
      }
      
      const notes = tickGroups[currentTick];
      blueprint += `TICK ${currentTick}: ${repeaters}-> `;
      notes.forEach((n, idx) => {
        const inst = INSTRUMENTS.find(ins => ins.type === n.instrument);
        blueprint += `[${inst?.name} | Pitch: ${n.pitch}]${idx < notes.length - 1 ? ' + ' : ''}`;
      });
      blueprint += `\n`;
    }

    blueprint += `\n==========================================\n`;
    blueprint += `PRO TIP: Place the block mentioned in the instrument name (e.g., Gold Block for Bell) UNDER the note block to get the correct sound in-game.`;

    return blueprint;
  };

  const clearSong = () => {
    setSong(DEFAULT_SONG);
    currentTickRef.current = 0;
    if (cursorRef.current) cursorRef.current.style.left = '0px';
    if (tickDisplayRef.current) tickDisplayRef.current.textContent = '0';
    setShowClearDialog(false);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      }
      if (e.code === 'Escape') {
        stopPlayback();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, song.tempo, togglePlay, stopPlayback]);

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-[#1a1a1a] text-white font-sans selection:bg-green-500/30">
        {/* Header */}
        <header className="border-b border-white/10 p-4 flex items-center justify-between bg-[#121212] sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <div className="bg-green-600 p-2 rounded-lg shadow-lg shadow-green-900/20">
              <Music className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">{song.name}</h1>
              <p className="text-xs text-white/40 uppercase tracking-widest font-medium">Minecraft Note Block Studio</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setShowClearDialog(true)} 
              className="text-white/60 hover:text-red-400 hover:bg-red-400/10"
            >
              <Trash2 className="w-5 h-5" />
            </Button>
            <div className="w-px h-6 bg-white/10 mx-1" />
            <Button variant="ghost" size="icon" onClick={() => {}} className="text-white/60 hover:text-white hover:bg-white/5">
              <Save className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => {}} className="text-white/60 hover:text-white hover:bg-white/5">
              <Download className="w-5 h-5" />
            </Button>
            <Dialog>
              <DialogTrigger render={<Button variant="ghost" size="icon" className="text-white/60 hover:text-white hover:bg-white/5" />}>
                <Settings className="w-5 h-5" />
              </DialogTrigger>
              <DialogContent className="bg-[#1a1a1a] border-white/10 text-white">
                <DialogHeader>
                  <DialogTitle>Song Settings</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">Name</Label>
                    <Input id="name" value={song.name} onChange={e => setSong({...song, name: e.target.value})} className="col-span-3 bg-white/5 border-white/10" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="tempo" className="text-right">Tempo (TPS)</Label>
                    <Select value={song.tempo.toString()} onValueChange={v => setSong({...song, tempo: parseFloat(v)})}>
                      <SelectTrigger className="col-span-3 bg-white/5 border-white/10">
                        <SelectValue placeholder="Select tempo" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                        {TICKS_PER_SECOND_OPTIONS.map(t => (
                          <SelectItem key={t} value={t.toString()}>{t} Ticks/sec</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        <main className="flex h-[calc(100vh-73px)]">
          {/* Left Sidebar - Instruments & Layers */}
          <aside className="w-72 border-r border-white/10 bg-[#121212] flex flex-col">
            <div className="p-4 border-b border-white/10">
              <h2 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">Instruments</h2>
              <div className="grid grid-cols-1 gap-1">
                {INSTRUMENTS.map(inst => (
                  <button
                    key={inst.type}
                    onClick={() => setSelectedInstrument(inst.type)}
                    className={cn(
                      "flex items-center gap-3 p-2 rounded-md transition-all text-sm group",
                      selectedInstrument === inst.type ? "bg-white/10 text-white" : "text-white/50 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: inst.color }} />
                    <span className="flex-1 text-left">{inst.name}</span>
                    <span className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity text-white/30">{inst.block}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 flex flex-col min-h-0">
              <div className="p-4 flex items-center justify-between border-b border-white/10">
                <h2 className="text-xs font-bold text-white/40 uppercase tracking-widest">Layers</h2>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 text-white/40 hover:text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    addLayer();
                  }}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-2 space-y-1">
                  {song.layers.map(layer => (
                    <div
                      key={layer.id}
                      onClick={() => setSelectedLayer(layer.id)}
                      className={cn(
                        "p-3 rounded-lg border transition-all cursor-pointer",
                        selectedLayer === layer.id 
                          ? "bg-green-600/10 border-green-500/30 text-white" 
                          : "bg-white/5 border-transparent text-white/60 hover:border-white/10"
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{layer.name}</span>
                        <div className="flex items-center gap-1">
                          <button 
                            className={cn("p-1 hover:text-white transition-colors", layer.muted ? "text-red-400" : "text-white/40")}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleMuteLayer(layer.id);
                            }}
                          >
                            {layer.muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                      <Slider 
                        value={[layer.volume]} 
                        max={100} 
                        step={1} 
                        className="h-1" 
                        onValueChange={(vals) => {
                          const v = Array.isArray(vals) ? vals[0] : vals;
                          setSong({
                            ...song,
                            layers: song.layers.map(l => l.id === layer.id ? { ...l, volume: v } : l)
                          });
                        }}
                      />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </aside>

          {/* Editor Area */}
          <div className="flex-1 flex flex-col bg-[#1a1a1a] relative overflow-hidden">
            {/* Playback Controls Overlay */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 p-2 bg-[#121212]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={stopPlayback}
                className="h-12 w-12 rounded-xl text-white/60 hover:text-white hover:bg-white/5"
              >
                <Square className="w-5 h-5 fill-current" />
              </Button>
              <Button 
                onClick={togglePlay}
                className={cn(
                  "h-14 w-14 rounded-xl shadow-lg transition-all",
                  isPlaying ? "bg-red-500 hover:bg-red-600 text-white" : "bg-green-600 hover:bg-green-700 text-white"
                )}
              >
                {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
              </Button>
              <div className="w-px h-8 bg-white/10 mx-2" />
              <div className="px-4 flex flex-col items-center">
                <span className="text-[10px] font-bold text-white/30 uppercase tracking-tighter">Tick</span>
                <span ref={tickDisplayRef} className="text-xl font-mono font-bold tabular-nums">0</span>
              </div>
              <div className="w-px h-8 bg-white/10 mx-2" />
              <Button 
                onClick={() => setShowBlueprint(true)}
                className="bg-white/5 hover:bg-white/10 text-white border border-white/10 h-12 px-6 rounded-xl gap-2"
              >
                <Box className="w-4 h-4" />
                Generate Blueprint
              </Button>
            </div>

            {/* Grid Editor */}
            <div className="flex-1 overflow-hidden flex flex-col relative bg-[#1a1a1a]">
              <ScrollArea className="h-full w-full" viewportRef={scrollContainerRef}>
                <div className="relative" style={{ width: 1000 * GRID_SIZE, height: (MAX_PITCH - MIN_PITCH + 1) * 40 }}>
                  {/* Timeline Header (Sticky Top) */}
                  <div className="flex sticky top-0 z-30 bg-[#121212] border-b border-white/10">
                    <div className="w-16 flex-shrink-0 border-r border-white/10 flex items-center justify-center text-[10px] font-bold text-white/30 uppercase sticky left-0 z-40 bg-[#121212]">
                      Pitch
                    </div>
                    <div className="flex relative h-10">
                      {/* Spacer to maintain width */}
                      <div style={{ width: 1000 * GRID_SIZE }} className="absolute inset-0 pointer-events-none" />
                      
                      {/* Visible Ticks */}
                      <div className="flex absolute top-0" style={{ left: visibleRange.start * GRID_SIZE }}>
                        {Array.from({ length: visibleRange.end - visibleRange.start }).map((_, i) => {
                          const tick = visibleRange.start + i;
                          return (
                            <div 
                              key={tick} 
                              className={cn(
                                "flex-shrink-0 flex items-center justify-center text-[10px] font-mono border-r border-white/5 h-10",
                                tick % 4 === 0 ? "text-white/60 bg-white/5" : "text-white/20"
                              )}
                              style={{ width: GRID_SIZE }}
                            >
                              {tick}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Grid Body */}
                  <div className="flex">
                    {/* Pitch Labels (Sticky Left) */}
                    <div className="w-16 flex-shrink-0 border-r border-white/10 bg-[#121212] sticky left-0 z-20">
                      {Array.from({ length: MAX_PITCH - MIN_PITCH + 1 }).map((_, i) => {
                        const pitch = MAX_PITCH - i;
                        return (
                          <div 
                            key={pitch} 
                            className="h-10 flex items-center justify-center text-[10px] font-bold border-b border-white/5 bg-[#121212]"
                          >
                            {pitch}
                          </div>
                        );
                      })}
                    </div>

                    {/* Note Grid */}
                    <div className="relative flex-1">
                      {/* Grid Lines Background */}
                      <div 
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          backgroundImage: `
                            linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)
                          `,
                          backgroundSize: `${GRID_SIZE}px 40px`,
                          width: 1000 * GRID_SIZE
                        }}
                      />

                      {/* Playback Cursor */}
                      <div 
                        ref={cursorRef}
                        className="absolute top-0 bottom-0 w-1 bg-green-500 z-10 shadow-[0_0_15px_rgba(34,197,94,0.5)] transition-[left]"
                        style={{ left: 0, transitionDuration: '0ms' }}
                      />

                      {/* Interactive Grid Cells */}
                      <div className="relative">
                        {Array.from({ length: MAX_PITCH - MIN_PITCH + 1 }).map((_, i) => {
                          const pitch = MAX_PITCH - i;
                          return (
                            <div key={pitch} className="flex h-10 relative">
                                {/* Spacer to maintain width */}
                                <div style={{ width: 1000 * GRID_SIZE }} className="flex-shrink-0 h-full pointer-events-none" />
                                
                                {/* Visible Cells */}
                                <div className="flex absolute top-0" style={{ left: visibleRange.start * GRID_SIZE }}>
                                  {Array.from({ length: visibleRange.end - visibleRange.start }).map((_, j) => {
                                    const tick = visibleRange.start + j;
                                    const notes = getNotesAt(tick, pitch);
                                    
                                    return (
                                      <GridCell
                                        key={tick}
                                        tick={tick}
                                        pitch={pitch}
                                        notes={notes}
                                        selectedLayer={selectedLayer}
                                        onAddNote={addNote}
                                      />
                                    );
                                  })}
                                </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
                <ScrollBar orientation="horizontal" />
                <ScrollBar orientation="vertical" />
              </ScrollArea>
            </div>
          </div>
        </main>

        {/* Blueprint Dialog */}
        <Dialog open={showBlueprint} onOpenChange={setShowBlueprint}>
          <DialogContent className="bg-[#1a1a1a] border-white/10 text-white max-w-2xl max-h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Box className="w-5 h-5 text-green-500" />
                Minecraft Build Blueprint
              </DialogTitle>
            </DialogHeader>
            <ScrollArea className="flex-1 mt-4 rounded-lg bg-black/40 p-4 font-mono text-sm border border-white/5">
              <pre className="whitespace-pre-wrap text-green-400/90">
                {generateBlueprint()}
              </pre>
            </ScrollArea>
            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={() => setShowBlueprint(false)} className="border-white/10 hover:bg-white/5">
                Close
              </Button>
              <Button className="bg-green-600 hover:bg-green-700">
                <Download className="w-4 h-4 mr-2" />
                Export as Text
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* Clear Song Dialog */}
        <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
          <DialogContent className="bg-[#1a1a1a] border-white/10 text-white">
            <DialogHeader>
              <DialogTitle>Clear Song?</DialogTitle>
            </DialogHeader>
            <p className="text-white/60 text-sm">This will permanently delete all notes in your current song. This action cannot be undone.</p>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setShowClearDialog(false)} className="border-white/10 hover:bg-white/5">
                Cancel
              </Button>
              <Button onClick={clearSong} className="bg-red-500 hover:bg-red-600">
                Clear Everything
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
