import React, { useState } from 'react';
import { Book } from '../data/initialData';
import { Search, Plus, Filter, Grid, List, Trash2, Edit, AlertCircle, CheckCircle, FileSpreadsheet, Download, RefreshCw, Barcode, BookOpen, Lock, Eye, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { playHappyTune } from './SplashIntro';

interface BookListProps {
  books: Book[];
  onAddBook: (book: Book) => void;
  onUpdateBook: (book: Book) => void;
  onDeleteBook: (id: string) => void;
  isAdmin?: boolean;
  onRequireAdmin?: () => void;
}

export default function BookList({ 
  books, 
  onAddBook, 
  onUpdateBook, 
  onDeleteBook,
  isAdmin = false,
  onRequireAdmin 
}: BookListProps) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  
  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [selectedBarcode, setSelectedBarcode] = useState<Book | null>(null);
  const [viewingDetail, setViewingDetail] = useState<Book | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('B1');
  const [category, setCategory] = useState('Cerita Anak');
  const [author, setAuthor] = useState('');
  const [publisher, setPublisher] = useState('Penerbit Literasi Nasional');
  const [year, setYear] = useState('2024');
  const [isbn, setIsbn] = useState('');
  const [quantity, setQuantity] = useState(3);
  const [shelf, setShelf] = useState('Rak B1-Adaptasi');
  const [description, setDescription] = useState('');

  const [notif, setNotif] = useState<string | null>(null);

  // Filter & Search
  const filtered = books.filter(b => {
    const matchesSearch = b.title.toLowerCase().includes(search.toLowerCase()) ||
                          b.author.toLowerCase().includes(search.toLowerCase()) ||
                          b.id.toLowerCase().includes(search.toLowerCase()) ||
                          b.code.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter ? b.category === categoryFilter : true;
    return matchesSearch && matchesCat;
  });

  // Categories list derived dynamically
  const categories = Array.from(new Set(books.map(b => b.category)));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (!isAdmin && onRequireAdmin) {
      onRequireAdmin();
      return;
    }

    const bookColors = ["from-blue-400 to-indigo-500", "from-amber-400 to-orange-500", "from-violet-400 to-purple-600", "from-teal-400 to-emerald-600", "from-pink-400 to-rose-500", "from-emerald-400 to-teal-650"];
    const bookEmojis = ["🎈", "🐨", "🤫", "🦘", "🙈", "📚", "🎨", "🏮", "⚽", "⛰️", "🤒", "🍁"];

    if (editingBook) {
      // Edit
      const updated: Book = {
        ...editingBook,
        title,
        code,
        category,
        author,
        publisher,
        year,
        isbn,
        quantity: Number(quantity),
        shelf,
        description
      };
      onUpdateBook(updated);
      setNotif("✨ Data Buku berhasil diperbarui ke Cloud Database!");
    } else {
      // Add
      const randomColor = bookColors[Math.floor(Math.random() * bookColors.length)];
      const randomEmoji = bookEmojis[Math.floor(Math.random() * bookEmojis.length)];
      
      const newBook: Book = {
        id: `INV-${String(books.length + 1).padStart(3, '0')}`,
        title,
        code,
        category,
        author,
        publisher,
        year,
        isbn: isbn || `978-602-0000-${Math.floor(10 + Math.random() * 89)}-${Math.floor(Math.random() * 9)}`,
        quantity: Number(quantity),
        available: Number(quantity),
        shelf,
        coverColor: randomColor,
        emoji: randomEmoji,
        description: description || `Buku bacaan interaktif kategori ${category} untuk siswa-siswi SD Negeri 1 Srimenganten.`
      };
      onAddBook(newBook);
      setNotif("🎉 Buku baru berhasil didaftarkan ke Database!");
    }

    playHappyTune();
    setIsAddOpen(false);
    resetForm();
    setTimeout(() => setNotif(null), 3500);
  };

  const startEdit = (b: Book) => {
    if (!isAdmin && onRequireAdmin) {
      onRequireAdmin();
      return;
    }
    setEditingBook(b);
    setTitle(b.title);
    setCode(b.code);
    setCategory(b.category);
    setAuthor(b.author);
    setPublisher(b.publisher);
    setYear(b.year);
    setIsbn(b.isbn);
    setQuantity(b.quantity);
    setShelf(b.shelf);
    setDescription(b.description);
    setIsAddOpen(true);
  };

  const handleDelete = (b: Book) => {
    if (!isAdmin && onRequireAdmin) {
      onRequireAdmin();
      return;
    }
    if (confirm(`Hapus buku "${b.title}" dari katalog perpustakaan?`)) {
      onDeleteBook(b.id);
      playHappyTune();
    }
  };

  const resetForm = () => {
    setTitle('');
    setCode('B1');
    setCategory('Cerita Anak');
    setAuthor('');
    setPublisher('Penerbit Literasi Nasional');
    setYear('2024');
    setIsbn('');
    setQuantity(3);
    setShelf('Rak B1-Adaptasi');
    setDescription('');
  };

  // Simulate import Excel
  const triggerImportExcel = () => {
    if (!isAdmin && onRequireAdmin) {
      onRequireAdmin();
      return;
    }
    playHappyTune();
    setNotif("📍 Excel Diimpor!: Berhasil mensinkronkan data Buku Bacaan Literasi 2024!");
    setTimeout(() => setNotif(null), 3000);
  };

  // Simulate Export Excel
  const triggerExportExcel = () => {
    playHappyTune();
    setNotif("📥 Sukses mengunduh lembar Excel: Data_Buku_Perpustakaan.xlsx");
    setTimeout(() => setNotif(null), 3000);
  };

  return (
    <div className="space-y-4">
      
      {/* Search and control Header */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white/60 p-4 rounded-3xl border border-white max-w-7xl mx-auto shadow-xs">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari Judul, Penulis, Kode Rak, atau Kategori..."
            id="input-book-search"
            className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-2 text-xs focus:outline-hidden focus:border-blue-400 font-medium text-slate-700 shadow-inner"
          />
        </div>

        {/* Filter controls and layout buttons */}
        <div className="flex flex-wrap items-center gap-2">
          
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-2xl">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              id="select-book-cat-filter"
              className="text-xs bg-transparent border-none text-slate-600 focus:outline-hidden font-semibold"
            >
              <option value="">Semua Kategori ({books.length})</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="flex p-0.5 bg-slate-100/80 border border-slate-200 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-slate-600 hover:bg-white transition-all cursor-pointer ${viewMode === 'grid' ? 'bg-white shadow-xs text-primary' : ''}`}
              title="Tampilan Grid Kartu"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-slate-600 hover:bg-white transition-all cursor-pointer ${viewMode === 'table' ? 'bg-white shadow-xs text-primary' : ''}`}
              title="Tampilan Tabel Berkas"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Import / Export Action Buttons */}
          <button
            onClick={triggerImportExcel}
            id="btn-book-import"
            className="p-2.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-2xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span className="hidden sm:inline">Impor Excel</span>
          </button>

          <button
            onClick={triggerExportExcel}
            id="btn-book-export"
            className="p-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-2xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Unduh Rekap</span>
          </button>

          <button
            onClick={() => { 
              if (!isAdmin && onRequireAdmin) {
                onRequireAdmin();
                return;
              }
              playHappyTune(); 
              setIsAddOpen(true); 
              setEditingBook(null); 
              resetForm(); 
            }}
            id="btn-book-add"
            className="p-2.5 bg-primary hover:bg-blue-700 text-white rounded-2xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer hover:scale-103"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Buku</span>
          </button>
        </div>
      </div>

      {/* Notification toast */}
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

      {/* Main Books list body */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-white/40 border border-slate-200/50 rounded-3xl max-w-7xl mx-auto">
          <BookOpen className="w-16 h-16 text-slate-300 mx-auto animate-pulse" />
          <h3 className="text-lg font-bold text-slate-600 mt-4 font-display">Buku Tidak Ditemukan</h3>
          <p className="text-xs text-slate-400 mt-1">Coba sesuaikan kata kunci filter pencarian Anda atau tambahkan baru.</p>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW FOR KIDS */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 max-w-7xl mx-auto">
          {filtered.map(b => (
            <div
              key={b.id}
              onClick={() => setViewingDetail(b)}
              className="glass-card p-3 rounded-2xl cursor-pointer hover:scale-102 flex flex-col justify-between h-[320px] transition-all group"
            >
              {/* Kids Book Cover */}
              <div className={`bg-linear-to-tr ${b.coverColor} rounded-xl p-3 text-white relative aspect-[3/4] flex flex-col justify-between shadow-xs overflow-hidden`}>
                <div className="absolute -right-3 -top-3 w-12 h-12 bg-white/20 rounded-full" />
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[9px] bg-black/25 px-1.5 py-0.5 rounded-full text-white font-bold">{b.code}</span>
                  <span className="text-[10px] bg-white/25 px-1.5 py-0.5 rounded-full text-white font-bold truncate max-w-[90px]">{b.category}</span>
                </div>
                
                <span className="text-4xl text-center my-3 block animate-frequent-bounce">{b.emoji}</span>
                
                <div className="text-left">
                  <h4 className="font-extrabold text-[11px] leading-tight line-clamp-2 uppercase font-display select-none">
                    {b.title}
                  </h4>
                  <p className="text-[9px] text-white/80 font-medium truncate mt-0.5">Oleh: {b.author}</p>
                </div>
              </div>

              {/* Action Buttons & Stocks */}
              <div className="mt-2.5 space-y-1.5 text-left" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-400 font-bold">Stok:</span>
                  <span className={`px-2 py-0.5 rounded-full font-bold ${b.available > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                    {b.available} / {b.quantity} Tersedia
                  </span>
                </div>

                <div className="flex gap-1 items-center">
                  <button
                    onClick={() => setViewingDetail(b)}
                    className="p-1 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex-1 cursor-pointer flex items-center justify-center gap-1"
                    title="Lihat Detail Buku"
                  >
                    <Eye className="w-3.5 h-3.5" /> Detail
                  </button>

                  <button
                    onClick={() => setSelectedBarcode(b)}
                    className="p-1.5 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 rounded-lg text-xs cursor-pointer flex items-center justify-center"
                    title="Label Barcode"
                  >
                    <Barcode className="w-3.5 h-3.5" />
                  </button>

                  {isAdmin && (
                    <>
                      <button
                        onClick={() => startEdit(b)}
                        className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs cursor-pointer flex items-center justify-center"
                        title="Edit Buku"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(b)}
                        className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg text-xs cursor-pointer flex items-center justify-center"
                        title="Hapus Buku"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* TABLE VIEW FOR OPERATOR */
        <div className="bg-white/70 overflow-x-auto rounded-3xl border border-slate-200 max-w-7xl mx-auto shadow-xs">
          <table className="w-full text-left text-xs text-slate-600 border-collapse">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5">ID Buku</th>
                <th className="p-3.5">Judul Buku</th>
                <th className="p-3.5">Kode</th>
                <th className="p-3.5">Kategori</th>
                <th className="p-3.5">Penulis</th>
                <th className="p-3.5 font-mono">Tahun</th>
                <th className="p-3.5">Lokasi Rak</th>
                <th className="p-3.5 text-center">Stok</th>
                <th className="p-3.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(b => (
                <tr key={b.id} className="hover:bg-blue-50/50 transition-all">
                  <td className="p-3.5 font-mono font-bold text-slate-500">{b.id}</td>
                  <td className="p-3.5 font-medium cursor-pointer" onClick={() => setViewingDetail(b)}>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{b.emoji}</span>
                      <span className="font-bold text-slate-800 text-[13px] hover:text-primary">{b.title}</span>
                    </div>
                  </td>
                  <td className="p-3.5 font-bold"><span className="bg-slate-100 px-2 py-0.5 rounded-md">{b.code}</span></td>
                  <td className="p-3.5"><span className="bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full font-bold text-[10px]">{b.category}</span></td>
                  <td className="p-3.5 font-medium">{b.author}</td>
                  <td className="p-3.5 font-mono text-slate-500">{b.year}</td>
                  <td className="p-3.5 text-slate-500 font-medium">{b.shelf}</td>
                  <td className="p-3.5 text-center font-bold">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] ${b.available > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                      {b.available} / {b.quantity}
                    </span>
                  </td>
                  <td className="p-3.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button onClick={() => setViewingDetail(b)} className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg" title="Detail"><Eye className="w-4 h-4" /></button>
                      <button onClick={() => setSelectedBarcode(b)} className="p-1.5 text-slate-500 hover:text-yellow-600 rounded-lg" title="Barcode"><Barcode className="w-4 h-4" /></button>
                      {isAdmin && (
                        <>
                          <button onClick={() => startEdit(b)} className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg" title="Edit"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(b)} className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg" title="Hapus"><Trash2 className="w-4 h-4" /></button>
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

      {/* Book Detail Modal (Available to everyone & visitors) */}
      {viewingDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-blue-100 text-left relative space-y-4"
          >
            <button 
              onClick={() => setViewingDetail(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-4">
              <div className={`w-24 h-32 rounded-2xl bg-linear-to-tr ${viewingDetail.coverColor} p-3 text-white flex flex-col justify-between shrink-0 shadow-md`}>
                <span className="text-xs font-mono font-bold bg-black/20 px-1.5 py-0.5 rounded-full self-start">{viewingDetail.code}</span>
                <span className="text-3xl text-center">{viewingDetail.emoji}</span>
                <span className="text-[8px] font-black truncate">{viewingDetail.category}</span>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                  {viewingDetail.category}
                </span>
                <h3 className="text-base font-extrabold text-slate-800 font-display leading-snug">
                  {viewingDetail.title}
                </h3>
                <p className="text-xs text-slate-500 font-medium">Penulis: <strong>{viewingDetail.author}</strong></p>
                <p className="text-xs text-slate-500 font-medium">Penerbit: {viewingDetail.publisher} ({viewingDetail.year})</p>
                <p className="text-xs font-mono text-slate-400">ISBN: {viewingDetail.isbn}</p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
              <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Sinopsis / Deskripsi Buku
              </span>
              <p className="text-xs text-slate-600 leading-relaxed">
                {viewingDetail.description || "Buku bacaan interaktif yang menyenangkan dan mendidik untuk siswa SD Negeri 1 Srimenganten."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                <span className="text-[10px] text-blue-600 font-bold block">Lokasi Rak</span>
                <span className="font-extrabold text-blue-900">{viewingDetail.shelf}</span>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                <span className="text-[10px] text-emerald-600 font-bold block">Ketersediaan Fisik</span>
                <span className="font-extrabold text-emerald-900">{viewingDetail.available} dari {viewingDetail.quantity} Buku Tersedia</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              {isAdmin && (
                <button
                  onClick={() => {
                    const b = viewingDetail;
                    setViewingDetail(null);
                    startEdit(b);
                  }}
                  className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-primary rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5"
                >
                  <Edit className="w-3.5 h-3.5" /> Edit Buku
                </button>
              )}
              <button
                onClick={() => setViewingDetail(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Tutup
              </button>
            </div>

          </motion.div>
        </div>
      )}

      {/* Add / Edit Dialog Popup */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-blue-100 text-left overflow-y-auto max-h-[90vh]"
          >
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <h2 className="text-lg font-extrabold text-slate-800 font-display flex items-center gap-2">
                <span>📚</span> {editingBook ? 'Ubah Informasi Buku' : 'Registrasi Buku Literasi Baru'}
              </h2>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-slate-700 text-lg">×</button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs font-semibold text-slate-600">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1 col-span-1 md:col-span-2">
                  <label className="text-[11px] font-bold text-slate-500">Judul Buku Utama *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Masukkan judul buku secara tepat..."
                    id="input-book-form-title"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-blue-400 font-medium text-slate-700"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500">Kode Kelompok Buku (B1/B2/B3/A/C)</label>
                  <select
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    id="select-book-form-code"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700"
                  >
                    <option value="B1">B1 (Bacaan Kelas Rendah)</option>
                    <option value="B2">B2 (Bacaan Kelas Menengah)</option>
                    <option value="B3">B3 (Bacaan Kelas Tinggi)</option>
                    <option value="A">A (Pengayaan Guru/Siswa)</option>
                    <option value="C">C (Referensi Umum)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500">Kategori / Topik Bacaan</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Cerita Anak, Sains, Sejarah..."
                    id="input-book-form-cat"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500">Penulis / Pengarang</label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Nama Pengarang..."
                    id="input-book-form-author"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500">Penerbit</label>
                  <input
                    type="text"
                    value={publisher}
                    onChange={(e) => setPublisher(e.target.value)}
                    placeholder="Penerbit Buku..."
                    id="input-book-form-publisher"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500">Tahun Terbit</label>
                  <input
                    type="text"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    placeholder="2024"
                    id="input-book-form-year"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500">Nomor ISBN</label>
                  <input
                    type="text"
                    value={isbn}
                    onChange={(e) => setIsbn(e.target.value)}
                    placeholder="978-602-..."
                    id="input-book-form-isbn"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500">Jumlah Eksemplar</label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    id="input-book-form-qty"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500">Posisi Rak</label>
                  <input
                    type="text"
                    value={shelf}
                    onChange={(e) => setShelf(e.target.value)}
                    placeholder="Rak B1-Adaptasi"
                    id="input-book-form-shelf"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700"
                  />
                </div>

                <div className="space-y-1 col-span-1 md:col-span-2">
                  <label className="text-[11px] font-bold text-slate-500">Sinopsis / Ringkasan Cerita</label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tuliskan gambaran isi buku ini..."
                    id="input-book-form-desc"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700"
                  />
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
                  id="btn-book-form-submit"
                  className="px-5 py-2 rounded-xl text-white bg-primary hover:bg-blue-700 transition-all font-bold shadow-md"
                >
                  {editingBook ? 'Simpan Perubahan' : 'Daftarkan Buku Baru'}
                </button>
              </div>

            </form>
          </motion.div>
        </div>
      )}

      {/* Barcode / Book Label Printable Popup */}
      {selectedBarcode && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl border border-yellow-200">
            <h3 className="font-extrabold text-sm text-slate-800 font-display">🏷️ Label Punggung & Barcode Buku</h3>
            
            <div className="p-4 bg-yellow-50/60 rounded-2xl border border-yellow-200 text-left font-mono space-y-2">
              <div className="text-center font-bold text-xs uppercase text-slate-800 tracking-wider">
                SD NEGERI 1 SRIMENGANTEN
              </div>
              <div className="text-center text-lg font-black text-slate-900 py-1 bg-white rounded-lg border border-yellow-300 shadow-inner">
                {selectedBarcode.code} / {selectedBarcode.shelf.replace('Rak ', '')}
              </div>
              <div className="text-[11px] text-slate-600 text-center font-bold truncate">
                {selectedBarcode.title}
              </div>
              <div className="text-center font-black tracking-widest text-slate-800 text-sm">
                * {selectedBarcode.id} *
              </div>
            </div>

            <div className="flex gap-2 justify-center">
              <button
                onClick={() => {
                  playHappyTune();
                  alert("🖨️ Mencetak Label Barcode untuk buku: " + selectedBarcode.title);
                }}
                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
              >
                Cetak Stiker Barcode
              </button>
              <button
                onClick={() => setSelectedBarcode(null)}
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
