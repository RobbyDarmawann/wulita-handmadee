# Fix: Connection Pool Exhaustion di Vercel

## ⚠️ Problem
Error: `FATAL: (EMAXCONNSESSION) max clients reached in session mode - max clients are limited to pool_size: 15`

Ini terjadi ketika admin pages membuka terlalu banyak koneksi database bersamaan, melebihi limit pool Supabase (15 koneksi default untuk free tier).

## ✅ Solusi

### 1. **Update DATABASE_URL di Vercel (WAJIB)**

DATABASE_URL saat ini kemungkinan menggunakan **regular connection URL** (port 5432) yang tidak ada pooling. Kamu perlu ganti dengan **Connection Pooler URL** (port 6543).

#### Langkah-langkah:

1. **Login ke Supabase Dashboard** → Pilih project Wulita Handmade
2. **Klik "Settings" → "Database" → "Connection Pooler"**
3. **Copy** URI yang punya format:
   ```
   postgresql://[user]:[password]@db.supabase.co:6543/postgres?schema=public
   ```
   ⚠️ Perhatian: Port harus `6543` (bukan `5432`)

4. **Login ke Vercel Dashboard** → Project "wulita-handmade"
5. **Klik "Settings" → "Environment Variables"**
6. **Edit variabel `DATABASE_URL`** → Paste connection pooler URL tadi
7. **Deploy ulang** atau klik "Redeploy"

### Contoh CONNECTION STRING yang benar:
```
postgresql://postgres.xxxxx:yyyyyy@db.supabase.co:6543/postgres?schema=public&pgbouncer=true
```

---

### 2. **Sudah Dilakukan: Caching di Admin Pages**

✅ Perubahan kode sudah diterapkan:
- `dashboard/page.tsx`: Cache 60 detik
- `produk/page.tsx`: Cache 60 detik
- `kategori/page.tsx`: Cache 60 detik  
- `pesanan/page.tsx`: Cache 30 detik (lebih critical)

Dengan caching ini, tidak setiap request langsung hit database.

### 3. **Sudah Dilakukan: Query Optimization**

✅ Dashboard page diperbaiki:
- Critical data: `Promise.all()` untuk kecepatan
- Non-critical data (recent orders, low stock): Sequential fetch untuk mengurangi concurrent connections

---

## 🔧 Jika error masih terjadi:

### A. Cek Connection Pool di Supabase
1. Supabase Dashboard → **Logs** → **Database Logs**
2. Lihat apakah masih ada "max clients reached" setelah deploy ulang

### B. Tambahkan Query Limit
Jika masih terjadi, di halaman yang berat (dashboard), batasi lebih:

```typescript
// Contoh: ambil hanya 3 data instead of 5
const recentOrders = await prisma.order.findMany({ 
  take: 3,  // ← kurangi dari 5
  orderBy: { createdAt: 'desc' } 
});
```

### C. Disable Real-time Features
Jika ada subscription Supabase real-time di admin pages, pertimbangkan disable untuk mengurangi koneksi:

```typescript
// Di layout atau component
// Jangan subscribe ke realtime data di admin berat
```

---

## 📊 Perbedaan Regular vs Pooler Connection

| Aspek | Regular (5432) | Pooler (6543) |
|-------|---|---|
| **Pool Mode** | Direct connection | PgBouncer (Transaction/Session mode) |
| **Max Connections** | Terbatas database | Terbatas aplikasi (biasanya 100) |
| **Cocok untuk** | Development, dedicated server | Serverless, Vercel, high-concurrency |
| **Latency** | Lebih rendah | Sedikit lebih tinggi (negligible) |

**Untuk Vercel/Serverless: SELALU gunakan Pooler (6543)** ✅

---

## ✨ Hasil Setelah Fix

✅ Admin pages akan reliable
✅ Tidak lagi "This page couldn't load" error
✅ Koneksi database terbagi lebih efisien
✅ Cache mengurangi database load

---

## 📝 Catatan

Jika masih ada issue:
1. Cek bahwa `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` benar
2. Cek bahwa `SUPABASE_SERVICE_ROLE_KEY` ada di Vercel
3. Pastikan semua env vars sudah di-redeploy

Hubungi Supabase support jika connection pooler URL sendiri error.
