# 🍽️ Little Olie Bistro - Frontend Application

Frontend interaktif, modern, dan responsif untuk REST API Express.js (`express-crud`) dengan database MySQL dan integrasi Cloudinary.

---

## ✨ Fitur Utama

1. **Dual Mode Interface**:
   - 🍽️ **Katalog Pelanggan (Customer View)**: Tampilan visual menu dengan foto HD, filter kategori, badge harga, tombol tambah ke pesanan, dan modal detail menu.
   - ⚙️ **Kelola Menu (Admin CRUD)**: Manajemen menu penuh untuk menambah (*Create*), melihat (*Read*), mengedit (*Update*), dan menghapus (*Delete*) data menu beserta foto.

2. **Koneksi Real-time ke Backend**:
   - Indikator status server di navigasi bar (`🟢 Server: Terhubung` / `🔴 Offline`) dengan auto-heartbeat setiap 15 detik.
   - Dukungan unggah file gambar langsung ke Cloudinary melalui backend `POST /api/menus` & `PUT /api/menus/:id`.
   - Pilihan foto rekomendasi gourmet (*presets*) untuk demo instan tanpa perlu menyiapkan file gambar manual.

3. **Pencarian, Filter, & Pengurutan Cepat**:
   - Pencarian real-time (live search) dengan fitur *debounce* pada nama, kategori, dan deskripsi.
   - Tombol filter kategori dinamis (*Category Chips*) lengkap dengan penghitung jumlah item.
   - Pengurutan berdasarkan: Terbaru, Harga Terendah, Harga Tertinggi, Nama A-Z.

4. **Nampan Pesanan & Keranjang Belanja (Order Tray)**:
   - Drawer samping untuk pesanan aktif dengan tombol atur jumlah (`+` / `-`).
   - Kalkulasi otomatis Subtotal, Pajak Restoran (10%), dan Grand Total.
   - Cetak nota / struk pesanan & integrasi pesan WhatsApp otomatis.

5. **Otentikasi Pengguna**:
   - Terintegrasi dengan endpoint `/api/login` & `/api/register` backend Express.
   - Menyimpan JWT token di `localStorage` untuk sesi aktif.

6. **Seed Data Instan**:
   - Tombol **"⚡ Muat Data Rekomendasi"** untuk mengisi menu gourmet (Wagyu Steak, Fettuccine Truffle, Tiramisu, dll.) langsung ke database dalam satu klik.

---

## 🚀 Panduan Menjalankan

### 1. Pastikan Backend Express Aktif
Backend berada di folder `../express-crud` dan berjalan di port `5000`:
```bash
cd c:/mapil_gua/express-crud
npm run dev
```

### 2. Jalankan Frontend
Buka terminal baru di folder `frontend`:
```bash
cd c:/mapil_gua/frontend
npm run dev
```

Aplikasi frontend akan aktif di:
👉 **http://localhost:5173/**

---

## 📁 Struktur Direktori

```
frontend/
├── index.html            # Struktur HTML utama, modal CRUD, & keranjang
├── vite.config.js        # Konfigurasi server Vite
├── package.json          # Dependensi Vite dan skrip build/dev
└── src/
    ├── api.js            # Service client fetch API (GET, POST, PUT, DELETE, Auth)
    ├── main.js           # Logika interaktif UI, event handler, dan state
    └── style.css         # Design system, palet bistro dark luxury & animasi
```

---

## 🛠️ Ringkasan API yang Terhubung

| Method | Endpoint | Fungsi |
|---|---|---|
| `GET` | `/api/menus` | Mengambil seluruh daftar menu |
| `GET` | `/api/menus/:id` | Mengambil detail spesifik menu |
| `POST` | `/api/menus` | Menambah menu baru + unggah gambar Cloudinary |
| `PUT` | `/api/menus/:id` | Mengupdate data menu dan opsional ganti gambar |
| `DELETE` | `/api/menus/:id` | Menghapus menu dari database |
| `POST` | `/api/login` | Login user / admin (mendapatkan JWT) |
| `POST` | `/api/register` | Mendaftarkan user baru |
