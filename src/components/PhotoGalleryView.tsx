import React, { useState } from 'react';
import { 
  Images, 
  Plus, 
  ExternalLink, 
  FolderOpen, 
  Trash2, 
  Eye, 
  Calendar, 
  User, 
  Sparkles, 
  UploadCloud, 
  Camera, 
  Check, 
  X,
  Filter,
  Layers,
  ZoomIn
} from 'lucide-react';
import { GalleryPhotoItem, dbSaveGalleryItem, dbDeleteGalleryItem } from '../lib/firestoreService';

interface PhotoGalleryViewProps {
  photos: GalleryPhotoItem[];
  isAdmin: boolean;
  currentUser?: {
    displayName?: string | null;
    email?: string | null;
    photoURL?: string | null;
  } | null;
  onRefresh?: () => void;
}

export default function PhotoGalleryView({ photos, isAdmin, currentUser }: PhotoGalleryViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [activePreviewPhoto, setActivePreviewPhoto] = useState<GalleryPhotoItem | null>(null);
  
  // Form states for adding photo
  const [photoTitle, setPhotoTitle] = useState('');
  const [photoDescription, setPhotoDescription] = useState('');
  const [photoCategory, setPhotoCategory] = useState<'TRANSFORMASI' | 'LAUNCHING' | 'KEGIATAN_SISWA' | 'POJOK_BACA' | 'DOKUMENTASI'>('LAUNCHING');
  const [photoDate, setPhotoDate] = useState(new Date().toISOString().split('T')[0]);
  const [uploaderName, setUploaderName] = useState(
    currentUser?.displayName || (isAdmin ? 'Saiful Jamil, M.Pd.' : 'Pengunjung Perpustakaan')
  );
  const [uploaderRole, setUploaderRole] = useState(isAdmin ? 'Kepala Sekolah' : 'Pemustaka / Guru');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const DRIVE_FOLDER_URL = "https://drive.google.com/drive/folders/1Qup72orotr4noxAIi_2vcTucUjaBc1LQ?usp=sharing";

  // Filter photos
  const filteredPhotos = selectedCategory === 'ALL' 
    ? photos 
    : photos.filter(p => p.category === selectedCategory);

  // Handle local file selection and convert to Base64 image
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2.5 * 1024 * 1024) {
        alert("Ukuran berkas terlalu besar. Silakan pilih foto dengan ukuran di bawah 2.5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        setImageUrl(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddPhotoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl && !imagePreview) {
      alert("Silakan unggah foto atau masukkan tautan URL gambar!");
      return;
    }

    setIsSubmitting(true);
    try {
      const newPhotoItem: GalleryPhotoItem = {
        id: `gal-${Date.now()}`,
        title: photoTitle.trim() || 'Dokumentasi Perpustakaan Ramah Anak',
        description: photoDescription.trim() || 'Dokumentasi kegiatan dan sarana literasi SDN 1 Srimenganten.',
        imageUrl: imagePreview || imageUrl.trim(),
        category: photoCategory,
        date: photoDate,
        uploaderName: uploaderName.trim() || 'Pengunjung',
        uploaderRole: uploaderRole.trim() || 'Umum',
        userEmail: currentUser?.email || undefined,
        createdAt: new Date().toISOString()
      };

      await dbSaveGalleryItem(newPhotoItem);

      // Reset form
      setPhotoTitle('');
      setPhotoDescription('');
      setImageUrl('');
      setImagePreview(null);
      setShowAddModal(false);
      alert("✅ Foto berhasil ditambahkan dan disimpan secara permanen di database Cloud!");
    } catch (err: any) {
      alert("Gagal menyimpan foto: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePhoto = async (photoId: string, title: string) => {
    if (window.confirm(`Yakin ingin menghapus foto "${title}" secara permanen dari database?`)) {
      try {
        await dbDeleteGalleryItem(photoId);
        if (activePreviewPhoto?.id === photoId) {
          setActivePreviewPhoto(null);
        }
      } catch (err: any) {
        alert("Gagal menghapus foto: " + err.message);
      }
    }
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'LAUNCHING':
        return <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">🎉 Launching</span>;
      case 'TRANSFORMASI':
        return <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black uppercase">🛠️ Transformasi</span>;
      case 'KEGIATAN_SISWA':
        return <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-black uppercase">📖 Kegiatan Siswa</span>;
      case 'POJOK_BACA':
        return <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-black uppercase">🎨 Pojok Baca</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 text-[10px] font-black uppercase">📸 Dokumentasi</span>;
    }
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Header Banner Galeri */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-black uppercase text-amber-300">
            <Images className="w-3.5 h-3.5" />
            <span>Dokumentasi & Galeri Permanen Cloud</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-display tracking-tight text-white">
            Galeri Foto Perpustakaan Ramah Anak
          </h2>
          <p className="text-xs sm:text-sm text-blue-100">
            Dokumentasi resmi seluruh kegiatan transformasi, peresmian launching, ruang baca ceria, dan Gerakan Literasi Siswa SDN 1 Srimenganten.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <a
            href={DRIVE_FOLDER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-2xl text-xs font-black shadow-lg transition-transform hover:scale-105 flex items-center gap-2"
          >
            <FolderOpen className="w-4 h-4 text-slate-950" />
            <span>Buka Google Drive Resmi</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-white text-blue-900 hover:bg-blue-50 rounded-2xl text-xs font-black shadow-lg transition-transform hover:scale-105 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Unggah Foto Baru</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Counter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              selectedCategory === 'ALL' ? 'bg-primary text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Semua Foto ({photos.length})
          </button>
          <button
            onClick={() => setSelectedCategory('LAUNCHING')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              selectedCategory === 'LAUNCHING' ? 'bg-primary text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            🎉 Launching
          </button>
          <button
            onClick={() => setSelectedCategory('TRANSFORMASI')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              selectedCategory === 'TRANSFORMASI' ? 'bg-primary text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            🛠️ Transformasi
          </button>
          <button
            onClick={() => setSelectedCategory('KEGIATAN_SISWA')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              selectedCategory === 'KEGIATAN_SISWA' ? 'bg-primary text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            📖 Kegiatan Siswa
          </button>
          <button
            onClick={() => setSelectedCategory('POJOK_BACA')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              selectedCategory === 'POJOK_BACA' ? 'bg-primary text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            🎨 Pojok Baca
          </button>
        </div>

        <div className="text-[11px] text-slate-500 font-bold px-2 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Tersimpan Permanen di Cloud</span>
        </div>
      </div>

      {/* Grid Galeri Foto */}
      {filteredPhotos.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto text-2xl">
            📷
          </div>
          <h3 className="text-sm font-bold text-slate-700">Belum ada foto dalam kategori ini</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Klik tombol "Unggah Foto Baru" di atas untuk menambahkan dokumentasi yang langsung tersimpan permanen.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer hover:bg-blue-500 inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Tambah Foto Pertama
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              className="group bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              {/* Photo Thumbnail Container */}
              <div 
                className="relative aspect-4/3 overflow-hidden bg-slate-100 cursor-pointer"
                onClick={() => setActivePreviewPhoto(photo)}
              >
                <img
                  src={photo.imageUrl}
                  alt={photo.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                
                {/* Category Overlay */}
                <div className="absolute top-2.5 left-2.5">
                  {getCategoryBadge(photo.category)}
                </div>

                {/* Hover overlay preview button */}
                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <span className="p-2.5 bg-white/90 text-slate-900 rounded-full shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform">
                    <ZoomIn className="w-4 h-4" />
                  </span>
                </div>
              </div>

              {/* Card Meta Content */}
              <div className="p-4 space-y-2.5 flex-1 flex flex-col justify-between">
                <div>
                  <h4 
                    onClick={() => setActivePreviewPhoto(photo)}
                    className="text-xs font-black text-slate-900 hover:text-blue-600 transition-colors line-clamp-2 leading-snug cursor-pointer"
                  >
                    {photo.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                    {photo.description}
                  </p>
                  <div className="flex items-center gap-1.5 mt-2 flex-wrap text-[9px] font-bold">
                    <span className="text-blue-700 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded-md truncate max-w-[120px]">
                      👤 {photo.uploaderName || 'Pengunjung'}
                    </span>
                    {photo.userEmail && (
                      <span className="text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-md truncate max-w-[130px] font-mono">
                        🌐 {photo.userEmail}
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-bold">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    {photo.date}
                  </span>
                  
                  {isAdmin && (
                    <button
                      onClick={() => handleDeletePhoto(photo.id, photo.title)}
                      className="text-rose-500 hover:text-rose-700 p-1 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Hapus Foto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: Tambah Foto Baru (Permanen Cloud) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Unggah Foto Dokumentasi Baru</h3>
                  <p className="text-[11px] text-slate-500">Foto akan disimpan permanen dan dapat dilihat oleh siapapun.</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddPhotoSubmit} className="space-y-4 text-xs font-bold text-slate-700 text-left">
              
              {/* Image Input Options */}
              <div className="space-y-2">
                <label className="block text-slate-800 font-extrabold">
                  Foto / Gambar Dokumentasi *
                </label>
                
                {/* File picker & preview */}
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <label className="w-full sm:w-auto px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl cursor-pointer border border-blue-200 transition-colors flex items-center justify-center gap-2">
                    <UploadCloud className="w-4 h-4" />
                    <span>Pilih Berkas Foto</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  <span className="text-[11px] text-slate-400 font-normal">atau masukkan URL langsung di bawah:</span>
                </div>

                <input
                  type="url"
                  placeholder="https://... (URL Gambar)"
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    setImagePreview(e.target.value);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                />

                {imagePreview && (
                  <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 mt-2">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setImageUrl('');
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-rose-600 text-white rounded-full shadow-md hover:bg-rose-700"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block mb-1">Judul Foto / Kegiatan *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Peresmian Ruang Baca Ramah Anak..."
                  value={photoTitle}
                  onChange={(e) => setPhotoTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Kategori Dokumentasi *</label>
                  <select
                    value={photoCategory}
                    onChange={(e: any) => setPhotoCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="LAUNCHING">🎉 Launching & Peresmian</option>
                    <option value="TRANSFORMASI">🛠️ Tahapan Transformasi</option>
                    <option value="KEGIATAN_SISWA">📖 Kegiatan Siswa / GLS</option>
                    <option value="POJOK_BACA">🎨 Pojok Baca Kelas</option>
                    <option value="DOKUMENTASI">📸 Dokumentasi Umum</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1">Tanggal Dokumentasi *</label>
                  <input
                    type="date"
                    required
                    value={photoDate}
                    onChange={(e) => setPhotoDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1">Keterangan / Deskripsi Singkat</label>
                <textarea
                  rows={2}
                  placeholder="Jelaskan suasana dan momen dalam foto..."
                  value={photoDescription}
                  onChange={(e) => setPhotoDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Nama Pengunggah</label>
                  <input
                    type="text"
                    value={uploaderName}
                    onChange={(e) => setUploaderName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block mb-1">Peran / Jabatan</label>
                  <input
                    type="text"
                    value={uploaderRole}
                    onChange={(e) => setUploaderRole(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-lg cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Menyimpan ke Cloud...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Simpan Foto Permanen</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* LIGHTBOX MODAL: Detail Preview Foto */}
      {activePreviewPhoto && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 text-white flex flex-col md:flex-row">
            
            {/* Close Button */}
            <button
              onClick={() => setActivePreviewPhoto(null)}
              className="absolute top-3 right-3 z-10 p-2 bg-slate-800/80 hover:bg-slate-700 text-white rounded-full backdrop-blur-xs transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Photo Large View */}
            <div className="md:w-3/5 bg-black flex items-center justify-center min-h-[300px] max-h-[550px] p-2">
              <img
                src={activePreviewPhoto.imageUrl}
                alt={activePreviewPhoto.title}
                className="max-h-full max-w-full object-contain rounded-xl"
              />
            </div>

            {/* Photo Info Sidebar */}
            <div className="md:w-2/5 p-6 flex flex-col justify-between space-y-4 text-left">
              <div className="space-y-3">
                <div>
                  {getCategoryBadge(activePreviewPhoto.category)}
                  <h3 className="text-base sm:text-lg font-black text-white mt-2 leading-snug">
                    {activePreviewPhoto.title}
                  </h3>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {activePreviewPhoto.description}
                </p>

                <div className="space-y-2 pt-3 border-t border-slate-800 text-xs text-slate-400">
                  <div className="flex items-center justify-between">
                    <span>Tanggal Kegiatan:</span>
                    <span className="font-mono text-slate-200 font-bold">{activePreviewPhoto.date}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Diunggah Oleh:</span>
                    <span className="text-slate-200 font-bold">{activePreviewPhoto.uploaderName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Peran Pengunggah:</span>
                    <span className="text-amber-300 font-bold">{activePreviewPhoto.uploaderRole}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-2">
                <a
                  href={activePreviewPhoto.imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Buka Resolusi Penuh</span>
                </a>

                {isAdmin && (
                  <button
                    onClick={() => handleDeletePhoto(activePreviewPhoto.id, activePreviewPhoto.title)}
                    className="px-3 py-2 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
