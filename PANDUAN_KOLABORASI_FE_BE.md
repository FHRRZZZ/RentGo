# 📘 Buku Panduan Kolaborasi Tim RentGo (Frontend & Backend)

Panduan praktis langkah demi langkah untuk tim pengembang **RentGo** (1 Frontend & 1 Backend) agar alur kerja sinkron, tidak terjadi tabrakan kode (*git merge conflict*), dan integrasi berjalan mulus.

---

## 📑 Daftar Isi
1. [Pembagian Wilayah Kerja (Siapa Boleh Edit Apa)](#1-pembagian-wilayah-kerja)
2. [SOP Git Harian (Langkah Demi Langkah)](#2-sop-git-harian)
3. [Jembatan FE & BE: Kontrak Data Inertia.js](#3-jembatan-fe--be-kontrak-data-inertiajs)
4. [Mengirim Form & Validasi Error](#4-mengirim-form--validasi-error)
5. [Standar Routing (Ziggy `route()`)](#5-standar-routing-ziggy-route)
6. [Sinkronisasi Database & Data Dummy](#6-sinkronisasi-database--data-dummy)
7. [Cheat Sheet Perintah Git Harian](#7-cheat-sheet-perintah-git-harian)

---

## 1. Pembagian Wilayah Kerja

Agar tidak terjadi tabrakan file saat push, patuhi zona masing-masing:

```
RentGo/
├── app/                  <-- 🔴 Wilayah BE (Controllers, Models, Requests, Policies)
├── config/               <-- 🔴 Wilayah BE
├── database/             <-- 🔴 Wilayah BE (Migrations, Seeders, Factories)
├── routes/web.php        <-- 🟡 Titik Temu (Hanya untuk daftarkan nama route & controller)
│
├── resources/
│   ├── js/               <-- 🔵 Wilayah FE (Pages, Components, Layouts)
│   └── css/              <-- 🔵 Wilayah FE (Tailwind, Style global)
├── public/               <-- 🔵 Wilayah FE (Logo, gambar, aset statis)
│
├── package.json          <-- 🔵 Wilayah FE (Dependensi Javascript/Node)
└── composer.json         <-- 🔴 Wilayah BE (Dependensi PHP)
```

> **Aturan Emas:**
> - FE tidak mengedit logic di dalam folder `app/` atau `database/`.
> - BE tidak mengubah styling/JSX di dalam folder `resources/js/` atau `resources/css/`.

---

## 2. SOP Git Harian

### A. Di Komputer Frontend (Anda)
Saat ini branch Anda adalah **`frontend`**.

**Setiap kali mulai kerja:**
```bash
git checkout frontend
git pull origin main --rebase    # Ambil update terbaru jika ada yang sudah di-merge ke main
npm run dev                     # Jalankan Vite server
```

**Setiap selesai ngoding / ada fitur baru:**
```bash
git add .
git commit -m "feat(frontend): deskripsi singkat apa yang diubah"
git push origin frontend
```

---

### B. Di Komputer Backend (Teman Anda)
Minta teman Anda membuat branch khusus backend dari `main`:

```bash
git checkout main
git pull origin main
git checkout -b backend         # Buat branch kerja backend
```

**Setiap selesai membuat controller / migrasi baru:**
```bash
git add .
git commit -m "feat(backend): buat migration dan controller armada"
git push -u origin backend
```

---

### C. Cara Menggabungkan Kode (Merge ke `main`)
Ketika salah satu fitur selesai (misal auth selesai atau katalog siap terhubung):

1. Buka repo di GitHub: **[https://github.com/FHRRZZZ/RentGo](https://github.com/FHRRZZZ/RentGo)**.
2. Klik tombol **New Pull Request**.
3. Pilih:
   - `base: main` ← `compare: frontend` (atau `backend`).
4. Beri judul dan penjelasan singkat, lalu klik **Create Pull Request**.
5. Diskusikan berdua, lalu klik **Merge Pull Request**.
6. Setelah merge di GitHub, kedua orang update branch lokal masing-masing:
   ```bash
   git checkout main
   git pull origin main
   ```

---

## 3. Jembatan FE & BE: Kontrak Data Inertia.js

Di Inertia.js, Controller Laravel tidak mengembalikan JSON mentah atau blade, melainkan langsung mengirim data ke komponen React melalui **Props**.

### Contoh Skenario: Menampilkan Daftar Mobil di Landing Page

#### Langkah 1: Backend Menyediakan Data di Controller
File: `app/Http/Controllers/CarController.php`
```php
namespace App\Http\Controllers;

use App\Models\Car;
use Inertia\Inertia;

class CarController extends Controller
{
    public function index()
    {
        return Inertia::render('Welcome', [
            // Kirim data mobil ke React dengan key 'cars'
            'cars' => Car::where('is_available', true)->take(6)->get(),
            'cities' => ['Jakarta', 'Bandung', 'Surabaya', 'Bali', 'Yogyakarta'],
        ]);
    }
}
```

#### Langkah 2: Frontend Menerima Data di Komponen React
File: `resources/js/Pages/Welcome.jsx`
```jsx
// Frontend tinggal tangkap 'cars' dan 'cities' dari parameter props:
export default function Welcome({ cars = [], cities = [], auth }) {
    return (
        <div>
            {cars.map((car) => (
                <div key={car.id}>
                    <h3>{car.nama}</h3>
                    <p>Rp {car.harga.toLocaleString('id-ID')} / hari</p>
                </div>
            ))}
        </div>
    );
}
```

> **Tips Kunci:** Sebelum BE membuat query database, FE dan BE cukup menyepakati nama field data, misalnya:
> - `id` (angka)
> - `nama` (string, contoh: 'Toyota Avanza')
> - `harga` (angka, contoh: 400000)
> - `kategori` (string, contoh: 'MPV')
> - `foto_url` (string url gambar)

---

## 4. Mengirim Form & Validasi Error

Ketika user mengirim form (misal: booking, login, tambah armada):

### Di React (Frontend): Gunakan `useForm` dari Inertia
```jsx
import { useForm } from '@inertiajs/react';

export default function BookingForm({ carId }) {
    const { data, setData, post, processing, errors } = useForm({
        car_id: carId,
        tanggal_mulai: '',
        lama_sewa: 1,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('bookings.store'));
    };

    return (
        <form onSubmit={submit}>
            <input
                type="date"
                value={data.tanggal_mulai}
                onChange={(e) => setData('tanggal_mulai', e.target.value)}
            />
            {/* Error otomatis muncul dari validasi Laravel! */}
            {errors.tanggal_mulai && (
                <span className="text-red-500 text-xs">{errors.tanggal_mulai}</span>
            )}

            <button type="submit" disabled={processing}>
                {processing ? 'Menyimpan...' : 'Pesan Sekarang'}
            </button>
        </form>
    );
}
```

### Di Laravel (Backend): Cukup Validasi Standar Request
```php
public function store(Request $request)
{
    $validated = $request->validate([
        'car_id' => 'required|exists:cars,id',
        'tanggal_mulai' => 'required|date|after_or_equal:today',
        'lama_sewa' => 'required|integer|min:1',
    ]);

    Booking::create($validated);

    // Redirect kembali atau ke halaman sukses
    return redirect()->route('dashboard')->with('success', 'Pesanan berhasil dibuat!');
}
```
*Tidak perlu menulis API JSON manual, Inertia otomatis menangani error status 422 dan mengisinya ke variabel `errors` di React!*

---

## 5. Standar Routing (Ziggy `route()`)

Selalu gunakan nama route Laravel agar perubahan URL di backend tidak merusak tombol link di frontend:

```jsx
// ✅ BENAR (Gunakan route name):
<Link href={route('login')}>Masuk</Link>
<Link href={route('cars.show', car.id)}>Detail</Link>

// ❌ HINDARI (Hardcoded URL):
<Link href="/login">Masuk</Link>
<Link href={`/armada/detail/${car.id}`}>Detail</Link>
```

---

## 6. Sinkronisasi Database & Data Dummy

Agar tampilan FE Anda tidak kosong saat diuji di laptop masing-masing:
1. Minta teman BE membuat Seeder di `database/seeders/CarSeeder.php`.
2. Setiap ada update migration / struktur tabel baru dari BE, FE cukup jalankan:
   ```bash
   php artisan migrate:fresh --seed
   ```
   *Database lokal Anda akan terisi data dummy kendaraan yang rapi dan seragam.*

---

## 7. Cheat Sheet Perintah Git Harian

| Keperluan | Perintah |
|---|---|
| Cek status file yang diubah | `git status` |
| Simpan perubahan lokal | `git add .` lalu `git commit -m "pesan commit"` |
| Kirim perubahan ke GitHub | `git push origin frontend` |
| Ambil perubahan terbaru dari teman (setelah di-merge ke main) | `git checkout frontend` lalu `git pull origin main --rebase` |
| Pindah antar branch | `git checkout <nama-branch>` |
| Buat branch baru | `git checkout -b <nama-branch-baru>` |
| Batalkan perubahan pada 1 file | `git restore <nama-file>` |
