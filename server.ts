import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

// Simple lazy initialization helper for Gemini
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === "MY_GEMINI_API_KEY" || key === "") {
      console.warn("⚠️ PERINGATAN: GEMINI_API_KEY tidak dikonfigurasi. Backend berjalan dalam mode simulasi interaktif.");
      return null;
    }
    try {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    } catch (e) {
      console.error("❌ Gagal menginisialisasi GoogleGenAI SDK:", e);
      return null;
    }
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // API 1: Rekomendasi Buku Cerdas dengan Maskot "SI-MPUS"
  app.post("/api/gemini/recommend", async (req, res) => {
    const { studentName, interest, availableBooks } = req.body;
    const client = getGeminiClient();

    if (!client) {
      // Graceful fallback to rich static helper response
      setTimeout(() => {
        const fallbackAnswers = [
          `Halo ${studentName}! SI-MPUS merekomendasikan buku **"Kiti dan Balon Udara"** karena kamu menyukai ${interest || 'petualangan'}. Buku ini mengajarkan semangat kerja sama dan penjelajahan seru! 🎈`,
          `Hai ${studentName}! Coba baca buku **"Puka Jalan-Jalan"** atau **"Ada Apa di Balik Hutan?"**. Keduanya sangat pas dengan ketertarikanmu pada ${interest || 'hewan dan alam'}. Jangan lupa catat poin membacamu ya! 🦘🌲`,
          `Hai teman pintar ${studentName}! SI-MPUS punya saran menarik: buku **"Sembunyi-Sembunyi"** sangat seru dibaca sore hari untuk kamu yang gemar bermain ${interest || 'game dan olahraga'}! Kelola waktu bermainmu dengan baik! 🙈`
        ];
        const selected = fallbackAnswers[Math.floor(Math.random() * fallbackAnswers.length)];
        return res.json({
          text: `[ZONA SIMULASI SI-MPUS]\n\n${selected}\n\n*Petunjuk: Hubungkan kunci API Gemini Anda di menu Secrets untuk berbicara langsung dengan AI SI-MPUS asli!*`
        });
      }, 600);
      return;
    }

    try {
      const bookListStr = Array.isArray(availableBooks) 
        ? availableBooks.map((b: any) => `- ${b.title} (Code: ${b.code}, Kategori: ${b.category})`).join("\n")
        : "- Kiti dan Balon Udara\n- Puka Jalan-Jalan\n- Mengapa Diam Saja?";

      const prompt = `Hai Gemini! Bertindaklah sebagai "SI-MPUS", seekor kucing lucu pahlawan literasi sekolah dasar yang ceria dan ramah anak. Seorang siswa bernama "${studentName}" sangat menyukai topik "${interest || 'Membaca'}". 
Di perpustakaan kami, ada daftar buku aktif berikut:
${bookListStr}

Pilihlah 1 atau 2 buku yang paling cocok dari daftar di atas. Berikan sapaan yang lucu, sangat menyemangati anak kelas sekolah dasar, jelaskan mengapa buku itu cocok dalam 3 kalimat sederhana, gunakan emoji anak SD yang menarik (seperti 🌟, 📚, 🚀, 🐱, ✨), dan akhiri dengan kata-kata mutiara motivasi literasi anak SD. Harap tulis respons dalam bahasa Indonesia yang sangat manis dan enerjik!`;

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "Kamu adalah 'SI-MPUS', maskot kucing kecil pembaca yang ceria, ramah untuk anak-anak SD di Indonesia, selalu memberi motivasi literasi dengan bahasa santun, ceria, dan penuh emoji.",
          temperature: 0.8
        }
      });

      return res.json({ text: response.text || "Halo! Tetap semangat membaca bersama SI-MPUS ya!" });
    } catch (error: any) {
      console.error("Error pada endpoint /api/gemini/recommend:", error);
      return res.status(500).json({ error: error.message || "Gagal memperoleh rekomendasi AI" });
    }
  });

  // API 2: Pembuat Kuis / Trivia Cerdas Pembaca Cilik
  app.post("/api/gemini/quiz", async (req, res) => {
    const { category } = req.body;
    const client = getGeminiClient();

    if (!client) {
      // Fallback local interactive trivia
      setTimeout(() => {
        const fallbacks = [
          {
            question: "Siapakah nama anjing penjaga perkebunan kakek dalam kisah buku pelajaran kita?",
            options: ["Kola", "Damki", "Puka", "Ciko"],
            answer: "Damki",
            expl: "Buku 'Terima Kasih, Damki' menceritakan kakek yang dibantu oleh anjing setianya bernama Damki!"
          },
          {
            question: "Lulu mencari alat musik tradisional apa yang hilang dalam petualangan seninya?",
            options: ["Gitar", "Suling", "Gong", "Saron"],
            answer: "Gong",
            expl: "Lulu mencari Gong pusaka sanggar seni dalam buku 'Lulu Mencari Gong'!"
          },
          {
            question: "Hewan apa yang menjadi bintang utama mencari keajaiban dalam lakon 'Puka Jalan-Jalan'?",
            options: ["Koala", "Kanguru", "Tupai", "Panda"],
            answer: "Kanguru",
            expl: "Puka adalah anak kanguru lincah dalam buku 'Puka Jalan-Jalan'!"
          }
        ];
        const selected = fallbacks[Math.floor(Math.random() * fallbacks.length)];
        return res.json({
          quiz: selected,
          simulated: true
        });
      }, 500);
      return;
    }

    try {
      const prompt = `Buatkan satu soal trivia anak SD pilihan ganda yang sangat mendidik tentang tema literasi, kesehatan, sains sederhana, atau dongeng nusantara (Kategori: "${category || 'Sains'}").
Format respons harus berupa JSON objek murni yang valid, dengan kolom persis:
{
  "question": "teks pertanyaan anak",
  "options": ["Pilihan A", "Pilihan B", "Pilihan C", "Pilihan D"],
  "answer": "Jawaban yang benar sesuai dengan nama pilihan",
  "expl": "Penjelasan singkat anak SD yang memotivasi dan penuh ilmu"
}
Pastikan tidak mengembalikan teks markdown lain di luar format JSON murni ini agar bisa langsung di-parse oleh program.`;

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.7
        }
      });

      const responseText = response.text || "{}";
      const cleanJson = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleanJson);
      return res.json({ quiz: parsed });
    } catch (error: any) {
      console.error("Error pada endpoint /api/gemini/quiz:", error);
      return res.status(500).json({ error: error.message || "Gagal memproses kuis AI" });
    }
  });

  const PORT = 3000;

  // Integrate Vite for dev, or static asset serving for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server berjalan di http://0.0.0.0:${PORT} [NODE_ENV=${process.env.NODE_ENV || 'development'}]`);
  });
}

startServer().catch((err) => {
  console.error("Gagal memulai server:", err);
});
