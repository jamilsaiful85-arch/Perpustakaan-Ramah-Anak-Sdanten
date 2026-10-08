import React, { useState } from 'react';
import { Loan } from '../data/initialData';
import { Search, Calendar, RefreshCw, AlertCircle, DollarSign, Receipt, Printer, CheckCircle, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { playHappyTune } from './SplashIntro';

interface ReturnRegisterProps {
  loans: Loan[];
  onReturnLoan: (loanId: string, fine: number) => void;
  finePerDay: number; // fine configuration
  isAdmin?: boolean;
  onRequireAdmin?: () => void;
}

export default function ReturnRegister({ 
  loans, 
  onReturnLoan, 
  finePerDay,
  isAdmin = false,
  onRequireAdmin 
}: ReturnRegisterProps) {
  const [search, setSearch] = useState('');
  const [returnReceipt, setReturnReceipt] = useState<Loan | null>(null);
  const [notif, setNotif] = useState<string | null>(null);

  // Active borrow actions (DIPINJAM)
  const activeLoans = loans.filter(l => l.status !== 'KEMBALI');
  
  // Completed actions (KEMBALI)
  const completedLoans = loans.filter(l => l.status === 'KEMBALI');

  const filteredActive = activeLoans.filter(l => 
    l.studentName.toLowerCase().includes(search.toLowerCase()) ||
    l.id.toLowerCase().includes(search.toLowerCase()) ||
    l.studentClass.toLowerCase().includes(search.toLowerCase())
  );

  // Calculate late days and fine automatically
  const calculateLateStatus = (dueDateStr: string) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const due = new Date(dueDateStr);
    due.setHours(0,0,0,0);

    const diffTime = today.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) {
      return {
        lateDays: diffDays,
        fineAmount: diffDays * finePerDay
      };
    }
    return { lateDays: 0, fineAmount: 0 };
  };

  const handleReturnAction = (l: Loan) => {
    if (!isAdmin && onRequireAdmin) {
      onRequireAdmin();
      return;
    }

    const { fineAmount } = calculateLateStatus(l.dueDate);
    
    // Trigger return state
    onReturnLoan(l.id, fineAmount);

    const updatedLoan: Loan = {
      ...l,
      status: 'KEMBALI',
      fine: fineAmount,
      returnDate: new Date().toISOString().split('T')[0]
    };

    setReturnReceipt(updatedLoan);
    playHappyTune();
    setNotif("🎉 Buku Berhasil Dikembalikan! Stok Otomatis Diperbarui.");
    setTimeout(() => {
      setNotif(null);
    }, 3500);
  };

  const printReturnReceipt = () => {
    playHappyTune();
    alert(`🖨️ Mencetak Bukti Pengembalian Buku: ${returnReceipt?.id}`);
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto text-xs font-semibold text-slate-600 text-left">
      
      {!isAdmin && (
        <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl flex items-center justify-between text-left">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="text-[11px] text-amber-900 font-medium">
              Mode Pengunjung Aktif. Anda dapat melihat status sirkulasi buku yang sedang dipinjam. Tombol proses pengembalian hanya aktif untuk Petugas Perpustakaan.
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

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white/60 p-4 rounded-3xl border border-white shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari transaksi pinjaman berdasarkan Nama Siswa atau Kode Transaksi..."
            id="input-return-search"
            className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-2 text-xs focus:outline-hidden focus:border-blue-400 font-medium text-slate-700 shadow-inner"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-2xl font-bold">
            🔴 {activeLoans.length} Buku Sedang Dipinjam
          </span>
          <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-2xl font-bold">
            🟢 {completedLoans.length} Sudah Selesai
          </span>
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

      {/* Main Circulation Active Table */}
      <div className="bg-white/70 overflow-x-auto rounded-3xl border border-slate-200 shadow-xs">
        <table className="w-full text-left text-xs text-slate-600 border-collapse">
          <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
            <tr>
              <th className="p-3.5">ID Pinjam</th>
              <th className="p-3.5">Nama Siswa</th>
              <th className="p-3.5">Kelas</th>
              <th className="p-3.5">Judul Buku</th>
              <th className="p-3.5">Tgl Pinjam</th>
              <th className="p-3.5">Jatuh Tempo</th>
              <th className="p-3.5">Status Keterlambatan</th>
              <th className="p-3.5 text-center">Aksi Pengembalian</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredActive.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-10 text-center text-slate-400 font-medium">
                  Tidak ada buku yang sedang dipinjam saat ini.
                </td>
              </tr>
            ) : (
              filteredActive.map(l => {
                const { lateDays, fineAmount } = calculateLateStatus(l.dueDate);
                return (
                  <tr key={l.id} className="hover:bg-blue-50/40 transition-all">
                    <td className="p-3.5 font-mono font-bold text-slate-500">{l.id}</td>
                    <td className="p-3.5 font-bold text-slate-800 uppercase">{l.studentName}</td>
                    <td className="p-3.5"><span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-bold text-[10px]">{l.studentClass}</span></td>
                    <td className="p-3.5">
                      <div className="space-y-0.5">
                        {l.bookTitles.map((t, idx) => (
                          <div key={idx} className="font-semibold text-slate-700 flex items-center gap-1.5">
                            <span>📖</span> <span>{t}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="p-3.5 font-mono text-slate-500">{l.loanDate}</td>
                    <td className="p-3.5 font-mono font-bold text-slate-700">{l.dueDate}</td>
                    <td className="p-3.5">
                      {lateDays > 0 ? (
                        <div className="space-y-0.5">
                          <span className="bg-rose-100 text-rose-800 text-[10px] px-2 py-0.5 rounded-full font-bold inline-block">
                            Terlambat {lateDays} Hari
                          </span>
                          <p className="text-[10px] text-rose-600 font-bold font-mono">Denda: Rp {fineAmount.toLocaleString('id-ID')}</p>
                        </div>
                      ) : (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                          Tepat Waktu
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => handleReturnAction(l)}
                        className={`p-2 px-3 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 mx-auto ${isAdmin ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-400 hover:bg-slate-500'}`}
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>{isAdmin ? 'Proses Kembali' : 'Cek Kembali'}</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Return Success Receipt */}
      {returnReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-emerald-200 text-left">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <Receipt className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-base text-slate-800 font-display">Tanda Terima Pengembalian Buku</h3>
              <p className="text-xs text-slate-400">Transaksi: <strong className="font-mono text-slate-700">{returnReceipt.id}</strong></p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Siswa:</span>
                <span className="font-bold text-slate-800">{returnReceipt.studentName} ({returnReceipt.studentClass})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Tanggal Kembali:</span>
                <span className="font-bold text-slate-800">{returnReceipt.returnDate}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2">
                <span className="text-slate-500 font-medium">Denda Keterlambatan:</span>
                <span className="font-bold text-rose-600 font-mono">Rp {returnReceipt.fine.toLocaleString('id-ID')}</span>
              </div>
            </div>

            <div className="flex gap-2 justify-center pt-2">
              <button
                onClick={printReturnReceipt}
                className="px-4 py-2 bg-primary hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" /> Cetak Bukti Kembali
              </button>
              <button
                onClick={() => setReturnReceipt(null)}
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
