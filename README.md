# 🛰️ NASA Remote Sensing & NeoWs Radar - Frontend

Aplikasi web GIS interaktif untuk menampilkan citra satelit penginderaan jauh NASA Worldview dan radar pelacak asteroid terdekat (*Near-Earth Objects*) secara real-time.

---

## 🚀 Fitur Utama

- **🛰️ Interactive Satellite Map**: Visualisasi lapisan citra satelit bumi dari NASA.
- **☄️ Radar Asteroid (NeoWs)**: Pemantauan lintasan objek dekat bumi berbasis API NASA.
- **♿ Panel Aksesibilitas**: Pengaturan ukuran teks, filter buta warna, tema antarmuka, dan Text-to-Speech (TTS).
- **⚡ Fast API Integration**: Komunikasi asynchronous dengan backend FastAPI di cloud.

---

## 🛠️ Tech Stack

- **Frontend**: React, Vite, JavaScript / CSS
- **API Backend**: FastAPI (Deployed on Vercel)
- **Deployment**: Vercel

---

## ⚙️ Environment Variables

Buat file `.env` di root folder proyek frontend:

```env
VITE_API_URL=[https://backend-remote-sensing.vercel.app](https://backend-remote-sensing.vercel.app)
