/**
 * Kalkulator & Generator Tahun Ajaran (Academic Year) dan Semester Otomatis
 * Berdasarkan Kalender Pendidikan Nasional Indonesia:
 * - Bulan Juli - Desember Tahun X  => Tahun Ajaran X / (X+1), Semester Ganjil (1)
 * - Bulan Januari - Juni Tahun X+1 => Tahun Ajaran X / (X+1), Semester Genap (2)
 * 
 * Contoh:
 * - Agustus 2026 => Tahun Ajaran 2026/2027 (Semester Ganjil)
 * - Februari 2027 => Tahun Ajaran 2026/2027 (Semester Genap)
 * - Juli 2027 => Tahun Ajaran 2027/2028 (Semester Ganjil)
 * - April 2028 => Tahun Ajaran 2027/2028 (Semester Genap)
 */

export interface AcademicPeriodInfo {
  academicYear: string;        // e.g. "2026/2027"
  startYear: number;           // e.g. 2026
  endYear: number;             // e.g. 2027
  semester: 'Ganjil' | 'Genap';
  semesterNumber: 1 | 2;
  semesterLabel: string;       // e.g. "Semester Ganjil (1)"
  fullPeriodTitle: string;     // e.g. "Tahun Ajaran 2026/2027 - Semester Ganjil"
  dateFormattedIndo: string;   // e.g. "Rabu, 26 Agustus 2026"
  timeFormattedIndo: string;   // e.g. "09:15:30 WIB"
  monthNameIndo: string;       // e.g. "Agustus 2026"
  periodRangeText: string;     // e.g. "Juli 2026 – Juni 2027"
}

export function getAcademicYearInfo(customDate?: Date | string): AcademicPeriodInfo {
  const date = customDate ? (typeof customDate === 'string' ? new Date(customDate) : customDate) : new Date();
  const validDate = isNaN(date.getTime()) ? new Date() : date;

  const currentYear = validDate.getFullYear();
  const currentMonth = validDate.getMonth(); // 0 = Jan, 6 = Juli, 11 = Des

  let startYear: number;
  let endYear: number;
  let semester: 'Ganjil' | 'Genap';
  let semesterNumber: 1 | 2;

  if (currentMonth >= 6) {
    // Juli (index 6) sampai Desember (index 11)
    startYear = currentYear;
    endYear = currentYear + 1;
    semester = 'Ganjil';
    semesterNumber = 1;
  } else {
    // Januari (index 0) sampai Juni (index 5)
    startYear = currentYear - 1;
    endYear = currentYear;
    semester = 'Genap';
    semesterNumber = 2;
  }

  const academicYear = `${startYear}/${endYear}`;
  const semesterLabel = `Semester ${semester} (${semesterNumber})`;
  const fullPeriodTitle = `Tahun Ajaran ${academicYear} - Semester ${semester}`;
  const periodRangeText = `Juli ${startYear} – Juni ${endYear}`;

  const dateFormattedIndo = validDate.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const timeFormattedIndo = `${validDate.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })} WIB`;

  const monthNameIndo = validDate.toLocaleDateString('id-ID', {
    month: 'long',
    year: 'numeric'
  });

  return {
    academicYear,
    startYear,
    endYear,
    semester,
    semesterNumber,
    semesterLabel,
    fullPeriodTitle,
    dateFormattedIndo,
    timeFormattedIndo,
    monthNameIndo,
    periodRangeText
  };
}
