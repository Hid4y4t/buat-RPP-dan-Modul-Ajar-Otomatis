const express = require('express');
const { GoogleGenAI } = require('@google/genai');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Inisialisasi Gemini AI
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Endpoint untuk generate materi
app.post('/api/generate-materi', async (req, res) => {
    try {
        const { mataPelajaran, jenjangPendidikan, totalPertemuan, jamPerPertemuan } = req.body;

        // Validasi input
        if (!mataPelajaran || !jenjangPendidikan || !totalPertemuan || !jamPerPertemuan) {
            return res.status(400).json({ error: 'Semua field harus diisi' });
        }

        const prompt = `Anda adalah seorang guru ahli yang akan membuat Rencana Pembelajaran (RPP) untuk mata pelajaran ${mataPelajaran} dengan jenjang pendidikan ${jenjangPendidikan}. 
        Total pertemuan: ${totalPertemuan} kali pertemuan.
        Durasi setiap pertemuan: ${jamPerPertemuan} jam.

        Tolong buatkan materi pembelajaran lengkap dengan format JSON berikut:
        {
            "judul_materi": "Judul utama materi",
            "deskripsi_umum": "Deskripsi singkat tentang materi ini",
            "rincian_pertemuan": [
                {
                    "pertemuan_ke": 1,
                    "topik": "Topik pertemuan",
                    "sub_materi": ["Sub materi 1", "Sub materi 2", ...],
                    "materi_lengkap": "Penjelasan detail materi untuk pertemuan ini (minimal 500 karakter)",
                    "durasi": "${jamPerPertemuan} jam",
                    "tujuan_pembelajaran": ["Tujuan 1", "Tujuan 2", ...],
                    "soal_latihan": [
                        {
                            "soal": "Pertanyaan soal",
                            "jawaban": "Jawaban yang benar",
                            "penjelasan": "Penjelasan jawaban"
                        }
                    ],
                    "studi_kasus": {
                        "kasus": "Deskripsi studi kasus",
                        "pertanyaan": "Pertanyaan studi kasus",
                        "pembahasan": "Pembahasan studi kasus"
                    }
                }
            ],
            "kesimpulan": "Kesimpulan dari seluruh materi"
        }

        Pastikan materi sesuai dengan jenjang pendidikan ${jenjangPendidikan} (SD/SMP/SMA/Kuliah) dan mudah dipahami. Buat soal latihan minimal 3 soal per pertemuan. Studi kasus harus relevan dengan dunia nyata.

        Hanya berikan response dalam format JSON, tanpa teks tambahan di luar JSON.`;

        // Menggunakan model gemini-2.5-flash
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        // Parse response dari AI
        let materiText = response.text;
        
        // Clean up response - ambil JSON dari response
        let jsonStr = materiText;
        const jsonMatch = materiText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            jsonStr = jsonMatch[0];
        }
        
        const materiData = JSON.parse(jsonStr);
        
        res.json({
            success: true,
            data: materiData
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Gagal generate materi: ' + error.message 
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
    console.log(`Menggunakan model: gemini-2.5-flash`);
});