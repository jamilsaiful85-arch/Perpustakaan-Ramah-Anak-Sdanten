import React, { useState, useRef, useEffect } from 'react';
import { Music, Volume2, VolumeX, Play, Pause, ExternalLink, Sparkles, Disc3, Minimize2, Maximize2 } from 'lucide-react';

interface SoundtrackPlayerProps {
  videoId?: string;
  title?: string;
  autoPlayPrompt?: boolean;
}

export default function SoundtrackPlayer({
  videoId = "NhEjXGVmYuc",
  title = "Soundtrack & Mars Perpustakaan Ramah Anak SDN 1 Srimenganten"
}: SoundtrackPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const youtubeEmbedUrl = `https://www.youtube.com/embed/${videoId}?enablejsapi=1&autoplay=${isPlaying ? 1 : 0}&mute=${isMuted ? 1 : 0}&loop=1&playlist=${videoId}&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`;

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div className={`fixed bottom-4 right-4 z-40 transition-all duration-300 ${isMinimized ? 'w-auto' : 'w-80 sm:w-96'} no-print`}>
      <div className="bg-slate-900/95 backdrop-blur-md border-2 border-amber-400/40 rounded-3xl p-3.5 shadow-2xl text-white">
        
        {/* Minimized Pill */}
        {isMinimized ? (
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsMinimized(false)}
              className="flex items-center gap-2 p-1.5 px-3 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-2xl text-xs font-black shadow-lg cursor-pointer transition-transform hover:scale-105"
            >
              <Disc3 className={`w-4 h-4 ${isPlaying ? 'animate-spin text-indigo-950' : ''}`} />
              <span>🎵 Soundtrack Musik</span>
            </button>
            <button
              onClick={togglePlay}
              className={`p-2 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                isPlaying ? 'bg-rose-600 hover:bg-rose-500 text-white' : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
              title={isPlaying ? 'Jeda Lagu' : 'Putar Lagu'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Header Controls */}
            <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-400 flex items-center justify-center text-slate-950 font-bold shrink-0 shadow-inner">
                  <Music className={`w-4 h-4 ${isPlaying ? 'animate-bounce' : ''}`} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 text-[9px] font-black tracking-wider uppercase">
                      YouTube Soundtrack
                    </span>
                    {isPlaying && (
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                    )}
                  </div>
                  <h4 className="text-[11px] font-bold text-slate-200 truncate" title={title}>
                    {title}
                  </h4>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                  title={isExpanded ? 'Sembunyikan Klip' : 'Tampilkan Klip Video'}
                >
                  {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => setIsMinimized(true)}
                  className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                  title="Kecilkan Pemutar"
                >
                  <Minimize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Video Iframe (Expanded View) */}
            {isExpanded && (
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-slate-800">
                <iframe
                  ref={iframeRef}
                  src={youtubeEmbedUrl}
                  title="YouTube Soundtrack Player"
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}

            {/* Hidden Iframe when collapsed to keep playing audio */}
            {!isExpanded && isPlaying && (
              <div className="hidden">
                <iframe
                  src={youtubeEmbedUrl}
                  title="YouTube Audio Player"
                  allow="autoplay"
                />
              </div>
            )}

            {/* Bottom Bar: Player Buttons & Equalizer */}
            <div className="flex items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={togglePlay}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-md transition-all ${
                    isPlaying 
                      ? 'bg-rose-500 hover:bg-rose-600 text-white' 
                      : 'bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 text-slate-950'
                  }`}
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5 fill-current" />
                      <span>Jeda Suara</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Putar Musik 🎵</span>
                    </>
                  )}
                </button>

                <button
                  onClick={toggleMute}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors cursor-pointer"
                  title={isMuted ? 'Bunyikan' : 'Bisukan'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                </button>
              </div>

              {/* Audio Wave Visualizer Simulation */}
              <div className="flex items-end gap-1 h-5 px-2">
                <span className={`w-1 bg-amber-400 rounded-full transition-all duration-300 ${isPlaying ? 'h-5 animate-pulse' : 'h-1.5 opacity-40'}`}></span>
                <span className={`w-1 bg-orange-400 rounded-full transition-all duration-200 ${isPlaying ? 'h-3 animate-pulse delay-75' : 'h-1.5 opacity-40'}`}></span>
                <span className={`w-1 bg-emerald-400 rounded-full transition-all duration-300 ${isPlaying ? 'h-4 animate-pulse delay-150' : 'h-1.5 opacity-40'}`}></span>
                <span className={`w-1 bg-blue-400 rounded-full transition-all duration-200 ${isPlaying ? 'h-2 animate-pulse delay-100' : 'h-1.5 opacity-40'}`}></span>
              </div>

              <a
                href={`https://youtu.be/${videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-slate-400 hover:text-amber-300 flex items-center gap-1 font-bold transition-colors"
                title="Buka di YouTube"
              >
                <span>YouTube</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
