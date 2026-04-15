/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from "react";
import { updatePageCode, PageVersion } from "./services/geminiService";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { 
  Send, 
  RotateCcw, 
  History, 
  Sparkles, 
  Code, 
  Eye, 
  ChevronLeft, 
  ChevronRight,
  Maximize,
  Minimize,
  ShieldAlert,
  Info,
  Cpu,
  Zap,
  Brain
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const INITIAL_CODE = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://unpkg.com/@tailwindcss/browser@4"></script>
    <style>
        body { font-family: sans-serif; }
    </style>
</head>
<body class="bg-gray-50 min-h-screen flex items-center justify-center p-8">
    <div class="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center space-y-6">
        <div class="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
            <svg class="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
            </svg>
        </div>
        <h1 class="text-3xl font-bold text-gray-900">Welcome to Your Live Page</h1>
        <p class="text-gray-600">This is a starting point. Tell the AI what you want to change, and it will update this page live!</p>
        <div class="pt-4">
            <button class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Explore Features
            </button>
        </div>
    </div>
</body>
</html>`;

export default function App() {
  const [history, setHistory] = useState<PageVersion[]>([
    { id: "initial", timestamp: Date.now(), code: INITIAL_CODE, prompt: "Initial Version", explanation: "Starting point for your architected page." }
  ]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prompt, setPrompt] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gemini-flash");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const currentVersion = history[currentIndex];

  useEffect(() => {
    if (iframeRef.current && currentVersion) {
      const iframe = iframeRef.current;
      iframe.srcdoc = currentVersion.code;
    }
  }, [currentVersion]);

  const handleUpdate = async () => {
    if (!prompt.trim() || isUpdating) return;

    setIsUpdating(true);
    const toastId = toast.loading("Architecting your changes...");

    try {
      const result = await updatePageCode(currentVersion.code, prompt, selectedModel);

      if (!result.safetyCheck) {
        toast.error("Safety Policy Violation", {
          description: result.explanation,
          id: toastId
        });
        setIsUpdating(false);
        return;
      }

      const newVersion: PageVersion = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        code: result.code,
        prompt: prompt,
        explanation: result.explanation
      };

      const newHistory = [...history.slice(0, currentIndex + 1), newVersion];
      setHistory(newHistory);
      setCurrentIndex(newHistory.length - 1);
      setPrompt("");
      toast.success("Page Updated!", {
        description: result.explanation,
        id: toastId
      });
    } catch (error) {
      toast.error("Update Failed", {
        description: "Something went wrong while updating the page.",
        id: toastId
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const revertTo = (index: number) => {
    setCurrentIndex(index);
    toast.info(`Reverted to: ${history[index].prompt}`);
  };

  return (
    <TooltipProvider>
      <div className="flex flex-col h-screen bg-zinc-950 text-zinc-100 font-sans overflow-hidden">
        {/* Header */}
        {!isFullscreen && (
          <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-6 bg-zinc-900/50 backdrop-blur-md z-10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h1 className="font-bold text-lg tracking-tight">Live Page Architect</h1>
              <Badge variant="outline" className="ml-2 border-zinc-700 text-zinc-400 font-mono text-[10px] uppercase tracking-widest">
                v1.0.0
              </Badge>
            </div>

            <div className="flex items-center gap-4">
              {/* Model Selector */}
              <div className="flex items-center gap-1 bg-zinc-800/50 rounded-lg p-1 border border-zinc-700">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "h-8 px-3 text-xs gap-2",
                        selectedModel === "gemini-flash" ? "bg-indigo-600 text-white hover:bg-indigo-500" : "text-zinc-400 hover:text-zinc-200"
                      )}
                      onClick={() => setSelectedModel("gemini-flash")}
                    >
                      <Zap className="w-3.5 h-3.5" />
                      Flash
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Gemini 2.0 Flash (Fast & Capable)</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "h-8 px-3 text-xs gap-2",
                        selectedModel === "gemini-lite" ? "bg-indigo-600 text-white hover:bg-indigo-500" : "text-zinc-400 hover:text-zinc-200"
                      )}
                      onClick={() => setSelectedModel("gemini-lite")}
                    >
                      <Cpu className="w-3.5 h-3.5" />
                      Lite
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Gemini 2.0 Flash Lite (Ultra Fast)</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "h-8 px-3 text-xs gap-2",
                        selectedModel === "gemma" ? "bg-indigo-600 text-white hover:bg-indigo-500" : "text-zinc-400 hover:text-zinc-200"
                      )}
                      onClick={() => setSelectedModel("gemma")}
                    >
                      <Brain className="w-3.5 h-3.5" />
                      Gemma
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Gemma 2 27B (Open Weights)</TooltipContent>
                </Tooltip>
              </div>

              <Separator orientation="vertical" className="h-6 bg-zinc-800 mx-1" />

              <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger 
                  onClick={() => setIsFullscreen(true)}
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "icon" }),
                    "text-zinc-400 hover:text-white"
                  )}
                >
                  <Maximize className="w-5 h-5" />
                </TooltipTrigger>
                <TooltipContent>Full Screen</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger 
                  onClick={() => setShowHistory(!showHistory)}
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "icon" }),
                    showHistory ? "bg-zinc-800 text-indigo-400" : "text-zinc-400"
                  )}
                >
                  <History className="w-5 h-5" />
                </TooltipTrigger>
                <TooltipContent>Version History</TooltipContent>
              </Tooltip>
              
              <Separator orientation="vertical" className="h-6 bg-zinc-800 mx-2" />
              
              <div className="flex items-center gap-1 bg-zinc-800/50 rounded-full px-3 py-1 border border-zinc-700">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 text-zinc-400 hover:text-white disabled:opacity-30"
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex(currentIndex - 1)}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-xs font-mono text-zinc-500 min-w-[3rem] text-center">
                  {currentIndex + 1} / {history.length}
                </span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 text-zinc-400 hover:text-white disabled:opacity-30"
                  disabled={currentIndex === history.length - 1}
                  onClick={() => setCurrentIndex(currentIndex + 1)}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>
        )}

        <main className="flex-1 flex overflow-hidden relative">
          {/* Main Preview Area */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex-1 bg-white relative">
              <iframe 
                ref={iframeRef}
                className="w-full h-full border-none"
                title="Page Preview"
                sandbox="allow-scripts allow-forms allow-modals allow-popups"
              />

              {isFullscreen && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsFullscreen(false)}
                  className="absolute top-4 right-4 z-30 bg-zinc-900/80 backdrop-blur-md border border-zinc-700 hover:bg-zinc-800 text-zinc-100 shadow-xl"
                >
                  <Minimize className="w-4 h-4 mr-2" />
                  Exit Full Screen
                </Button>
              )}
              
              {isUpdating && (
                <div className="absolute inset-0 bg-zinc-950/40 backdrop-blur-[2px] flex items-center justify-center z-20">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-2xl flex flex-col items-center gap-4"
                  >
                    <div className="relative">
                      <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                      <Sparkles className="w-5 h-5 text-indigo-400 absolute inset-0 m-auto animate-pulse" />
                    </div>
                    <div className="text-center">
                      <p className="font-medium">Architecting...</p>
                      <p className="text-xs text-zinc-500 mt-1">
                        {selectedModel === "gemma" 
                          ? "Using Gemma model - this might take a moment..." 
                          : "Applying your vision to the page"}
                      </p>
                    </div>
                  </motion.div>
                </div>
              )}
            </div>

            {/* Input Area */}
            {!isFullscreen && (
              <div className="p-6 bg-zinc-900/80 border-t border-zinc-800 backdrop-blur-xl">
                <div className="max-w-4xl mx-auto relative">
                  <div className="flex gap-3 items-end">
                    <div className="flex-1 relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-indigo-400 transition-colors">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <Input 
                        placeholder="Request a change... (e.g., 'Make the header dark with a neon glow')"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleUpdate()}
                        className="pl-12 pr-4 h-14 bg-zinc-950 border-zinc-800 focus:border-indigo-500/50 focus:ring-indigo-500/20 rounded-xl text-base shadow-inner"
                      />
                    </div>
                    <Button 
                      onClick={handleUpdate}
                      disabled={!prompt.trim() || isUpdating}
                      className="h-14 px-8 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
                    >
                      <Send className="w-5 h-5 mr-2" />
                      Update
                    </Button>
                  </div>
                  
                  <div className="mt-3 flex items-center justify-between px-2">
                    <div className="flex items-center gap-4">
                      <Tooltip>
                        <TooltipTrigger className="flex items-center gap-1.5 text-[10px] text-zinc-500 uppercase tracking-wider font-semibold cursor-help bg-transparent border-none p-0 outline-none">
                          <ShieldAlert className="w-3 h-3 text-amber-500" />
                          <span>Strict Safety Mode Active</span>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs bg-zinc-900 border-zinc-800 text-zinc-300">
                          <p>Our AI model filters for harmful, offensive, or illegal content. Requests violating these policies will be rejected.</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger className="flex items-center gap-1.5 text-[10px] text-zinc-500 uppercase tracking-wider font-semibold cursor-help bg-transparent border-none p-0 outline-none">
                          <Info className="w-3 h-3 text-blue-500" />
                          <span>Token Optimized</span>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs bg-zinc-900 border-zinc-800 text-zinc-300">
                          <p>Requests are optimized to minimize token usage while maintaining high quality output.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <p className="text-[10px] text-zinc-600 italic">
                      AI updates HTML, CSS, and JS live
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar History */}
          <AnimatePresence>
            {showHistory && (
              <motion.aside 
                initial={{ x: 400 }}
                animate={{ x: 0 }}
                exit={{ x: 400 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="w-80 border-l border-zinc-800 bg-zinc-900/95 backdrop-blur-md flex flex-col"
              >
                <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                  <h2 className="font-semibold flex items-center gap-2">
                    <History className="w-4 h-4 text-indigo-400" />
                    Version History
                  </h2>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowHistory(false)}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
                <ScrollArea className="flex-1">
                  <div className="p-4 space-y-3">
                    {history.map((version, index) => (
                      <Card 
                        key={version.id}
                        onClick={() => revertTo(index)}
                        className={`p-3 cursor-pointer transition-all border-zinc-800 hover:border-zinc-700 bg-zinc-950/50 ${
                          currentIndex === index ? "ring-2 ring-indigo-500/50 border-indigo-500/50" : ""
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <Badge variant="secondary" className="text-[10px] bg-zinc-800 text-zinc-400">
                            v{index + 1}
                          </Badge>
                          <span className="text-[10px] text-zinc-500 font-mono">
                            {new Date(version.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-sm text-zinc-300 line-clamp-2 italic">
                          "{version.prompt}"
                        </p>
                        
                        <div className="mt-3 p-2 bg-zinc-900/50 rounded border border-zinc-800/50">
                          <p className="text-[10px] text-zinc-400 leading-relaxed">
                            {version.explanation}
                          </p>
                        </div>

                        {currentIndex === index && (
                          <div className="mt-2 flex items-center gap-1 text-[10px] text-indigo-400 font-bold uppercase tracking-tighter">
                            <Eye className="w-3 h-3" />
                            Current View
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
                <div className="p-4 border-t border-zinc-800">
                  <Button 
                    variant="outline" 
                    className="w-full border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                    onClick={() => {
                      setHistory([history[0]]);
                      setCurrentIndex(0);
                      toast.success("History Cleared");
                    }}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset to Initial
                  </Button>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>
        </main>
        <Toaster theme="dark" position="bottom-right" />
      </div>
    </TooltipProvider>
  );
}
