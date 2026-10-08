import React, { useState } from 'react';
import { Sparkles, MessageSquare, BookOpen, Send, Award, RefreshCw, Star, CheckCircle, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Book, Student } from '../data/initialData';
import { playHappyTune } from './SplashIntro';

interface MascotKumbiProps {
  books: Book[];
  students: Student[];
  onAwardPoints: (studentId: string, pts: number) => void;
  selectedStudentId?: string;
}

export default function MascotKumbi({ books, students, onAwardPoints, selectedStudentId }: MascotKumbiProps) {
  const [activeTab, setActiveTab] = useState<'chat' | 'quiz'>('chat');
  const [prompt, setPrompt] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ sender: 'user' | 'kumbi'; text: string }>>([
    { sender: 'kumbi', text: 'Halo Sahabat Literasi! Aku SI-MPUS 🐱, kucing pintar pendamping setia perpustakaanmu. Mau tahu buku dongeng, sains, atau petualangan apa yang paling cocok untukmu hari ini? Tanya aku yuk!' }
  ]);
  const [loading, setLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<string>(selectedStudentId || '');
  const [quizItem, setQuizItem] = useState<{ question: string; options: string[]; answer: string; expl: string } | null>(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizCategory, setQuizCategory] = useState('Dongeng Nusantara');
  const [userSelectedAnswer, setUserSelectedAnswer] = useState<string | null>(null);
  const [quizChecked, setQuizChecked] = useState(false);
  const [scoreNotification, setScoreNotification] = useState<string | null>(null);

  // Sync selectedStudentId with state
  React.useEffect(() => {
    if (selectedStudentId) {
      setSelectedStudent(selectedStudentId);
    }
  }, [selectedStudentId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    const userText = prompt;
    setChatHistory(prev => [...prev, { sender: 'user', text: userText }]);
    setPrompt('');
    setLoading(true);

    try {
      const studentNameObj = students.find(s => s.id === selectedStudent);
      const studentName = studentNameObj ? studentNameObj.name : "Teman Kreatif";

      const res = await fetch("/api/gemini/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName,
          interest: userText,
          availableBooks: books.slice(0, 15) // send limited list for context
        })
      });

      const data = await res.json();
      setChatHistory(prev => [...prev, { sender: 'kumbi', text: data.text || "Tetap semangat membaca ya!" }]);
      playHappyTune();
    } catch (err) {
      console.error(err);
      setChatHistory(prev => [...prev, { sender: 'kumbi', text: "Aduh, kumis SI-MPUS tergelitik debu! 🐱 Coba tanya sekali lagi atau hubungkan internetmu ya!" }]);
    } finally {
      setLoading(false);
    }
  };

  const loadNewQuiz = async () => {
    setQuizLoading(true);
    setQuizItem(null);
    setUserSelectedAnswer(null);
    setQuizChecked(false);
    
    try {
      const res = await fetch("/api/gemini/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: quizCategory })
      });
      const data = await res.json();
      if (data.quiz) {
        setQuizItem(data.quiz);
      }
    } catch (err) {
      console.error(err);
      // Failback offline quiz
      setQuizItem({
        question: "Siapakah maskot digital perpustakaan ramah anak kita?",
        options: ["Si Kiki Koala", "SI-MPUS Kucing Pintar", "Si Puka Kanguru", "Si Damki Guguk"],
        answer: "SI-MPUS Kucing Pintar",
        expl: "Pilihan pintar! Pengenal perpustakaan kita adalah SI-MPUS si kucing pintar cinta literasi! 🐱"
      });
    } finally {
      setQuizLoading(false);
    }
  };

  const handleAnswerSubmit = (option: string) => {
    if (quizChecked) return;
    setUserSelectedAnswer(option);
  };

  const checkAnswer = () => {
    if (!quizItem || !userSelectedAnswer) return;
    setQuizChecked(true);

    if (userSelectedAnswer === quizItem.answer) {
      playHappyTune();
      if (selectedStudent) {
        // Award 50 points
        onAwardPoints(selectedStudent, 50);
        const st = students.find(s => s.id === selectedStudent);
        setScoreNotification(`🎉 Hebat! Kamu benar! +50 Poin ditambahkan untuk ${st?.name}!`);
      } else {
        setScoreNotification("🎉 Pintar sekali! Jawabanmu 100% tepat!");
      }
    } else {
      setScoreNotification(`Let's try again! Jawaban betul adalah: ${quizItem.answer}`);
    }

    setTimeout(() => {
      setScoreNotification(null);
    }, 4500);
  };

  return (
    <div className="glass-panel rounded-3xl p-5 border border-white/80 shadow-xl flex flex-col h-[520px] justify-between relative overflow-hidden">
      
      {/* Decorative Golden Star badge background indicator */}
      <div className="absolute top-1 right-2 opacity-10 select-none">
        <Sparkles className="w-56 h-56 text-amber-500" />
      </div>

      {/* Mascot Header bar */}
      <div className="z-10 flex items-center justify-between border-b border-blue-100 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-linear-to-tr from-sky-400 to-blue-500 rounded-2xl flex items-center justify-center text-2xl shadow-md animate-frequent-bounce">
            🐱
          </div>
          <div>
            <span className="text-2xl font-bold font-display text-slate-800 flex items-center gap-1.5">
              SI-MPUS AI <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />
            </span>
            <p className="text-xs text-slate-500">Mascot & Sahabat Literasi Cerdas</p>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="flex p-0.5 bg-slate-100/90 rounded-full text-xs">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-3 py-1.5 rounded-full font-bold transition-all cursor-pointer ${activeTab === 'chat' ? 'bg-primary text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Tanya SI-MPUS
          </button>
          <button
            onClick={() => { setActiveTab('quiz'); if(!quizItem) loadNewQuiz(); }}
            className={`px-3 py-1.5 rounded-full font-bold transition-all cursor-pointer ${activeTab === 'quiz' ? 'bg-primary text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Main Kuis
          </button>
        </div>
      </div>

      {/* Floating score notification banner */}
      <AnimatePresence>
        {scoreNotification && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute top-16 left-4 right-4 bg-emerald-500 text-white py-2 px-4 rounded-xl shadow-lg z-20 text-center text-xs font-bold"
          >
            {scoreNotification}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Tab: Tanya Kumbi */}
      {activeTab === 'chat' ? (
        <div className="flex flex-col flex-1 mt-4 overflow-hidden justify-between z-10">
          
          {/* Student Selector to personalize recommendations */}
          <div className="bg-blue-50/70 p-2 rounded-xl border border-blue-100/60 mb-2 flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-blue-800">Siswa yang Bertanya:</span>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              id="select-chat-student"
              className="text-xs font-semibold text-slate-700 bg-white border border-blue-200 rounded-lg px-2 py-1 max-w-[180px]"
            >
              <option value="">-- Tamu Kreatif --</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.className})</option>
              ))}
            </select>
          </div>

          {/* Chat Bubble List */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 mb-3 scrollbar-thin">
            {chatHistory.map((item, id) => (
              <div key={id} className={`flex items-start gap-2.5 ${item.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {item.sender === 'kumbi' && (
                  <span className="text-xl p-1 bg-sky-100 rounded-lg shadow-xs select-none">🐱</span>
                )}
                <div 
                  className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                    item.sender === 'user' 
                      ? 'bg-primary text-white rounded-br-none shadow-xs' 
                      : 'bg-white/90 text-slate-700 border border-slate-100 rounded-bl-none shadow-xs font-medium'
                  }`}
                >
                  {item.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2">
                <span className="text-xl animate-bounce">🐱</span>
                <div className="bg-white/80 border border-slate-100 p-2.5 rounded-2xl rounded-bl-none text-xs text-slate-400 font-medium">
                  SI-MPUS sedang berpikir keras... 🐾
                </div>
              </div>
            )}
          </div>

          {/* Form write message and examples pill */}
          <div className="space-y-2">
            <div className="flex flex-wrap gap-1.5">
              <button 
                onClick={() => setPrompt("Rekomendasikan buku petualangan hewan")}
                className="text-[10px] bg-white border border-blue-100 text-blue-600 px-2 py-0.5 rounded-full hover:bg-blue-50"
              >
                🌲 Tema Hewan
              </button>
              <button 
                onClick={() => setPrompt("Saran komite membaca tentang dongeng")}
                className="text-[10px] bg-white border border-blue-100 text-blue-600 px-2 py-0.5 rounded-full hover:bg-blue-50"
              >
                🧜‍♀️ Dongeng Rakyat
              </button>
              <button 
                onClick={() => setPrompt("Buku belajar sopan santun anak")}
                className="text-[10px] bg-white border border-blue-100 text-blue-600 px-2 py-0.5 rounded-full hover:bg-blue-50"
              >
                💖 Nilai Kebaikan
              </button>
            </div>

            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Tulis hobimu (contoh: menggambar, melukis, bersepeda)..."
                id="input-chat-prompt"
                className="flex-1 bg-white border border-slate-200 rounded-2xl px-3 py-2 text-xs focus:outline-hidden focus:border-blue-400 text-slate-700 font-medium shadow-inner"
              />
              <button
                type="submit"
                id="btn-chat-send"
                disabled={loading || !prompt.trim()}
                className="p-2.5 bg-primary hover:bg-blue-700 text-white rounded-2xl shadow-md active:scale-95 transition-all text-xs cursor-pointer flex items-center justify-center disabled:opacity-45"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>
      ) : (
        /* Active Tab: Bermain Kuis */
        <div className="flex flex-col flex-1 mt-4 justify-between z-10 overflow-hidden">
          
          <div className="flex items-center gap-2 justify-between bg-emerald-50/60 p-2 border border-emerald-100 rounded-xl mb-2">
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-emerald-800">Kuis:</span>
              <select
                value={quizCategory}
                onChange={(e) => setQuizCategory(e.target.value)}
                id="select-quiz-cat"
                className="text-xs text-slate-700 bg-white border border-emerald-200 rounded-md px-1 py-0.5"
              >
                <option value="Dongeng Populer">Dongeng Populer</option>
                <option value="Kesehatan Anak">Sains & Kesehatan</option>
                <option value="Buku Cerita Binatang">Dunia Hewan</option>
                <option value="Budi Pekerti SDN">Sikap Baik</option>
              </select>
            </div>
            
            <button
              onClick={loadNewQuiz}
              id="btn-quiz-refresh"
              className="p-1 text-emerald-600 hover:bg-emerald-100 rounded-lg flex items-center justify-center transition-all"
              title="Buat kuis baru"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${quizLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Student Selector for quiz point accumulation */}
          <div className="bg-amber-50/70 p-1.5 rounded-xl border border-amber-100/60 mb-2 flex items-center justify-between">
            <span className="text-[10px] font-bold text-amber-900 flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-amber-500" /> Kumpul Poin Untuk:
            </span>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              id="select-quiz-student"
              className="text-xs font-semibold text-slate-700 bg-white border border-amber-200 rounded-lg px-2 py-0.5 max-w-[170px]"
            >
              <option value="">-- Tamu Playground --</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.className})</option>
              ))}
            </select>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            {quizLoading ? (
              <div className="text-center py-8 space-y-2">
                <span className="text-3xl animate-bounce inline-block">🐱🎲</span>
                <p className="text-xs text-slate-500 font-medium">Sedang menyusun soal kuis literasi cerdas SI-MPUS...</p>
              </div>
            ) : quizItem ? (
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-800 bg-slate-100/60 p-2.5 rounded-xl leading-relaxed border border-slate-200">
                  {quizItem.question}
                </p>

                <div className="grid grid-cols-1 gap-1.5">
                  {quizItem.options.map((opt, i) => {
                    const isSelected = userSelectedAnswer === opt;
                    const isCorrect = opt === quizItem.answer;
                    
                    let btnStyle = "bg-white hover:bg-slate-50 text-slate-700 border-slate-200";
                    if (isSelected) {
                      btnStyle = "bg-blue-550 border-blue-500 text-blue-900 font-bold bg-blue-50";
                    }
                    if (quizChecked) {
                      if (isCorrect) {
                        btnStyle = "bg-emerald-100 border-emerald-400 text-emerald-800 font-bold";
                      } else if (isSelected) {
                        btnStyle = "bg-rose-100 border-rose-400 text-rose-800";
                      }
                    }

                    return (
                      <button
                        key={i}
                        onClick={() => handleAnswerSubmit(opt)}
                        disabled={quizChecked}
                        id={`btn-quiz-opt-${i}`}
                        className={`text-left p-2.5 rounded-xl text-xs border ${btnStyle} transition-all cursor-pointer flex items-center justify-between`}
                      >
                        <span>{opt}</span>
                        {quizChecked && isCorrect && <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />}
                        {quizChecked && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {quizChecked && (
                  <div className="p-2.5 bg-blue-50/50 rounded-xl border border-blue-100/50 text-[11px] text-slate-600">
                    <span className="font-bold text-blue-800 flex items-center gap-1 mb-0.5">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> Kunci Penjelasan SI-MPUS:
                    </span>
                    {quizItem.expl}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-slate-400 text-xs">Klik refresh untuk memuat pertanyaan.</p>
              </div>
            )}
          </div>

          <div className="mt-2 border-t border-slate-100 pt-2 flex gap-2">
            {!quizChecked ? (
              <button
                onClick={checkAnswer}
                disabled={!userSelectedAnswer || quizChecked}
                id="btn-quiz-check"
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-45 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                Kunci Jawaban Saya 🔒
              </button>
            ) : (
              <button
                onClick={loadNewQuiz}
                id="btn-quiz-next"
                className="w-full py-2 bg-primary hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-1"
              >
                Selesai / Next Quiz 👉
              </button>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
