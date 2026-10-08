import React, { useState } from 'react';
import { 
  Sparkles, 
  BookOpen, 
  Users, 
  Camera, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight, 
  RefreshCw, 
  Volume2, 
  VolumeX, 
  Heart, 
  Clock, 
  Star,
  Layers,
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { SchoolLogo, LibraryLogo } from './Logos';
import { auth, googleProvider, signInWithPopup } from '../lib/firebase';
import { playHappyTune, UserRoleType } from './SplashIntro';
import { ActivityLogItem } from '../lib/firestoreService';

interface GoogleLoginPageProps {
  onLoginSuccess: (role: UserRoleType) => void;
  onContinueAsGuest: (role: UserRoleType) => void;
  recentActivities: ActivityLogItem[];
  schoolName: string;
  totalBooks: number;
  totalVisitors: number;
  totalPhotos: number;
}

export default function GoogleLoginPage({
  onLoginSuccess,
  onContinueAsGuest,
  recentActivities,
  schoolName,
  totalBooks,
  totalVisitors,
  totalPhotos
}: GoogleLoginPageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [musicInterval, setMusicInterval] = useState<any>(null);

  const toggleMusic = () => {
    if (isPlayingMusic) {
      if (musicInterval) clearInterval(musicInterval);
      setIsPlayingMusic(false);
    } else {
      setIsPlayingMusic(true);
      playHappyTune();
      const interval = setInterval(() => {
        playHappyTune();
      }, 4500);
      setMusicInterval(interval);
    }
  };

  React.useEffect(() => {
    return () => {
      if (musicInterval) clearInterval(musicInterval);
    };
  }, [musicInterval]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      playHappyTune();
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Check if master admin
      const isMasterAdmin = user.email?.toLowerCase() === 'jamilsaiful85@gmail.com';
      const role: UserRoleType = isMasterAdmin ? 'admin' : 'pengunjung';
      
      onLoginSuccess(role);
    } catch (err: any) {
      console.error("Google sign in error:", err);
      if (err.code === 'auth/popup-closed-by-user') {
        setErrorMessage("Jendela login Google ditutup sebelum selesai. Silakan klik tombol masuk kembali.");
      } else if (err.code === 'auth/cancelled-popup-request') {
        setErrorMessage("Permintaan login sedang diproses, silakan coba beberapa saat lagi.");
      } else {
        setErrorMessage("Gagal masuk dengan Google: " + (err.message || "Pastikan koneksi internet stabil."));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-100 via-amber-50 to-emerald-100 flex flex-col items-center justify-center p-4 relative font-sans overflow-hidden">
      
      {/* Decorative Floating Blobs */}
      <div className="absolute top-10 left-10 w-40 h-40 bg-blue-300 rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-pulse pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-52 h-52 bg-amber-300 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-pulse pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-44 h-44 bg-emerald-300 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-pulse pointer-events-none" />

      {/* Top action buttons */}
      <div className="absolute top-4 right-4 flex items-center gap-2.5 z-20">
        <button
          onClick={toggleMusic}
          className="px-3 py-2 bg-white/90 hover:bg-white text-primary rounded-full shadow-md hover:scale-105 transition-all flex items-center gap-2 text-xs font-bold border border-blue-200 cursor-pointer"
          title="Putar Nada Ceria Perpustakaan"
        >
          {isPlayingMusic ? <Volume2 className="w-4 h-4 text-emerald-500 animate-bounce" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          <span className="hidden sm:inline text-slate-700">Nada Ceria</span>
        </button>

        <button 
          onClick={() => setShowGuideModal(true)}
          className="p-2 bg-white/90 hover:bg-white text-slate-700 rounded-full shadow-md hover:scale-105 transition-all text-xs font-bold border border-blue-200 cursor-pointer"
          title="Panduan Akses & Sinkronisasi"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>

      {/* Main Login Card */}
      <motion.div 
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl w-full z-10 py-4"
      >
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border-2 border-white/80 p-6 sm:p-10 relative overflow-hidden">
          
          {/* Top Decorative accent bar */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-linear-to-r from-blue-500 via-amber-400 to-emerald-500" />

          {/* School & Library Logo Header */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-100 pb-6 mb-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-md bg-white p-1 rounded-2xl border border-blue-100 shrink-0">
                <SchoolLogo className="w-full h-full" />
              </div>
              <div className="text-left">
                <span className="px-3 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-extrabold uppercase tracking-wider">
                  Sistem Informasi Perpustakaan Digital
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight font-display mt-0.5">
                  {schoolName || "SD NEGERI 1 SRIMENGANTEN"}
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  Kecamatan Pulau Panggung, Kabupaten Tanggamus, Lampung
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-14 h-14 sm:w-16 sm:h-16 drop-shadow-md bg-white p-1 rounded-2xl border border-blue-100 shrink-0">
                <LibraryLogo className="w-full h-full" />
              </div>
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-linear-to-tr from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center text-3xl shadow-md border border-white">
                🐱
              </div>
            </div>
          </div>

          {/* Grid Layout: Left Login CTA, Right Real-time Stats & Sync History */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Login with Google Call to Action */}
            <div className="lg:col-span-7 text-left space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>Cloud Database Firestore Terhubung & Sinkron</span>
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-800 font-display leading-tight">
                  Selamat Datang di <span className="text-blue-600">Perpustakaan</span> <span className="text-amber-500">Ramah Anak</span>
                </h2>
                <p className="text-slate-600 text-xs sm:text-sm mt-2 leading-relaxed">
                  Tautkan <strong>Akun Google</strong> Anda untuk masuk. Setiap isian buku tamu, sirkulasi peminjaman, dan dokumentasi foto akan <strong>tersimpan permanen</strong> dan <strong>tersinkronisasi serentak</strong> sehingga seluruh pengunjung dapat melihat riwayat terbaru secara seragam.
                </p>
              </div>

              {/* Error message alert if any */}
              {errorMessage && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Perhatian:</span> {errorMessage}
                  </div>
                </div>
              )}

              {/* Google Sign In Button */}
              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  id="btn-google-login"
                  className="w-full sm:w-auto px-6 py-4 bg-white hover:bg-slate-50 text-slate-800 font-black rounded-2xl shadow-lg hover:shadow-xl border-2 border-slate-200 hover:border-blue-400 transition-all flex items-center justify-center gap-3 cursor-pointer group hover:scale-[1.02] active:scale-95 disabled:opacity-50 text-sm sm:text-base"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
                      <span>Menautkan Akun Google...</span>
                    </>
                  ) : (
                    <>
                      {/* Official Google Icon SVG */}
                      <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                      <span className="font-extrabold text-slate-800 font-display">
                        Masuk dengan Akun Google
                      </span>
                      <ArrowRight className="w-4 h-4 text-blue-600 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>

                <p className="text-[11px] text-slate-500 font-medium">
                  🔒 Otentikasi aman melalui Google Cloud Identity. Data identitas tersimpan di Firestore.
                </p>
              </div>

              {/* Fast guest bypass */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] text-slate-400 font-medium">
                  Ingin melihat tampilan tanpa login Google terlebih dahulu?
                </span>
                <button
                  type="button"
                  onClick={() => { playHappyTune(); onContinueAsGuest('pengunjung'); }}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 underline cursor-pointer"
                >
                  Masuk Mode Tamu Cepat &rarr;
                </button>
              </div>

            </div>

            {/* Right Column: Database Stats & Live Stream of Shared Updates */}
            <div className="lg:col-span-5 bg-slate-50/80 rounded-2xl p-5 border border-slate-200/80 space-y-4 text-left">
              
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-blue-600" /> Status Database Terpusat
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full">
                  LIVE SYNC
                </span>
              </div>

              {/* Key Indicators Mini Grid */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs">
                  <div className="text-base sm:text-lg font-black text-blue-600">{totalBooks}</div>
                  <div className="text-[10px] text-slate-500 font-bold">Katalog Buku</div>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs">
                  <div className="text-base sm:text-lg font-black text-emerald-600">{totalVisitors}</div>
                  <div className="text-[10px] text-slate-500 font-bold">Buku Tamu</div>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs">
                  <div className="text-base sm:text-lg font-black text-purple-600">{totalPhotos}</div>
                  <div className="text-[10px] text-slate-500 font-bold">Galeri Foto</div>
                </div>
              </div>

              {/* Live Input Stream Preview */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-black text-slate-600 uppercase tracking-wider flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-500" /> Riwayat Terakhir Pengakses Lain
                  </span>
                  <span className="text-[10px] text-slate-400">Sinkron Otomatis</span>
                </div>

                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {recentActivities && recentActivities.length > 0 ? (
                    recentActivities.slice(0, 4).map((act) => (
                      <div 
                        key={act.id} 
                        className="bg-white p-2.5 rounded-xl border border-slate-200/80 text-[11px] space-y-1 shadow-xs"
                      >
                        <div className="flex items-center justify-between gap-1 text-[10px] text-slate-500">
                          <span className="font-extrabold text-blue-700 truncate max-w-[140px]">
                            {act.operator || "Pengunjung"}
                          </span>
                          <span className="text-[9px] text-slate-400 shrink-0">
                            {act.formattedDate ? act.formattedDate.split('•')[1] || act.formattedDate : 'Baru saja'}
                          </span>
                        </div>
                        <p className="text-slate-700 font-medium line-clamp-2 text-[10px] leading-tight">
                          {act.activity}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="bg-white p-4 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                      Belum ada riwayat aktivitas terbaru hari ini.
                    </div>
                  )}
                </div>
              </div>

              <div className="p-2.5 bg-amber-50/80 border border-amber-200 rounded-xl text-[10px] text-amber-800 leading-relaxed font-medium">
                💡 <strong>Keterpaduan Data:</strong> Setiap pengunjung yang masuk dengan email Google berbeda tetap melihat data yang sama dan konsisten.
              </div>

            </div>

          </div>

          {/* Footer School Details */}
          <div className="mt-8 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500 font-medium">
            <div className="flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-amber-500" />
              <span>Gerakan Literasi Sekolah (GLS) SDN 1 Srimenganten</span>
            </div>
            <div>
              <span>Kepala Sekolah: <strong>Saiful Jamil, M.Pd.</strong></span>
            </div>
          </div>

        </div>
      </motion.div>

      {/* Guide Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl overflow-y-auto max-h-[85vh] border border-blue-100 text-left"
          >
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="text-3xl">📘</span>
              <div>
                <h3 className="text-lg font-black text-slate-800 font-display">Panduan Login & Sinkronisasi Google</h3>
                <p className="text-xs text-slate-400">SD Negeri 1 Srimenganten</p>
              </div>
            </div>

            <div className="mt-4 space-y-3.5 text-xs text-slate-600 font-medium leading-relaxed">
              <div className="p-3 bg-blue-50/70 rounded-2xl border border-blue-100">
                <h4 className="font-bold text-blue-800 flex items-center gap-1.5 mb-1 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Mengapa Login dengan Google?
                </h4>
                <p className="text-[11px] text-blue-950">
                  Dengan login Google, identitas pengunjung tervalidasi. Setiap kali Anda mengisi buku tamu atau mengunggah foto galeri, nama dan email Anda akan tercatat rapi di database pusat.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 text-xs mb-1.5">🔄 Sinkronisasi Bersama Real-Time:</h4>
                <p className="text-[11px] text-slate-600">
                  Aplikasi ini menggunakan teknologi <strong>Google Cloud Firestore</strong>. Artinya, tidak ada data yang tercecer di komputer masing-masing. Ketika Guru A atau Siswa B mengisi data, gawai Anda akan langsung memperbarui tampilannya tanpa perlu refresh halaman!
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 text-xs mb-1.5">🛡️ Hak Akses & Keamanan:</h4>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-600">
                  <li><strong>Pengunjung / Siswa:</strong> Bebas melihat katalog, mengisi buku tamu, melihat galeri foto & video linimasa.</li>
                  <li><strong>Admin & Petugas:</strong> Memiliki akses sirkulasi pinjam/kembali dan manajemen katalog melalui kode PIN pengamanan.</li>
                  <li><strong>Kepala Sekolah:</strong> Dapat mengecek laporan statistik dan cetak berkas rekapitulasi literasi.</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold shadow-md transition-all cursor-pointer"
              >
                Tutup Panduan
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}
