import React, { useState } from 'react';
import { Student } from '../data/initialData';
import { Search, Plus, Filter, Users, Download, Printer, Trash2, Edit, Award, QrCode, Grid, List, CheckCircle, Smartphone, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { playHappyTune } from './SplashIntro';

interface StudentListProps {
  students: Student[];
  onAddStudent: (student: Student) => void;
  onUpdateStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
  isAdmin?: boolean;
  onRequireAdmin?: () => void;
}

export default function StudentList({ 
  students, 
  onAddStudent, 
  onUpdateStudent, 
  onDeleteStudent,
  isAdmin = false,
  onRequireAdmin 
}: StudentListProps) {
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [selectedStudentCard, setSelectedStudentCard] = useState<Student | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'L' | 'P'>('L');
  const [nis, setNis] = useState('');
  const [nisn, setNisn] = useState('');
  const [birthPlace, setBirthPlace] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [className, setClassName] = useState('Kelas 1');
  const [points, setPoints] = useState(10);
  const [badge, setBadge] = useState<'Pemula' | 'Pembaca Hebat' | 'Pahlawan Buku' | 'Bintang Literasi'>('Pemula');

  const [notif, setNotif] = useState<string | null>(null);

  // Filter & Search
  const filtered = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
                          s.nis.toLowerCase().includes(search.toLowerCase()) ||
                          s.nisn.toLowerCase().includes(search.toLowerCase()) ||
                          s.className.toLowerCase().includes(search.toLowerCase());
    const matchesClass = classFilter ? s.className === classFilter : true;
    return matchesSearch && matchesClass;
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (!isAdmin && onRequireAdmin) {
      onRequireAdmin();
      return;
    }

    if (editingStudent) {
      // Edit
      const updated: Student = {
        ...editingStudent,
        name: name.toUpperCase(),
        gender,
        nis,
        nisn,
        birthPlace,
        birthDate,
        className,
        points: Number(points),
        badge
      };
      onUpdateStudent(updated);
      setNotif("✨ Data Anggota Siswa berhasil disunting!");
    } else {
      // Add
      const newS: Student = {
        id: `NIS-${nis || Math.floor(1000 + Math.random() * 9000)}`,
        name: name.toUpperCase(),
        gender,
        nis: nis || String(Math.floor(1000 + Math.random() * 9000)),
        nisn: nisn || `00${Math.floor(10000000 + Math.random() * 90000000)}`,
        birthPlace: birthPlace || 'Lampung Timur',
        birthDate: birthDate || '2016-05-12',
        className,
        active: true,
        avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
        badge,
        points: Number(points)
      };
      onAddStudent(newS);
      setNotif("🎉 Anggota Siswa baru sukses ditambahkan!");
    }

    playHappyTune();
    setIsAddOpen(false);
    resetForm();
    setTimeout(() => setNotif(null), 3000);
  };

  const startEdit = (s: Student) => {
    if (!isAdmin && onRequireAdmin) {
      onRequireAdmin();
      return;
    }
    setEditingStudent(s);
    setName(s.name);
    setGender(s.gender);
    setNis(s.nis);
    setNisn(s.nisn);
    setBirthPlace(s.birthPlace);
    setBirthDate(s.birthDate);
    setClassName(s.className);
    setPoints(s.points);
    setBadge(s.badge);
    setIsAddOpen(true);
  };

  const handleDelete = (s: Student) => {
    if (!isAdmin && onRequireAdmin) {
      onRequireAdmin();
      return;
    }
    if (confirm(`Hapus data keanggotaan ${s.name}?`)) {
      onDeleteStudent(s.id);
      playHappyTune();
    }
  };

  const resetForm = () => {
    setName('');
    setGender('L');
    setNis('');
    setNisn('');
    setBirthPlace('');
    setBirthDate('');
    setClassName('Kelas 1');
    setPoints(10);
    setBadge('Pemula');
  };

  const badgeStyles = {
    'Pemula': 'bg-slate-100 text-slate-700 border-slate-200',
    'Pembaca Hebat': 'bg-blue-100 text-blue-800 border-blue-200',
    'Pahlawan Buku': 'bg-purple-100 text-purple-800 border-purple-200',
    'Bintang Literasi': 'bg-amber-100 text-amber-900 border-amber-300 font-extrabold'
  };

  return (
    <div className="space-y-4">
      
      {/* Top Filter and Actions */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white/60 p-4 rounded-3xl border border-white max-w-7xl mx-auto shadow-xs">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari Siswa berdasarkan Nama Lengkap, NIS, NISN..."
            id="input-student-search"
            className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-2 text-xs focus:outline-hidden focus:border-blue-400 font-medium text-slate-700 shadow-inner"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-2xl">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              id="select-student-class-filter"
              className="text-xs bg-transparent border-none text-slate-600 focus:outline-hidden font-semibold"
            >
              <option value="">Semua Rombel Kelas</option>
              <option value="Kelas 1">Kelas 1</option>
              <option value="Kelas 2">Kelas 2</option>
              <option value="Kelas 3">Kelas 3</option>
              <option value="Kelas 4">Kelas 4</option>
              <option value="Kelas 5">Kelas 5</option>
              <option value="Kelas 6">Kelas 6</option>
            </select>
          </div>

          <div className="flex p-0.5 bg-slate-100/80 border border-slate-200 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-slate-600 hover:bg-white transition-all cursor-pointer ${viewMode === 'grid' ? 'bg-white shadow-xs text-primary' : ''}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-slate-600 hover:bg-white transition-all cursor-pointer ${viewMode === 'table' ? 'bg-white shadow-xs text-primary' : ''}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => { 
              if (!isAdmin && onRequireAdmin) {
                onRequireAdmin();
                return;
              }
              playHappyTune(); 
              setIsAddOpen(true); 
              setEditingStudent(null); 
              resetForm(); 
            }}
            id="btn-student-add"
            className="p-2.5 bg-primary hover:bg-blue-700 text-white rounded-2xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer hover:scale-103"
          >
            <Plus className="w-4 h-4" />
            <span>Pendaftaran Anggota</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      <AnimatePresence>
        {notif && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-emerald-500 text-white px-5 py-3 rounded-2xl text-center text-xs font-bold max-w-md mx-auto shadow-md flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-4 h-4 animate-bounce" />
            <span>{notif}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Student listing */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-white/40 border border-slate-200/50 rounded-3xl max-w-7xl mx-auto">
          <Users className="w-16 h-16 text-slate-300 mx-auto animate-pulse" />
          <h3 className="text-lg font-bold text-slate-600 mt-4 font-display">Siswa Tidak Terdaftar</h3>
          <p className="text-xs text-slate-400 mt-1">Coba ketikkan kata kunci yang berbeda atau tambahkan siswa baru.</p>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW FOR CARDS */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-7xl mx-auto">
          {filtered.map(s => (
            <div
              key={s.id}
              className="glass-card p-4 rounded-3xl cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-start gap-3">
                {/* School kids avatar */}
                <div className="w-14 h-14 bg-linear-to-tr from-blue-100 to-amber-100 rounded-2xl shrink-0 border border-blue-200 p-1 flex items-center justify-center relative">
                  <img src={s.avatarUrl} alt={s.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                  <span className="absolute -bottom-1 -right-1 bg-white text-[10px] px-1 rounded-md border border-slate-200 font-bold text-slate-700">
                    {s.gender}
                  </span>
                </div>

                <div className="text-left flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-wider">{s.className}</span>
                  <h4 className="font-extrabold text-[13px] text-slate-800 line-clamp-1 mt-1 font-display uppercase">{s.name}</h4>
                  <p className="text-[10px] text-slate-450 font-mono mt-0.5">NIS: {s.nis} | NISN: {s.nisn}</p>
                </div>
              </div>

              {/* Badges system */}
              <div className="mt-4 border-t border-slate-100 pt-3 flex items-center justify-between text-[11px] text-left font-medium">
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Points</span>
                  <span className="font-mono text-xs font-bold text-slate-700 flex items-center gap-1">
                    🌟 {s.points} Pts
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Kelas Literasi</span>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] border font-bold ${badgeStyles[s.badge]}`}>
                    {s.badge}
                  </span>
                </div>
              </div>

              {/* Option controls */}
              <div className="mt-3 flex gap-1 pt-1 border-t border-slate-100">
                <button
                  onClick={() => setSelectedStudentCard(s)}
                  className="p-1 px-2.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-bold flex-1 cursor-pointer flex items-center justify-center gap-1"
                  title="Kartu Anggota Digital"
                >
                  <QrCode className="w-3.5 h-3.5" /> <span>Kartu Anggota</span>
                </button>
                {isAdmin && (
                  <>
                    <button
                      onClick={() => startEdit(s)}
                      className="p-1 px-2 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-lg text-xs font-bold cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(s)}
                      className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg text-xs cursor-pointer flex items-center justify-center"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>

            </div>
          ))}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white/70 overflow-x-auto rounded-3xl border border-slate-200 max-w-7xl mx-auto shadow-xs">
          <table className="w-full text-left text-xs text-slate-600 border-collapse">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5">NIS</th>
                <th className="p-3.5">NISN</th>
                <th className="p-3.5">Nama Siswa</th>
                <th className="p-3.5 text-center">JK</th>
                <th className="p-3.5">Kelas</th>
                <th className="p-3.5">Tempat Lahir</th>
                <th className="p-3.5">Poin</th>
                <th className="p-3.5">Badge</th>
                <th className="p-3.5 text-center">Pilihan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(s => (
                <tr key={s.id} className="hover:bg-slate-50/70 transition-all">
                  <td className="p-3.5 font-bold font-mono text-slate-500">{s.nis}</td>
                  <td className="p-3.5 font-mono text-slate-400">{s.nisn}</td>
                  <td className="p-3.5 font-bold text-slate-800 text-[13px] uppercase">{s.name}</td>
                  <td className="p-3.5 text-center font-bold">{s.gender}</td>
                  <td className="p-3.5 font-bold text-blue-600">{s.className}</td>
                  <td className="p-3.5 text-slate-500">{s.birthPlace}</td>
                  <td className="p-3.5 font-mono font-bold">🌟 {s.points}</td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] border font-bold ${badgeStyles[s.badge]}`}>
                      {s.badge}
                    </span>
                  </td>
                  <td className="p-3.5 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => setSelectedStudentCard(s)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg" title="Cetak Kartu">
                        <QrCode className="w-4 h-4" />
                      </button>
                      {isAdmin && (
                        <>
                          <button onClick={() => startEdit(s)} className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(s)} className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Student Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-blue-100 text-left overflow-y-auto max-h-[90vh]"
          >
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <h2 className="text-lg font-extrabold text-slate-800 font-display flex items-center gap-2">
                <span>🎒</span> {editingStudent ? 'Sunting Biodata Anggota' : 'Registrasi Anggota Siswa Baru'}
              </h2>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-slate-700 text-lg">×</button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs font-semibold text-slate-600">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1 col-span-1 md:col-span-2">
                  <label className="text-[11px] font-bold text-slate-500">Nama Lengkap Siswa *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: AHMAD REZKY..."
                    id="input-student-form-name"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 uppercase"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500">Jenis Kelamin</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as 'L' | 'P')}
                    id="select-student-form-gender"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500">Rombongan Belajar (Kelas)</label>
                  <select
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    id="select-student-form-class"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700"
                  >
                    <option value="Kelas 1">Kelas 1</option>
                    <option value="Kelas 2">Kelas 2</option>
                    <option value="Kelas 3">Kelas 3</option>
                    <option value="Kelas 4">Kelas 4</option>
                    <option value="Kelas 5">Kelas 5</option>
                    <option value="Kelas 6">Kelas 6</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500">Nomor Induk Siswa (NIS)</label>
                  <input
                    type="text"
                    value={nis}
                    onChange={(e) => setNis(e.target.value)}
                    placeholder="1988"
                    id="input-student-form-nis"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500">NISN Nasional</label>
                  <input
                    type="text"
                    value={nisn}
                    onChange={(e) => setNisn(e.target.value)}
                    placeholder="0087612345"
                    id="input-student-form-nisn"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500">Tempat Lahir</label>
                  <input
                    type="text"
                    value={birthPlace}
                    onChange={(e) => setBirthPlace(e.target.value)}
                    placeholder="Lampung Timur"
                    id="input-student-form-birthplace"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500">Tanggal Lahir</label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    id="input-student-form-birthdate"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500">Poin Literasi Harian</label>
                  <input
                    type="number"
                    min="0"
                    value={points}
                    onChange={(e) => setPoints(Number(e.target.value))}
                    placeholder="10"
                    id="input-student-form-points"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500">Lencana / Predikat</label>
                  <select
                    value={badge}
                    onChange={(e) => setBadge(e.target.value as any)}
                    id="select-student-form-badge"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700"
                  >
                    <option value="Pemula">Pemula</option>
                    <option value="Pembaca Hebat">Pembaca Hebat</option>
                    <option value="Pahlawan Buku">Pahlawan Buku</option>
                    <option value="Bintang Literasi">Bintang Literasi</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-3 mt-4">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  id="btn-student-form-submit"
                  className="px-5 py-2 rounded-xl text-white bg-primary hover:bg-blue-700 transition-all font-bold shadow-md"
                >
                  {editingStudent ? 'Simpan Data' : 'Daftarkan Siswa'}
                </button>
              </div>

            </form>
          </motion.div>
        </div>
      )}

      {/* Printable ID Card for Kids */}
      {selectedStudentCard && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-blue-200 text-left">
            <h3 className="font-extrabold text-sm text-slate-800 font-display text-center">📇 Kartu Anggota Perpustakaan Resmi</h3>
            
            {/* Visual Card Front */}
            <div className="bg-gradient-to-tr from-blue-700 via-indigo-700 to-primary rounded-2xl p-4 text-white shadow-xl relative overflow-hidden">
              <div className="absolute right-0 bottom-0 opacity-10 text-9xl select-none">📚</div>
              
              <div className="flex items-center gap-2 border-b border-white/20 pb-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold">🏫</div>
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-wider">SD NEGERI 1 SRIMENGANTEN</h4>
                  <p className="text-[8px] text-blue-200">KARTU ANGGOTA PERPUSTAKAAN DIGITAL</p>
                </div>
              </div>

              <div className="flex items-center gap-3 my-3">
                <div className="w-14 h-14 bg-white/20 rounded-xl p-1 shrink-0 border border-white/30 backdrop-blur-xs">
                  <img src={selectedStudentCard.avatarUrl} alt="Avatar" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                </div>
                <div className="min-w-0">
                  <h5 className="font-extrabold text-xs tracking-wide uppercase line-clamp-1">{selectedStudentCard.name}</h5>
                  <p className="text-[10px] text-blue-200 mt-0.5">{selectedStudentCard.className}</p>
                  <p className="text-[9px] font-mono text-yellow-300">NIS: {selectedStudentCard.nis}</p>
                </div>
              </div>

              <div className="border-t border-white/20 pt-2 flex items-center justify-between text-[9px]">
                <span>Masa Berlaku: Aktif Belajar</span>
                <span className="bg-white/20 px-2 py-0.5 rounded-full font-bold">Terdaftar</span>
              </div>
            </div>

            <div className="flex gap-2 justify-center pt-2">
              <button
                onClick={() => {
                  playHappyTune();
                  alert(`🖨️ Mencetak Kartu Anggota Perpustakaan Siswa: ${selectedStudentCard.name}`);
                }}
                className="px-4 py-2 bg-primary hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" /> Cetak Kartu Digital
              </button>
              <button
                onClick={() => setSelectedStudentCard(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
