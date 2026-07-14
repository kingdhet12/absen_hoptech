# Sistem Absensi Karyawan PT Hoptech Indonesia

Web app absensi karyawan berbasis **HTML5, CSS3, Vanilla JavaScript ES6, Supabase, dan Chart.js**. Tidak menggunakan React, Vue, Angular, Bootstrap, Tailwind, atau Node.js.

---

Support Admin 💵 💰
https://saweria.co/resae

---

## 🌐 Live Demo

> GitHub Pages:
> https://github.com/kingdhet12

> Link Demo:
> https://absen-hoptech.vercel.app/

---
<img width="1440" height="765" alt="image" src="https://github.com/user-attachments/assets/49eee77c-7210-45bb-96d6-40ac72dc15b9" />
<img width="1423" height="752" alt="image" src="https://github.com/user-attachments/assets/f10f132b-5461-4f90-bcc7-fdaa4ef22f69" />
<img width="1437" height="755" alt="image" src="https://github.com/user-attachments/assets/591e22f5-5a93-44c3-9b8f-d47a97658e2b" />

## Fitur

- Login admin dengan Supabase Authentication.
- Dashboard statistik: total karyawan, hadir hari ini, tidak hadir, terlambat, persentase kehadiran bulan ini, tanggal, dan jam realtime.
- Sidebar: Dashboard, Data Karyawan, Absensi, Laporan, Grafik, Pengaturan, Logout.
- CRUD karyawan dengan modal tambah/edit, confirm delete, pagination, sorting, dan realtime search.
- Absensi berdasarkan ID karyawan, data karyawan tampil otomatis, tanggal/jam otomatis, anti absensi ganda per hari.
- Laporan dengan filter tanggal, bulan, tahun, nama/ID, divisi, status.
- Export CSV, export Excel, dan print laporan.
- Grafik Chart.js: bulanan, mingguan, pie status, top 10 karyawan terajin bulan kemarin.
- Dark mode, toast notification, loading overlay, responsive table, back to top, ripple button, dan animasi.

## Struktur Project

```text
/
├── index.html
├── style.css
├── script.js
├── config.js
├── supabase.js
├── supabase-schema.sql
├── README.md
└── assets/
    ├── logo/
    ├── icons/
    ├── background/
    └── avatar/
```

## Cara Setup Supabase

1. Buka [Supabase](https://supabase.com/) dan buat project baru.
2. Masuk ke **SQL Editor**.
3. Jalankan seluruh isi file `supabase-schema.sql`.
4. Masuk ke **Authentication > Users**.
5. Tambahkan user admin, misalnya `admin@hoptech.co.id`, password: app_absensi123 .
6. Masuk ke **Project Settings > API**.
7. Salin `Project URL` dan `anon public key`.
8. Buka file `config.js`, lalu isi:

```js
window.APP_CONFIG = {
  SUPABASE_URL: "https://PROJECT_ID.supabase.co",
  SUPABASE_ANON_KEY: "ANON_PUBLIC_KEY_ANDA",
};
```

## Struktur Tabel

### employees

| Kolom       | Tipe        | Keterangan       |
| ----------- | ----------- | ---------------- |
| id          | uuid        | Primary key      |
| employee_id | text        | ID karyawan unik |
| name        | text        | Nama karyawan    |
| division    | text        | Divisi           |
| position    | text        | Jabatan          |
| photo       | text        | URL foto         |
| join_date   | date        | Tanggal masuk    |
| status      | text        | Aktif / Nonaktif |
| created_at  | timestamptz | Timestamp dibuat |

### attendance

| Kolom             | Tipe        | Keterangan                           |
| ----------------- | ----------- | ------------------------------------ |
| id                | uuid        | Primary key                          |
| employee_id       | text        | Relasi ke employees.employee_id      |
| attendance_date   | date        | Tanggal absensi                      |
| check_in          | time        | Jam masuk                            |
| check_out         | time        | Jam keluar                           |
| attendance_status | text        | Hadir, Izin, Sakit, Alpha, Terlambat |
| created_at        | timestamptz | Timestamp dibuat                     |

Constraint `unique_employee_attendance_per_day` mencegah absensi ganda untuk karyawan yang sama pada tanggal yang sama.

## Cara Menjalankan

1. Pastikan `config.js` sudah diisi.
2. Buka `index.html` langsung di browser.
3. Login menggunakan user admin yang dibuat di Supabase Authentication.

Tidak perlu instalasi package, build tool, Node.js, atau server lokal.

## Deploy ke GitHub Pages

1. Upload semua file project ke repository GitHub.
2. Buka **Settings > Pages**.
3. Pilih branch, misalnya `main`.
4. Pilih folder `/root`.
5. Klik **Save**.
6. Buka URL GitHub Pages yang diberikan.

Catatan: karena `config.js` berada di frontend, hanya gunakan `anon public key`. Jangan pernah menggunakan `service_role key`.

## Deploy ke Vercel

1. Login ke [Vercel](https://vercel.com/).
2. Import repository GitHub.
3. Framework preset pilih **Other**.
4. Build command kosongkan.
5. Output directory isi `.`.
6. Deploy.

## Catatan Produksi

- Untuk produksi, aktifkan kebijakan RLS yang lebih ketat sesuai role admin perusahaan.
- Supabase anon key aman untuk frontend selama RLS dikonfigurasi benar.
- Foto karyawan menggunakan URL. Jika ingin upload file, gunakan Supabase Storage dan simpan public URL ke kolom `photo`.
- Export Excel menggunakan format `.xls` berbasis HTML table agar tetap bisa berjalan tanpa library tambahan.

## File Penting

- `config.js`: konfigurasi Supabase.
- `supabase.js`: inisialisasi Supabase client.
- `script.js`: semua logic aplikasi.
- `supabase-schema.sql`: tabel, RLS policy, constraint, dan dummy data.

# 👨‍💻 Author

**Resa Erlangga**

📧 Email  
resaerlangga@gmail.com

💼 LinkedIn  
www.linkedin.com/in/resa-erlangga-42018b179

🐙 GitHub  
https://github.com/kingdhet12

🌐 Portfolio  
https://kingdhet12.github.io/

---
