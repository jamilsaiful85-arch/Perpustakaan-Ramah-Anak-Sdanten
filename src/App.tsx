import React, { useState, useEffect } from 'react';
import SplashIntro, { playHappyTune, UserRoleType } from './components/SplashIntro';
import GoogleLoginPage from './components/GoogleLoginPage';
import MascotKumbi from './components/MascotKumbi';
import BookList from './components/BookList';
import StudentList from './components/StudentList';
import LoanRegister from './components/LoanRegister';
import ReturnRegister from './components/ReturnRegister';
import ReportsView from './components/ReportsView';
import SettingsView from './components/SettingsView';
import VisitorRegister, { VisitorLog } from './components/VisitorRegister';
import AdminAuthModal from './components/AdminAuthModal';
import TimelineVideos from './components/TimelineVideos';
import PhotoGalleryView from './components/PhotoGalleryView';
import SoundtrackPlayer from './components/SoundtrackPlayer';
import { SchoolLogo, LibraryLogo } from './components/Logos';
import { getAcademicYearInfo } from './utils/academicYear';

import { 
  INITIAL_BOOKS, 
  INITIAL_STUDENTS, 
  LITERACY_QUOTES, 
  Book, 
  Student, 
  Loan 
} from './data/initialData';

import {
  auth,
  signOut,
  onAuthStateChanged,
  type FirebaseUser,
  testConnection
} from './lib/firebase';

import {
  initializeDatabaseIfNeeded,
  subscribeToBooks,
  subscribeToStudents,
  subscribeToLoans,
  subscribeToVisitors,
  subscribeToActivities,
  subscribeToSettings,
  subscribeToGallery,
  syncUserProfile,
  AppUser,
  dbSaveBook,
  dbDeleteBook,
  dbSaveStudent,
  dbDeleteStudent,
  dbSaveLoan,
  dbDeleteLoan,
  dbSaveVisitor,
  dbDeleteVisitor,
  dbClearVisitors,
  dbSaveActivityLog,
  dbSaveSettings,
  ActivityLogItem,
  GalleryPhotoItem,
  INITIAL_GALLERY_PHOTOS,
  SchoolIdentity,
  DEFAULT_SCHOOL_SETTINGS
} from './lib/firestoreService';

import { 
  BookOpen, 
  Users, 
  Compass, 
  ArrowLeftRight, 
  Clock, 
  FileText, 
  Settings, 
  Volume2, 
  VolumeX, 
  LogOut, 
  Star, 
  Info, 
  ShieldCheck,
  UserCheck,
  Lock,
  Unlock,
  Cloud,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Youtube,
  Images,
  FolderOpen
} from 'lucide-react';

export default function App() {
  // Application Entry state
  const [currentUserRole, setCurrentUserRole] = useState<UserRoleType | null>(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [showAdminModal, setShowAdminModal] = useState<boolean>(false);
  
  // App Data State (Real-time Cloud Database + Local Fallback)
  const [books, setBooks] = useState<Book[]>(INITIAL_BOOKS);
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [visitorLogs, setVisitorLogs] = useState<VisitorLog[]>([]);
  const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhotoItem[]>(INITIAL_GALLERY_PHOTOS);
  
  // Google Auth & User State
  const [authCurrentUser, setAuthCurrentUser] = useState<FirebaseUser | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [hasChosenGuestMode, setHasChosenGuestMode] = useState<boolean>(false);
  const [activityFilter, setActivityFilter] = useState<'ALL' | 'KUNJUNGAN' | 'PINJAM' | 'BUKU' | 'GALERI'>('ALL');

  // Customization States
  const [maxDays, setMaxDays] = useState(7);
  const [finePerDay, setFinePerDay] = useState(500);
  const [schoolIdentity, setSchoolIdentity] = useState<SchoolIdentity>(DEFAULT_SCHOOL_SETTINGS);

  // Real-time activity logs state for input recap
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>([]);

  // UI Control states
  const [activeMenu, setActiveMenu] = useState<'dashboard' | 'buku' | 'siswa' | 'pinjam' | 'kembali' | 'laporan' | 'pengaturan' | 'panduan' | 'kunjungan' | 'linimasa' | 'galeri'>('dashboard');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeQuote, setActiveQuote] = useState(LITERACY_QUOTES[0]);
  const [isCloudSynced, setIsCloudSynced] = useState(false);

  // Dynamic Academic Year Info (July-Dec X -> X/(X+1), Jan-June X+1 -> X/(X+1))
  const academicInfo = getAcademicYearInfo();

  // Initialize Firestore on App Mount & Attach Real-Time Listeners
  useEffect(() => {
    testConnection();
    initializeDatabaseIfNeeded();

    // Listen to Google Auth State Changes
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setAuthCurrentUser(user);
        try {
          const profile = await syncUserProfile(user);
          setAppUser(profile);
          if (user.email?.toLowerCase() === 'jamilsaiful85@gmail.com') {
            setIsAdminAuthenticated(true);
            setCurrentUserRole('admin');
          }
        } catch (e) {
          console.warn("Could not sync user profile:", e);
        }
      } else {
        setAuthCurrentUser(null);
        setAppUser(null);
      }
      setAuthLoading(false);
    });

    // Subscribe to Books
    const unsubBooks = subscribeToBooks((cloudBooks) => {
      if (cloudBooks && cloudBooks.length > 0) {
        setBooks(cloudBooks);
      }
      setIsCloudSynced(true);
    });

    // Subscribe to Students
    const unsubStudents = subscribeToStudents((cloudStudents) => {
      if (cloudStudents && cloudStudents.length > 0) {
        setStudents(cloudStudents);
      }
      setIsCloudSynced(true);
    });

    // Subscribe to Loans
    const unsubLoans = subscribeToLoans((cloudLoans) => {
      setLoans(cloudLoans || []);
      setIsCloudSynced(true);
    });

    // Subscribe to Visitors
    const unsubVisitors = subscribeToVisitors((cloudVisitors) => {
      setVisitorLogs(cloudVisitors || []);
      setIsCloudSynced(true);
    });

    // Subscribe to Activity Logs
    const unsubActivities = subscribeToActivities((cloudActivities) => {
      setActivityLogs(cloudActivities || []);
      setIsCloudSynced(true);
    });

    // Subscribe to Settings
    const unsubSettings = subscribeToSettings((settingsData) => {
      if (settingsData) {
        setSchoolIdentity(settingsData.identity);
        setMaxDays(settingsData.maxDays);
        setFinePerDay(settingsData.finePerDay);
      }
      setIsCloudSynced(true);
    });

    // Subscribe to Gallery Photos
    const unsubGallery = subscribeToGallery((cloudPhotos) => {
      if (cloudPhotos && cloudPhotos.length > 0) {
        setGalleryPhotos(cloudPhotos);
      }
      setIsCloudSynced(true);
    });

    // Rotate quotes on timer
    const quoteInterval = setInterval(() => {
      const index = Math.floor(Math.random() * LITERACY_QUOTES.length);
      setActiveQuote(LITERACY_QUOTES[index]);
    }, 15000);

    return () => {
      unsubAuth();
      unsubBooks();
      unsubStudents();
      unsubLoans();
      unsubVisitors();
      unsubActivities();
      unsubSettings();
      unsubGallery();
      clearInterval(quoteInterval);
    };
  }, []);

  // Safe helper to build structured timestamp in indonesian WIB format
  const createFormattedDateTime = () => {
    const d = new Date();
    const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    
    const dayName = days[d.getDay()];
    const date = d.getDate();
    const monthName = months[d.getMonth()];
    const year = d.getFullYear();
    
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    const ss = String(d.getSeconds()).padStart(2, '0');
    
    return `${dayName}, ${date} ${monthName} ${year} • ${hh}:${mm}:${ss} WIB`;
  };

  const addActivityLog = async (type: 'BUKU' | 'SISWA' | 'PINJAM' | 'KEMBALI' | 'SISTEM' | 'KUNJUNGAN' | 'GALERI' | 'MASUK', activity: string) => {
    const displayName = authCurrentUser?.displayName || (currentUserRole === 'kepsek' ? 'Saiful Jamil, M.Pd.' : 'Pengunjung');
    const operatorName = isAdminAuthenticated 
      ? `🛡️ ${displayName} (Admin)` 
      : currentUserRole === 'kepsek' 
      ? `👑 ${displayName} (Kepsek)` 
      : `🎒 ${displayName}`;

    const newLog: ActivityLogItem = {
      id: "LOG-" + Math.floor(100000 + Math.random() * 900000),
      timestamp: new Date().toISOString(),
      formattedDate: createFormattedDateTime(),
      type,
      activity,
      operator: operatorName,
      userEmail: authCurrentUser?.email || undefined,
      userPhoto: authCurrentUser?.photoURL || undefined
    };
    
    try {
      await dbSaveActivityLog(newLog);
    } catch (e) {
      console.warn("Local log saved:", e);
      setActivityLogs(prev => [newLog, ...prev]);
    }
  };

  const handleGoogleLogout = async () => {
    if (soundEnabled) {
      try { playHappyTune(); } catch(e){}
    }
    try {
      await signOut(auth);
    } catch (e) {
      console.error("Sign out error:", e);
    }
    setAuthCurrentUser(null);
    setAppUser(null);
    setCurrentUserRole(null);
    setIsAdminAuthenticated(false);
    setHasChosenGuestMode(false);
  };

  // Sound triggering sound effect simple synthesis
  const handleMenuClick = (menu: typeof activeMenu) => {
    setActiveMenu(menu);
    if (soundEnabled) {
      playHappyTune();
    }
  };

  // When user selects a role from splash
  const handleRoleSelection = (role: UserRoleType) => {
    setCurrentUserRole(role);
    if (role === 'admin' || role === 'petugas') {
      setShowAdminModal(true);
    } else {
      setIsAdminAuthenticated(false);
    }
  };

  // Add / Update / Delete Student
  const handleAddStudent = async (s: Student) => {
    await dbSaveStudent(s);
    addActivityLog('SISWA', `Mendaftarkan Siswa Baru: ${s.name} (${s.className})`);
  };

  const handleUpdateStudent = async (s: Student) => {
    await dbSaveStudent(s);
    addActivityLog('SISWA', `Memperbarui Profil Siswa: ${s.name} (${s.className})`);
  };

  const handleDeleteStudent = async (id: string) => {
    const target = students.find(s => s.id === id);
    await dbDeleteStudent(id);
    if (target) {
      addActivityLog('SISWA', `Menghapus Keanggotaan Siswa: ${target.name} (NIS: ${target.nis})`);
    }
  };

  // Add / Update / Delete Book
  const handleAddBook = async (b: Book) => {
    await dbSaveBook(b);
    addActivityLog('BUKU', `Menambahkan Judul Buku Baru: "${b.title}" (${b.category})`);
  };

  const handleUpdateBook = async (b: Book) => {
    await dbSaveBook(b);
    addActivityLog('BUKU', `Memperbarui Data Buku: "${b.title}"`);
  };

  const handleDeleteBook = async (id: string) => {
    const target = books.find(b => b.id === id);
    await dbDeleteBook(id);
    if (target) {
      addActivityLog('BUKU', `Menghapus Buku Dari Katalog: "${target.title}"`);
    }
  };

  // Add Borrow Transaction Loan
  const handleAddLoan = async (newL: Loan) => {
    // 1. Save Loan
    await dbSaveLoan(newL);

    // 2. Deduct book available quantities in Firestore
    for (const b of books) {
      if (newL.bookIds.includes(b.id)) {
        await dbSaveBook({
          ...b,
          available: Math.max(0, b.available - 1)
        });
      }
    }

    // 3. Increase student points by 20 on successful loans trigger
    const targetStudent = students.find(st => st.id === newL.studentId);
    if (targetStudent) {
      const nextPts = targetStudent.points + 20;
      let nextBadge = targetStudent.badge;
      if (nextPts >= 500) nextBadge = 'Bintang Literasi';
      else if (nextPts >= 300) nextBadge = 'Pahlawan Buku';
      else if (nextPts >= 120) nextBadge = 'Pembaca Hebat';

      await dbSaveStudent({
        ...targetStudent,
        points: nextPts,
        badge: nextBadge
      });
    }

    addActivityLog('PINJAM', `Peminjaman Buku: ${newL.studentName} (${newL.studentClass}) meminjam "${newL.bookTitles.join(', ')}"`);
  };

  // Process Return Book Transaction
  const handleReturnLoan = async (loanId: string, fineCalculated: number) => {
    const targetLoan = loans.find(l => l.id === loanId);
    if (!targetLoan) return;

    const updatedLoan: Loan = {
      ...targetLoan,
      status: 'KEMBALI',
      fine: fineCalculated,
      returnDate: new Date().toISOString().split('T')[0]
    };

    // 1. Save updated loan to Firestore
    await dbSaveLoan(updatedLoan);

    // 2. Restore book physical quantities
    for (const b of books) {
      if (targetLoan.bookIds.includes(b.id)) {
        await dbSaveBook({
          ...b,
          available: Math.min(b.quantity, b.available + 1)
        });
      }
    }

    // 3. Give additional return point for on-time return
    if (fineCalculated === 0 && targetLoan.studentId) {
      const targetStudent = students.find(st => st.id === targetLoan.studentId);
      if (targetStudent) {
        const nextPts = targetStudent.points + 60; // Extra 60 point on-time reward!
        let nextBadge = targetStudent.badge;
        if (nextPts >= 500) nextBadge = 'Bintang Literasi';
        else if (nextPts >= 300) nextBadge = 'Pahlawan Buku';
        else if (nextPts >= 120) nextBadge = 'Pembaca Hebat';

        await dbSaveStudent({
          ...targetStudent,
          points: nextPts,
          badge: nextBadge
        });
      }
    }

    addActivityLog('KEMBALI', `Pengembalian Buku: ${targetLoan.studentName} mengembalikan "${targetLoan.bookTitles.join(', ')}"${fineCalculated > 0 ? ` (Denda Terbayar: Rp ${fineCalculated.toLocaleString('id-ID')})` : ' (Tepat Waktu)'}`);
  };

  // Award Points via Mascot Kuis
  const handleAwardPoints = async (studentId: string, pts: number) => {
    const targetStudent = students.find(s => s.id === studentId);
    if (targetStudent) {
      const nextPts = targetStudent.points + pts;
      let nextBadge = targetStudent.badge;
      if (nextPts >= 500) nextBadge = 'Bintang Literasi';
      else if (nextPts >= 300) nextBadge = 'Pahlawan Buku';
      else if (nextPts >= 120) nextBadge = 'Pembaca Hebat';

      await dbSaveStudent({
        ...targetStudent,
        points: nextPts,
        badge: nextBadge
      });
    }
  };

  // Visitor logs action controls (Everyone can add!)
  const handleAddVisitor = async (newV: VisitorLog) => {
    await dbSaveVisitor(newV);
    addActivityLog('SISWA', `Buku Kunjungan: ${newV.name} (${newV.className}) berkunjung ke perpustakaan.`);
  };

  const handleDeleteVisitor = async (id: string) => {
    await dbDeleteVisitor(id);
  };

  const handleClearVisitors = async () => {
    await dbClearVisitors();
  };

  // Backup restore or setting changes
  const handleBackupRestore = async (data: any) => {
    if (data.books) {
      for (const b of data.books) await dbSaveBook(b);
    }
    if (data.students) {
      for (const s of data.students) await dbSaveStudent(s);
    }
    if (data.loans) {
      for (const l of data.loans) await dbSaveLoan(l);
    }
    if (data.schoolIdentity || data.maxDays || data.finePerDay) {
      const iden = data.schoolIdentity || schoolIdentity;
      const mD = data.maxDays || maxDays;
      const fP = data.finePerDay || finePerDay;
      await dbSaveSettings(iden, mD, fP);
    }
  };

  const handleSaveSettings = async (newIdentity: SchoolIdentity, newMaxDays: number, newFineRate: number) => {
    setSchoolIdentity(newIdentity);
    setMaxDays(newMaxDays);
    setFinePerDay(newFineRate);
    await dbSaveSettings(newIdentity, newMaxDays, newFineRate);
  };

  const logout = () => {
    handleGoogleLogout();
  };

  // Loading indicator while resolving Google Auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-100 via-amber-50 to-emerald-100 flex flex-col items-center justify-center p-4">
        <div className="w-20 h-20 bg-linear-to-tr from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center text-4xl shadow-xl animate-bounce border-2 border-white">
          🐱
        </div>
        <div className="mt-4 text-center">
          <h3 className="text-base font-black text-slate-800 font-display">Memuat Perpustakaan Ramah Anak</h3>
          <p className="text-xs text-slate-500 mt-1 flex items-center justify-center gap-1.5 font-medium">
            <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin" /> Menghubungkan ke Cloud Database Firestore...
          </p>
        </div>
      </div>
    );
  }

  // 1. Google Login Page: Shown if not authenticated with Google and hasn't chosen fast guest mode
  if (!authCurrentUser && !hasChosenGuestMode) {
    return (
      <GoogleLoginPage
        onLoginSuccess={(role) => {
          setCurrentUserRole(role);
        }}
        onContinueAsGuest={(role) => {
          setHasChosenGuestMode(true);
          setCurrentUserRole(role);
        }}
        recentActivities={activityLogs}
        schoolName={schoolIdentity.name}
        totalBooks={books.length}
        totalVisitors={visitorLogs.length}
        totalPhotos={galleryPhotos.length}
      />
    );
  }

  // 2. Role Selector (Splash Intro): Shown if role is not yet selected
  if (currentUserRole === null) {
    return (
      <SplashIntro 
        onEnter={handleRoleSelection} 
        schoolName={schoolIdentity.name} 
        currentUser={authCurrentUser}
        onLogout={handleGoogleLogout}
        onRequestLogin={() => {
          setHasChosenGuestMode(false);
        }}
      />
    );
  }

  // Calculate parameters for dashboard
  const activeLoansList = loans.filter(l => l.status !== 'KEMBALI');
  const delayLoansCount = activeLoansList.filter(l => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const due = new Date(l.dueDate);
    due.setHours(0,0,0,0);
    return today.getTime() > due.getTime();
  }).length;

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-100 via-amber-50 to-emerald-100 flex pb-10 flex-col md:flex-row font-sans relative">
      
      {/* Decorative tiny elements */}
      <div className="absolute top-10 right-1/4 w-2 h-2 rounded-full bg-amber-400 animate-ping opacity-60 pointer-events-none" />
      <div className="absolute top-1/2 left-5 w-3 h-3 rounded-full bg-blue-400 animate-pulse pointer-events-none" />

      {/* Admin Authorization Modal */}
      {showAdminModal && (
        <AdminAuthModal
          adminPin={schoolIdentity.adminPin || "1985"}
          isOpen={showAdminModal}
          onClose={() => setShowAdminModal(false)}
          isAdmin={isAdminAuthenticated}
          onLoginSuccess={() => {
            setIsAdminAuthenticated(true);
          }}
          onLogout={() => {
            setIsAdminAuthenticated(false);
          }}
        />
      )}

      {/* LEFT SIDEBAR: Premium Glassmorphism Navigation */}
      <aside className="w-full md:w-64 border-r border-white/60 bg-white/70 backdrop-blur-md p-5 flex flex-col justify-between shrink-0 no-print">
        <div className="space-y-5">
          
          {/* School Badge Branding block */}
          <div className="flex flex-col gap-2 border-b border-blue-100/60 pb-4">
            <div className="flex items-center gap-2">
              <SchoolLogo className="w-10 h-10 drop-shadow-sm hover:scale-105 transition-all cursor-pointer animate-frequent-bounce" />
              <LibraryLogo className="w-10 h-10 drop-shadow-sm hover:scale-105 transition-all cursor-pointer" />
              <div className="text-left font-display leading-none ml-1 font-semibold">
                <span className="font-extrabold text-[11px] tracking-wider text-slate-800 uppercase block">SD NEGERI 1</span>
                <span className="font-extrabold text-[10px] text-blue-600 block mt-0.5">SRIMENGANTEN</span>
              </div>
            </div>
            <p className="text-[9px] text-slate-500 font-bold bg-slate-100/80 p-1.5 rounded-lg text-center select-none uppercase tracking-wide">
              📖 PERPUSTAKAAN DIGITAL
            </p>
          </div>

          {/* Google Account Profile Card */}
          {authCurrentUser ? (
            <div className="p-3 bg-white/90 rounded-2xl border border-blue-200 shadow-xs text-left space-y-2">
              <div className="flex items-center gap-2.5">
                {authCurrentUser.photoURL ? (
                  <img src={authCurrentUser.photoURL} alt="" className="w-8 h-8 rounded-full border border-blue-400 shrink-0" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-extrabold flex items-center justify-center text-xs shrink-0">
                    {(authCurrentUser.displayName || authCurrentUser.email || 'G')[0].toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <span className="text-[11px] font-extrabold text-slate-800 truncate block leading-tight">
                    {authCurrentUser.displayName || 'Akun Google'}
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono truncate block leading-tight">
                    {authCurrentUser.email}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between text-[9px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg font-bold">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  Cloud Firestore
                </span>
                <span>Sinkron Real-Time</span>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setHasChosenGuestMode(false)}
              className="w-full p-2.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 rounded-2xl text-[11px] font-bold transition-all text-left flex items-center justify-between cursor-pointer shadow-2xs"
            >
              <div className="flex items-center gap-1.5">
                <span>🔑</span>
                <span>Masuk Akun Google</span>
              </div>
              <span>&rarr;</span>
            </button>
          )}

          {/* Role & Auth Status Badge */}
          <div className={`p-2.5 rounded-2xl border text-left flex items-center justify-between gap-2 transition-all ${
            isAdminAuthenticated ? 'bg-emerald-50 border-emerald-200' : 'bg-blue-50/70 border-blue-100/60'
          }`}>
            <div className="flex items-center gap-2 min-w-0">
              <div className={`w-3 h-3 rounded-full shrink-0 ${isAdminAuthenticated ? 'bg-emerald-500 animate-pulse' : 'bg-blue-500'}`} />
              <div className="leading-tight min-w-0">
                <span className="text-[9px] text-slate-400 block font-bold uppercase">AKSES SAAT INI:</span>
                <span className="text-[11px] text-slate-800 font-extrabold truncate block uppercase">
                  {isAdminAuthenticated ? '🛡️ Petugas Aktif' : currentUserRole === 'kepsek' ? '👑 Kepala Sekolah' : '🎒 Pengunjung'}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                if (isAdminAuthenticated) {
                  setIsAdminAuthenticated(false);
                  playHappyTune();
                } else {
                  setShowAdminModal(true);
                }
              }}
              title={isAdminAuthenticated ? "Kunci Wewenang Petugas" : "Buka Wewenang Petugas (PIN)"}
              className={`p-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                isAdminAuthenticated 
                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                  : 'bg-white text-slate-600 hover:bg-blue-50 shadow-xs border border-slate-200'
              }`}
            >
              {isAdminAuthenticated ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 text-left">
            <button
              onClick={() => handleMenuClick('dashboard')}
              id="sidebar-btn-dashboard"
              className={`w-full py-2 px-3.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
                activeMenu === 'dashboard' ? 'bg-primary text-white shadow-md' : 'text-slate-600 hover:bg-white hover:text-slate-800'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Dashboard Utama</span>
            </button>

            <button
              onClick={() => handleMenuClick('buku')}
              id="sidebar-btn-buku"
              className={`w-full py-2 px-3.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
                activeMenu === 'buku' ? 'bg-primary text-white shadow-md' : 'text-slate-600 hover:bg-white hover:text-slate-800'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Katalog Buku Literasi</span>
            </button>

            <button
              onClick={() => handleMenuClick('siswa')}
              id="sidebar-btn-siswa"
              className={`w-full py-2 px-3.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
                activeMenu === 'siswa' ? 'bg-primary text-white shadow-md' : 'text-slate-600 hover:bg-white hover:text-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Siswa & Kartu Digital</span>
            </button>

            <button
              onClick={() => handleMenuClick('kunjungan')}
              id="sidebar-btn-kunjungan"
              className={`w-full py-2 px-3.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                activeMenu === 'kunjungan' ? 'bg-primary text-white shadow-md' : 'text-slate-600 hover:bg-white hover:text-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span>Buku Tamu Pengunjung</span>
              </div>
              <span className="bg-emerald-100 text-emerald-800 text-[9px] px-1.5 py-0.5 rounded-full font-extrabold">
                Real
              </span>
            </button>

            <button
              onClick={() => handleMenuClick('pinjam')}
              id="sidebar-btn-pinjam"
              className={`w-full py-2 px-3.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
                activeMenu === 'pinjam' ? 'bg-primary text-white shadow-md' : 'text-slate-600 hover:bg-white hover:text-slate-800'
              }`}
            >
              <ArrowLeftRight className="w-4 h-4" />
              <span>Sirkulasi Peminjaman</span>
            </button>

            <button
              onClick={() => handleMenuClick('kembali')}
              id="sidebar-btn-kembali"
              className={`w-full py-2 px-3.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
                activeMenu === 'kembali' ? 'bg-primary text-white shadow-md' : 'text-slate-600 hover:bg-white hover:text-slate-800'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Pengembalian & Denda</span>
            </button>

            <button
              onClick={() => handleMenuClick('laporan')}
              id="sidebar-btn-laporan"
              className={`w-full py-2 px-3.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
                activeMenu === 'laporan' ? 'bg-primary text-white shadow-md' : 'text-slate-600 hover:bg-white hover:text-slate-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Laporan GLS & Rekap</span>
            </button>

            <button
              onClick={() => handleMenuClick('linimasa')}
              id="sidebar-btn-linimasa"
              className={`w-full py-2 px-3.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                activeMenu === 'linimasa' ? 'bg-primary text-white shadow-md' : 'text-slate-600 hover:bg-white hover:text-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Youtube className="w-4 h-4 text-rose-500" />
                <span>Linimasa Video YT</span>
              </div>
              <span className="bg-rose-100 text-rose-800 text-[9px] px-1.5 py-0.5 rounded-full font-black">
                3 Tahap
              </span>
            </button>

            <button
              onClick={() => handleMenuClick('galeri')}
              id="sidebar-btn-galeri"
              className={`w-full py-2 px-3.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                activeMenu === 'galeri' ? 'bg-primary text-white shadow-md' : 'text-slate-600 hover:bg-white hover:text-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Images className="w-4 h-4 text-amber-500" />
                <span>Galeri Foto & Drive</span>
              </div>
              <span className="bg-amber-100 text-amber-900 text-[9px] px-1.5 py-0.5 rounded-full font-black">
                {galleryPhotos.length} Foto
              </span>
            </button>

            <button
              onClick={() => handleMenuClick('pengaturan')}
              id="sidebar-btn-pengaturan"
              className={`w-full py-2 px-3.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
                activeMenu === 'pengaturan' ? 'bg-primary text-white shadow-md' : 'text-slate-600 hover:bg-white hover:text-slate-800'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Pengaturan & Database</span>
            </button>

            <button
              onClick={() => handleMenuClick('panduan')}
              id="sidebar-btn-panduan"
              className={`w-full py-2 px-3.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
                activeMenu === 'panduan' ? 'bg-primary text-white shadow-md' : 'text-slate-600 hover:bg-white hover:text-slate-800'
              }`}
            >
              <Info className="w-4 h-4" />
              <span>Panduan Aplikasi</span>
            </button>
          </nav>
        </div>

        {/* Action Bottom Section of Sidebar */}
        <div className="space-y-3.5 pt-4 border-t border-slate-200 text-left">
          
          {/* Sounds toggles */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-bold">
            <span>Efek Suara Anak:</span>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              id="sidebar-btn-sound"
              className="p-1 px-2 bg-slate-150 hover:bg-slate-200 rounded-lg text-[10px] text-slate-600 shrink-0 font-bold flex items-center gap-1 cursor-pointer"
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-500" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
              <span>{soundEnabled ? 'Aktif':'Sunyi'}</span>
            </button>
          </div>

          <button
            onClick={logout}
            id="sidebar-btn-logout"
            className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border border-rose-100"
          >
            <LogOut className="w-4 h-4" />
            <span>Ganti Peran / Keluar</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTAINER CONTENT VIEW */}
      <main className="flex-1 p-4 md:p-8 space-y-6 overflow-x-hidden relative">
        
        {/* TOP ROW HEADER */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-indigo-100/60 pb-4 text-left no-print">
          <div>
            <h2 className="text-xl md:text-2xl font-bold font-display text-slate-800 flex items-center gap-2">
              <span>🎏</span> {activeMenu === 'dashboard' ? 'Gerakan Literasi Sekolah' : activeMenu === 'buku' ? 'Katalog Buku Digital' : activeMenu === 'siswa' ? 'Anggota Siswa SD' : activeMenu === 'pinjam' ? 'Sirkulasi Peminjaman' : activeMenu === 'kembali' ? 'Pengembalian Buku' : activeMenu === 'laporan' ? 'Laporan Program GLS' : activeMenu === 'linimasa' ? 'Linimasa Video Transformasi YouTube' : activeMenu === 'galeri' ? 'Galeri Foto & Drive Sekolah' : activeMenu === 'pengaturan' ? 'Identitas & Database Cloud' : activeMenu === 'kunjungan' ? 'Buku Tamu Kunjungan' : 'Dinding Profil Perpustakaan'}
            </h2>
            <p className="text-xs text-slate-500 mt-1 uppercase tracking-wide">
              {schoolIdentity.name} • Tahun Ajaran {academicInfo.academicYear} ({academicInfo.semesterLabel}) • Kab. Tanggamus
            </p>
          </div>

          {/* Database Cloud Sync & User Profile Status Indicators */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Google Profile Pill */}
            {authCurrentUser ? (
              <div className="bg-white/95 border border-blue-200 px-3 py-1.5 rounded-2xl flex items-center gap-2 shadow-xs">
                {authCurrentUser.photoURL ? (
                  <img src={authCurrentUser.photoURL} alt="" className="w-6 h-6 rounded-full border border-blue-400 shrink-0" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-black flex items-center justify-center text-[10px] shrink-0">
                    {(authCurrentUser.displayName || authCurrentUser.email || 'G')[0].toUpperCase()}
                  </div>
                )}
                <div className="text-left leading-none hidden sm:block">
                  <span className="text-[11px] font-extrabold text-slate-800 block truncate max-w-[120px]">
                    {authCurrentUser.displayName || 'Akun Google'}
                  </span>
                  <span className="text-[9px] text-slate-400 block truncate max-w-[120px] font-mono mt-0.5">
                    {authCurrentUser.email}
                  </span>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setHasChosenGuestMode(false)}
                className="bg-white/90 hover:bg-white text-blue-700 border border-blue-200 px-3 py-1.5 rounded-2xl text-[11px] font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>🔑 Masuk Google</span>
              </button>
            )}

            {/* Cloud Firestore Sync Indicator */}
            <div className="bg-white/90 border border-emerald-200 px-3 py-1.5 rounded-2xl flex items-center gap-2 shadow-xs">
              <Cloud className="w-4 h-4 text-emerald-600 animate-pulse" />
              <div className="text-left">
                <span className="text-[9px] text-emerald-800 font-extrabold uppercase block leading-none">Cloud Firestore</span>
                <span className="text-[10px] font-semibold text-slate-600">Sinkron Real-Time</span>
              </div>
            </div>

            {/* Admin Lock status icon toggle */}
            <button
              onClick={() => {
                if (isAdminAuthenticated) {
                  setIsAdminAuthenticated(false);
                } else {
                  setShowAdminModal(true);
                }
              }}
              className={`px-3 py-1.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs border transition-all ${
                isAdminAuthenticated 
                  ? 'bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700' 
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {isAdminAuthenticated ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5 text-amber-500" />}
              <span>{isAdminAuthenticated ? 'Admin Aktif' : 'Masuk Admin'}</span>
            </button>
          </div>
        </header>

        {/* MULTI QUOTE MOTIVATION BANNER */}
        <div className="bg-linear-to-r from-blue-500 to-indigo-600 text-white p-4 rounded-3xl text-left shadow-lg relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-display no-print">
          <div className="absolute right-0 top-0 opacity-10 font-bold text-9xl pointer-events-none select-none">
            📚
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-amber-300 uppercase tracking-widest block bg-white/20 px-2 py-0.5 rounded-full w-max">SI-MPUS Quotes</span>
            <h3 className="text-[13px] md:text-sm font-bold tracking-wide italic mt-1 font-sans">
              "{activeQuote}"
            </h3>
          </div>
          <span className="text-2xl select-none hidden lg:block animate-wiggle">🪄</span>
        </div>

        {/* RENDERING SPECIFIC BOARD MENU */}
        <div className="flex-1">
          {activeMenu === 'dashboard' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
              
              {/* Dashboard Content Summary metrics (Left col 8 spans) */}
              <div className="lg:col-span-8 space-y-5">
                
                {/* Visual Stats Cards grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div 
                    onClick={() => handleMenuClick('buku')}
                    className="glass-panel p-4 rounded-2xl border border-white text-left shadow-md flex flex-col justify-between h-28 hover:scale-102 transition-all cursor-pointer"
                  >
                    <span className="text-[10px] uppercase font-bold text-slate-400">Total Buku Fisik</span>
                    <h3 className="text-2xl font-black text-slate-800 font-mono mt-2">{books.length} Judul</h3>
                    <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">100% Terinventarisir</span>
                  </div>

                  <div 
                    onClick={() => handleMenuClick('pinjam')}
                    className="glass-panel p-4 rounded-2xl border border-white text-left shadow-md flex flex-col justify-between h-28 hover:scale-102 transition-all cursor-pointer"
                  >
                    <span className="text-[10px] uppercase font-bold text-slate-400">Aktif Dipinjam</span>
                    <h3 className="text-2xl font-black text-blue-600 font-mono mt-2">{activeLoansList.length} Transaksi</h3>
                    <span className="text-[10px] text-slate-550 font-medium">Sirkulasi Siswa SD</span>
                  </div>

                  <div 
                    onClick={() => handleMenuClick('kembali')}
                    className="glass-panel p-4 rounded-2xl border border-white text-left shadow-md flex flex-col justify-between h-28 hover:scale-102 transition-all cursor-pointer"
                  >
                    <span className="text-[10px] uppercase font-bold text-slate-400">Buku Terlambat</span>
                    <h3 className="text-2xl font-black text-rose-600 font-mono mt-2">{delayLoansCount} Buku</h3>
                    <span className="text-[10px] text-rose-550 font-semibold animate-pulse">Perlu Pengembalian</span>
                  </div>

                  <div 
                    onClick={() => handleMenuClick('kunjungan')}
                    className="glass-panel p-4 rounded-2xl border border-white text-left shadow-md flex flex-col justify-between h-28 hover:scale-102 transition-all cursor-pointer bg-emerald-50/30 hover:bg-emerald-50/50"
                  >
                    <span className="text-[10px] uppercase font-bold text-emerald-700">Kunjungan Real-Time</span>
                    <h3 className="text-2xl font-black text-emerald-600 font-mono mt-2 flex items-center gap-1.5">
                      {visitorLogs.length} Orang
                    </h3>
                    <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">Buku Tamu Terbuka →</span>
                  </div>
                </div>

                {/* Indonesian School Activities / Calendar of Literacy */}
                <div className="glass-panel p-5 rounded-3xl border border-white shadow-lg text-left space-y-3">
                  <h4 className="font-extrabold text-slate-800 uppercase tracking-wider text-xs flex items-center gap-1.5 border-b border-indigo-100 pb-2">
                    <Star className="w-4 h-4 text-primary fill-blue-100" /> Agenda Kegiatan Literasi SDN {academicInfo.semesterLabel} (T.A. {academicInfo.academicYear})
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3 bg-white/70 rounded-2xl border border-slate-100 space-y-1">
                      <div className="flex justify-between text-[11px] font-bold">
                        <span className="text-blue-600 font-bold uppercase tracking-wide">Pekan Membaca</span>
                        <span className="text-slate-400">Setiap Selasa</span>
                      </div>
                      <p className="text-xs text-slate-700 font-bold mt-1">Setiap Selasa Nyaring (Selang) 📖</p>
                      <p className="text-[10px] text-slate-500 leading-relaxed">Siswa membaca nyaring bersama guru kelas selama 15 menit sebelum masuk kelas.</p>
                    </div>

                    <div className="p-3 bg-white/70 rounded-2xl border border-slate-100 space-y-1">
                      <div className="flex justify-between text-[11px] font-bold">
                        <span className="text-emerald-600 font-bold uppercase tracking-wide">Piala SI-MPUS</span>
                        <span className="text-slate-400">Akhir Bulan</span>
                      </div>
                      <p className="text-xs text-slate-700 font-bold mt-1">Penganugerahan Bintang Literasi 🏆</p>
                      <p className="text-[10px] text-slate-500 leading-relaxed">Pemberian lencana khusus kepada siswa teraktif mengumpulkan poin membaca.</p>
                    </div>
                  </div>
                </div>

                {/* Spotlight: Linimasa Video YouTube & Galeri Foto Cloud */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Linimasa Card */}
                  <div 
                    onClick={() => handleMenuClick('linimasa')}
                    className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl p-5 text-white shadow-md hover:shadow-xl transition-all cursor-pointer border border-indigo-700/50 flex flex-col justify-between space-y-3 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-rose-600 flex items-center justify-center text-white">
                          <Youtube className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] font-black uppercase text-amber-300 tracking-wider block">Linimasa Video</span>
                          <h4 className="text-xs font-black text-white group-hover:text-amber-300 transition-colors">3 Tahap Transformasi</h4>
                        </div>
                      </div>
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold">
                        YouTube HD
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Dokumentasi video lengkap: <strong>Bagian 1 (Before)</strong>, <strong>Bagian 2 (On Process)</strong>, dan <strong>Bagian 3 (After Launching)</strong>.
                    </p>

                    <div className="flex items-center justify-between text-[10px] font-bold text-amber-400 pt-2 border-t border-slate-800">
                      <span>Putar Video Sekarang →</span>
                      <span className="text-slate-400 font-normal">3 Video Episode</span>
                    </div>
                  </div>

                  {/* Galeri Card */}
                  <div 
                    onClick={() => handleMenuClick('galeri')}
                    className="bg-gradient-to-br from-blue-900 to-indigo-950 rounded-3xl p-5 text-white shadow-md hover:shadow-xl transition-all cursor-pointer border border-blue-700/50 flex flex-col justify-between space-y-3 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950">
                          <Images className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] font-black uppercase text-blue-200 tracking-wider block">Galeri Resmi</span>
                          <h4 className="text-xs font-black text-white group-hover:text-amber-300 transition-colors">Foto & Google Drive</h4>
                        </div>
                      </div>
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                        Cloud Sync
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Kumpulan foto dokumentasi beresolusi tinggi, integrasi Google Drive resmi, dan fitur tambah foto permanen secara real-time.
                    </p>

                    <div className="flex items-center justify-between text-[10px] font-bold text-amber-300 pt-2 border-t border-slate-800">
                      <span>Buka Galeri Foto ({galleryPhotos.length}) →</span>
                      <span className="text-slate-400 font-normal">Google Drive</span>
                    </div>
                  </div>
                </div>

                {/* Live Shared History Stream Across All Visitors & Google Accounts */}
                <div className="glass-panel p-5 rounded-3xl border border-white shadow-lg text-left space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                        <h4 className="font-extrabold text-slate-800 uppercase tracking-wider text-xs">
                          🔄 Riwayat Masukan Terakhir (Sinkron Real-Time Seluruh Pengakses)
                        </h4>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Setiap isian buku tamu, sirkulasi peminjaman, buku, dan galeri tersimpan di Cloud Database dan sama isinya untuk seluruh pengunjung.
                      </p>
                    </div>

                    {/* Filter buttons */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {(['ALL', 'KUNJUNGAN', 'PINJAM', 'BUKU', 'GALERI'] as const).map(f => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => setActivityFilter(f)}
                          className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                            activityFilter === f
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-white/80 hover:bg-white text-slate-600 border border-slate-200'
                          }`}
                        >
                          {f === 'ALL' ? 'Semua' : f === 'KUNJUNGAN' ? 'Buku Tamu' : f === 'PINJAM' ? 'Pinjam/Kembali' : f === 'BUKU' ? 'Katalog' : 'Galeri'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* List of activity items */}
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {(() => {
                      const filtered = activityLogs.filter(item => {
                        if (activityFilter === 'ALL') return true;
                        if (activityFilter === 'KUNJUNGAN') return item.type === 'SISWA' && item.activity.includes('Buku Kunjungan');
                        if (activityFilter === 'PINJAM') return item.type === 'PINJAM' || item.type === 'KEMBALI';
                        if (activityFilter === 'BUKU') return item.type === 'BUKU';
                        if (activityFilter === 'GALERI') return item.type === 'GALERI';
                        return true;
                      });

                      if (filtered.length === 0) {
                        return (
                          <div className="p-8 text-center bg-white/60 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs">
                            Belum ada riwayat aktivitas untuk filter ini. Setiap inputan baru dari pengunjung manapun akan otomatis muncul di sini secara real-time!
                          </div>
                        );
                      }

                      return filtered.slice(0, 8).map((act) => (
                        <div 
                          key={act.id} 
                          className="p-3 bg-white/90 rounded-2xl border border-slate-150 hover:border-blue-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs"
                        >
                          <div className="flex items-start gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0 mt-0.5 text-xs">
                              {act.type === 'PINJAM' ? '📚' : act.type === 'KEMBALI' ? '↩️' : act.type === 'BUKU' ? '📖' : act.type === 'SISWA' ? '✍️' : '📸'}
                            </div>
                            <div className="min-w-0 text-left">
                              <p className="text-[11px] font-bold text-slate-800 leading-snug">
                                {act.activity}
                              </p>
                              <div className="flex items-center gap-2 mt-1 flex-wrap text-[10px]">
                                <span className="font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                                  {act.operator}
                                </span>
                                {act.userEmail && (
                                  <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded font-mono text-[9px]">
                                    🌐 {act.userEmail}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="text-[9px] text-slate-450 font-bold font-mono shrink-0 text-right sm:self-center">
                            {act.formattedDate}
                          </div>
                        </div>
                      ));
                    })()}
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-medium">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Terhubung langsung ke Firestore Cloud Database
                    </span>
                    <span>{activityLogs.length} total input tercatat</span>
                  </div>
                </div>

                {/* Pendaftar list latest */}
                <div className="glass-panel p-5 rounded-3xl border border-white shadow-lg text-left space-y-3">
                  <div className="flex justify-between items-center border-b border-indigo-100 pb-2">
                    <h4 className="font-extrabold text-slate-800 uppercase tracking-wider text-xs">
                      👥 Peringkat Siswa Teraktif Membaca (Real-Time Leaderboard)
                    </h4>
                    <span className="text-[10px] text-primary font-bold cursor-pointer" onClick={() => setActiveMenu('siswa')}>Lihat Semua Siswa →</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[...students].sort((a, b) => b.points - a.points).slice(0, 4).map(st => (
                      <div key={st.id} className="p-2.5 bg-white/80 rounded-2xl border border-slate-100 flex items-center justify-between gap-2 shadow-xs">
                        <div className="flex items-center gap-2.5">
                          <img src={st.avatarUrl} alt={st.name} className="w-9 h-9 rounded-xl border bg-slate-50 p-0.5" referrerPolicy="no-referrer" />
                          <div className="leading-tight text-left">
                            <span className="text-[11px] font-extrabold uppercase block truncate w-[130px]">{st.name}</span>
                            <span className="text-[9px] text-blue-600 block font-bold">{st.className} • {st.badge}</span>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-amber-500 shrink-0">⭐ {st.points} Pts</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Chat Mascot / Quiz Widget "Si Kumbi" (Right col 4 spans) */}
              <div className="lg:col-span-4 flex flex-col">
                <MascotKumbi 
                  books={books} 
                  students={students} 
                  onAwardPoints={handleAwardPoints} 
                />
              </div>

            </div>
          )}

          {activeMenu === 'buku' && (
            <BookList 
              books={books} 
              onAddBook={handleAddBook} 
              onUpdateBook={handleUpdateBook} 
              onDeleteBook={handleDeleteBook} 
              isAdmin={isAdminAuthenticated}
              onRequireAdmin={() => setShowAdminModal(true)}
            />
          )}

          {activeMenu === 'siswa' && (
            <StudentList 
              students={students} 
              onAddStudent={handleAddStudent} 
              onUpdateStudent={handleUpdateStudent} 
              onDeleteStudent={handleDeleteStudent} 
              isAdmin={isAdminAuthenticated}
              onRequireAdmin={() => setShowAdminModal(true)}
            />
          )}

          {activeMenu === 'pinjam' && (
            <LoanRegister 
              books={books} 
              students={students} 
              onAddLoan={handleAddLoan} 
              maxDays={maxDays} 
              isAdmin={isAdminAuthenticated}
              onRequireAdmin={() => setShowAdminModal(true)}
            />
          )}

          {activeMenu === 'kembali' && (
            <ReturnRegister 
              loans={loans} 
              onReturnLoan={handleReturnLoan} 
              finePerDay={finePerDay} 
              isAdmin={isAdminAuthenticated}
              onRequireAdmin={() => setShowAdminModal(true)}
            />
          )}

          {activeMenu === 'laporan' && (
            <ReportsView 
              books={books} 
              students={students} 
              loans={loans} 
              visitorLogs={visitorLogs}
              schoolIdentity={schoolIdentity} 
              activityLogs={activityLogs}
              onClearLogs={() => {
                if (!isAdminAuthenticated) {
                  setShowAdminModal(true);
                  return;
                }
                if (window.confirm("Apakah Anda yakin ingin menghapus seluruh histori rekap input realtime?")) {
                  setActivityLogs([]);
                }
              }}
            />
          )}

          {activeMenu === 'linimasa' && (
            <TimelineVideos />
          )}

          {activeMenu === 'galeri' && (
            <PhotoGalleryView 
              photos={galleryPhotos}
              isAdmin={isAdminAuthenticated}
              currentUser={authCurrentUser}
            />
          )}

          {activeMenu === 'kunjungan' && (
            <VisitorRegister 
              students={students}
              visitorLogs={visitorLogs}
              onAddVisitor={handleAddVisitor}
              onDeleteVisitor={handleDeleteVisitor}
              onClearVisitors={handleClearVisitors}
              isAdmin={isAdminAuthenticated}
              onRequireAdmin={() => setShowAdminModal(true)}
              currentUser={authCurrentUser}
            />
          )}

          {activeMenu === 'pengaturan' && (
            <SettingsView 
              maxDays={maxDays} 
              setMaxDays={setMaxDays} 
              finePerDay={finePerDay} 
              setFinePerDay={setFinePerDay} 
              schoolIdentity={schoolIdentity} 
              setSchoolIdentity={(newId) => handleSaveSettings(newId, maxDays, finePerDay)} 
              onBackupRestore={handleBackupRestore} 
              fullState={{ books, students, loans }} 
              isAdmin={isAdminAuthenticated}
              onRequireAdmin={() => setShowAdminModal(true)}
            />
          )}

          {activeMenu === 'panduan' && (
            <div className="max-w-4xl mx-auto space-y-6 text-left text-xs text-slate-600 font-semibold">
              
              {/* About App card */}
              <div className="glass-panel p-6 rounded-3xl border border-white shadow-lg space-y-3">
                <span className="text-3xl">ℹ️</span>
                <h3 className="text-base font-extrabold text-slate-800 font-display uppercase tracking-wider">Perpustakaan Digital Ramah Anak (PDR-Anak)</h3>
                
                <p className="leading-relaxed font-medium">
                  Aplikasi administrasi perpustakaan resmi penunjang Gerakan Literasi Sekolah (GLS) di SD Negeri 1 Srimenganten. Dibangun dengan database terintegrasi secara langsung melalui Cloud Firestore sehingga setiap pembaruan data buku, peminjaman, pengembalian, dan kunjungan dapat diakses serentak oleh seluruh gawai.
                </p>

                <p className="leading-relaxed font-medium">
                  <strong>Pengamanan Role-Based (Admin & Pengunjung):</strong> Pengunjung umum dan siswa dapat mencari buku, mencatat kunjungan, dan membaca ringkasan secara bebas, sedangkan penambahan/penyuntingan/penghapusan data diproteksi dengan verifikasi PIN Petugas.
                </p>
              </div>

              {/* Guidelines for elementary library management */}
              <div className="glass-panel p-6 rounded-3xl border border-white shadow-lg space-y-4">
                <h4 className="font-extrabold text-slate-800 uppercase tracking-wider text-xs flex items-center gap-1">
                  📚 Standard Kelompok Bacaan Literasi SD (Kementerian RI)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-[11px] leading-relaxed">
                  <div className="p-3 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-1">
                    <span className="font-bold text-blue-800 uppercase block">Kelompok B1</span>
                    <p className="text-slate-700"><strong>Kelas Rendah (1 & 2):</strong> Mengutamakan bacaan lisan yang kaya bergambar, dongeng hewan ceria, sinopsis berima, serta pembelajaran afektif emosi sederhana.</p>
                  </div>

                  <div className="p-3 bg-amber-50/50 rounded-2xl border border-amber-100 space-y-1">
                    <span className="font-bold text-amber-800 uppercase block">Kelompok B2</span>
                    <p className="text-slate-700"><strong>Kelas Menengah (3 & 4):</strong> Mengadaptasi tema petualangan alam, sains sederhana, pengenalan sejarah lokal nusantara, serta ketangkasan olahraga.</p>
                  </div>

                  <div className="p-3 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-1">
                    <span className="font-bold text-emerald-800 uppercase block">Kelompok B3</span>
                    <p className="text-slate-700"><strong>Kelas Tinggi (5 & 6):</strong> Cerita eksplorasi teka-teki, sastra anak yang mendalam, sains ekosistem modern, serta keterampilan teknologi produktif.</p>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Global Floating Soundtrack Player */}
        <SoundtrackPlayer videoId="NhEjXGVmYuc" />

      </main>

    </div>
  );
}
