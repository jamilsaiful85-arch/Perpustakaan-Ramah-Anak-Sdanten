import { Book, Student, Loan } from '../data/initialData';
import { VisitorLog } from '../components/VisitorRegister';
import { AcademicPeriodInfo, getAcademicYearInfo } from './academicYear';

// Helper to trigger direct browser download of text/blob files
function downloadBlob(content: string, filename: string, mimeType: string = 'text/csv;charset=utf-8;') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Format CSV with UTF-8 BOM for full Microsoft Excel & Google Sheets compatibility
function formatCsv(headers: string[], rows: (string | number | undefined | null)[][]): string {
  const escapeCell = (val: any) => {
    if (val === null || val === undefined) return '""';
    const str = String(val);
    return `"${str.replace(/"/g, '""')}"`;
  };

  const csvRows = [
    headers.map(escapeCell).join(','),
    ...rows.map(row => row.map(escapeCell).join(','))
  ];

  return '\uFEFF' + csvRows.join('\r\n');
}

/**
 * 1. Unduh Katalog Koleksi & Buku Induk Perpustakaan (.CSV / Excel)
 */
export function exportBooksCSV(books: Book[], academicInfo = getAcademicYearInfo()) {
  const headers = [
    'No',
    'Kode Inventaris',
    'Kode Klasifikasi',
    'Judul Buku',
    'Kategori / Bidang',
    'Pengarang / Penulis',
    'Penerbit',
    'Tahun Terbit',
    'Nomor ISBN',
    'Lokasi Rak',
    'Total Eksemplar',
    'Tersedia',
    'Sedang Dipinjam'
  ];

  const rows = books.map((b, index) => [
    index + 1,
    b.id,
    b.code,
    b.title,
    b.category,
    b.author,
    b.publisher,
    b.year,
    b.isbn,
    b.shelf,
    b.quantity,
    b.available,
    b.quantity - b.available
  ]);

  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `BUKU_INDUK_INVENTARIS_SDN1_SRIMENGANTEN_${academicInfo.academicYear.replace('/', '-')}_${timestamp}.csv`;
  downloadBlob(formatCsv(headers, rows), filename);
}

/**
 * 2. Unduh Rekapitulasi Data Anggota Siswa & Poin Literasi (.CSV / Excel)
 */
export function exportStudentsCSV(students: Student[], academicInfo = getAcademicYearInfo()) {
  const headers = [
    'No',
    'ID Siswa',
    'NIS',
    'NISN',
    'Nama Lengkap Siswa',
    'Jenis Kelamin',
    'Kelas',
    'Tempat Lahir',
    'Tanggal Lahir',
    'Peringkat Bintang GLS',
    'Akumulasi Poin Literasi',
    'Status Keanggotaan'
  ];

  const rows = students.map((s, index) => [
    index + 1,
    s.id,
    s.nis,
    s.nisn,
    s.name,
    s.gender === 'L' ? 'Laki-laki (L)' : 'Perempuan (P)',
    s.className,
    s.birthPlace,
    s.birthDate,
    s.badge,
    s.points,
    s.active ? 'Aktif' : 'Non-Aktif'
  ]);

  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `DATA_ANGGOTA_SISWA_GLS_SDN1_SRIMENGANTEN_${academicInfo.academicYear.replace('/', '-')}_${timestamp}.csv`;
  downloadBlob(formatCsv(headers, rows), filename);
}

/**
 * 3. Unduh Rekapitulasi Sirkulasi Peminjaman & Pengembalian (.CSV / Excel)
 */
export function exportLoansCSV(loans: Loan[], academicInfo = getAcademicYearInfo()) {
  const headers = [
    'No',
    'ID Transaksi',
    'NIS Siswa',
    'Nama Siswa',
    'Kelas',
    'Judul Buku yang Dipinjam',
    'Tanggal Peminjaman',
    'Batas Waktu (Jatuh Tempo)',
    'Tanggal Pengembalian',
    'Status Sirkulasi',
    'Denda Keterlambatan (Rp)',
    'Catatan Khusus'
  ];

  const rows = loans.map((l, index) => [
    index + 1,
    l.id,
    l.studentId,
    l.studentName,
    l.studentClass,
    l.bookTitles.join('; '),
    l.loanDate,
    l.dueDate,
    l.returnDate || '-',
    l.status,
    l.fine ? `Rp ${l.fine.toLocaleString('id-ID')}` : 'Rp 0',
    l.notes || '-'
  ]);

  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `REKAP_SIRKULASI_PEMINJAMAN_SDN1_SRIMENGANTEN_${academicInfo.academicYear.replace('/', '-')}_${timestamp}.csv`;
  downloadBlob(formatCsv(headers, rows), filename);
}

/**
 * 4. Unduh Buku Tamu & Kunjungan Pemustaka (.CSV / Excel)
 */
export function exportVisitorsCSV(visitors: VisitorLog[], academicInfo = getAcademicYearInfo()) {
  const headers = [
    'No',
    'ID Kunjungan',
    'Tanggal & Jam Masuk',
    'Nama Pengunjung / Siswa',
    'Kelas / Kategori Tamu',
    'Tujuan & Keperluan Kunjungan',
    'Tingkat Kepuasan (Bintang 1-5)'
  ];

  const rows = visitors.map((v, index) => [
    index + 1,
    v.id,
    v.formattedDate,
    v.name,
    v.className,
    v.purpose,
    v.rating ? `${v.rating} ⭐` : '5 ⭐'
  ]);

  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `BUKU_TAMU_KUNJUNGAN_SDN1_SRIMENGANTEN_${academicInfo.academicYear.replace('/', '-')}_${timestamp}.csv`;
  downloadBlob(formatCsv(headers, rows), filename);
}

/**
 * 5. Unduh Log Histori Audit & Input Realtime (.CSV / Excel)
 */
export function exportAuditLogsCSV(
  logs: { id: string; timestamp: string; formattedDate: string; type: string; activity: string; operator: string }[],
  academicInfo = getAcademicYearInfo()
) {
  const headers = [
    'No',
    'ID Log Entri',
    'Timestamp Realtime',
    'Format Waktu Lokal',
    'Kategori Entri',
    'Rincian Aktivitas Lapangan',
    'Petugas / Operator Penanggungjawab'
  ];

  const rows = logs.map((log, index) => [
    index + 1,
    log.id,
    log.timestamp,
    log.formattedDate,
    log.type,
    log.activity,
    log.operator
  ]);

  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `LOG_AUDIT_INPUT_REALTIME_SDN1_SRIMENGANTEN_${academicInfo.academicYear.replace('/', '-')}_${timestamp}.csv`;
  downloadBlob(formatCsv(headers, rows), filename);
}

/**
 * 6. Unduh Paket Laporan Lengkap Multi-Seksi Resmi (.CSV / Excel Master)
 * Berisi Rekapitulasi Eksekutif, Koleksi, Sirkulasi, Kunjungan & Siswa dalam satu berkas terstruktur
 */
export function exportMasterExecutiveReportCSV(data: {
  books: Book[];
  students: Student[];
  loans: Loan[];
  visitors: VisitorLog[];
  logs: any[];
  schoolIdentity: any;
  academicInfo: AcademicPeriodInfo;
}) {
  const { books, students, loans, visitors, schoolIdentity, academicInfo } = data;

  const totalCopies = books.reduce((acc, b) => acc + b.quantity, 0);
  const activeLoans = loans.filter(l => l.status === 'DIPINJAM').length;
  const returnedLoans = loans.filter(l => l.status === 'KEMBALI').length;
  const overdueLoans = loans.filter(l => l.status === 'TERLAMBAT').length;
  const totalFines = loans.reduce((acc, l) => acc + (l.fine || 0), 0);

  const lines: string[] = [
    '========================================================================================',
    'LAPORAN RESMI PERTANGGUNGJAWABAN PERPUSTAKAAN & GERAKAN LITERASI SEKOLAH (GLS)',
    `PEMERINTAH KABUPATEN TANGGAMUS - DINAS PENDIDIKAN DAN KEBUDAYAAN`,
    `${schoolIdentity.name || 'SD NEGERI 1 SRIMENGANTEN'}`,
    `Alamat: ${schoolIdentity.address || 'Jalan Babakan Linggar Pekon Srimenganten, Kec. Pulau Panggung, Kab. Tanggamus'}`,
    `Tahun Ajaran: ${academicInfo.academicYear} | ${academicInfo.semesterLabel} (${academicInfo.periodRangeText})`,
    `Waktu Unduh Laporan: ${academicInfo.dateFormattedIndo}, ${academicInfo.timeFormattedIndo}`,
    '========================================================================================',
    '',
    '--- I. RINGKASAN EKSEKUTIF STATISTIK UTAMA ---',
    `Total Judul Koleksi Buku,${books.length} Judul`,
    `Total Eksemplar Buku Fisik,${totalCopies} Eksemplar`,
    `Total Siswa Terdaftar Anggota,${students.length} Siswa`,
    `Total Akumulasi Transaksi Sirkulasi,${loans.length} Transaksi`,
    `Sirkulasi Buku Sedang Dipinjam,${activeLoans} Transaksi`,
    `Sirkulasi Buku Selesai Dikembalikan,${returnedLoans} Transaksi`,
    `Sirkulasi Terlambat/Jatuh Tempo,${overdueLoans} Transaksi`,
    `Total Akumulasi Kas Denda Keterlambatan,Rp ${totalFines.toLocaleString('id-ID')}`,
    `Total Pengunjung Buku Tamu,${visitors.length} Pemustaka`,
    '',
    '--- II. DAFTAR KOLEKSI BUKU PERPUSTAKAAN ---',
    'No,ID Inventaris,Kode,Judul Buku,Kategori,Pengarang,Penerbit,Tahun,ISBN,Rak,Jumlah,Tersedia',
    ...books.map((b, i) => 
      `${i+1},"${b.id}","${b.code}","${b.title.replace(/"/g, '""')}","${b.category}","${b.author}","${b.publisher}","${b.year}","${b.isbn}","${b.shelf}",${b.quantity},${b.available}`
    ),
    '',
    '--- III. DAFTAR ANGGOTA SISWA & PRESTASI LITERASI ---',
    'No,NIS,NISN,Nama Siswa,JK,Kelas,Peringkat Bintang GLS,Poin Literasi',
    ...students.map((s, i) => 
      `${i+1},"${s.nis}","${s.nisn}","${s.name}","${s.gender}","${s.className}","${s.badge}",${s.points}`
    ),
    '',
    '--- IV. DAFTAR SIRKULASI PEMINJAMAN TERAKHIR ---',
    'No,ID Transaksi,Nama Siswa,Kelas,Judul Buku,Tgl Pinjam,Jatuh Tempo,Tgl Kembali,Status,Denda',
    ...loans.map((l, i) => 
      `${i+1},"${l.id}","${l.studentName}","${l.studentClass}","${l.bookTitles.join('; ').replace(/"/g, '""')}","${l.loanDate}","${l.dueDate}","${l.returnDate || '-'}","${l.status}",${l.fine || 0}`
    ),
    '',
    '--- V. LEMBAR PENGESAHAN & TANDA TANGAN ---',
    `Kepala Sekolah:,"${schoolIdentity.headmaster}"`,
    `NIP Kepala Sekolah:,"'${schoolIdentity.nip}"`,
    `Petugas Perpustakaan:,"${schoolIdentity.librarian}"`,
    `NIP Petugas:,"'${schoolIdentity.librarianNip}"`,
    '========================================================================================'
  ];

  const content = '\uFEFF' + lines.join('\r\n');
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `LAPORAN_MASTER_LENGKAP_GLS_SDN1_SRIMENGANTEN_${academicInfo.academicYear.replace('/', '-')}_${timestamp}.csv`;
  downloadBlob(content, filename);
}

/**
 * 7. Unduh Cadangan Penuh Database JSON (Backup & Arsip Digital)
 */
export function exportFullDatabaseJSON(data: {
  books: Book[];
  students: Student[];
  loans: Loan[];
  visitors: VisitorLog[];
  logs: any[];
  schoolIdentity: any;
  academicInfo: AcademicPeriodInfo;
}) {
  const exportPayload = {
    metadata: {
      appName: 'Sistem Perpustakaan Digital & GLS SD Negeri 1 Srimenganten',
      exportedAt: new Date().toISOString(),
      academicYear: data.academicInfo.academicYear,
      semester: data.academicInfo.semesterLabel,
      schoolIdentity: data.schoolIdentity,
      systemVersion: '2.5.0-GLS-TANGGAMUS'
    },
    statistics: {
      totalBookTitles: data.books.length,
      totalBookCopies: data.books.reduce((acc, b) => acc + b.quantity, 0),
      totalStudents: data.students.length,
      totalLoans: data.loans.length,
      totalVisitors: data.visitors.length,
      totalAuditLogs: data.logs.length
    },
    database: {
      books: data.books,
      students: data.students,
      loans: data.loans,
      visitors: data.visitors,
      activityLogs: data.logs
    }
  };

  const jsonString = JSON.stringify(exportPayload, null, 2);
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `BACKUP_DATABASE_PERPUS_SDN1_SRIMENGANTEN_${data.academicInfo.academicYear.replace('/', '-')}_${timestamp}.json`;
  downloadBlob(jsonString, filename, 'application/json;charset=utf-8;');
}
