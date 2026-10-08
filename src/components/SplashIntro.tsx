import React, { useState } from 'react';
import { BookOpen, Sparkles, Shield, User, HelpCircle, Volume2, VolumeX, ArrowRight, Star, Heart, Compass, Smile } from 'lucide-react';
import { motion } from 'motion/react';
import { SchoolLogo, LibraryLogo } from './Logos';

export type UserRoleType = 'admin' | 'petugas' | 'kepsek' | 'pengunjung';

interface SplashIntroProps {
  onEnter: (role: UserRoleType) => void;
  schoolName: string;
  currentUser?: {
    displayName?: string | null;
    email?: string | null;
    photoURL?: string | null;
  } | null;
  onLogout?: () => void;
  onRequestLogin?: () => void;
}

// Resilient synthesizer playing a cute, short happy pentatonic arpeggio for elementary school vibes!
let audioCtx: AudioContext | null = null;
export function playHappyTune() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25]; // C, E, G, C, E
    notes.forEach((freq, index) => {
      const osc = audioCtx!.createOscillator();
      const gain = audioCtx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx!.currentTime + index * 0.12);
      
      gain.gain.setValueAtTime(0.15, audioCtx!.currentTime + index * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx!.currentTime + index * 0.12 + 0.4);
      
      osc.connect(gain);
      gain.connect(audioCtx!.destination);
      osc.start(audioCtx!.currentTime + index * 0.12);
      osc.stop(audioCtx!.currentTime + index * 0.12 + 0.5);
    });
  } catch (e) {
    console.log("Audio play blocked/failed:", e);
  }
}

export default function SplashIntro({ 
  onEnter, 
  schoolName, 
  currentUser, 
  onLogout, 
  onRequestLogin 
}: SplashIntroProps) {
  const [showGuide, setShowGuide] = useState(false);
  const [isPlayingTheme, setIsPlayingTheme] = useState(false);
  const [synthInterval, setSynthInterval] = useState<any>(null);

  const toggleThemeSong = () => {
    if (isPlayingTheme) {
      if (synthInterval) clearInterval(synthInterval);
      setIsPlayingTheme(false);
    } else {
      setIsPlayingTheme(true);
      playHappyTune();
      const interval = setInterval(() => {
        playHappyTune();
      }, 4000);
      setSynthInterval(interval);
    }
  };

  React.useEffect(() => {
    return () => {
      if (synthInterval) clearInterval(synthInterval);
    };
  }, [synthInterval]);

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-100 via-amber-50 to-emerald-100 flex flex-col items-center justify-center p-4 relative font-sans overflow-hidden">
      
      {/* Decorative Floating Balloons/Bubbles for children aesthetic */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" />
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-gold rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" />
      <div className="absolute top-1/3 right-1/4 w-36 h-36 bg-emerald-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" />

      {/* Music and Help controls header */}
      <div className="absolute top-4 right-4 flex items-center gap-3 z-20">
        <button
          onClick={toggleThemeSong}
          id="btn-music"
          className="p-3 bg-white/85 hover:bg-white text-primary rounded-full shadow-md hover:scale-105 transition-all flex items-center gap-2 text-sm font-medium border border-blue-200 cursor-pointer"
        >
          {isPlayingTheme ? <Volume2 className="w-5 h-5 text-emerald-500 animate-bounce" /> : <VolumeX className="w-5 h-5 text-gray-400" />}
          <span className="hidden sm:inline text-xs text-slate-700">Nada Ceria SI-MPUS</span>
        </button>

        <button 
          onClick={() => setShowGuide(true)}
          id="btn-guide-open"
          className="p-3 bg-white/85 hover:bg-white text-slate-700 rounded-full shadow-md hover:scale-105 transition-all text-sm font-medium border border-blue-200 cursor-pointer"
        >
          <HelpCircle className="w-5 h-5" />
        </button>
      </div>

      {/* Main Container */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-5xl w-full text-center z-10 py-6"
      >
        {/* Logos & Kid Mascot Banner */}
        <div className="mb-4 flex items-center justify-center gap-4 md:gap-8">
          <motion.div initial={{ rotate: -8, scale: 0.9 }} animate={{ rotate: 0, scale: 1 }} transition={{ delay: 0.2 }} className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-md bg-white p-1 rounded-2xl border border-white/40">
            <SchoolLogo className="w-full h-full" />
          </motion.div>
          
          <div className="relative">
            <div className="absolute -top-3 -left-3 bg-amber-400 rounded-full p-1.5 text-white animate-bounce">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-linear-to-tr from-blue-500 to-indigo-600 rounded-3xl soft-shadow flex items-center justify-center border-3 border-white animate-frequent-bounce">
              <span className="text-4xl sm:text-5xl">🐱</span>
            </div>
            <div className="absolute -bottom-2 -right-2 bg-emerald-500 rounded-full px-2 py-0.5 text-white text-[8px] font-extrabold border-2 border-white uppercase tracking-wider">
              SI-MPUS
            </div>
          </div>

          <motion.div initial={{ rotate: 8, scale: 0.9 }} animate={{ rotate: 0, scale: 1 }} transition={{ delay: 0.2 }} className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-md bg-white p-1 rounded-2xl border border-white/40">
            <LibraryLogo className="w-full h-full" />
          </motion.div>
        </div>

        {/* Brand Header */}
        <span className="px-4 py-1 rounded-full bg-white/90 border border-blue-200 text-[11px] font-bold text-primary uppercase tracking-wider shadow-xs">
          {schoolName || "SD NEGERI 1 SRIMENGANTEN"}
        </span>
        
        <h1 className="text-2xl md:text-4xl font-extrabold text-slate-800 tracking-tight font-display mt-2 drop-shadow-xs">
          Perpustakaan <span className="text-blue-600">Digital</span> <span className="text-amber-500">Ramah Anak</span>
        </h1>
        
        <p className="text-slate-600 text-xs md:text-sm max-w-xl mx-auto mt-2 font-medium">
          Aplikasi perpustakaan profesional & ramah anak dengan Database Terpadu Real-Time untuk seluruh guru, siswa, dan pengunjung!
        </p>

        {/* Google User Status or Login Trigger */}
        <div className="mt-3 flex items-center justify-center">
          {currentUser ? (
            <div className="p-2 px-4 rounded-2xl bg-white/95 border border-emerald-300 shadow-sm inline-flex items-center gap-3">
              {currentUser.photoURL ? (
                <img src={currentUser.photoURL} alt="" className="w-8 h-8 rounded-full border border-emerald-400" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-black flex items-center justify-center text-xs">
                  {(currentUser.displayName || currentUser.email || 'G')[0].toUpperCase()}
                </div>
              )}
              <div className="text-left">
                <span className="text-[10px] text-emerald-800 font-extrabold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  Akun Google Terhubung (Sinkron Cloud):
                </span>
                <span className="text-xs font-black text-slate-800 block leading-tight">
                  {currentUser.displayName || 'Pengguna Google'}
                </span>
                <span className="text-[10px] text-slate-500 font-mono block leading-none">
                  {currentUser.email}
                </span>
              </div>
              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="ml-2 text-[10px] font-bold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-xl transition-colors cursor-pointer border border-rose-100"
                >
                  Keluar / Ganti Akun
                </button>
              )}
            </div>
          ) : onRequestLogin ? (
            <button
              type="button"
              onClick={onRequestLogin}
              className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-800 border-2 border-blue-300 hover:border-blue-500 rounded-2xl text-xs font-black shadow-md flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Masuk dengan Akun Google (Simpan Permanen)</span>
            </button>
          ) : null}
        </div>

        {/* Interactive Roles Card / Access selector */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto text-left">
          
          {/* 1. Pengunjung / Siswa */}
          <motion.div 
            whileHover={{ scale: 1.03 }}
            onClick={() => { playHappyTune(); onEnter('pengunjung'); }}
            className="glass-panel p-5 rounded-3xl border-2 border-emerald-200/80 bg-linear-to-b from-white/90 to-emerald-50/50 shadow-xl cursor-pointer hover:border-emerald-400 transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="bg-emerald-100 text-emerald-600 p-3 rounded-2xl group-hover:bg-emerald-500 group-hover:text-white transition-all">
                  <Smile className="w-6 h-6" />
                </div>
                <span className="text-[10px] bg-emerald-500 text-white font-extrabold px-2 py-0.5 rounded-full uppercase">
                  Bebas Masuk
                </span>
              </div>
              <div className="my-3">
                <h3 className="text-base font-extrabold text-slate-800 font-display">Pengunjung / Siswa</h3>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Jelajahi buku bacaan, cari literatur, isi buku kunjungan real-time, dan cek poin lencana membaca.
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 group-hover:translate-x-1 transition-all pt-2 border-t border-emerald-100">
              Mulai Eksplorasi <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </motion.div>

          {/* 2. Admin Role */}
          <motion.div 
            whileHover={{ scale: 1.03 }}
            onClick={() => { playHappyTune(); onEnter('admin'); }}
            className="glass-panel p-5 rounded-3xl border border-white/60 shadow-xl cursor-pointer hover:border-blue-400 transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="bg-blue-100 text-blue-600 p-3 rounded-2xl group-hover:bg-blue-500 group-hover:text-white transition-all w-max">
                <Shield className="w-6 h-6" />
              </div>
              <div className="my-3">
                <h3 className="text-base font-extrabold text-slate-800 font-display">Administrator</h3>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Kelola penuh master data katalog buku, data siswa, konfigurasi sekolah, dan keamanan sistem.
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-blue-600 flex items-center gap-1 group-hover:translate-x-1 transition-all pt-2 border-t border-slate-100">
              Buka Panel Admin <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </motion.div>

          {/* 3. Librarian / Petugas */}
          <motion.div 
            whileHover={{ scale: 1.03 }}
            onClick={() => { playHappyTune(); onEnter('petugas'); }}
            className="glass-panel p-5 rounded-3xl border border-white/60 shadow-xl cursor-pointer hover:border-amber-400 transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="bg-amber-100 text-amber-600 p-3 rounded-2xl group-hover:bg-amber-500 group-hover:text-white transition-all w-max">
                <User className="w-6 h-6" />
              </div>
              <div className="my-3">
                <h3 className="text-base font-extrabold text-slate-800 font-display">Petugas Layanan</h3>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Sirkulasi peminjaman cepat, konfirmasi pengembalian buku, hitung denda, dan verifikasi anggota.
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-amber-600 flex items-center gap-1 group-hover:translate-x-1 transition-all pt-2 border-t border-slate-100">
              Layanan Sirkulasi <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </motion.div>

          {/* 4. Principal Role */}
          <motion.div 
            whileHover={{ scale: 1.03 }}
            onClick={() => { playHappyTune(); onEnter('kepsek'); }}
            className="glass-panel p-5 rounded-3xl border border-white/60 shadow-xl cursor-pointer hover:border-indigo-400 transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="bg-indigo-100 text-indigo-600 p-3 rounded-2xl group-hover:bg-indigo-500 group-hover:text-white transition-all w-max">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="my-3">
                <h3 className="text-base font-extrabold text-slate-800 font-display">Kepala Sekolah</h3>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Pantau statistik minat baca, rekapitulasi pengunjung real-time, dan unduh laporan resmi GLS.
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-indigo-600 flex items-center gap-1 group-hover:translate-x-1 transition-all pt-2 border-t border-slate-100">
              Rekapitulasi GLS <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </motion.div>

        </div>

        {/* Footer info banner */}
        <div className="mt-8 bg-white/60 backdrop-blur-md max-w-md mx-auto py-2 px-4 rounded-full border border-white/40 text-[11px] text-slate-600 font-semibold flex items-center justify-center gap-2">
          <Star className="w-4 h-4 text-amber-500 animate-spin" />
          <span>SD Negeri 1 Srimenganten • Pulau Panggung, Kab. Tanggamus</span>
        </div>
      </motion.div>

      {/* Educational Guide Modal Popup */}
      {showGuide && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl overflow-y-auto max-h-[85vh] border border-blue-100 text-left"
          >
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="text-3xl">📘</span>
              <div>
                <h2 className="text-lg font-extrabold text-slate-800 font-display">Panduan Penggunaan Perpustakaan</h2>
                <p className="text-xs text-slate-400">SD Negeri 1 Srimenganten</p>
              </div>
            </div>

            <div className="mt-4 space-y-4 text-xs text-slate-600 font-medium">
              <div className="p-3 bg-blue-50/70 rounded-2xl border border-blue-100">
                <h4 className="font-bold text-blue-800 flex items-center gap-1.5 mb-1 text-xs">
                  <Star className="w-4 h-4 text-amber-500" /> DATABASE REAL-TIME TERPUSAT:
                </h4>
                <p className="text-[11px] text-blue-900 leading-relaxed">
                  Semua data tersimpan otomatis di Cloud Database Firestore. Setiap pembaruan yang dilakukan Petugas atau Pengunjung akan langsung tersinkronisasi di semua gawai (komputer, tablet, HP) secara serentak.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2">💡 Hak Akses Pengguna:</h4>
                <ul className="list-decimal list-inside space-y-2 text-[11px]">
                  <li><strong>Pengunjung & Siswa:</strong> Dapat melihat koleksi buku, mencari buku cerita anak, mengisi buku tamu kunjungan real-time, dan mencetak kartu anggota digital.</li>
                  <li><strong>Petugas & Administrator:</strong> Dilindungi kode PIN pengamanan untuk memproses sirkulasi peminjaman, pengembalian, edit katalog buku, dan pengaturan sekolah.</li>
                  <li><strong>Kepala Sekolah:</strong> Dapat meninjau grafik analitik, evaluasi keterbacaan siswa, dan mencetak rekapitulasi bertandatangan resmi.</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowGuide(false)}
                id="btn-guide-close"
                className="px-5 py-2.5 bg-primary hover:bg-blue-700 text-white rounded-2xl text-xs font-bold shadow-md transition-all cursor-pointer"
              >
                Saya Mengerti & Siap Gunakan
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
