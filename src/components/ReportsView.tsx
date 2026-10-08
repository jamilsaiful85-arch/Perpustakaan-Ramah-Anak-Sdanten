import React, { useState } from 'react';
import { Book, Student, Loan } from '../data/initialData';
import { VisitorLog } from './VisitorRegister';
import { 
  Printer, 
  TrendingUp, 
  Award, 
  Users, 
  BookOpen, 
  Clock, 
  ShieldCheck, 
  Star, 
  Download, 
  Search, 
  Calendar,
  Layers,
  Sparkles,
  CalendarDays,
  Trash2,
  FileSpreadsheet,
  FileText,
  Database,
  Building2,
  CheckCircle2,
  AlertTriangle,
  FolderDown,
  GraduationCap
} from 'lucide-react';
import { playHappyTune } from './SplashIntro';
import { SchoolLogo, LibraryLogo } from './Logos';
import { getAcademicYearInfo } from '../utils/academicYear';
import { 
  exportBooksCSV, 
  exportStudentsCSV, 
  exportLoansCSV, 
  exportVisitorsCSV, 
  exportAuditLogsCSV, 
  exportMasterExecutiveReportCSV,
  exportFullDatabaseJSON 
} from '../utils/exportHelpers';

export type ReportTabType = 'eksekutif' | 'buku' | 'sirkulasi' | 'tamu' | 'siswa' | 'audit';

interface ReportsViewProps {
  books: Book[];
  students: Student[];
  loans: Loan[];
  visitorLogs?: VisitorLog[];
  schoolIdentity: {
    name: string;
    address?: string;
    headmaster: string;
    nip: string;
    librarian: string;
    librarianNip: string;
    established: string;
  };
  activityLogs: {
    id: string;
    timestamp: string;
    formattedDate: string;
    type: 'BUKU' | 'SISWA' | 'PINJAM' | 'KEMBALI';
    activity: string;
    operator: string;
  }[];
  onClearLogs?: () => void;
}

export default function ReportsView({ 
  books, 
  students, 
  loans, 
  visitorLogs = [],
  schoolIdentity,
  activityLogs = [],
  onClearLogs
}: ReportsViewProps) {
  
  // Real-time Academic Year Info (July-Dec X to Jan-June X+1)
  const academicInfo = getAcademicYearInfo();

  // Active Report Tab View
  const [activeTab, setActiveTab] = useState<ReportTabType>('eksekutif');

  // Filters
  const [timeFilter, setTimeFilter] = useState<'all' | 'weekly' | 'monthly' | 'yearly'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loanStatusFilter, setLoanStatusFilter] = useState<'all' | 'DIPINJAM' | 'KEMBALI' | 'TERLAMBAT'>('all');
  const [classFilter, setClassFilter] = useState<string>('all');

  // Notification for downloads
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  // Core Statistics Calculations
  const totalBookTitles = books.length;
  const totalBookCopies = books.reduce((acc, b) => acc + (b.quantity || 0), 0);
  const totalAvailableCopies = books.reduce((acc, b) => acc + (b.available || 0), 0);
  const totalBorrowedCopies = totalBookCopies - totalAvailableCopies;
  
  const activeLoans = loans.filter(l => l.status === 'DIPINJAM');
  const returnedLoans = loans.filter(l => l.status === 'KEMBALI');
  const overdueLoans = loans.filter(l => l.status === 'TERLAMBAT');
  const totalFinesCollected = loans.reduce((acc, l) => acc + (l.fine || 0), 0);

  // Category distribution
  const categoryCounts: { [key: string]: { count: number; copies: number } } = {};
  books.forEach(b => {
    const cat = b.category || 'Umum';
    if (!categoryCounts[cat]) {
      categoryCounts[cat] = { count: 0, copies: 0 };
    }
    categoryCounts[cat].count += 1;
    categoryCounts[cat].copies += b.quantity;
  });

  // Class statistics counts
  const classesList = ["Kelas 1", "Kelas 2", "Kelas 3", "Kelas 4", "Kelas 5", "Kelas 6"];
  const studentsByClass = classesList.map(cls => {
    const count = students.filter(s => s.className === cls).length;
    const activeReaders = students.filter(s => s.className === cls && s.points > 50).length;
    return { name: cls, count, activeReaders };
  });

  // Calculate top students by points
  const topStudents = [...students].sort((a,b) => b.points - a.points).slice(0, 10);

  // Calculate top most-borrowed books
  const bookCountMap: { [key: string]: number } = {};
  loans.forEach(l => {
    l.bookTitles.forEach(title => {
      bookCountMap[title] = (bookCountMap[title] || 0) + 1;
    });
  });

  const popularBooks = Object.entries(bookCountMap)
    .map(([title, count]) => ({ title, count }))
    .sort((a,b) => b.count - a.count)
    .slice(0, 8);

  // Filtered Logs
  const now = new Date();
  const getFilteredLogs = () => {
    let baseLogs = [...activityLogs];
    const nowMs = now.getTime();
    const oneDayMs = 24 * 60 * 60 * 1000;

    if (timeFilter !== 'all') {
      baseLogs = baseLogs.filter(log => {
        const logDate = new Date(log.timestamp);
        const diffDays = (nowMs - logDate.getTime()) / oneDayMs;
        if (timeFilter === 'weekly') return diffDays <= 7;
        if (timeFilter === 'monthly') return diffDays <= 30;
        if (timeFilter === 'yearly') return diffDays <= 365;
        return true;
      });
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      baseLogs = baseLogs.filter(log => 
        log.activity.toLowerCase().includes(q) ||
        log.operator.toLowerCase().includes(q) ||
        log.formattedDate.toLowerCase().includes(q) ||
        log.type.toLowerCase().includes(q)
      );
    }
    return baseLogs;
  };

  const filteredLogs = getFilteredLogs();

  // Filtered Books
  const filteredBooks = books.filter(b => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q) ||
      b.publisher.toLowerCase().includes(q) ||
      b.category.toLowerCase().includes(q) ||
      b.id.toLowerCase().includes(q) ||
      b.code.toLowerCase().includes(q);
  });

  // Filtered Loans
  const filteredLoans = loans.filter(l => {
    if (loanStatusFilter !== 'all' && l.status !== loanStatusFilter) return false;
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return l.studentName.toLowerCase().includes(q) ||
      l.studentClass.toLowerCase().includes(q) ||
      l.id.toLowerCase().includes(q) ||
      l.bookTitles.some(t => t.toLowerCase().includes(q));
  });

  // Filtered Visitors
  const filteredVisitors = visitorLogs.filter(v => {
    if (classFilter !== 'all' && v.className !== classFilter) return false;
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return v.name.toLowerCase().includes(q) ||
      v.className.toLowerCase().includes(q) ||
      v.purpose.toLowerCase().includes(q) ||
      v.id.toLowerCase().includes(q);
  });

  // Filtered Students
  const filteredStudents = students.filter(s => {
    if (classFilter !== 'all' && s.className !== classFilter) return false;
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return s.name.toLowerCase().includes(q) ||
      s.nis.toLowerCase().includes(q) ||
      s.nisn.toLowerCase().includes(q) ||
      s.className.toLowerCase().includes(q) ||
      s.badge.toLowerCase().includes(q);
  });

  // Trigger Print with Audio
  const handlePrint = () => {
    playHappyTune();
    window.print();
  };

  const triggerNotice = (msg: string) => {
    setDownloadNotice(msg);
    setTimeout(() => setDownloadNotice(null), 4000);
  };

  // CSV Exporter Handlers
  const handleDownloadActiveTabCSV = () => {
    playHappyTune();
    if (activeTab === 'buku') {
      exportBooksCSV(books, academicInfo);
      triggerNotice('📄 Laporan Buku Induk Koleksi (.csv / Excel) berhasil diunduh!');
    } else if (activeTab === 'siswa') {
      exportStudentsCSV(students, academicInfo);
      triggerNotice('📄 Laporan Rekapitulasi Anggota Siswa (.csv / Excel) berhasil diunduh!');
    } else if (activeTab === 'sirkulasi') {
      exportLoansCSV(loans, academicInfo);
      triggerNotice('📄 Laporan Sirkulasi Peminjaman & Pengembalian (.csv / Excel) berhasil diunduh!');
    } else if (activeTab === 'tamu') {
      exportVisitorsCSV(visitorLogs, academicInfo);
      triggerNotice('📄 Laporan Buku Tamu & Kunjungan Pemustaka (.csv / Excel) berhasil diunduh!');
    } else if (activeTab === 'audit') {
      exportAuditLogsCSV(filteredLogs, academicInfo);
      triggerNotice('📄 Laporan Log Audit Input Realtime (.csv / Excel) berhasil diunduh!');
    } else {
      exportMasterExecutiveReportCSV({
        books,
        students,
        loans,
        visitors: visitorLogs,
        logs: activityLogs,
        schoolIdentity,
        academicInfo
      });
      triggerNotice('📊 Laporan Master Lengkap Resmi GLS (.csv / Excel) berhasil diunduh!');
    }
  };

  const handleDownloadAllMasterCSV = () => {
    playHappyTune();
    exportMasterExecutiveReportCSV({
      books,
      students,
      loans,
      visitors: visitorLogs,
      logs: activityLogs,
      schoolIdentity,
      academicInfo
    });
    triggerNotice('📦 Laporan Master Lengkap Pertanggungjawaban GLS (.csv / Excel) berhasil diunduh!');
  };

  const handleDownloadBackupJSON = () => {
    playHappyTune();
    exportFullDatabaseJSON({
      books,
      students,
      loans,
      visitors: visitorLogs,
      logs: activityLogs,
      schoolIdentity,
      academicInfo
    });
    triggerNotice('💾 Cadangan Basis Data Penuh (JSON Database) berhasil diunduh!');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-xs text-slate-600 font-semibold print-sheet">
      
      {/* Top Banner: Academic Year & Reporting Controls (Hidden in Print) */}
      <div className="no-print space-y-4">
        
        {/* Dynamic Academic Year Header Badge */}
        <div className="bg-linear-to-r from-blue-700 via-indigo-700 to-slate-900 text-white p-5 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-amber-300 shadow-inner">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] uppercase tracking-wider">
                  TAHUN AJARAN {academicInfo.academicYear}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/50 text-blue-100 font-bold text-[10px] border border-blue-300/30">
                  {academicInfo.semesterLabel}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black font-display tracking-tight text-white mt-1">
                Pusat Pelaporan & Unduh Data Resmi Perpustakaan
              </h2>
              <p className="text-[11px] text-blue-100/80 font-medium">
                Rentang Waktu: {academicInfo.periodRangeText} • Siap diserahkan kepada Kepala Sekolah, Pengawas & Kepala Dinas Pendidikan.
              </p>
            </div>
          </div>

          {/* Quick Action Export Buttons */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
            <button
              type="button"
              onClick={handleDownloadAllMasterCSV}
              title="Unduh Paket Lengkap Semua Data Excel/CSV"
              className="px-3.5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[11px] font-bold shadow-md transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
            >
              <FileSpreadsheet className="w-4 h-4" /> Unduh Master Excel (.csv)
            </button>

            <button
              type="button"
              onClick={handleDownloadBackupJSON}
              title="Cadangkan Seluruh Database Perpustakaan (JSON)"
              className="px-3.5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-[11px] font-bold shadow-md transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
            >
              <Database className="w-4 h-4" /> Arsip JSON
            </button>

            <button
              type="button"
              onClick={handlePrint}
              id="btn-print-report-main"
              className="px-4 py-2.5 bg-white hover:bg-blue-50 text-blue-900 rounded-xl text-[11px] font-black shadow-md transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
            >
              <Printer className="w-4 h-4 text-blue-700" /> Cetak PDF / Kop Resmi 🖨️
            </button>
          </div>
        </div>

        {/* Download Notice Toast Alert */}
        {downloadNotice && (
          <div className="p-3 bg-emerald-50 border-2 border-emerald-300 text-emerald-800 rounded-2xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{downloadNotice}</span>
          </div>
        )}

        {/* Interactive Tab Navigation for Report Sections */}
        <div className="flex items-center gap-1.5 overflow-x-auto p-1.5 bg-slate-200/70 rounded-2xl text-[11px]">
          <button
            type="button"
            onClick={() => { playHappyTune(); setActiveTab('eksekutif'); }}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'eksekutif' 
                ? 'bg-white text-blue-800 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-blue-600" />
            <span>1. Laporan Eksekutif & GLS</span>
          </button>

          <button
            type="button"
            onClick={() => { playHappyTune(); setActiveTab('buku'); }}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'buku' 
                ? 'bg-white text-blue-800 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-600" />
            <span>2. Buku Induk & Inventaris ({books.length})</span>
          </button>

          <button
            type="button"
            onClick={() => { playHappyTune(); setActiveTab('sirkulasi'); }}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'sirkulasi' 
                ? 'bg-white text-blue-800 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-purple-600" />
            <span>3. Sirkulasi Peminjaman ({loans.length})</span>
          </button>

          <button
            type="button"
            onClick={() => { playHappyTune(); setActiveTab('tamu'); }}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'tamu' 
                ? 'bg-white text-blue-800 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-emerald-600" />
            <span>4. Buku Tamu / Kunjungan ({visitorLogs.length})</span>
          </button>

          <button
            type="button"
            onClick={() => { playHappyTune(); setActiveTab('siswa'); }}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'siswa' 
                ? 'bg-white text-blue-800 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-rose-600" />
            <span>5. Anggota & Prestasi Siswa ({students.length})</span>
          </button>

          <button
            type="button"
            onClick={() => { playHappyTune(); setActiveTab('audit'); }}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'audit' 
                ? 'bg-white text-blue-800 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>6. Log Audit Real-time ({activityLogs.length})</span>
          </button>
        </div>

        {/* Filter Bar for Active Tab */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder={`Cari dalam tampilan ${activeTab.toUpperCase()} (Kata Kunci, Nama, Judul, Tanggal)...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:bg-white focus:outline-hidden"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="text-[10px] text-slate-400 hover:text-slate-700 font-bold px-2"
              >
                Hapus
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {activeTab === 'sirkulasi' && (
              <select
                value={loanStatusFilter}
                onChange={(e) => setLoanStatusFilter(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700"
              >
                <option value="all">Semua Status Sirkulasi</option>
                <option value="DIPINJAM">Sedang Dipinjam</option>
                <option value="KEMBALI">Sudah Dikembalikan</option>
                <option value="TERLAMBAT">Terlambat</option>
              </select>
            )}

            {(activeTab === 'siswa' || activeTab === 'tamu') && (
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700"
              >
                <option value="all">Semua Kelas / Rombel</option>
                {classesList.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            )}

            {activeTab === 'audit' && (
              <div className="flex items-center gap-1 text-[10px]">
                <button
                  type="button"
                  onClick={() => setTimeFilter('all')}
                  className={`px-2.5 py-1.5 rounded-lg font-bold ${timeFilter === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'}`}
                >
                  Semua
                </button>
                <button
                  type="button"
                  onClick={() => setTimeFilter('weekly')}
                  className={`px-2.5 py-1.5 rounded-lg font-bold ${timeFilter === 'weekly' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}
                >
                  7 Hari
                </button>
                <button
                  type="button"
                  onClick={() => setTimeFilter('monthly')}
                  className={`px-2.5 py-1.5 rounded-lg font-bold ${timeFilter === 'monthly' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}
                >
                  30 Hari
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={handleDownloadActiveTabCSV}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 shadow-xs"
            >
              <Download className="w-3.5 h-3.5" /> Unduh Tabel Ini (.csv)
            </button>
          </div>
        </div>

      </div>

      {/* PRINTABLE OFFICIAL SHEET CONTAINER */}
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-xl space-y-8 relative print-sheet text-slate-800">
        
        {/* Decorative Top Stripe for On-screen */}
        <div className="no-print absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-blue-600 via-indigo-600 to-amber-500 rounded-t-3xl" />

        {/* OFFICIAL KOP SURAT (GOVERNMENT LETTERHEAD HEADER) */}
        <div className="flex items-center justify-between border-b-4 border-double border-slate-900 pb-4 relative gap-4">
          <div className="shrink-0 flex items-center justify-center">
            <SchoolLogo className="w-20 h-20 sm:w-24 sm:h-24 drop-shadow-xs" />
          </div>

          <div className="text-center flex-1 font-display uppercase tracking-tight text-slate-900 space-y-0.5">
            <h5 className="text-[10px] sm:text-[12px] font-black tracking-widest text-slate-700">
              PEMERINTAH KABUPATEN TANGGAMUS
            </h5>
            <h4 className="text-[11px] sm:text-[13px] font-black tracking-wider text-slate-800">
              DINAS PENDIDIKAN DAN KEBUDAYAAN
            </h4>
            <h2 className="text-base sm:text-xl md:text-2xl font-black text-slate-950 leading-tight">
              {schoolIdentity.name || "SEKOLAH DASAR NEGERI 1 SRIMENGANTEN"}
            </h2>
            <h3 className="text-[10px] sm:text-[12px] font-extrabold text-blue-900 leading-none mt-1 tracking-wider uppercase">
              UNIT PELAKSANA TEKNIS PERPUSTAKAAN SEKOLAH & GERAKAN LITERASI SEKOLAH (GLS)
            </h3>
            <p className="text-[9px] text-slate-600 font-semibold tracking-wide mt-1.5 italic capitalize font-sans normal-case">
              Alamat: {schoolIdentity.address || "Jalan Babakan Linggar Pekon Srimenganten, Kecamatan Pulau Panggung Kabupaten Tanggamus, Lampung. Kodepos 35384"}
            </p>
          </div>

          <div className="shrink-0 flex items-center justify-center">
            <LibraryLogo className="w-20 h-20 sm:w-24 sm:h-24 drop-shadow-xs" />
          </div>
        </div>

        {/* REPORT SUB-HEADER & METADATA BLOCK */}
        <div className="text-center space-y-1">
          <h3 className="font-extrabold text-xs sm:text-sm uppercase tracking-wider text-slate-900 border-b-2 border-slate-800 inline-block pb-0.5">
            {activeTab === 'eksekutif' && 'LAPORAN PERTANGGUNGJAWABAN GERAKAN LITERASI SEKOLAH (GLS)'}
            {activeTab === 'buku' && 'BUKU INDUK & REKAPITULASI INVENTARIS BUKU PERPUSTAKAAN'}
            {activeTab === 'sirkulasi' && 'LAPORAN REKAPITULASI SIRKULASI PEMINJAMAN DAN PENGEMBALIAN BUKU'}
            {activeTab === 'tamu' && 'LAPORAN BUKU TAMU & REKAPITULASI KUNJUNGAN PEMUSTAKA'}
            {activeTab === 'siswa' && 'LAPORAN REKAPITULASI KEANGGOTAAN SISWA & PRESTASI BINTANG LITERASI'}
            {activeTab === 'audit' && 'LAPORAN REKAPITULASI LOG AUDIT & HISTORI INPUT REAL-TIME'}
          </h3>
          
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[10px] text-slate-600 font-semibold pt-1">
            <span className="font-bold text-slate-900">
              Tahun Ajaran: {academicInfo.academicYear} ({academicInfo.semesterLabel})
            </span>
            <span>•</span>
            <span>Periode: {academicInfo.periodRangeText}</span>
            <span>•</span>
            <span>Waktu Dokumen: {academicInfo.dateFormattedIndo}, {academicInfo.timeFormattedIndo}</span>
          </div>
        </div>

        {/* TAB 1: LAPORAN EKSEKUTIF KOMPREHENSIF */}
        {activeTab === 'eksekutif' && (
          <div className="space-y-6">
            
            {/* CORE KPI METRIC CARDS */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <div className="bg-blue-50/70 p-3.5 rounded-2xl border border-blue-200 text-left">
                <span className="text-[9px] uppercase font-bold text-blue-900 block">Koleksi Judul Buku</span>
                <span className="text-xl font-black text-blue-950 font-mono mt-0.5 block">{totalBookTitles} Judul</span>
                <span className="text-[9px] text-blue-700 font-medium">Total {totalBookCopies} Eksemplar</span>
              </div>

              <div className="bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200 text-left">
                <span className="text-[9px] uppercase font-bold text-amber-900 block">Sirkulasi Aktif</span>
                <span className="text-xl font-black text-amber-950 font-mono mt-0.5 block">{activeLoans.length} Berkas</span>
                <span className="text-[9px] text-amber-700 font-medium">{totalBorrowedCopies} Eksemplar di Siswa</span>
              </div>

              <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200 text-left">
                <span className="text-[9px] uppercase font-bold text-emerald-900 block">Anggota Siswa GLS</span>
                <span className="text-xl font-black text-emerald-950 font-mono mt-0.5 block">{students.length} Siswa</span>
                <span className="text-[9px] text-emerald-700 font-medium">100% Terdaftar Digital</span>
              </div>

              <div className="bg-purple-50/70 p-3.5 rounded-2xl border border-purple-200 text-left">
                <span className="text-[9px] uppercase font-bold text-purple-900 block">Pengunjung Buku Tamu</span>
                <span className="text-xl font-black text-purple-950 font-mono mt-0.5 block">{visitorLogs.length} Pemustaka</span>
                <span className="text-[9px] text-purple-700 font-medium">Kas Denda: Rp {totalFinesCollected.toLocaleString('id-ID')}</span>
              </div>
            </div>

            {/* TWO COLUMN ANALYSIS: CLASS PROGRESS & TOP READERS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
              
              {/* Class reading distribution table */}
              <div className="border border-slate-300 rounded-2xl p-4 text-left bg-slate-50/50 print-avoid-break">
                <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-300 pb-1.5 flex items-center justify-between">
                  <span>Distribusi Anggota & Partisipasi Per-Kelas</span>
                  <span className="text-[9px] text-blue-700 font-mono">T.A. {academicInfo.academicYear}</span>
                </h4>

                <table className="w-full text-[10px] mt-2.5 border-collapse print-table">
                  <thead>
                    <tr className="border-b border-slate-400 text-slate-800 bg-slate-100">
                      <th className="p-1.5 text-left font-bold">Rombongan Belajar</th>
                      <th className="p-1.5 text-center font-bold">Jumlah Siswa</th>
                      <th className="p-1.5 text-center font-bold">Pembaca Aktif</th>
                      <th className="p-1.5 text-right font-bold">Rasio Literasi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentsByClass.map((cls) => {
                      const ratio = cls.count > 0 ? (cls.activeReaders / cls.count) * 100 : 0;
                      return (
                        <tr key={cls.name} className="border-b border-slate-200">
                          <td className="p-1.5 font-bold text-slate-800">{cls.name}</td>
                          <td className="p-1.5 text-center font-mono">{cls.count} Siswa</td>
                          <td className="p-1.5 text-center font-mono text-emerald-700 font-bold">{cls.activeReaders}</td>
                          <td className="p-1.5 text-right font-mono font-bold text-blue-700">{ratio.toFixed(0)}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Top 5 Reading Champions */}
              <div className="border border-slate-300 rounded-2xl p-4 text-left bg-slate-50/50 print-avoid-break">
                <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-300 pb-1.5 flex items-center justify-between">
                  <span>Peringkat 5 Siswa Bintang Literasi</span>
                  <span className="text-[9px] text-amber-600 font-bold">🏆 Piala GLS</span>
                </h4>

                <div className="mt-2.5 space-y-1.5">
                  {topStudents.slice(0, 5).map((st, index) => (
                    <div key={st.id} className="flex items-center justify-between p-1.5 bg-white rounded-lg border border-slate-200 text-[10px]">
                      <div className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[9px] text-white ${index === 0 ? 'bg-amber-500' : 'bg-slate-400'}`}>
                          {index + 1}
                        </span>
                        <div>
                          <span className="font-bold text-slate-900 uppercase block leading-tight">{st.name}</span>
                          <span className="text-[8.5px] text-slate-500 font-medium">{st.className} • NISN: {st.nisn}</span>
                        </div>
                      </div>
                      <span className="font-bold font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        ⭐ {st.points} Poin
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* POPULAR BOOKS & CIRCULATION INSIGHTS */}
            <div className="border border-slate-300 rounded-2xl p-4 text-left bg-slate-50/50 print-avoid-break">
              <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-300 pb-1.5">
                Koleksi Buku Terpopuler & Sering Dipinjam Pemustaka
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 mt-2.5">
                {popularBooks.slice(0, 4).map((b, idx) => (
                  <div key={idx} className="p-2.5 bg-white rounded-xl border border-slate-200 text-left">
                    <span className="text-[9px] font-bold text-blue-600 block">Peringkat #{idx + 1}</span>
                    <p className="text-[11px] font-bold text-slate-800 line-clamp-1 mt-0.5">📖 {b.title}</p>
                    <span className="text-[9px] font-mono font-bold text-slate-500 mt-1 block">Tercatat {b.count}x Sirkulasi</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: BUKU INDUK & INVENTARIS KOLEKSI */}
        {activeTab === 'buku' && (
          <div className="space-y-4 print-avoid-break text-left">
            <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold border-b border-slate-200 pb-1">
              <span>Menampilkan {filteredBooks.length} dari {books.length} Judul Buku</span>
              <span>Total Eksemplar: {totalBookCopies} | Tersedia: {totalAvailableCopies}</span>
            </div>

            <table className="w-full text-[9px] border-collapse print-table text-slate-800">
              <thead>
                <tr className="bg-slate-100 text-slate-900 border-b border-slate-400">
                  <th className="p-1.5 text-center font-black border border-slate-300 w-8">No</th>
                  <th className="p-1.5 text-left font-black border border-slate-300">ID / Kode</th>
                  <th className="p-1.5 text-left font-black border border-slate-300">Judul Buku & Kategori</th>
                  <th className="p-1.5 text-left font-black border border-slate-300">Pengarang & Penerbit</th>
                  <th className="p-1.5 text-center font-black border border-slate-300">Tahun</th>
                  <th className="p-1.5 text-left font-black border border-slate-300">ISBN</th>
                  <th className="p-1.5 text-center font-black border border-slate-300">Lokasi Rak</th>
                  <th className="p-1.5 text-center font-black border border-slate-300">Eks.</th>
                  <th className="p-1.5 text-center font-black border border-slate-300">Ada</th>
                </tr>
              </thead>
              <tbody>
                {filteredBooks.map((b, idx) => (
                  <tr key={b.id} className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="p-1.5 text-center font-mono border border-slate-200">{idx + 1}</td>
                    <td className="p-1.5 font-mono font-bold border border-slate-200">{b.id} ({b.code})</td>
                    <td className="p-1.5 border border-slate-200">
                      <span className="font-bold text-slate-900 block">{b.title}</span>
                      <span className="text-[8px] text-slate-500">{b.category}</span>
                    </td>
                    <td className="p-1.5 border border-slate-200">
                      <span className="block">{b.author}</span>
                      <span className="text-[8px] text-slate-500">{b.publisher}</span>
                    </td>
                    <td className="p-1.5 text-center font-mono border border-slate-200">{b.year}</td>
                    <td className="p-1.5 font-mono text-[8px] border border-slate-200">{b.isbn}</td>
                    <td className="p-1.5 text-center border border-slate-200 font-medium">{b.shelf}</td>
                    <td className="p-1.5 text-center font-mono font-bold border border-slate-200">{b.quantity}</td>
                    <td className="p-1.5 text-center font-mono font-bold text-emerald-700 border border-slate-200">{b.available}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: REKAPITULASI SIRKULASI */}
        {activeTab === 'sirkulasi' && (
          <div className="space-y-4 print-avoid-break text-left">
            <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold border-b border-slate-200 pb-1">
              <span>Menampilkan {filteredLoans.length} dari {loans.length} Berkas Sirkulasi</span>
              <span>Aktif: {activeLoans.length} | Kembali: {returnedLoans.length} | Terlambat: {overdueLoans.length}</span>
            </div>

            <table className="w-full text-[9px] border-collapse print-table text-slate-800">
              <thead>
                <tr className="bg-slate-100 text-slate-900 border-b border-slate-400">
                  <th className="p-1.5 text-center font-black border border-slate-300 w-8">No</th>
                  <th className="p-1.5 text-left font-black border border-slate-300">ID Berkas</th>
                  <th className="p-1.5 text-left font-black border border-slate-300">Nama Siswa & Kelas</th>
                  <th className="p-1.5 text-left font-black border border-slate-300">Judul Buku Dipinjam</th>
                  <th className="p-1.5 text-center font-black border border-slate-300">Tgl Pinjam</th>
                  <th className="p-1.5 text-center font-black border border-slate-300">Jatuh Tempo</th>
                  <th className="p-1.5 text-center font-black border border-slate-300">Tgl Kembali</th>
                  <th className="p-1.5 text-center font-black border border-slate-300">Status</th>
                  <th className="p-1.5 text-right font-black border border-slate-300">Denda</th>
                </tr>
              </thead>
              <tbody>
                {filteredLoans.map((l, idx) => (
                  <tr key={l.id} className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="p-1.5 text-center font-mono border border-slate-200">{idx + 1}</td>
                    <td className="p-1.5 font-mono font-bold border border-slate-200">{l.id}</td>
                    <td className="p-1.5 border border-slate-200">
                      <span className="font-bold text-slate-900 block uppercase">{l.studentName}</span>
                      <span className="text-[8px] text-slate-500">{l.studentClass} • {l.studentId}</span>
                    </td>
                    <td className="p-1.5 border border-slate-200 font-medium">
                      {l.bookTitles.join('; ')}
                    </td>
                    <td className="p-1.5 text-center font-mono border border-slate-200">{l.loanDate}</td>
                    <td className="p-1.5 text-center font-mono border border-slate-200">{l.dueDate}</td>
                    <td className="p-1.5 text-center font-mono border border-slate-200">{l.returnDate || '-'}</td>
                    <td className="p-1.5 text-center border border-slate-200 font-bold">
                      <span className={`px-2 py-0.5 rounded text-[8px] ${
                        l.status === 'DIPINJAM' ? 'bg-amber-100 text-amber-900' :
                        l.status === 'KEMBALI' ? 'bg-emerald-100 text-emerald-900' :
                        'bg-rose-100 text-rose-900'
                      }`}>
                        {l.status}
                      </span>
                    </td>
                    <td className="p-1.5 text-right font-mono font-bold border border-slate-200">
                      {l.fine ? `Rp ${l.fine.toLocaleString('id-ID')}` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 4: BUKU TAMU & KUNJUNGAN */}
        {activeTab === 'tamu' && (
          <div className="space-y-4 print-avoid-break text-left">
            <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold border-b border-slate-200 pb-1">
              <span>Menampilkan {filteredVisitors.length} dari {visitorLogs.length} Kunjungan Pemustaka</span>
              <span>Tahun Ajaran: {academicInfo.academicYear}</span>
            </div>

            <table className="w-full text-[9px] border-collapse print-table text-slate-800">
              <thead>
                <tr className="bg-slate-100 text-slate-900 border-b border-slate-400">
                  <th className="p-1.5 text-center font-black border border-slate-300 w-8">No</th>
                  <th className="p-1.5 text-left font-black border border-slate-300">ID / Waktu Kunjungan</th>
                  <th className="p-1.5 text-left font-black border border-slate-300">Nama Pengunjung</th>
                  <th className="p-1.5 text-left font-black border border-slate-300">Kelas / Status</th>
                  <th className="p-1.5 text-left font-black border border-slate-300">Keperluan / Aktivitas</th>
                  <th className="p-1.5 text-center font-black border border-slate-300">Kepuasan</th>
                </tr>
              </thead>
              <tbody>
                {filteredVisitors.map((v, idx) => (
                  <tr key={v.id} className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="p-1.5 text-center font-mono border border-slate-200">{idx + 1}</td>
                    <td className="p-1.5 border border-slate-200">
                      <span className="font-mono font-bold block">{v.id}</span>
                      <span className="text-[8px] text-slate-500">{v.formattedDate}</span>
                    </td>
                    <td className="p-1.5 font-bold uppercase text-slate-900 border border-slate-200">{v.name}</td>
                    <td className="p-1.5 border border-slate-200 font-medium">{v.className}</td>
                    <td className="p-1.5 border border-slate-200">{v.purpose}</td>
                    <td className="p-1.5 text-center border border-slate-200 font-mono text-amber-600 font-bold">
                      {v.rating ? `${v.rating} ⭐` : '5 ⭐'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 5: REKAPITULASI SISWA & PRESTASI GLS */}
        {activeTab === 'siswa' && (
          <div className="space-y-4 print-avoid-break text-left">
            <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold border-b border-slate-200 pb-1">
              <span>Menampilkan {filteredStudents.length} dari {students.length} Siswa Terdaftar</span>
              <span>Kategori: Rombel Kelas 1 s/d 6 SDN 1 Srimenganten</span>
            </div>

            <table className="w-full text-[9px] border-collapse print-table text-slate-800">
              <thead>
                <tr className="bg-slate-100 text-slate-900 border-b border-slate-400">
                  <th className="p-1.5 text-center font-black border border-slate-300 w-8">No</th>
                  <th className="p-1.5 text-left font-black border border-slate-300">NIS / NISN</th>
                  <th className="p-1.5 text-left font-black border border-slate-300">Nama Lengkap Siswa</th>
                  <th className="p-1.5 text-center font-black border border-slate-300">JK</th>
                  <th className="p-1.5 text-center font-black border border-slate-300">Kelas</th>
                  <th className="p-1.5 text-left font-black border border-slate-300">Tempat, Tanggal Lahir</th>
                  <th className="p-1.5 text-center font-black border border-slate-300">Bintang GLS</th>
                  <th className="p-1.5 text-right font-black border border-slate-300">Poin Literasi</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((s, idx) => (
                  <tr key={s.id} className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="p-1.5 text-center font-mono border border-slate-200">{idx + 1}</td>
                    <td className="p-1.5 font-mono border border-slate-200">
                      <span className="font-bold block">{s.nis}</span>
                      <span className="text-[8px] text-slate-500">{s.nisn}</span>
                    </td>
                    <td className="p-1.5 font-bold uppercase text-slate-900 border border-slate-200">{s.name}</td>
                    <td className="p-1.5 text-center font-bold border border-slate-200">{s.gender}</td>
                    <td className="p-1.5 text-center font-bold text-blue-800 border border-slate-200">{s.className}</td>
                    <td className="p-1.5 border border-slate-200 text-[8.5px]">{s.birthPlace}, {s.birthDate}</td>
                    <td className="p-1.5 text-center border border-slate-200 font-bold text-indigo-700">{s.badge}</td>
                    <td className="p-1.5 text-right font-mono font-bold text-amber-700 border border-slate-200">⭐ {s.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 6: AUDIT LOG INPUT REALTIME */}
        {activeTab === 'audit' && (
          <div className="space-y-4 print-avoid-break text-left">
            <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold border-b border-slate-200 pb-1">
              <span>Menampilkan {filteredLogs.length} dari {activityLogs.length} Log Aktivitas Realtime</span>
              {onClearLogs && (
                <button
                  type="button"
                  onClick={onClearLogs}
                  className="no-print text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" /> Kosongkan Histori
                </button>
              )}
            </div>

            <table className="w-full text-[9px] border-collapse print-table text-slate-800">
              <thead>
                <tr className="bg-slate-100 text-slate-900 border-b border-slate-400">
                  <th className="p-1.5 text-center font-black border border-slate-300 w-8">No</th>
                  <th className="p-1.5 text-left font-black border border-slate-300">ID Log</th>
                  <th className="p-1.5 text-left font-black border border-slate-300">Waktu & Tanggal Input</th>
                  <th className="p-1.5 text-center font-black border border-slate-300">Kategori</th>
                  <th className="p-1.5 text-left font-black border border-slate-300">Rincian Aktivitas Lapangan</th>
                  <th className="p-1.5 text-left font-black border border-slate-300">Petugas Penginput</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log, idx) => (
                  <tr key={log.id} className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="p-1.5 text-center font-mono border border-slate-200">{idx + 1}</td>
                    <td className="p-1.5 font-mono font-bold border border-slate-200">{log.id}</td>
                    <td className="p-1.5 border border-slate-200">{log.formattedDate}</td>
                    <td className="p-1.5 text-center border border-slate-200 font-bold">{log.type}</td>
                    <td className="p-1.5 border border-slate-200 font-medium">{log.activity}</td>
                    <td className="p-1.5 border border-slate-200 font-bold uppercase">{log.operator}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* OFFICIAL DUAL SIGNATURE BLOCK (PENGESAHAN KEPSEK & PUSTAKAWAN) */}
        <div className="pt-8 text-center text-xs text-slate-900 print-avoid-break">
          <div className="grid grid-cols-2 gap-6">
            
            {/* Left: Kepala Sekolah */}
            <div>
              <span className="block italic text-slate-500 text-[10px]">Mengetahui & Menyetujui,</span>
              <span className="font-bold block uppercase mt-0.5 text-slate-900 text-[11px]">
                Kepala Sekolah {schoolIdentity.name || 'SDN 1 SRIMENGANTEN'}
              </span>
              
              <div className="h-16 flex items-center justify-center my-1">
                <div className="border border-indigo-200 bg-indigo-50/30 py-1.5 px-4 rounded-lg transform -rotate-1 select-none">
                  <span className="font-serif italic font-extrabold text-[13px] text-indigo-700 tracking-wider font-display block leading-none">
                    {schoolIdentity.headmaster}
                  </span>
                  <span className="text-[7.5px] text-slate-400 font-mono block mt-0.5">verified digital sign</span>
                </div>
              </div>

              <span className="font-black block uppercase text-slate-950 text-xs select-none underline decoration-1">
                {schoolIdentity.headmaster}
              </span>
              <span className="font-mono text-[9.5px] text-slate-700 font-bold block mt-0.5">
                NIP. {schoolIdentity.nip || '19850810 2014061 003'}
              </span>
            </div>

            {/* Right: Petugas Perpustakaan */}
            <div>
              <span className="block italic text-slate-500 text-[10px]">
                Srimenganten, {academicInfo.dateFormattedIndo}
              </span>
              <span className="font-bold block uppercase mt-0.5 text-slate-900 text-[11px]">
                Petugas Pengelola Perpustakaan
              </span>
              
              <div className="h-16 flex items-center justify-center my-1">
                <div className="border border-emerald-200 bg-emerald-50/30 py-1.5 px-4 rounded-lg transform rotate-1 select-none">
                  <span className="font-serif italic font-extrabold text-[13px] text-emerald-700 tracking-wider font-display block leading-none">
                    {schoolIdentity.librarian}
                  </span>
                  <span className="text-[7.5px] text-slate-400 font-mono block mt-0.5">verified digital sign</span>
                </div>
              </div>

              <span className="font-black block uppercase text-slate-950 text-xs select-none underline decoration-1">
                {schoolIdentity.librarian}
              </span>
              <span className="font-mono text-[9.5px] text-slate-700 font-bold block mt-0.5">
                NIP. {schoolIdentity.librarianNip ? (schoolIdentity.librarianNip === '-' ? '-' : schoolIdentity.librarianNip.replace('- (Belum Memiliki NIP)', '-')) : '-'}
              </span>
            </div>

          </div>

          <p className="text-[8px] text-slate-400 italic text-center mt-6">
            * Berkas laporan ini diterbitkan secara resmi melalui Sistem Informasi Perpustakaan Digital SDN 1 Srimenganten dan sah digunakan untuk pelaporan dinas/akreditasi.
          </p>
        </div>

      </div>

    </div>
  );
}
