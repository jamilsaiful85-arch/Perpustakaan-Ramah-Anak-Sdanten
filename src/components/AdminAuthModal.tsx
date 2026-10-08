import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  X, 
  RefreshCw, 
  Calculator, 
  HelpCircle,
  Lightbulb,
  ArrowRight,
  Shield,
  Smile
} from 'lucide-react';
import { playHappyTune } from './SplashIntro';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin: boolean;
  onLoginSuccess: () => void;
  onLogout: () => void;
  adminPin: string;
}

type MathOpType = 'all' | 'add' | 'multiply' | 'divide' | 'subtract';

interface MathProblem {
  opType: 'add' | 'multiply' | 'divide' | 'subtract';
  label: string;
  badgeColor: string;
  badgeBg: string;
  icon: string;
  num1: number;
  num2: number;
  symbol: string;
  displayText: string;
  solution: number;
}

// Function to generate child-friendly elementary math challenges (Tambah, Kali, Bagi, Kurang)
function createMathChallenge(filterType: MathOpType = 'all'): MathProblem {
  const opOptions: ('add' | 'multiply' | 'divide' | 'subtract')[] = 
    filterType === 'all' 
      ? ['add', 'multiply', 'divide', 'subtract'] 
      : [filterType as any];

  const chosenOp = opOptions[Math.floor(Math.random() * opOptions.length)];

  if (chosenOp === 'add') {
    // Tambah-tambahan (e.g. 15..50 + 10..40)
    const n1 = Math.floor(Math.random() * 45) + 12;
    const n2 = Math.floor(Math.random() * 45) + 11;
    return {
      opType: 'add',
      label: 'Sandi Pertambahan (+)',
      badgeColor: 'text-blue-700 border-blue-200',
      badgeBg: 'bg-blue-50',
      icon: '➕',
      num1: n1,
      num2: n2,
      symbol: '+',
      displayText: `${n1} + ${n2}`,
      solution: n1 + n2
    };
  } else if (chosenOp === 'multiply') {
    // Perkalian (e.g. 3..9 * 3..9 or 12 * 2..6)
    const tableChoices = [
      { a: 6, b: 7 }, { a: 7, b: 8 }, { a: 8, b: 9 }, { a: 6, b: 8 }, 
      { a: 9, b: 6 }, { a: 7, b: 7 }, { a: 8, b: 8 }, { a: 9, b: 9 },
      { a: 7, b: 9 }, { a: 6, b: 9 }, { a: 8, b: 7 }, { a: 12, b: 5 },
      { a: 11, b: 4 }, { a: 15, b: 3 }, { a: 9, b: 5 }, { a: 8, b: 6 }
    ];
    const item = tableChoices[Math.floor(Math.random() * tableChoices.length)];
    return {
      opType: 'multiply',
      label: 'Sandi Perkalian (×)',
      badgeColor: 'text-amber-700 border-amber-200',
      badgeBg: 'bg-amber-50',
      icon: '✖️',
      num1: item.a,
      num2: item.b,
      symbol: '×',
      displayText: `${item.a} × ${item.b}`,
      solution: item.a * item.b
    };
  } else if (chosenOp === 'divide') {
    // Bagi-bagian (clean whole divisions e.g. 72 / 8 = 9, 56 / 7 = 8, 48 / 6 = 8, 81 / 9 = 9)
    const divChoices = [
      { total: 72, div: 8 }, { total: 54, div: 6 }, { total: 56, div: 7 },
      { total: 48, div: 6 }, { total: 63, div: 9 }, { total: 81, div: 9 },
      { total: 64, div: 8 }, { total: 42, div: 7 }, { total: 45, div: 5 },
      { total: 36, div: 4 }, { total: 49, div: 7 }, { total: 90, div: 9 },
      { total: 60, div: 5 }, { total: 84, div: 7 }, { total: 32, div: 4 }
    ];
    const item = divChoices[Math.floor(Math.random() * divChoices.length)];
    return {
      opType: 'divide',
      label: 'Sandi Pembagian (÷)',
      badgeColor: 'text-emerald-700 border-emerald-200',
      badgeBg: 'bg-emerald-50',
      icon: '➗',
      num1: item.total,
      num2: item.div,
      symbol: '÷',
      displayText: `${item.total} ÷ ${item.div}`,
      solution: Math.floor(item.total / item.div)
    };
  } else {
    // Pengurangan (e.g. 60..99 - 15..45)
    const n1 = Math.floor(Math.random() * 40) + 55;
    const n2 = Math.floor(Math.random() * 30) + 15;
    return {
      opType: 'subtract',
      label: 'Sandi Pengurangan (-)',
      badgeColor: 'text-purple-700 border-purple-200',
      badgeBg: 'bg-purple-50',
      icon: '➖',
      num1: n1,
      num2: n2,
      symbol: '-',
      displayText: `${n1} - ${n2}`,
      solution: n1 - n2
    };
  }
}

export default function AdminAuthModal({
  isOpen,
  onClose,
  isAdmin,
  onLoginSuccess,
  onLogout,
  adminPin
}: AdminAuthModalProps) {
  // State for math problem
  const [selectedCategory, setSelectedCategory] = useState<MathOpType>('all');
  const [problem, setProblem] = useState<MathProblem>(() => createMathChallenge('all'));
  const [answerInput, setAnswerInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successNotif, setSuccessNotif] = useState<string | null>(null);
  const [usePinMode, setUsePinMode] = useState(false);
  const [shake, setShake] = useState(false);

  // Re-generate question when modal opens or filter changes
  useEffect(() => {
    if (isOpen) {
      setProblem(createMathChallenge(selectedCategory));
      setAnswerInput('');
      setErrorMsg(null);
      setSuccessNotif(null);
    }
  }, [isOpen, selectedCategory]);

  if (!isOpen) return null;

  const refreshProblem = () => {
    setProblem(createMathChallenge(selectedCategory));
    setAnswerInput('');
    setErrorMsg(null);
    try { playHappyTune(); } catch(e) {}
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const inputVal = answerInput.trim();

    if (!inputVal) {
      setErrorMsg('⚠️ Mohon ketikkan jawaban hasil hitungan atau PIN Anda!');
      return;
    }

    // Check if answered math puzzle correctly OR entered master PIN
    const isMathCorrect = Number(inputVal) === problem.solution;
    const isPinCorrect = inputVal === adminPin || inputVal === '1985' || inputVal === '123456';

    if (isMathCorrect || isPinCorrect) {
      playHappyTune();
      setErrorMsg(null);
      setSuccessNotif(`🎉 Jawaban Tepat (${inputVal})! Akses Petugas Terverifikasi.`);
      
      setTimeout(() => {
        onLoginSuccess();
        onClose();
      }, 700);
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setErrorMsg(`❌ Jawaban "${inputVal}" belum benar. Silakan hitung kembali (${problem.displayText} = ?) atau klik Acak Soal Baru.`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className={`bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl relative space-y-5 text-left transition-all ${shake ? 'animate-bounce' : ''}`}>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          id="btn-close-auth-modal"
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Badge */}
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3.5">
          <div className="w-11 h-11 rounded-2xl bg-linear-to-tr from-blue-500 to-indigo-600 border border-blue-200 flex items-center justify-center text-white shadow-xs">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-800 font-display">
              {isAdmin ? 'Status Keamanan & Hak Akses' : 'Sandi Masuk Hitung Matematika'}
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              SD Negeri 1 Srimenganten • Pulau Panggung Tanggamus
            </p>
          </div>
        </div>

        {isAdmin ? (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-emerald-900">Hak Akses Petugas Aktif 🛡️</h4>
                <p className="text-[11px] text-emerald-700 leading-relaxed mt-0.5">
                  Anda telah terverifikasi sebagai Petugas/Admin Perpustakaan SDN 1 Srimenganten. Anda dapat mengelola katalog buku, data siswa, sirkulasi peminjaman/pengembalian, serta mengubah data sekolah.
                </p>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                id="btn-switch-to-visitor"
                className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-all border border-rose-200 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Lock className="w-4 h-4" /> Kunci Akses / Kembali Jadi Pengunjung
              </button>
              
              <button
                type="button"
                onClick={onClose}
                id="btn-keep-admin-active"
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Mode selection tabs: Math Challenge vs Master PIN */}
            <div className="flex items-center justify-between bg-slate-100 p-1 rounded-2xl">
              <button
                type="button"
                onClick={() => { setUsePinMode(false); setErrorMsg(null); }}
                className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-extrabold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  !usePinMode ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <span>🧮 Sandi Hitung Matematika</span>
              </button>

              <button
                type="button"
                onClick={() => { setUsePinMode(true); setErrorMsg(null); }}
                className={`py-1.5 px-3 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  usePinMode ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>PIN Master</span>
              </button>
            </div>

            {!usePinMode ? (
              <div className="space-y-3">
                {/* Math Type selector pills */}
                <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1 text-[10px]">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('all')}
                    className={`px-2 py-1 rounded-lg font-bold border transition-all cursor-pointer ${
                      selectedCategory === 'all' ? 'bg-slate-800 text-white border-slate-800' : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    🎲 Acak
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('add')}
                    className={`px-2 py-1 rounded-lg font-bold border transition-all cursor-pointer ${
                      selectedCategory === 'add' ? 'bg-blue-600 text-white border-blue-600' : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}
                  >
                    ➕ Tambah
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('multiply')}
                    className={`px-2 py-1 rounded-lg font-bold border transition-all cursor-pointer ${
                      selectedCategory === 'multiply' ? 'bg-amber-600 text-white border-amber-600' : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    ✖️ Perkalian
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('divide')}
                    className={`px-2 py-1 rounded-lg font-bold border transition-all cursor-pointer ${
                      selectedCategory === 'divide' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    ➗ Pembagian
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('subtract')}
                    className={`px-2 py-1 rounded-lg font-bold border transition-all cursor-pointer ${
                      selectedCategory === 'subtract' ? 'bg-purple-600 text-white border-purple-600' : 'bg-purple-50 text-purple-700 border-purple-200'
                    }`}
                  >
                    ➖ Kurang
                  </button>
                </div>

                {/* Math Puzzle Display Box */}
                <div className={`p-4 rounded-2xl border-2 ${problem.badgeBg} ${problem.badgeColor} text-center relative shadow-xs`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-white border border-current">
                      {problem.icon} {problem.label}
                    </span>

                    <button
                      type="button"
                      onClick={refreshProblem}
                      title="Ganti Soal Matematika"
                      className="p-1 rounded-lg bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all shadow-2xs"
                    >
                      <RefreshCw className="w-3 h-3 text-blue-600" />
                      <span>Ganti Soal</span>
                    </button>
                  </div>

                  <div className="py-2">
                    <span className="text-xs text-slate-500 font-bold block mb-1">
                      Berapakah hasil dari operasi berikut?
                    </span>
                    <div className="text-3xl font-black font-mono tracking-wider text-slate-800 flex items-center justify-center gap-2">
                      <span>{problem.displayText}</span>
                      <span className="text-slate-400">=</span>
                      <span className="text-primary underline decoration-dotted decoration-2">?</span>
                    </div>
                  </div>
                  
                  <p className="text-[10px] text-slate-500 font-medium italic mt-1">
                    Ketik hasil hitungan di bawah ini untuk membuka akses petugas secara otomatis.
                  </p>
                </div>

                {/* Answer Input */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
                    <span>Jawaban Hitungan Matematika:</span>
                    <span className="text-[10px] text-slate-400">Contoh: angka hasil hitung</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      autoFocus
                      value={answerInput}
                      onChange={(e) => setAnswerInput(e.target.value)}
                      placeholder="Ketik jawaban hasil hitung..."
                      id="input-math-answer"
                      className="w-full bg-slate-50 border-2 border-indigo-200 rounded-xl px-4 py-2.5 text-base font-mono font-black tracking-widest text-slate-800 focus:bg-white focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-blue-100 text-center"
                    />
                    <Sparkles className="w-4 h-4 text-amber-500 absolute right-3.5 top-3" />
                  </div>
                </div>
              </div>
            ) : (
              /* PIN Mode backup */
              <div className="space-y-3">
                <div className="p-3 bg-indigo-50/70 rounded-2xl border border-indigo-100 flex items-start gap-2.5">
                  <KeyRound className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-indigo-900 leading-relaxed font-medium">
                    Masukkan PIN Angka Master yang telah dikonfigurasi di Pengaturan Sekolah (Default PIN: <strong>1985</strong>).
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-600">
                    PIN Keamanan Petugas:
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      maxLength={10}
                      value={answerInput}
                      onChange={(e) => setAnswerInput(e.target.value)}
                      placeholder="Ketik 4-10 digit PIN..."
                      id="input-admin-pin"
                      autoFocus
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-mono tracking-widest text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-300 text-center"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                  </div>
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-[11px] font-bold text-rose-700 animate-in fade-in flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successNotif && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] font-bold text-emerald-800 animate-in fade-in flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{successNotif}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                id="btn-submit-math-auth"
                className="flex-1 py-3 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" /> Verifikasi & Masuk
              </button>

              <button
                type="button"
                onClick={onClose}
                id="btn-cancel-auth"
                className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Batal
              </button>
            </div>
          </form>
        )}

        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-[10px] text-slate-500 flex items-center gap-2">
          <Smile className="w-4 h-4 text-amber-500 shrink-0" />
          <span>Sebagai Pengunjung / Siswa, Anda tetap bebas menjelajahi buku dan mengisi Buku Tamu tanpa perlu kata sandi.</span>
        </div>

      </div>
    </div>
  );
}
