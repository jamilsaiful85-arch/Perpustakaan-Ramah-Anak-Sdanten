import {
  db,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  onSnapshot,
  deleteDoc,
  writeBatch,
  handleFirestoreError,
  OperationType,
  FirebaseUser
} from './firebase';
import { Book, Student, Loan, INITIAL_BOOKS, INITIAL_STUDENTS } from '../data/initialData';
import { VisitorLog } from '../components/VisitorRegister';

export interface SchoolIdentity {
  name: string;
  address?: string;
  headmaster: string;
  nip: string;
  librarian: string;
  librarianNip: string;
  established: string;
  adminPin?: string;
}

export interface AppUser {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  role: 'admin' | 'petugas' | 'kepsek' | 'pengunjung';
  lastLoginAt: string;
  createdAt?: string;
}

export interface ActivityLogItem {
  id: string;
  timestamp: string;
  formattedDate: string;
  type: 'PINJAM' | 'KEMBALI' | 'BUKU' | 'SISWA' | 'SISTEM' | 'KUNJUNGAN' | 'GALERI' | 'MASUK';
  activity: string;
  operator: string;
  userEmail?: string;
  userPhoto?: string;
}

export interface GalleryPhotoItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: 'TRANSFORMASI' | 'LAUNCHING' | 'KEGIATAN_SISWA' | 'POJOK_BACA' | 'DOKUMENTASI';
  date: string;
  uploaderName: string;
  uploaderRole: string;
  userEmail?: string;
  createdAt: string;
}

// Collections references
const BOOKS_COL = 'books';
const STUDENTS_COL = 'students';
const LOANS_COL = 'loans';
const VISITORS_COL = 'visitors';
const ACTIVITIES_COL = 'activities';
const SETTINGS_COL = 'settings';
const GALLERY_COL = 'gallery';
const USERS_COL = 'users';

export const INITIAL_GALLERY_PHOTOS: GalleryPhotoItem[] = [
  {
    id: "gal-001",
    title: "Launching Resmi Perpustakaan Ramah Anak SDN 1 Srimenganten",
    description: "Peresmian dan pembukaan perpustakaan baru ramah anak SDN 1 Srimenganten bersama dewan guru, komite sekolah, dan siswa-siswi.",
    imageUrl: "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1000&q=80",
    category: "LAUNCHING",
    date: "2026-08-15",
    uploaderName: "Saiful Jamil, M.Pd.",
    uploaderRole: "Kepala Sekolah",
    createdAt: new Date().toISOString()
  },
  {
    id: "gal-002",
    title: "Proses Transformasi & Penataan Rak Buku Ceria",
    description: "Gotong royong guru dan pustakawan menata buku cerita berkategori warna dan rak ramah anak yang mudah dijangkau siswa.",
    imageUrl: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1000&q=80",
    category: "TRANSFORMASI",
    date: "2026-08-01",
    uploaderName: "Dea Cahya Kirana",
    uploaderRole: "Pustakawan",
    createdAt: new Date().toISOString()
  },
  {
    id: "gal-003",
    title: "Membaca Buku Cerita Bergambar Si Kumbi Bersama Siswa",
    description: "Kegiatan rutin Gerakan Literasi Sekolah 15 menit sebelum pembelajaran di ruang baca berkarpet warna-warni.",
    imageUrl: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1000&q=80",
    category: "KEGIATAN_SISWA",
    date: "2026-08-20",
    uploaderName: "Dea Cahya Kirana",
    uploaderRole: "Pustakawan",
    createdAt: new Date().toISOString()
  },
  {
    id: "gal-004",
    title: "Pojok Baca Ceria & Dinding Pohon Literasi",
    description: "Karya literasi siswa-siswi kelas 1 s/d 6 yang dipajang di dinding apresiasi perpustakaan ramah anak.",
    imageUrl: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1000&q=80",
    category: "POJOK_BACA",
    date: "2026-08-22",
    uploaderName: "Saiful Jamil, M.Pd.",
    uploaderRole: "Kepala Sekolah",
    createdAt: new Date().toISOString()
  }
];

export const DEFAULT_SCHOOL_SETTINGS: SchoolIdentity = {
  name: "SD NEGERI 1 SRIMENGANTEN",
  address: "Jalan Babakan Linggar Pekon Srimenganten, Kecamatan Pulau Panggung Kabupaten Tanggamus",
  headmaster: "Saiful Jamil, M.Pd.",
  nip: "19850810 2014061 003",
  librarian: "Dea Cahya Kirana",
  librarianNip: "-",
  established: "1985",
  adminPin: "1985"
};

/**
 * Sync Google user to Firestore users collection
 */
export async function syncUserProfile(user: FirebaseUser, requestedRole?: string): Promise<AppUser> {
  const userRef = doc(db, USERS_COL, user.uid);
  try {
    const snap = await getDoc(userRef);
    const isMasterAdmin = user.email?.toLowerCase() === 'jamilsaiful85@gmail.com';
    
    let role: 'admin' | 'petugas' | 'kepsek' | 'pengunjung' = 'pengunjung';
    if (isMasterAdmin) {
      role = 'admin';
    } else if (snap.exists() && snap.data().role) {
      role = snap.data().role;
    } else if (requestedRole && ['admin', 'petugas', 'kepsek', 'pengunjung'].includes(requestedRole)) {
      role = requestedRole as any;
    }

    const profileData: AppUser = {
      uid: user.uid,
      displayName: user.displayName || user.email?.split('@')[0] || 'Pengunjung',
      email: user.email || '',
      photoURL: user.photoURL || '',
      role,
      lastLoginAt: new Date().toISOString(),
      createdAt: snap.exists() ? snap.data().createdAt || new Date().toISOString() : new Date().toISOString()
    };

    await setDoc(userRef, profileData, { merge: true });
    return profileData;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${USERS_COL}/${user.uid}`);
    throw error;
  }
}

/**
 * Initialize and auto-seed Firestore with default data if empty
 */
export async function initializeDatabaseIfNeeded() {
  try {
    const booksSnapshot = await getDocs(collection(db, BOOKS_COL));
    if (booksSnapshot.empty) {
      console.log("Seeding books to Firestore...");
      const batch = writeBatch(db);
      for (const book of INITIAL_BOOKS) {
        const ref = doc(db, BOOKS_COL, book.id);
        batch.set(ref, book);
      }
      await batch.commit();
    }

    const studentsSnapshot = await getDocs(collection(db, STUDENTS_COL));
    if (studentsSnapshot.empty) {
      console.log("Seeding students to Firestore...");
      const batch = writeBatch(db);
      for (const student of INITIAL_STUDENTS) {
        const ref = doc(db, STUDENTS_COL, student.id);
        batch.set(ref, student);
      }
      await batch.commit();
    }

    const settingsDoc = doc(db, SETTINGS_COL, 'identity');
    const settingsSnap = await getDocs(collection(db, SETTINGS_COL));
    if (settingsSnap.empty) {
      await setDoc(settingsDoc, {
        identity: DEFAULT_SCHOOL_SETTINGS,
        maxDays: 7,
        finePerDay: 500
      });
    }

    const gallerySnapshot = await getDocs(collection(db, GALLERY_COL));
    if (gallerySnapshot.empty) {
      console.log("Seeding initial gallery photos to Firestore...");
      const batch = writeBatch(db);
      for (const photo of INITIAL_GALLERY_PHOTOS) {
        const ref = doc(db, GALLERY_COL, photo.id);
        batch.set(ref, photo);
      }
      await batch.commit();
    }
  } catch (error) {
    console.error("Error initializing Firestore data:", error);
  }
}

/**
 * Subscribe to Books in Real-Time
 */
export function subscribeToBooks(callback: (books: Book[]) => void) {
  const booksRef = collection(db, BOOKS_COL);
  return onSnapshot(booksRef, (snapshot) => {
    const books: Book[] = [];
    snapshot.forEach((docSnap) => {
      books.push(docSnap.data() as Book);
    });
    books.sort((a, b) => a.title.localeCompare(b.title));
    callback(books);
  }, (err) => {
    handleFirestoreError(err, OperationType.GET, BOOKS_COL);
  });
}

/**
 * Subscribe to Students in Real-Time
 */
export function subscribeToStudents(callback: (students: Student[]) => void) {
  const studentsRef = collection(db, STUDENTS_COL);
  return onSnapshot(studentsRef, (snapshot) => {
    const students: Student[] = [];
    snapshot.forEach((docSnap) => {
      students.push(docSnap.data() as Student);
    });
    students.sort((a, b) => a.name.localeCompare(b.name));
    callback(students);
  }, (err) => {
    handleFirestoreError(err, OperationType.GET, STUDENTS_COL);
  });
}

/**
 * Subscribe to Loans in Real-Time
 */
export function subscribeToLoans(callback: (loans: Loan[]) => void) {
  const loansRef = collection(db, LOANS_COL);
  return onSnapshot(loansRef, (snapshot) => {
    const loans: Loan[] = [];
    snapshot.forEach((docSnap) => {
      loans.push(docSnap.data() as Loan);
    });
    loans.sort((a, b) => new Date(b.loanDate).getTime() - new Date(a.loanDate).getTime());
    callback(loans);
  }, (err) => {
    handleFirestoreError(err, OperationType.GET, LOANS_COL);
  });
}

/**
 * Subscribe to Visitors in Real-Time
 */
export function subscribeToVisitors(callback: (visitors: VisitorLog[]) => void) {
  const visitorsRef = collection(db, VISITORS_COL);
  return onSnapshot(visitorsRef, (snapshot) => {
    const visitors: VisitorLog[] = [];
    snapshot.forEach((docSnap) => {
      visitors.push(docSnap.data() as VisitorLog);
    });
    visitors.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    callback(visitors);
  }, (err) => {
    handleFirestoreError(err, OperationType.GET, VISITORS_COL);
  });
}

/**
 * Subscribe to Activity Logs in Real-Time
 */
export function subscribeToActivities(callback: (logs: ActivityLogItem[]) => void) {
  const activitiesRef = collection(db, ACTIVITIES_COL);
  return onSnapshot(activitiesRef, (snapshot) => {
    const logs: ActivityLogItem[] = [];
    snapshot.forEach((docSnap) => {
      logs.push(docSnap.data() as ActivityLogItem);
    });
    logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    callback(logs);
  }, (err) => {
    handleFirestoreError(err, OperationType.GET, ACTIVITIES_COL);
  });
}

/**
 * Subscribe to Gallery Photos in Real-Time
 */
export function subscribeToGallery(callback: (photos: GalleryPhotoItem[]) => void) {
  const galleryRef = collection(db, GALLERY_COL);
  return onSnapshot(galleryRef, (snapshot) => {
    const photos: GalleryPhotoItem[] = [];
    snapshot.forEach((docSnap) => {
      photos.push(docSnap.data() as GalleryPhotoItem);
    });
    photos.sort((a, b) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime());
    callback(photos);
  }, (err) => {
    handleFirestoreError(err, OperationType.GET, GALLERY_COL);
  });
}

/**
 * Subscribe to Settings & School Identity
 */
export function subscribeToSettings(callback: (settingsData: { identity: SchoolIdentity; maxDays: number; finePerDay: number }) => void) {
  const settingsDocRef = doc(db, SETTINGS_COL, 'identity');
  return onSnapshot(settingsDocRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      callback({
        identity: data.identity || DEFAULT_SCHOOL_SETTINGS,
        maxDays: data.maxDays || 7,
        finePerDay: data.finePerDay || 500
      });
    }
  }, (err) => {
    handleFirestoreError(err, OperationType.GET, `${SETTINGS_COL}/identity`);
  });
}

/**
 * Subscribe to Users logged in
 */
export function subscribeToUsers(callback: (users: AppUser[]) => void) {
  const usersRef = collection(db, USERS_COL);
  return onSnapshot(usersRef, (snapshot) => {
    const usersList: AppUser[] = [];
    snapshot.forEach((docSnap) => {
      usersList.push(docSnap.data() as AppUser);
    });
    usersList.sort((a, b) => new Date(b.lastLoginAt || 0).getTime() - new Date(a.lastLoginAt || 0).getTime());
    callback(usersList);
  }, (err) => {
    handleFirestoreError(err, OperationType.GET, USERS_COL);
  });
}

// ================== CRUD Operations ==================

export async function dbSaveBook(book: Book) {
  try {
    await setDoc(doc(db, BOOKS_COL, book.id), book, { merge: true });
  } catch (e) {
    handleFirestoreError(e, OperationType.WRITE, `${BOOKS_COL}/${book.id}`);
  }
}

export async function dbDeleteBook(bookId: string) {
  try {
    await deleteDoc(doc(db, BOOKS_COL, bookId));
  } catch (e) {
    handleFirestoreError(e, OperationType.DELETE, `${BOOKS_COL}/${bookId}`);
  }
}

export async function dbSaveStudent(student: Student) {
  try {
    await setDoc(doc(db, STUDENTS_COL, student.id), student, { merge: true });
  } catch (e) {
    handleFirestoreError(e, OperationType.WRITE, `${STUDENTS_COL}/${student.id}`);
  }
}

export async function dbDeleteStudent(studentId: string) {
  try {
    await deleteDoc(doc(db, STUDENTS_COL, studentId));
  } catch (e) {
    handleFirestoreError(e, OperationType.DELETE, `${STUDENTS_COL}/${studentId}`);
  }
}

export async function dbSaveLoan(loan: Loan) {
  try {
    await setDoc(doc(db, LOANS_COL, loan.id), loan, { merge: true });
  } catch (e) {
    handleFirestoreError(e, OperationType.WRITE, `${LOANS_COL}/${loan.id}`);
  }
}

export async function dbDeleteLoan(loanId: string) {
  try {
    await deleteDoc(doc(db, LOANS_COL, loanId));
  } catch (e) {
    handleFirestoreError(e, OperationType.DELETE, `${LOANS_COL}/${loanId}`);
  }
}

export async function dbSaveVisitor(visitor: VisitorLog) {
  try {
    await setDoc(doc(db, VISITORS_COL, visitor.id), visitor, { merge: true });
  } catch (e) {
    handleFirestoreError(e, OperationType.WRITE, `${VISITORS_COL}/${visitor.id}`);
  }
}

export async function dbDeleteVisitor(visitorId: string) {
  try {
    await deleteDoc(doc(db, VISITORS_COL, visitorId));
  } catch (e) {
    handleFirestoreError(e, OperationType.DELETE, `${VISITORS_COL}/${visitorId}`);
  }
}

export async function dbClearVisitors() {
  try {
    const snap = await getDocs(collection(db, VISITORS_COL));
    const batch = writeBatch(db);
    snap.forEach((d) => {
      batch.delete(d.ref);
    });
    await batch.commit();
  } catch (e) {
    handleFirestoreError(e, OperationType.DELETE, VISITORS_COL);
  }
}

export async function dbSaveActivityLog(log: ActivityLogItem) {
  try {
    await setDoc(doc(db, ACTIVITIES_COL, log.id), log, { merge: true });
  } catch (e) {
    handleFirestoreError(e, OperationType.WRITE, `${ACTIVITIES_COL}/${log.id}`);
  }
}

export async function dbSaveGalleryItem(photo: GalleryPhotoItem) {
  try {
    await setDoc(doc(db, GALLERY_COL, photo.id), photo, { merge: true });
  } catch (e) {
    handleFirestoreError(e, OperationType.WRITE, `${GALLERY_COL}/${photo.id}`);
  }
}

export async function dbDeleteGalleryItem(photoId: string) {
  try {
    await deleteDoc(doc(db, GALLERY_COL, photoId));
  } catch (e) {
    handleFirestoreError(e, OperationType.DELETE, `${GALLERY_COL}/${photoId}`);
  }
}

export async function dbSaveSettings(identity: SchoolIdentity, maxDays: number, finePerDay: number) {
  try {
    await setDoc(doc(db, SETTINGS_COL, 'identity'), {
      identity,
      maxDays,
      finePerDay
    }, { merge: true });
  } catch (e) {
    handleFirestoreError(e, OperationType.WRITE, `${SETTINGS_COL}/identity`);
  }
}

export async function dbResetToDefaults() {
  try {
    const batch = writeBatch(db);
    
    for (const book of INITIAL_BOOKS) {
      batch.set(doc(db, BOOKS_COL, book.id), book);
    }
    for (const student of INITIAL_STUDENTS) {
      batch.set(doc(db, STUDENTS_COL, student.id), student);
    }
    batch.set(doc(db, SETTINGS_COL, 'identity'), {
      identity: DEFAULT_SCHOOL_SETTINGS,
      maxDays: 7,
      finePerDay: 500
    });

    await batch.commit();
  } catch (e) {
    handleFirestoreError(e, OperationType.WRITE, 'resetDefaults');
  }
}
