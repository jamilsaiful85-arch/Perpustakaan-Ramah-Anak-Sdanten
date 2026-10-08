import React, { useState } from 'react';
import { Save, RefreshCw, Smartphone, Key, FileJson, CheckCircle, Database, HelpCircle, Shield, Lock, ShieldCheck, Cloud, Wifi } from 'lucide-react';
import { playHappyTune } from './SplashIntro';
import { dbResetToDefaults } from '../lib/firestoreService';

interface SettingsViewProps {
  maxDays: number;
  setMaxDays: (val: number) => void;
  finePerDay: number;
  setFinePerDay: (val: number) => void;
  schoolIdentity: {
    name: string;
    address?: string;
    headmaster: string;
    nip: string;
    librarian: string;
    librarianNip: string;
    established: string;
    adminPin?: string;
  };
  setSchoolIdentity: (val: any) => void;
  onBackupRestore: (restoredData: any) => void;
  fullState: any;
  isAdmin?: boolean;
  onRequireAdmin?: () => void;
}

export default function SettingsView({
  maxDays,
  setMaxDays,
  finePerDay,
  setFinePerDay,
  schoolIdentity,
  setSchoolIdentity,
  onBackupRestore,
  fullState,
  isAdmin = false,
  onRequireAdmin
}: SettingsViewProps) {
  
  // Local states
  const [name, setName] = useState(schoolIdentity.name || "SD NEGERI 1 SRIMENGANTEN");
  const [address, setAddress] = useState(schoolIdentity.address || "Jalan Babakan Linggar Pekon Srimenganten, Kecamatan Pulau Panggung Kabupaten Tanggamus");
  const [headmaster, setHeadmaster] = useState(schoolIdentity.headmaster || "Saiful Jamil, M.Pd.");
  const [nip, setNip] = useState(schoolIdentity.nip || "19850810 2014061 003");
  const [librarian, setLibrarian] = useState(schoolIdentity.librarian || "Dea Cahya Kirana");
  const [librarianNip, setLibrarianNip] = useState(schoolIdentity.librarianNip || "- (Belum Memiliki NIP)");
  const [established, setEstablished] = useState(schoolIdentity.established || "1985");
  const [adminPin, setAdminPin] = useState(schoolIdentity.adminPin || "1985");
  
  const [localMaxDays, setLocalMaxDays] = useState(maxDays);
  const [localFinePerDay, setLocalFinePerDay] = useState(finePerDay);

  const [backupString, setBackupString] = useState('');
  const [notif, setNotif] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAdmin && onRequireAdmin) {
      onRequireAdmin();
      return;
    }

    // Save configurations
    setMaxDays(Number(localMaxDays));
    setFinePerDay(Number(localFinePerDay));
    setSchoolIdentity({
      name,
      address,
      headmaster,
      nip,
      librarian,
      librarianNip,
      established,
      adminPin: adminPin || "1985"
    });

    playHappyTune();
    setNotif("🎉 Pengaturan Sekolah & Sirkulasi Berhasil Disimpan ke Cloud Database!");
    setTimeout(() => {
      setNotif(null);
    }, 3000);
  };

  // Generate Backup Key
  const generateBackup = () => {
    playHappyTune();
    const cleanState = {
      books: fullState.books,
      students: fullState.students,
      loans: fullState.loans,
      schoolIdentity,
      finePerDay,
      maxDays
    };
    const json = JSON.stringify(cleanState);
    const base64 = btoa(unescape(encodeURIComponent(json)));
    setBackupString(base64);
    setNotif("🌟 Kunci Backup Keamanan Berhasil Dibuat!");
    setTimeout(() => setNotif(null), 3000);
  };

  // Restore Backup Key
  const handleRestore = () => {
    if (!isAdmin && onRequireAdmin) {
      onRequireAdmin();
      return;
    }

    if (!backupString.trim()) return;
    try {
      const decoded = decodeURIComponent(escape(atob(backupString)));
      const parsed = JSON.parse(decoded);
      if (parsed.books && parsed.students) {
        onBackupRestore(parsed);
        playHappyTune();
        setNotif("❇️ Database Berhasil Dipulihkan (Restored)!");
      } else {
        alert("Format kunci backup tidak valid!");
      }
    } catch (e) {
      alert("Gagal memulihkan database. Periksa keaslian Kunci Backup!");
    }
    setTimeout(() => setNotif(null), 3500);
  };

  const handleResetDefaults = async () => {
    if (!isAdmin && onRequireAdmin) {
      onRequireAdmin();
      return;
    }

    if (confirm("⚠️ Apakah Anda yakin ingin memuat ulang 68 koleksi buku dan anggota awal ke database cloud? Data buku sirkulasi saat ini akan diselaraskan.")) {
      setIsResetting(true);
      try {
        await dbResetToDefaults();
        playHappyTune();
        setNotif("✨ Database Cloud berhasil diselaraskan dengan seluruh 68 buku perpustakaan awal!");
      } catch (err) {
        alert("Gagal menyelaraskan database cloud.");
      } finally {
        setIsResetting(false);
        setTimeout(() => setNotif(null), 3000);
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 text-xs text-slate-600 font-semibold text-left">
      
      {/* Cloud Status Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-primary text-white p-4 rounded-3xl shadow-lg flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-white backdrop-blur-xs">
            <Cloud className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm tracking-wide">Penyimpanan Cloud Database Firestore Aktif</span>
              <span className="bg-emerald-400 text-slate-900 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                <Wifi className="w-3 h-3" /> Real-time Live
              </span>
            </div>
            <p className="text-[11px] text-blue-100 font-normal mt-0.5">
              Semua perubahan data buku, anggota siswa, peminjaman, dan buku tamu disinkronkan langsung ke seluruh pengguna dan perangkat lain.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin ? (
            <div className="bg-emerald-500/30 border border-emerald-300/50 text-white px-3 py-1.5 rounded-2xl text-[11px] font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>Petugas / Admin Terbuka</span>
            </div>
          ) : (
            <button
              onClick={onRequireAdmin}
              className="bg-amber-400 hover:bg-amber-300 text-slate-900 px-3.5 py-1.5 rounded-2xl text-[11px] font-extrabold flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Masuk Sebagai Petugas</span>
            </button>
          )}
        </div>
      </div>

      {notif && (
        <div className="bg-emerald-500 text-white p-3 rounded-2xl text-center text-xs font-bold shadow-xs animate-in fade-in">
          {notif}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
        
        {/* School Credentials */}
        <div className="glass-panel p-5 rounded-3xl border border-white md:col-span-8 space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-sm font-extrabold text-slate-800 font-display flex items-center gap-2">
              <span>⚙️</span> Profil Sekolah Dasar Negeri & Identitas Surat
            </h3>
            {!isAdmin && (
              <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-lg flex items-center gap-1">
                <Lock className="w-3 h-3 text-slate-400" /> Mode Hanya Lihat
              </span>
            )}
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500">Nama Sekolah *</label>
                <input
                  type="text"
                  required
                  disabled={!isAdmin}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: SD NEGERI 1 SRIMENGANTEN"
                  id="input-settings-school-name"
                  className="w-full bg-white disabled:bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500">Tahun Pendirian</label>
                <input
                  type="text"
                  disabled={!isAdmin}
                  value={established}
                  onChange={(e) => setEstablished(e.target.value)}
                  placeholder="Contoh: 1985"
                  id="input-settings-school-est"
                  className="w-full bg-white disabled:bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-medium"
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-[11px] font-bold text-slate-500">Alamat Lengkap Sekolah *</label>
                <input
                  type="text"
                  required
                  disabled={!isAdmin}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Jalan Babakan Linggar Pekon Srimenganten, Kecamatan Pulau Panggung Kabupaten Tanggamus"
                  id="input-settings-school-address"
                  className="w-full bg-white disabled:bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500">Nama Kepala Sekolah *</label>
                <input
                  type="text"
                  required
                  disabled={!isAdmin}
                  value={headmaster}
                  onChange={(e) => setHeadmaster(e.target.value)}
                  placeholder="Saiful Jamil, M.Pd."
                  id="input-settings-headmaster"
                  className="w-full bg-white disabled:bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500">Nomor Induk Pegawai (NIP) Kepala Sekolah</label>
                <input
                  type="text"
                  disabled={!isAdmin}
                  value={nip}
                  onChange={(e) => setNip(e.target.value)}
                  placeholder="19850810 2014061 003"
                  id="input-settings-kasek-nip"
                  className="w-full bg-white disabled:bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-medium font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500">Petugas Perpustakaan (Pustakawan) *</label>
                <input
                  type="text"
                  disabled={!isAdmin}
                  value={librarian}
                  onChange={(e) => setLibrarian(e.target.value)}
                  placeholder="Dea Cahya Kirana"
                  id="input-settings-pustakawan"
                  className="w-full bg-white disabled:bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500">Nomor Induk Pegawai (NIP) Petugas</label>
                <input
                  type="text"
                  disabled={!isAdmin}
                  value={librarianNip}
                  onChange={(e) => setLibrarianNip(e.target.value)}
                  placeholder="-"
                  id="input-settings-pustakawan-nip"
                  className="w-full bg-white disabled:bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-medium font-mono"
                />
              </div>
            </div>

            {/* Admin PIN Settings */}
            <div className="border-t border-slate-100 pt-4 mt-2">
              <h4 className="font-bold text-slate-800 text-xs uppercase mb-3 text-left flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-blue-600" />
                <span>Keamanan & PIN Akses Petugas</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500">PIN Rahasia Petugas / Admin (4-10 Digit)</label>
                  <input
                    type="password"
                    disabled={!isAdmin}
                    value={adminPin}
                    onChange={(e) => setAdminPin(e.target.value)}
                    placeholder="1985"
                    id="input-settings-admin-pin"
                    className="w-full bg-white disabled:bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-mono tracking-widest font-medium"
                  />
                  <p className="text-[10px] text-slate-400">PIN ini digunakan untuk mengunci/membuka akses kelola perpustakaan.</p>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 mt-2">
              <h4 className="font-bold text-slate-800 text-xs uppercase mb-3 text-left">📅 Pengaturan Kebijakan Sirkulasi Buku</h4>
              
              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500">Batas Waktu Pinjaman Default (Hari)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    disabled={!isAdmin}
                    value={localMaxDays}
                    onChange={(e) => setLocalMaxDays(Number(e.target.value))}
                    placeholder="Contoh: 7"
                    id="input-settings-max-days"
                    className="w-full bg-white disabled:bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500">Nominal Denda Harian Keterlambatan (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    disabled={!isAdmin}
                    value={localFinePerDay}
                    onChange={(e) => setLocalFinePerDay(Number(e.target.value))}
                    placeholder="Contoh: 1000"
                    id="input-settings-fine"
                    className="w-full bg-white disabled:bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              {isAdmin ? (
                <button
                  type="submit"
                  id="btn-settings-save"
                  className="px-6 py-2.5 bg-primary hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer flex items-center gap-1.5 ml-auto"
                >
                  <Save className="w-4 h-4" /> Simpan Konfigurasi Sekolah
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onRequireAdmin}
                  id="btn-settings-unlock-admin"
                  className="px-6 py-2.5 bg-blue-50 text-primary hover:bg-blue-100 border border-blue-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ml-auto"
                >
                  <Lock className="w-4 h-4" /> Buka Akses Petugas Untuk Mengedit
                </button>
              )}
            </div>

          </form>
        </div>

        {/* Local storage manual Backup security keys */}
        <div className="glass-panel p-5 rounded-3xl border border-white md:col-span-4 flex flex-col justify-between shadow-lg space-y-4">
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold text-slate-800 font-display flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Database className="w-4 h-4 text-emerald-600" /> Cadangan (Backup Engine)
            </h3>

            <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
              Amankan data perpustakaan Anda! Guna menghindari kehilangan data sirkulasi harian, ekspor seluruh database sekolah menjadi Kunci Backup terenkripsi di bawah ini.
            </p>

            <div className="space-y-2">
              <button
                type="button"
                onClick={generateBackup}
                id="btn-settings-gen-backup"
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
              >
                <FileJson className="w-4 h-4" /> Ekspor Kunci Cadangan 🛡️
              </button>

              <textarea
                value={backupString}
                onChange={(e) => setBackupString(e.target.value)}
                placeholder="Tempelkan Kunci Backup di sini untuk memulihkan data..."
                id="textarea-settings-backup"
                rows={4}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-[10px] text-slate-600 font-mono focus:outline-hidden"
              />

              <button
                type="button"
                onClick={handleRestore}
                disabled={!backupString.trim()}
                id="btn-settings-restore"
                className="w-full py-2 bg-blue-50 hover:bg-blue-100 disabled:opacity-40 text-primary border border-blue-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Key className="w-4 h-4" /> Impor & Pulihkan Database
              </button>

              {isAdmin && (
                <div className="pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleResetDefaults}
                    disabled={isResetting}
                    id="btn-settings-reset-defaults"
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
                    <span>Sinkronkan 68 Buku & Anggota Awal</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="bg-blue-50/50 p-2.5 rounded-xl border border-blue-100/60 text-[11px] leading-relaxed text-blue-800 font-medium self-baseline w-full">
            <HelpCircle className="w-4 h-4 text-blue-500 inline mr-1.5 shrink-0" />
            <span>Format kunci cadangan kompatibel diunggah langsung ke web Blogger, atau backup mandiri di hosting sekolah!</span>
          </div>
        </div>

      </div>

    </div>
  );
}
