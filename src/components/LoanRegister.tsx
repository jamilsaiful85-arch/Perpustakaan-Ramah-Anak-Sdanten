import React, { useState } from 'react';
import { Book, Student, Loan } from '../data/initialData';
import { Search, Plus, Calendar, CheckCircle, Trash2, Printer, AlertCircle, Sparkles, UserCheck, BookOpen, Lock, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { playHappyTune } from './SplashIntro';

interface LoanRegisterProps {
  books: Book[];
  students: Student[];
  onAddLoan: (loan: Loan) => void;
  maxDays: number;
  isAdmin?: boolean;
  onRequireAdmin?: () => void;
}

export default function LoanRegister({ 
  books, 
  students, 
  onAddLoan, 
  maxDays,
  isAdmin = false,
  onRequireAdmin
}: LoanRegisterProps) {
  // Autocomplete state
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentSearch, setStudentSearch] = useState('');
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);

  const [selectedBooks, setSelectedBooks] = useState<Book[]>([]);
  const [bookSearch, setBookSearch] = useState('');
  const [showBookDropdown, setShowBookDropdown] = useState(false);

  const [loanDate, setLoanDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Calculate default return date based on settings (maxDays)
  const defaultDueDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + maxDays);
    return d.toISOString().split('T')[0];
  };
  const [dueDate, setDueDate] = useState(defaultDueDate());

  // Visual success receipt modal
  const [successReceipt, setSuccessReceipt] = useState<Loan | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Search autocompletes
  const matchingStudents = students.filter(s => 
    s.name.toLowerCase().includes(studentSearch.toLowerCase()) || 
    s.nis.includes(studentSearch)
  );

  const matchingBooks = books.filter(b => 
    b.title.toLowerCase().includes(bookSearch.toLowerCase()) ||
    b.code.toLowerCase().includes(bookSearch.toLowerCase()) ||
    b.id.toLowerCase().includes(bookSearch.toLowerCase())
  );

  const handleSelectStudent = (s: Student) => {
    setSelectedStudent(s);
    setStudentSearch(`${s.name} (${s.className})`);
    setShowStudentDropdown(false);
    playHappyTune();
  };

  const handleAddBookToLoan = (b: Book) => {
    if (selectedBooks.some(item => item.id === b.id)) {
      setErrorMsg("⚠️ Buku ini sudah terdaftar dalam antrean pinjam!");
      setTimeout(() => setErrorMsg(null), 3000);
      return;
    }
    if (b.available <= 0) {
      setErrorMsg("❌ Stok fisik buku habis! Harap tunggu peminjaman sebelumnya dikembalikan.");
      setTimeout(() => setErrorMsg(null), 3000);
      return;
    }
    if (selectedBooks.length >= 3) {
      setErrorMsg("⚠️ Batas maksimal peminjaman adalah 3 buku anak sekaligus!");
      setTimeout(() => setErrorMsg(null), 3000);
      return;
    }

    setSelectedBooks(prev => [...prev, b]);
    setBookSearch('');
    setShowBookDropdown(false);
    playHappyTune();
  };

  const handleRemoveBookFromSelection = (id: string) => {
    setSelectedBooks(prev => prev.filter(b => b.id !== id));
  };

  const submitLoan = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAdmin && onRequireAdmin) {
      onRequireAdmin();
      return;
    }

    if (!selectedStudent) {
      setErrorMsg("⚠️ Harap pilih siswa anggota perpustakaan terlebih dahulu!");
      setTimeout(() => setErrorMsg(null), 3000);
      return;
    }
    if (selectedBooks.length === 0) {
      setErrorMsg("⚠️ Harap masukkan minimal 1 buku yang akan dipinjam!");
      setTimeout(() => setErrorMsg(null), 3000);
      return;
    }

    const newLoanId = `LN-${Date.now().toString().slice(-6)}`;
    const newL: Loan = {
      id: newLoanId,
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      studentClass: selectedStudent.className,
      bookIds: selectedBooks.map(b => b.id),
      bookTitles: selectedBooks.map(b => b.title),
      loanDate,
      dueDate,
      fine: 0,
      status: 'DIPINJAM'
    };

    onAddLoan(newL);
    setSuccessReceipt(newL);
    playHappyTune();

    // Reset loop
    setSelectedStudent(null);
    setStudentSearch('');
    setSelectedBooks([]);
  };

  const printReceipt = () => {
    playHappyTune();
    alert(`🖨️ Mencetak Bukti Peminjaman Buku: ${successReceipt?.id}`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 text-xs font-semibold text-slate-600">
      
      {!isAdmin && (
        <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl flex items-center justify-between text-left">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="text-[11px] text-amber-900 font-medium">
              Mode Pengunjung Aktif. Anda dapat melihat alur sirkulasi, namun pencatatan pinjaman baru memerlukan wewenang Petugas Perpustakaan.
            </span>
          </div>
          <button
            onClick={onRequireAdmin}
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-[11px] font-bold shrink-0 cursor-pointer shadow-xs"
          >
            Buka Akses Petugas
          </button>
        </div>
      )}

      {/* Visual error banner popup */}
      <AnimatePresence>
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-rose-500 text-white p-3 rounded-2xl text-center text-xs font-bold font-display shadow-md flex items-center justify-center gap-1.5 z-30"
          >
            <AlertCircle className="w-4 h-4" />
            <span>{errorMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="glass-panel p-6 rounded-3xl border border-white space-y-6 shadow-lg text-left">
        
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <h2 className="text-base font-extrabold text-slate-800 font-display flex items-center gap-2">
            <span>📖</span> Formulir Sirkulasi Peminjaman Buku Baru
          </h2>
          <span className="text-[11px] bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-bold">
            Maksimal {maxDays} Hari Pinjam
          </span>
        </div>

        <form onSubmit={submitLoan} className="space-y-5">
          
          {/* Step 1: Member Selection */}
          <div className="space-y-1.5 relative">
            <label className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-blue-500" />
              <span>1. Identifikasi Anggota Siswa (Cari Nama / NIS) *</span>
            </label>
            
            <div className="relative">
              <input
                type="text"
                value={studentSearch}
                onFocus={() => setShowStudentDropdown(true)}
                onChange={(e) => {
                  setStudentSearch(e.target.value);
                  setShowStudentDropdown(true);
                  setSelectedStudent(null);
                }}
                placeholder="Ketik nama siswa atau scan barcode kartu siswa..."
                id="input-loan-student"
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-700 font-medium focus:border-blue-400"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
            </div>

            {/* Dropdown Suggestions */}
            {showStudentDropdown && matchingStudents.length > 0 && !selectedStudent && (
              <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-48 overflow-y-auto divide-y divide-slate-100">
                {matchingStudents.map(s => (
                  <div
                    key={s.id}
                    onClick={() => handleSelectStudent(s)}
                    className="p-2.5 hover:bg-blue-50 cursor-pointer flex items-center justify-between transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-blue-100 p-0.5 shrink-0">
                        <img src={s.avatarUrl} alt="av" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-slate-800 uppercase">{s.name}</h4>
                        <p className="text-[10px] text-slate-400 font-mono">NIS: {s.nis}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">{s.className}</span>
                  </div>
                ))}
              </div>
            )}

            {selectedStudent && (
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between animate-in fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 p-1 shrink-0">
                    <img src={selectedStudent.avatarUrl} alt="av" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-emerald-900 uppercase">{selectedStudent.name}</h4>
                    <p className="text-[10px] text-emerald-700 font-medium">{selectedStudent.className} • NIS: {selectedStudent.nis}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => { setSelectedStudent(null); setStudentSearch(''); }}
                  className="text-xs text-slate-400 hover:text-rose-600 font-bold px-2 py-1"
                >
                  Ganti
                </button>
              </div>
            )}
          </div>

          {/* Step 2: Book Selection */}
          <div className="space-y-1.5 relative">
            <label className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-blue-500" />
              <span>2. Pilih Buku Yang Dipinjam (Maks. 3 Buku) *</span>
            </label>

            <div className="relative">
              <input
                type="text"
                value={bookSearch}
                onFocus={() => setShowBookDropdown(true)}
                onChange={(e) => {
                  setBookSearch(e.target.value);
                  setShowBookDropdown(true);
                }}
                placeholder="Cari judul buku atau kode inventaris..."
                id="input-loan-book"
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-700 font-medium focus:border-blue-400"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
            </div>

            {/* Book Dropdown */}
            {showBookDropdown && matchingBooks.length > 0 && (
              <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-52 overflow-y-auto divide-y divide-slate-100">
                {matchingBooks.map(b => (
                  <div
                    key={b.id}
                    onClick={() => handleAddBookToLoan(b)}
                    className="p-2.5 hover:bg-blue-50 cursor-pointer flex items-center justify-between transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{b.emoji}</span>
                      <div>
                        <h4 className="font-bold text-xs text-slate-800">{b.title}</h4>
                        <p className="text-[10px] text-slate-400">Kode: {b.code} • {b.category}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${b.available > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                      Stok: {b.available}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Selected Books Basket */}
            {selectedBooks.length > 0 && (
              <div className="space-y-2 mt-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Buku Yang Dipilih:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {selectedBooks.map(b => (
                    <div
                      key={b.id}
                      className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-lg">{b.emoji}</span>
                        <div className="min-w-0">
                          <h5 className="font-bold text-[11px] text-slate-800 truncate">{b.title}</h5>
                          <span className="text-[9px] text-blue-600 font-mono">{b.id}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveBookFromSelection(b.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded-md"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Step 3: Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 border-t border-slate-100 pt-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-blue-500" /> Tanggal Peminjaman
              </label>
              <input
                type="date"
                required
                value={loanDate}
                onChange={(e) => setLoanDate(e.target.value)}
                id="input-loan-date"
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-amber-500" /> Batas Pengembalian (Jatuh Tempo)
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                id="input-loan-due"
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              id="btn-submit-loan-register"
              className="px-6 py-2.5 bg-primary hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Proses & Catat Peminjaman
            </button>
          </div>

        </form>
      </div>

      {/* Success Printable Receipt Modal */}
      {successReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-blue-200 text-left">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-base text-slate-800 font-display">Peminjaman Berhasil Dicatat!</h3>
              <p className="text-xs text-slate-400">Kode Transaksi: <strong className="font-mono text-slate-700">{successReceipt.id}</strong></p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Nama Peminjam:</span>
                <span className="font-bold text-slate-800">{successReceipt.studentName} ({successReceipt.studentClass})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Tanggal Pinjam:</span>
                <span className="font-bold text-slate-800">{successReceipt.loanDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Batas Kembali:</span>
                <span className="font-bold text-rose-600">{successReceipt.dueDate}</span>
              </div>
              <div className="border-t border-slate-200 pt-2">
                <span className="text-slate-500 font-medium block mb-1">Daftar Buku:</span>
                <ul className="list-disc list-inside text-[11px] text-slate-700 font-bold space-y-0.5">
                  {successReceipt.bookTitles.map((t, idx) => (
                    <li key={idx}>{t}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex gap-2 justify-center pt-2">
              <button
                onClick={printReceipt}
                className="px-4 py-2 bg-primary hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" /> Cetak Bukti Pinjam
              </button>
              <button
                onClick={() => setSuccessReceipt(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
