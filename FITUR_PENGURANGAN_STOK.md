# Fitur Pengurangan Stok Telur

## Deskripsi
Fitur baru di menu Warehouse yang memungkinkan input manual pengurangan stok telur berdasarkan penjualan harian.

## Lokasi
Menu: **Warehouse** → Tab **Pengurangan Stok Telur**

## Fitur Utama

### 1. Tab Pengurangan Stok Telur
- Terpisah dari tab Stok Gudang utama
- Fokus khusus untuk manajemen stok telur

### 2. Form Pengurangan Stok
- **Tanggal**: Pilih tanggal penjualan
- **Jumlah Pengurangan (Butir)**: Input jumlah telur yang terjual
- **Keterangan (Opsional)**: Catatan tambahan (contoh: "Penjualan harian")

### 3. Validasi
- Memastikan jumlah pengurangan > 0
- Mengecek ketersediaan stok (tidak bisa kurangi lebih dari stok yang ada)
- Menampilkan stok saat ini sebagai referensi

### 4. Display Stok Telur
- Kartu besar menampilkan stok telur saat ini (butir)
- Kartu menampilkan konversi ke tray (@ 30 butir)

### 5. Riwayat Perubahan Stok
- Tabel menampilkan histori perubahan stok telur
- Kolom "Perubahan" menunjukkan:
  - Warna merah untuk pengurangan (-)
  - Warna hijau untuk penambahan (+)
- Memudahkan tracking penjualan harian

## Cara Penggunaan

1. Buka menu **Warehouse**
2. Klik tab **Pengurangan Stok Telur**
3. Klik tombol **Kurangi Stok Telur** (tombol merah)
4. Isi form:
   - Pilih tanggal penjualan
   - Masukkan jumlah telur yang terjual (dalam butir)
   - Tambahkan keterangan jika perlu
5. Klik **Kurangi Stok**
6. Sistem akan:
   - Mengurangi stok telur
   - Menghitung ulang jumlah tray
   - Menambahkan entry baru ke warehouse
   - Menampilkan notifikasi sukses

## Contoh Penggunaan

**Skenario**: Penjualan harian 150 butir telur

1. Stok awal: 1000 butir (33.33 tray)
2. Input pengurangan: 150 butir
3. Keterangan: "Penjualan 24 Feb 2026"
4. Stok akhir: 850 butir (28.33 tray)

## Catatan Teknis

- Pengurangan stok akan membuat entry baru di tabel warehouse
- Stok pakan (jagung, konsentrat, dedak) tidak berubah
- Hanya stok telur yang dikurangi
- Perhitungan tray otomatis: butir ÷ 30
- Role "Worker" hanya bisa melihat, tidak bisa mengurangi stok

## Integrasi dengan Sistem

- Data tersimpan di tabel `app_warehouse_entries`
- Terintegrasi dengan sistem backup/restore warehouse
- Muncul di export Excel warehouse
- Sinkronisasi dengan AppDataContext
