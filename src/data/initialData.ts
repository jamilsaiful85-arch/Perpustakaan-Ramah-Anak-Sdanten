export interface Book {
  id: string; // SKU / Inventory ID like INV-xxxx
  title: string;
  code: string; // The original book code (B1, B2, B3, A, C)
  category: string;
  author: string;
  publisher: string;
  year: string;
  isbn: string;
  quantity: number;
  available: number;
  shelf: string;
  coverColor: string; // To generate kids-friendly covers dynamically
  emoji: string;      // Visual kid-friendly visual icon
  description: string;
}

export interface Student {
  id: string; // NIS
  name: string;
  gender: 'L' | 'P';
  nis: string;
  nisn: string;
  birthPlace: string;
  birthDate: string;
  className: string; // Kelas 1 - Kelas 6
  active: boolean;
  avatarUrl: string;
  badge: 'Pemula' | 'Pembaca Hebat' | 'Pahlawan Buku' | 'Bintang Literasi';
  points: number; // For reading gamification
}

export interface Loan {
  id: string;
  studentId: string;
  studentName: string;
  studentClass: string;
  bookIds: string[];
  bookTitles: string[];
  loanDate: string;
  dueDate: string;
  returnDate?: string;
  fine: number;
  status: 'DIPINJAM' | 'KEMBALI' | 'TERLAMBAT';
  notes?: string;
}

export const INITIAL_BOOKS: Book[] = [
  // Page 1
  { id: "INV-001", title: "Kiti dan Balon Udara", code: "B1", category: "Cerita Anak", author: "Suryadi W.", publisher: "Perpustakaan Digital Madani", year: "2024", isbn: "978-602-1234-01-9", quantity: 3, available: 3, shelf: "Rak B1-Hewan", coverColor: "from-blue-400 to-indigo-500", emoji: "🎈", description: "Perjalanan seru Kiti bersama balon udara warna-warni mengelilingi desa hijau." },
  { id: "INV-002", title: "Mengapa Diam Saja?", code: "B1", category: "Pengembangan Diri Anak", author: "Ayu Astuti", publisher: "Buku Litera Sekolah", year: "2024", isbn: "978-602-1234-02-6", quantity: 3, available: 3, shelf: "Rak B1-Sikap", coverColor: "from-amber-400 to-orange-500", emoji: "🤫", description: "Kisah persahabatan tentang memahami emosi dan keberanian untuk berbicara jujur." },
  { id: "INV-003", title: "Selamat Tidur, Kola!", code: "B1", category: "Cerita Sebelum Tidur", author: "Dewi Lestari", publisher: "Erlangga Anak", year: "2024", isbn: "978-602-1234-03-3", quantity: 3, available: 3, shelf: "Rak B1-Tidur", coverColor: "from-violet-400 to-purple-600", emoji: "🐨", description: "Buku pengantar tidur yang mengajarkan Kola pentingnya istirahat tepat waktu." },
  { id: "INV-004", title: "Puka Jalan-Jalan", code: "B1", category: "Cerita Anak", author: "Hariadi", publisher: "Indah Pustaka", year: "2024", isbn: "978-602-1234-04-0", quantity: 3, available: 3, shelf: "Rak B1-Hewan", coverColor: "from-teal-400 to-emerald-600", emoji: "🦘", description: "Petualangan anak kanguru bernama Puka mencari keajaiban di padang rumput." },
  { id: "INV-005", title: "Sembunyi-Sembunyi", code: "B1", category: "Permainan Tradisional", author: "Nanan G.", publisher: "Kreator Bangsa", year: "2024", isbn: "978-602-1234-05-7", quantity: 3, available: 3, shelf: "Rak B1-Aktif", coverColor: "from-pink-400 to-rose-500", emoji: "🙈", description: "Permainan petak umpet seru yang mengajarkan sportivitas dan kegembiraan bersama." },
  { id: "INV-006", title: "Uuh Sebel!", code: "B1", category: "Pengembangan Diri Anak", author: "Fujianti S.", publisher: "Grasindo Kids", year: "2024", isbn: "978-602-1234-06-4", quantity: 3, available: 3, shelf: "Rak B1-Sikap", coverColor: "from-red-400 to-orange-600", emoji: "😤", description: "Belajar mengelola rasa marah bagi usia dini dengan cara yang bijak dan menyenangkan." },
  { id: "INV-007", title: "Terima Kasih, Damki", code: "B1", category: "Cerita Anak", author: "Zulpan Hari", publisher: "Yudhistira Anak", year: "2024", isbn: "978-602-1234-07-1", quantity: 3, available: 3, shelf: "Rak B1-Hewan", coverColor: "from-yellow-400 to-amber-600", emoji: "🐕", description: "Kisah kesetiaan anjing pintar Damki menjaga perkebunan keluarga kakek." },
  { id: "INV-008", title: "Hobi Baru", code: "B1", category: "Keterampilan Anak", author: "Budi Utomo", publisher: "Tiga Serangkai", year: "2024", isbn: "978-602-1234-08-8", quantity: 3, available: 3, shelf: "Rak B1-Aktif", coverColor: "from-cyan-400 to-blue-500", emoji: "🎨", description: "Ciko mencoba berbagai macam hobi menarik sampai menemukan bakat melukisnya." },
  { id: "INV-009", title: "Lulu Mencari Gong", code: "B1", category: "Seni & Budaya", author: "Eko Prasetyo", publisher: "Balai Pustaka Anak", year: "2024", isbn: "978-602-1234-09-5", quantity: 3, available: 3, shelf: "Rak B1-Budaya", coverColor: "from-indigo-400 to-purple-600", emoji: "🥁", description: "Perjalanan memukau Lulu menyusuri sanggar seni daerah mencari gong pusaka." },
  { id: "INV-010", title: "Ciko, Cimi, dan Rumah Pohon", code: "B1", category: "Cerita Anak", author: "Kartina R.", publisher: "Pustaka Pelangi", year: "2024", isbn: "978-602-1234-10-1", quantity: 3, available: 3, shelf: "Rak B1-Aktif", coverColor: "from-emerald-400 to-teal-600", emoji: "🏡", description: "Kerja sama manis kakak adik tupai membangun rumah pohon di musim semi." },
  { id: "INV-011", title: "Ayo Lari, Kino!", code: "B1", category: "Sains & Kesehatan", author: "M. Yunus", publisher: "Kementerian Pendidikan", year: "2024", isbn: "978-602-1234-11-8", quantity: 3, available: 3, shelf: "Rak B1-Sehat", coverColor: "from-fuchsia-400 to-pink-600", emoji: "🏃", description: "Pentingnya berolahraga dan mengonsumsi sayuran agar badan kuat seperti si Kino." },
  { id: "INV-012", title: "Tut Tuut Tut Siapa Hendak Turut?", code: "B1", category: "Buku Interaktif Anak", author: "Amalia", publisher: "Pustaka Dekat", year: "2024", isbn: "978-602-1234-12-5", quantity: 3, available: 3, shelf: "Rak B1-Aktif", coverColor: "from-sky-450 to-blue-600", emoji: "🚂", description: "Bernyanyi dan belajar tentang nama-nama kota di Indonesia lewat lagu kereta api." },
  
  // Page 2
  { id: "INV-013", title: "Permainan Rahasia Minul", code: "B1", category: "Misteri Anak", author: "Ratih", publisher: "Intan Pariwara", year: "2024", isbn: "978-602-1234-13-2", quantity: 3, available: 3, shelf: "Rak B1-Aktif", coverColor: "from-blue-400 to-emerald-500", emoji: "🧩", description: "Minul menyusun kuis cerdas cermat rahasia untuk kejutan ulang tahun ibunya." },
  { id: "INV-014", title: "Ayo, Berangkat, Roli!", code: "B1", category: "Cerita Anak", author: "Dimas A.", publisher: "Erlangga Kids", year: "2024", isbn: "978-602-1234-14-9", quantity: 3, available: 3, shelf: "Rak B1-Hewan", coverColor: "from-amber-400 to-orange-600", emoji: "🚴", description: "Perjuangan kelinci Roli mengendarai sepeda barunya berangkat ke sekolah dasar." },
  { id: "INV-015", title: "Maaf, Tapi Tidak!", code: "B1", category: "Pengembangan Diri Anak", author: "Tari W.", publisher: "Tiga Serangkai", year: "2024", isbn: "978-602-1234-15-6", quantity: 3, available: 3, shelf: "Rak B1-Sikap", coverColor: "from-rose-450 to-red-650", emoji: "🙅", description: "Belajar berkata tidak untuk hal-hal berbahaya demi menjaga keselamatan diri anak." },
  { id: "INV-016", title: "Pantai untuk Semua", code: "B1", category: "Sains & Lingkungan", author: "Ismail", publisher: "Penerbit Green SD", year: "2024", isbn: "978-602-1234-16-3", quantity: 3, available: 3, shelf: "Rak B1-Sains", coverColor: "from-cyan-400 to-teal-500", emoji: "🏖️", description: "Menjaga kebersihan laut dan ekosistem terumbu karang secara bergotong royong." },
  { id: "INV-017", title: "Julia dan Bola Pinang", code: "B2", category: "Olahraga Tradisional", author: "Sonia G.", publisher: "Balai Bahasa", year: "2024", isbn: "978-602-1234-17-0", quantity: 3, available: 3, shelf: "Rak B2-Lokal", coverColor: "from-indigo-400 to-purple-600", emoji: "⚽", description: "Julia belajar ketangkasan menendang bola pinang khas daerah Sumatera Selatan." },
  { id: "INV-018", title: "Feng", code: "B2", category: "Persahabatan Global", author: "Li Wei", publisher: "Toko Buku Dunia", year: "2024", isbn: "978-602-1234-18-7", quantity: 3, available: 3, shelf: "Rak B2-Dunia", coverColor: "from-red-400 to-pink-600", emoji: "🐼", description: "Kisah persahabatan anak dunia, melintasi perbedaan bahasa dan mengenalkan aksara." },
  { id: "INV-019", title: "Si Anak Dieng", code: "B2", category: "Budaya Nusantara", author: "Gunawan", publisher: "Bentang Kidz", year: "2024", isbn: "978-602-1234-19-4", quantity: 3, available: 3, shelf: "Rak B2-Lokal", coverColor: "from-teal-400 to-indigo-600", emoji: "⛰️", description: "Petualangan Gilang di pegunungan Dieng yang sejuk, mistis, dan penuh sejarah." },
  { id: "INV-020", title: "Rancak Sakit", code: "B2", category: "Sains & Kesehatan", author: "Andi R.", publisher: "Sains Anak SD", year: "2024", isbn: "978-602-1234-20-0", quantity: 3, available: 3, shelf: "Rak B2-Sains", coverColor: "from-green-400 to-emerald-600", emoji: "🤒", description: "Mengapa rancak bisa sakit demam? Edukasi kuman dan cara mencuci tangan dengan sabun." },
  { id: "INV-021", title: "Kisah Daun Mangga", code: "B2", category: "Sains Tradisional", author: "Arifin", publisher: "Kementerian Lingkungan", year: "2024", isbn: "978-602-1234-21-7", quantity: 3, available: 3, shelf: "Rak B2-Sains", coverColor: "from-lime-400 to-forest-650", emoji: "🍃", description: "Metamorfosis energi matahari menjadi zat hijau daun mangga yang rimbun." },
  { id: "INV-022", title: "Daun-Daun Istimewa", code: "B2", category: "Sains Tradisional", author: "Lina", publisher: "Intan Pariwara", year: "2024", isbn: "978-602-1234-22-4", quantity: 3, available: 3, shelf: "Rak B2-Sains", coverColor: "from-emerald-400 to-emerald-700", emoji: "🍁", description: "Mengenal ragam jenis tulang dan bentuk daun di sekitar pekarangan sekolah dasar." },
  { id: "INV-023", title: "Ada Apa di Balik Hutan?", code: "B2", category: "Dongeng Nusantara", author: "Suroso", publisher: "Pustaka Rimba", year: "2024", isbn: "978-602-1234-23-1", quantity: 3, available: 3, shelf: "Rak B2-Misteri", coverColor: "from-violet-550 to-slate-700", emoji: "🌲", description: "Misteri satwa langka yang menjaga hutan hujan tropis dari penebangan liar." },
  { id: "INV-024", title: "Damar Kurung Persahabatan", code: "B2", category: "Seni & Kerajinan", author: "Siti K.", publisher: "Seni Indonesia", year: "2024", isbn: "978-602-1234-24-8", quantity: 3, available: 3, shelf: "Rak B2-Lokal", coverColor: "from-amber-400 to-rose-500", emoji: "🏮", description: "Membuat lampion damar kurung Gresik bersama sahabat terbaik di masa liburan." }
];

export const INITIAL_STUDENTS: Student[] = [
  // Class 1
  { id: "NIS-1988", name: "AHMAD REZKY", gender: "L", nis: "1988", nisn: "7405101607170002", birthPlace: "WOWONDENGGI", birthDate: "16 Juli 2017", className: "Kelas 1", active: true, avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=AhmadRezky", badge: "Pemula", points: 20 },
  { id: "NIS-1989", name: "AL FAUZAN MUHYI", gender: "L", nis: "1989", nisn: "1906041908180001", birthPlace: "SRI MENGANTEN", birthDate: "19 Agustus 2018", className: "Kelas 1", active: true, avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=AlFauzan", badge: "Pemula", points: 35 },
  { id: "NIS-1990", name: "ALIF ROUFFUR ROHMAN", gender: "L", nis: "1990", nisn: "1806062809180001", birthPlace: "SRI MENGANTEN", birthDate: "28 September 2018", className: "Kelas 1", active: true, avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=AlifRouffur", badge: "Pembaca Hebat", points: 150 },
  { id: "NIS-1991", name: "ANGGI ANUGRAH", gender: "P", nis: "1991", nisn: "1806042003180001", birthPlace: "TANGGAMUS", birthDate: "20 Maret 2018", className: "Kelas 1", active: true, avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=AnggiAnugrah", badge: "Pemula", points: 40 },
  { id: "NIS-1992", name: "AQILLA FDELYA", gender: "P", nis: "1992", nisn: "7405105501190001", birthPlace: "WOWONDENGI", birthDate: "15 Januari 2019", className: "Kelas 1", active: true, avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=AqillaFdelya", badge: "Pahlawan Buku", points: 280 },
  { id: "NIS-1993", name: "AZKIA NAURA ARASHYA", gender: "P", nis: "1993", nisn: "1806046602190001", birthPlace: "TANGGAMUS", birthDate: "26 Februari 2019", className: "Kelas 1", active: true, avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=AzkiaNaura", badge: "Pemula", points: 60 },
  { id: "NIS-1994", name: "FARIZ DZAKIR FATAHILLAH", gender: "L", nis: "1994", nisn: "1806040509190001", birthPlace: "TANGGAMUS", birthDate: "05 September 2019", className: "Kelas 1", active: true, avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=FarizDzakir", badge: "Pemula", points: 15 },
  { id: "NIS-1995", name: "FATHIR DEPAN TAMA", gender: "L", nis: "1995", nisn: "1806040111180001", birthPlace: "TANGGAMUS", birthDate: "01 November 2018", className: "Kelas 1", active: true, avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=FathirDepan", badge: "Pemula", points: 30 },
  { id: "NIS-1996", name: "GIBRAN RAMADHAN", gender: "L", nis: "1996", nisn: "1806041605190001", birthPlace: "TANGGAMUS", birthDate: "16 Mei 2019", className: "Kelas 1", active: true, avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=GibranRamadhan", badge: "Pembaca Hebat", points: 120 },
  { id: "NIS-1997", name: "INDI PUTRI NADIN", gender: "P", nis: "1997", nisn: "1806045903190002", birthPlace: "TANGGAMUS", birthDate: "19 Maret 2019", className: "Kelas 1", active: true, avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=IndiPutri", badge: "Pemula", points: 25 },
  { id: "NIS-1998", name: "KHOIRUL HUSNA", gender: "P", nis: "1998", nisn: "1806044407180001", birthPlace: "TANGGAMUS", birthDate: "4 Juli 2018", className: "Kelas 1", active: true, avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=KhoirulHusna", badge: "Bintang Literasi", points: 420 },

  // Class 2
  { id: "NIS-1962", name: "ADIBA SHAKILA ATMARINI", gender: "P", nis: "1962", nisn: "1806044506180001", birthPlace: "TANGGAMUS", birthDate: "5 Juni 2018", className: "Kelas 2", active: true, avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=AdibaShakila", badge: "Pembaca Hebat", points: 195 },
  { id: "NIS-1963", name: "ADILA ARSI SABILA", gender: "P", nis: "1963", nisn: "1806045001180001", birthPlace: "SRIMENGANTEN", birthDate: "10 Januari 2018", className: "Kelas 2", active: true, avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=AdilaArsi", badge: "Pemula", points: 80 },
  { id: "NIS-1964", name: "ALIFA RAMADHANI", gender: "P", nis: "1964", nisn: "1806046105180001", birthPlace: "Talang Padang", birthDate: "21 Mei 2018", className: "Kelas 2", active: true, avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=AlifaRamadhani", badge: "Pahlawan Buku", points: 310 },
  { id: "NIS-1965", name: "AQYLA EDIA RAMA", gender: "P", nis: "1965", nisn: "1806045507170002", birthPlace: "Tekad", birthDate: "15 Juli 2017", className: "Kelas 2", active: true, avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=AqylaEdia", badge: "Pemula", points: 55 },
  { id: "NIS-1966", name: "ASHILLA SALSABILA", gender: "P", nis: "1966", nisn: "1806045601170001", birthPlace: "TANGGAMUS", birthDate: "16 Oktober 2017", className: "Kelas 2", active: true, avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=AshillaSalsabila", badge: "Bintang Literasi", points: 490 },
  { id: "NIS-1967", name: "ASYIFA TRIYANDINI", gender: "P", nis: "1967", nisn: "1806046608170001", birthPlace: "TANGGAMUS", birthDate: "26 Agustus 2017", className: "Kelas 2", active: true, avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=AsyifaTriyandini", badge: "Pemula", points: 10 },
  { id: "NIS-1968", name: "AZQI FEBRIAN AL FAHMI", gender: "P", nis: "1968", nisn: "1806041102170001", birthPlace: "Srimenganten", birthDate: "11 Februari 2017", className: "Kelas 2", active: true, avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=AzqiFebrian", badge: "Pembaca Hebat", points: 165 },

  // Class 3
  { id: "NIS-1934", name: "Adeleo Pratama", gender: "L", nis: "1934", nisn: "1806041308160002", birthPlace: "Srimenganten", birthDate: "2016-08-13", className: "Kelas 3", active: true, avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=AdeleoPratama", badge: "Pahlawan Buku", points: 340 },
  { id: "NIS-1935", name: "AIDIL RAMADAN", gender: "L", nis: "1935", nisn: "1801130206170008", birthPlace: "Lampung Selatan", birthDate: "2017-06-02", className: "Kelas 3", active: true, avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=AidilRamadan", badge: "Pemula", points: 75 },
  { id: "NIS-1936", name: "AL FAHMI NUR'ARIFIN", gender: "L", nis: "1936", nisn: "1806041802170001", birthPlace: "TANGGAMUS", birthDate: "2017-02-18", className: "Kelas 3", active: true, avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=AlFahmi", badge: "Pemula", points: 90 },
  { id: "NIS-1937", name: "ALIYA MEI SALSABILA", gender: "P", nis: "1937", nisn: "1806046405160001", birthPlace: "TANGGAMUS", birthDate: "2016-05-24", className: "Kelas 3", active: true, avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=AliyaMei", badge: "Pahlawan Buku", points: 290 },

  // Class 4
  { id: "NIS-1914", name: "ADITYA RAHMAN", gender: "L", nis: "1914", nisn: "1806043012160001", birthPlace: "Tekad", birthDate: "30 Desember 2016", className: "Kelas 4", active: true, avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=AdityaRahman", badge: "Bintang Literasi", points: 510 },
  { id: "NIS-1915", name: "ALISA", gender: "P", nis: "1915", nisn: "1806044202160001", birthPlace: "Bogor", birthDate: "02 Februari 2016", className: "Kelas 4", active: true, avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Alisa", badge: "Pemula", points: 45 },
  { id: "NIS-1916", name: "ALVARO KHOIRUL AZZAM", gender: "L", nis: "1916", nisn: "1806040803160001", birthPlace: "Srimenganten", birthDate: "08 Maret 2016", className: "Kelas 4", active: true, avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=AlvaroKhoirul", badge: "Pembaca Hebat", points: 180 },

  // Class 5
  { id: "NIS-1932", name: "ADIB PUTRA PRATAMA", gender: "L", nis: "1932", nisn: "1806040104150001", birthPlace: "Bandung Baru", birthDate: "01 April 2015", className: "Kelas 5", active: true, avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=AdibPutra", badge: "Bintang Literasi", points: 550 },
  { id: "NIS-1892", name: "AJENG AL-MAIDAH", gender: "P", nis: "1892", nisn: "1806046705150001", birthPlace: "Srimenganten", birthDate: "27 Mei 2015", className: "Kelas 5", active: true, avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=AjengAl", badge: "Pembaca Hebat", points: 210 },
  { id: "NIS-1893", name: "ALIF RAMADHAN", gender: "L", nis: "1893", nisn: "1806041706150001", birthPlace: "TANGGAMUS", birthDate: "17 Juni 2015", className: "Kelas 5", active: true, avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=AlifRamadhan", badge: "Pemula", points: 95 },

  // Class 6
  { id: "NIS-1863", name: "ABI JALALUDIN", gender: "L", nis: "1863", nisn: "1805042510130001", birthPlace: "Tanggamus", birthDate: "25 Oktober 2013", className: "Kelas 6", active: true, avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=AbiJalaludin", badge: "Bintang Literasi", points: 640 },
  { id: "NIS-1864", name: "ABIZA HIBATUL TABRIZZAKIF", gender: "L", nis: "1864", nisn: "1806042104140002", birthPlace: "Tanggamus", birthDate: "21 April 2014", className: "Kelas 6", active: true, avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=AbizaHibabul", badge: "Pahlawan Buku", points: 380 },
  { id: "NIS-1865", name: "AJI RAHAYU", gender: "L", nis: "1865", nisn: "1806042305140003", birthPlace: "Cianjur", birthDate: "23 Mei 2014", className: "Kelas 6", active: true, avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=AjiRahayu", badge: "Pembaca Hebat", points: 140 }
];

export const LITERACY_QUOTES = [
  "Buku adalah jendela dunia, mari kita buka jendelanya lebar-lebar! 🌟",
  "Semakin banyak kamu membaca, semakin banyak tempat yang akan kamu kunjungi! 🗺️",
  "Membaca adalah petualangan seru yang bisa kita lakukan kapan saja! 🚀",
  "Anak pembaca hari ini adalah pemimpin cerdas masa depan! 👑",
  "Kutubuku adalah pahlawan super yang berjuang dengan kekuatan ilmu pengetahuan! 🦸‍♂️",
  "Setiap buku adalah sahabat baru yang siap berbagi rahasia kebaikan. 🤝"
];
