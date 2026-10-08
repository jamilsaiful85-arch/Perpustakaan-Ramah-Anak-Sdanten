import React, { useState } from 'react';
import { Student } from '../data/initialData';
import { Search, Plus, Filter, Users, Download, Trash2, Calendar, ClipboardCheck, Sparkles, BookOpen, Star, CheckCircle, Lock } from 'lucide-react';
import { playHappyTune } from './SplashIntro';

export interface VisitorLog {
  id: string;
  studentId?: string;
  name: string;
  className: string;
  purpose: string;
  formattedDate: string;
  timestamp: string;
  rating?: number;
  userEmail?: string;
  userPhoto?: string;
}

interface VisitorRegisterProps {
  students: Student[];
  visitorLogs: VisitorLog[];
  onAddVisitor: (visitor: VisitorLog) => void;
  onDeleteVisitor: (id: string) => void;
  onClearVisitors: () => void;
  isAdmin?: boolean;
  onRequireAdmin?: () => void;
  currentUser?: {
    displayName?: string | null;
    email?: string | null;
    photoURL?: string | null;
  } | null;
}

export default function VisitorRegister({
  students,
  visitorLogs,
  onAddVisitor,
  onDeleteVisitor,
  onClearVisitors,
  isAdmin = false,
  onRequireAdmin,
  currentUser
}: VisitorRegisterProps) {
  
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [notif, setNotif] = useState<string | null>(null);

  // Form Fields
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [manualName, setManualName] = useState('');
  const [manualClass, setManualClass] = useState('Kelas 1');
  const [purpose, setPurpose] = useState('Membaca Buku 📖');
  const [rating, setRating] = useState<number>(5);

  const classesList = ["Kelas 1", "Kelas 2", "Kelas 3", "Kelas 4", "Kelas 5", "Kelas 6", "Guru & Staf Sekolah", "Orang Tua / Tamu Umum"];
  const purposeOptions = [
    "Membaca Buku Cerita / Fiksi 📖",
    "Meminjam & Mengembalikan Buku 📚",
    "Mengerjakan Tugas Belajar / PR 📝",
    "Membaca di Pojok Literasi Anak 🧸",
    "Kunjungan Studi / Literasi Perpustakaan 🧑‍🏫",
    "Mencari Referensi & Ensiklopedia 🔍"
  ];

  // Auto-fill form fields when a student is selected
  const handleStudentSelect = (id: string) => {
    setSelectedStudentId(id);
    if (id) {
      const student = students.find(s => s.id === id);
      if (student) {
        setManualName(student.name);
        setManualClass(student.className);
      }
    } else {
      setManualName('');
      setManualClass('Kelas 1');
    }
  };

  const handleSaveVisitor = (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalName = selectedStudentId 
      ? (students.find(s => s.id === selectedStudentId)?.name || manualName) 
      : manualName;

    if (!finalName.trim()) {
      alert("Silakan masukkan atau pilih nama pengunjung!");
      return;
    }

    const d = new Date();
    const indonesianDays = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const indonesianMonths = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    
    const formattedDate = `${indonesianDays[d.getDay()]}, ${d.getDate()} ${indonesianMonths[d.getMonth()]} ${d.getFullYear()} • ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')} WIB`;

    const newVisitor: VisitorLog = {
      id: "VS-" + Math.floor(100000 + Math.random() * 900000),
      studentId: selectedStudentId || undefined,
      name: finalName.toUpperCase(),
      className: selectedStudentId ? (students.find(s => s.id === selectedStudentId)?.className || manualClass) : manualClass,
      purpose,
      formattedDate,
      timestamp: d.toISOString(),
      rating,
      userEmail: currentUser?.email || undefined,
      userPhoto: currentUser?.photoURL || undefined
    };

    onAddVisitor(newVisitor);
    playHappyTune();
    setNotif(`🎉 Terima kasih! Kunjungan ${newVisitor.name} berhasil tersimpan ke Database Cloud!`);
    
    // reset form
    setSelectedStudentId('');
    setManualName('');
    setManualClass('Kelas 1');
    setPurpose('Membaca Buku Cerita / Fiksi 📖');
    setRating(5);

    setTimeout(() => setNotif(null), 3500);
  };

  // Filter visitors
  const filteredVisitors = visitorLogs.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(search.toLowerCase()) || 
                          v.purpose.toLowerCase().includes(search.toLowerCase());
    const matchesClass = classFilter ? v.className === classFilter : true;
    return matchesSearch && matchesClass;
  });

  // Export Excel-compatible CSV for visitor reports
  const handleDownloadVisitors = () => {
    playHappyTune();
    const headers = ["ID Kunjungan", "Waktu Dan Tanggal Kunjungan", "Nama Pengunjung", "Kelas/Kategori", "Tujuan Kunjungan", "Rating"];
    const rows = filteredVisitors.map(v => [
      v.id,
      v.formattedDate,
      v.name,
      v.className,
      v.purpose,
      v.rating || 5
    ]);

    const csvContent = "\uFEFF" + [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    ].join("\r\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `REKAP_PENGUNJUNG_PERPUS_SDN1SRIMENGANTEN_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = (id: string) => {
    if (!isAdmin && onRequireAdmin) {
      onRequireAdmin();
      return;
    }
    onDeleteVisitor(id);
    playHappyTune();
  };

  const handleClearAll = () => {
    if (!isAdmin && onRequireAdmin) {
      onRequireAdmin();
      return;
    }
    if (window.confirm("Apakah Anda yakin ingin mengosongkan seluruh data buku tamu pengunjung?")) {
      onClearVisitors();
      playHappyTune();
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-xs text-slate-600 font-semibold text-left">
      
      {notif && (
        <div id="visitor-log-notification" className="bg-emerald-500 text-white p-3.5 rounded-2xl text-center text-xs font-bold shadow-md flex items-center justify-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4" />
          <span>{notif}</span>
        </div>
      )}

      {/* Main Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Form Logging Section (Left - 5 Span) */}
        <div className="lg:col-span-5 flex flex-col justify-between glass-panel p-5 rounded-3xl border border-white shadow-lg space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-indigo-100 pb-2 mb-4">
              <h3 className="text-sm font-extrabold text-slate-800 font-display flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-primary" /> Buku Kunjungan & Tamu Terbuka
              </h3>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                ✍️ Terbuka Untuk Semua
              </span>
            </div>

            <form onSubmit={handleSaveVisitor} className="space-y-3.5">
              
              {/* Logged in Google user banner & fast fill */}
              {currentUser && (
                <div className="p-2.5 bg-blue-50/90 border border-blue-200 rounded-2xl flex items-center justify-between gap-2 text-left">
                  <div className="flex items-center gap-2 min-w-0">
                    {currentUser.photoURL ? (
                      <img src={currentUser.photoURL} alt="" className="w-7 h-7 rounded-full border border-blue-300 shrink-0" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                        {(currentUser.displayName || currentUser.email || 'G')[0].toUpperCase()}
                      </div>
                    )}
                    <div className="truncate text-[10px]">
                      <span className="font-extrabold text-blue-900 block truncate">{currentUser.displayName || 'Akun Google'}</span>
                      <span className="text-slate-500 font-medium truncate block">{currentUser.email}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStudentId('');
                      if (currentUser.displayName) setManualName(currentUser.displayName);
                    }}
                    className="px-2.5 py-1 bg-white hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-[10px] font-extrabold shrink-0 transition-all cursor-pointer shadow-2xs"
                  >
                    Pakai Nama Saya
                  </button>
                </div>
              )}

              {/* Optional Student List selection for quick add */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 block">Pilih dari Anggota Siswa (Otomatis)</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => handleStudentSelect(e.target.value)}
                  id="select-visitor-student"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700"
                >
                  <option value="">-- Ketik Nama Sendiri / Tamu Umum --</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.className})</option>
                  ))}
                </select>
              </div>

              {/* Name field (disabled if student selected, manual input if empty) */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 block">Nama Lengkap Pengunjung *</label>
                <input
                  type="text"
                  required
                  disabled={!!selectedStudentId}
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  placeholder="Ketik nama lengkap Anda di sini..."
                  id="input-visitor-name"
                  className="w-full bg-white disabled:bg-slate-50 disabled:text-slate-500 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Class list category */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 block">Kelas / Kategori</label>
                  <select
                    disabled={!!selectedStudentId}
                    value={manualClass}
                    onChange={(e) => setManualClass(e.target.value)}
                    id="select-visitor-class"
                    className="w-full bg-white disabled:bg-slate-50 disabled:text-slate-500 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700"
                  >
                    {classesList.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Purpose of visit */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 block">Tujuan Kunjungan *</label>
                  <select
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    id="select-visitor-purpose"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700"
                  >
                    {purposeOptions.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Star Rating for friendly engagement */}
              <div className="space-y-1 pt-1">
                <label className="text-[11px] font-bold text-slate-500 block">Bagaimana Suasana Membaca Hari Ini? ⭐</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`text-lg transition-transform hover:scale-125 cursor-pointer ${star <= rating ? 'opacity-100' : 'opacity-30'}`}
                    >
                      ⭐
                    </button>
                  ))}
                  <span className="text-[11px] font-bold text-slate-600 ml-2">
                    {rating === 5 ? 'Sangat Menyenangkan! 🤩' : rating >= 4 ? 'Seru & Nyaman! 😊' : 'Cukup Baik 👍'}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                id="btn-save-visitor"
                className="w-full py-2.5 bg-primary hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5 mt-2"
              >
                <Plus className="w-4 h-4" /> Simpan Ke Buku Tamu Real-time ✍️
              </button>
            </form>
          </div>

          <div className="bg-blue-50/60 p-3 rounded-2xl border border-blue-100/50 text-[11px] text-blue-800 leading-relaxed font-medium">
            <Sparkles className="w-4 h-4 text-amber-500 inline mr-1.5 shrink-0" />
            Setiap pengunjung bebas mencatat kehadiran, dan catatan ini langsung tersimpan ke Cloud Firestore agar dapat dilihat oleh seluruh pengakses secara serentak.
          </div>
        </div>

        {/* History Visitor logger Section (Right - 7 Span) */}
        <div className="lg:col-span-7 flex flex-col justify-between glass-panel p-5 rounded-3xl border border-white shadow-lg space-y-4">
          <div className="space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-100 pb-2">
              <h3 className="text-sm font-extrabold text-slate-800 font-display flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" /> Buku Tamu Pengunjung Real-time ({filteredVisitors.length})
              </h3>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadVisitors}
                  id="btn-download-visitors"
                  className="p-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg flex items-center justify-center transition-all cursor-pointer"
                  title="Unduh Rekap Pengunjung"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
                {isAdmin && visitorLogs.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAll}
                    id="btn-clear-visitors"
                    className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg flex items-center justify-center transition-all cursor-pointer"
                    title="Kosongkan Buku Tamu"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Searching Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5">
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari pengunjung..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-transparent border-none text-[11px] font-medium text-slate-700 placeholder-slate-400 focus:outline-hidden w-full"
                />
              </div>

              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-[11px] font-medium text-slate-700 focus:outline-hidden"
              >
                <option value="">-- Semua Kelas / Kategori --</option>
                {classesList.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* List Rows */}
            <div className="space-y-2 max-h-[310px] overflow-y-auto pr-1">
              {filteredVisitors.length === 0 ? (
                <div className="p-10 text-center bg-white rounded-2xl border border-slate-100/80 text-slate-400 flex flex-col items-center justify-center">
                  <Calendar className="w-8 h-8 text-slate-300 mb-2" />
                  <span className="text-[11px] font-medium block">Belum ada kunjungan yang tercatat. Silakan isi form di sebelah kiri!</span>
                </div>
              ) : (
                filteredVisitors.map((v) => (
                  <div
                    key={v.id}
                    className="p-2.5 bg-white rounded-xl border border-slate-150 hover:border-slate-300 transition-all flex items-center justify-between gap-3 text-left shadow-2xs"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-md truncate max-w-[120px] select-none uppercase">
                          {v.className}
                        </span>
                        <h4 className="font-extrabold text-[11px] text-slate-800 uppercase truncate leading-none">
                          {v.name}
                        </h4>
                        {v.rating && (
                          <span className="text-[10px] text-amber-500 font-bold ml-auto">
                            {'⭐'.repeat(v.rating)}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 font-bold mt-1">🏷️ Tujuan: <span className="text-slate-700 font-semibold">{v.purpose}</span></p>
                      {v.userEmail && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-[9px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded-md font-mono inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span className="truncate max-w-[170px]">Google: {v.userEmail}</span>
                          </span>
                        </div>
                      )}
                      <span className="text-[9px] text-slate-450 block font-bold font-mono mt-0.5">{v.formattedDate}</span>
                    </div>

                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => handleDelete(v.id)}
                        className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-all cursor-pointer"
                        title="Hapus Kunjungan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="text-[10px] font-bold text-slate-450 text-right w-full border-t border-slate-100/60 pt-2 shrink-0">
            Total kunjungan dalam rekap: {filteredVisitors.length} dari {visitorLogs.length} orang tercatat di Cloud Database.
          </div>
        </div>

      </div>

    </div>
  );
}
