import React, { useState } from 'react';
import { 
  Play, 
  Youtube, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  History, 
  Hammer, 
  PartyPopper, 
  Share2, 
  Layers, 
  Maximize2,
  Calendar,
  Eye
} from 'lucide-react';

export interface TimelineStep {
  part: number;
  phase: 'BEFORE' | 'ON_PROSES' | 'AFTER';
  badge: string;
  badgeColor: string;
  title: string;
  subtitle: string;
  youtubeId: string;
  youtubeUrl: string;
  date: string;
  description: string;
  highlights: string[];
  duration: string;
}

export const TIMELINE_VIDEOS: TimelineStep[] = [
  {
    part: 1,
    phase: 'BEFORE',
    badge: 'Bagian 1 • Kondisi Awal (Before)',
    badgeColor: 'bg-rose-500 text-white',
    title: 'Dokumentasi Kondisi Awal Perpustakaan Sebelum Transformasi',
    subtitle: 'Ruang baca lama sebelum renovasi dan standarisasi ramah anak',
    youtubeId: 'Kw1kTzZyGmM',
    youtubeUrl: 'https://youtu.be/Kw1kTzZyGmM?si=zmuMFBrixwBgYKif',
    date: 'Juli 2026',
    duration: 'Video Dokumentasi',
    description: 'Rekaman visual kondisi ruangan dan sarana perpustakaan sebelum dilakukan revitalisasi total menjadi perpustakaan ramah anak berstandar GLS.',
    highlights: [
      'Inventarisasi buku koleksi lama',
      'Pemetaan tata letak ruangan kelas',
      'Rencana anggaran & desain ramah anak'
    ]
  },
  {
    part: 2,
    phase: 'ON_PROSES',
    badge: 'Bagian 2 • Proses Pengerjaan (On Proses)',
    badgeColor: 'bg-amber-500 text-slate-950',
    title: 'Tahap Renovasi, Pengecatan & Penataan Koleksi Ramah Anak',
    subtitle: 'Aksi gotong royong guru, komite, dan pustakawan',
    youtubeId: 'gELo2CLYtfA',
    youtubeUrl: 'https://youtu.be/gELo2CLYtfA?si=kwoy_t6Dc1H1opRD',
    date: 'Agustus 2026',
    duration: 'Video Proses Kerja',
    description: 'Proses intensif pengecatan tema edukasi ceria, perakitan rak buku ramah anak setinggi jangkauan siswa, dan pengelompokan buku berlabel warna.',
    highlights: [
      'Pengecatan dinding karakter literasi & Si Kumbi',
      'Penyusunan rak buku ramah anak & karpet baca',
      'Digitalisasi katalog buku & kartu anggota siswa'
    ]
  },
  {
    part: 3,
    phase: 'AFTER',
    badge: 'Bagian 3 • Hasil & Peresmian (After)',
    badgeColor: 'bg-emerald-500 text-white',
    title: 'Launching Akbar Perpustakaan Ramah Anak SD Negeri 1 Srimenganten',
    subtitle: 'Peresmian operasional dan Gerakan Literasi Sekolah (GLS)',
    youtubeId: 'NhEjXGVmYuc',
    youtubeUrl: 'https://youtu.be/NhEjXGVmYuc?si=hjcSc1vObpL_FHYt',
    date: 'Agustus 2026',
    duration: 'Video Launching Resmi',
    description: 'Momen puncak peresmian perpustakaan baru oleh Kepala Sekolah Saiful Jamil, M.Pd., Pustakawan Dea Cahya Kirana, dewan guru, dan seluruh murid.',
    highlights: [
      'Pemotongan pita peresmian ruang baca ramah anak',
      'Peluncuran kartu digital & program Bintang Literasi',
      'Antusiasme siswa membaca 15 menit setiap hari'
    ]
  }
];

export default function TimelineVideos() {
  const [selectedVideo, setSelectedVideo] = useState<TimelineStep>(TIMELINE_VIDEOS[2]); // Default to latest (Launching)
  const [theaterMode, setTheaterMode] = useState<boolean>(false);

  return (
    <div className="space-y-6 text-left">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-black uppercase tracking-wider">
              <Youtube className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              <span>Linimasa Video Transformasi YouTube</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black font-display tracking-tight text-white">
              Perjalanan Transformasi Perpustakaan Ramah Anak
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Saksikan perjalanan lengkap inovasi perpustakaan SDN 1 Srimenganten dari kondisi awal (*Before*), tahapan renovasi (*On Process*), hingga momen peresmian akbar (*After Launching*).
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
            <a
              href="https://drive.google.com/drive/folders/1Qup72orotr4noxAIi_2vcTucUjaBc1LQ?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-xs font-bold border border-white/20 backdrop-blur-sm transition-all flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
              <span>Buka Galeri Drive</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Video Stage & Timeline Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Active Featured Video Player (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border-2 border-slate-800">
            
            {/* Embedded YouTube Player */}
            <div className="relative aspect-video w-full bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                title={selectedVideo.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Video Meta Info Box */}
            <div className="p-5 bg-slate-900 text-white space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider ${selectedVideo.badgeColor}`}>
                  {selectedVideo.badge}
                </span>

                <div className="flex items-center gap-2">
                  <a
                    href={selectedVideo.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    <Youtube className="w-3.5 h-3.5" />
                    <span>Tonton di YouTube</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-black text-white leading-snug">
                  {selectedVideo.title}
                </h3>
                <p className="text-xs text-amber-300 font-medium mt-0.5">
                  {selectedVideo.subtitle}
                </p>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed border-t border-slate-800 pt-3">
                {selectedVideo.description}
              </p>

              {/* Highlights badges */}
              <div className="pt-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                  Poin Penting Tahapan:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {selectedVideo.highlights.map((h, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/80 border border-slate-700/60 text-[11px] text-slate-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate">{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Timeline Interactive Cards List (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <Layers className="w-4 h-4 text-primary" />
              <span>Daftar 3 Episode Linimasa</span>
            </h3>

            <div className="space-y-3">
              {TIMELINE_VIDEOS.map((item) => {
                const isActive = selectedVideo.part === item.part;
                return (
                  <button
                    key={item.part}
                    onClick={() => setSelectedVideo(item)}
                    className={`w-full text-left p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col gap-2.5 ${
                      isActive
                        ? 'bg-blue-50/70 border-blue-500 shadow-md ring-2 ring-blue-400/20'
                        : 'bg-slate-50/70 border-slate-200 hover:border-slate-300 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase ${item.badgeColor}`}>
                        Bagian {item.part}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 font-bold flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {item.date}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs font-black text-slate-900 line-clamp-2 leading-snug">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {item.subtitle}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-[10px] font-bold text-blue-600">
                      <span className="flex items-center gap-1">
                        <Play className={`w-3 h-3 ${isActive ? 'fill-current animate-pulse' : ''}`} />
                        {isActive ? 'Sedang Diputar' : 'Klik untuk Memutar'}
                      </span>
                      <span className="text-slate-400">YouTube Video</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Info Box */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-2xl border border-amber-200 text-slate-800 text-xs space-y-1.5">
            <h4 className="font-extrabold text-amber-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-600" />
              Semangat Transformasi Sekolah
            </h4>
            <p className="text-[11px] text-amber-800/90 leading-relaxed">
              Program revitalisasi ini diinisiasi untuk memberikan ruang baca yang ramah, nyaman, ceria, dan aman bagi tumbuh kembang budaya literasi siswa SD Negeri 1 Srimenganten.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
