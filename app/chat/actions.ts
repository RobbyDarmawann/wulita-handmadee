"use server";

import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// 1. OTAM SUPER BOT WULITA (Kamus Pertanyaan)
function generateBotReply(message: string, product: any) {
  // Membersihkan teks: huruf kecil semua, hilangkan tanda baca berlebih agar mudah dideteksi
  const text = message.toLowerCase().replace(/[^\w\s]/g, '');

  // Sapaan
  if (/\b(halo|hi|hai|min|admin|permisi|pagi|siang|sore|malam)\b/.test(text)) {
    return "Halo kak! 👋 Selamat datang di Wulita Care. Ada yang bisa Bot bantu jawab seputar produk, stok, atau pengiriman?";
  }
  
  // Tanya Stok & Ketersediaan
  if (/\b(ready|ada|stok|sisa|masih|habis)\b/.test(text)) {
    if (product) {
      return product.stock > 0 
        ? `Kabar baik! **${product.name}** masih ready stok **${product.stock} pcs**. Yuk buruan di-checkout sebelum kehabisan! ✨`
        : `Yah, **${product.name}** sedang kosong/habis kak. 🥺 Coba cek katalog untuk karya menarik lainnya ya!`;
    }
    return "Boleh tahu nama pusaka/produk yang ingin kakak cek stoknya? Atau kakak bisa balas dari halaman produk langsung. 📦";
  }

  // Pengiriman & Ekspedisi
  if (/\b(kirim|ongkir|kurir|lama|sampai|pengiriman|ekspedisi)\b/.test(text)) {
    return "🚚 Pengiriman: Pesanan sebelum jam 15.00 WITA akan diproses hari yang sama. Ongkir kurir lokal Rp 15.000, atau Kakak bisa pilih 'Ambil Sendiri di Toko' secara GRATIS!";
  }

  // Bahan & Kualitas
  if (/\b(bahan|material|terbuat|asli|luntur|karat|gatal|alergi|awet)\b/.test(text)) {
    return "Pusaka Wulita Handmade dibuat dari bahan premium yang aman di kulit (hipoalergenik) dan dijamin awet kak! Untuk detail bahan spesifik, Kakak bisa cek langsung di deskripsi masing-masing produk ya. ✨";
  }

  // Ukuran & Size
  if (/\b(ukuran|size|panjang|lebar|muat|besar|kecil|ukur)\b/.test(text)) {
    return "Sebagian besar produk kami (seperti gelang) ukurannya bisa disesuaikan (adjustable) kok kak. Jika butuh ukuran khusus, Kakak bisa tulis detailnya di 'Catatan Pembeli' saat checkout! 📏";
  }

  // Promo, Poin & Diskon
  if (/\b(promo|diskon|potongan|voucher|sale|murah|poin|reward)\b/.test(text)) {
    return "Wulita sering mengadakan promo lho! Produk berlabel merah di katalog sedang ada diskon. Oh ya, setiap pesanan selesai juga akan menghasilkan 'Wulita Rewards Poin' yang bisa dipakai untuk potongan harga di pesanan berikutnya! 💸";
  }

  // Pembayaran
  if (/\b(bayar|cod|transfer|qris|rekening|metode|shopeepay|dana|gopay)\b/.test(text)) {
    return "Untuk saat ini kami menerima pembayaran via Transfer Bank BCA (Manual) dan QRIS (Bisa di-scan pakai semua E-Wallet seperti DANA, OVO, Gopay, atau M-Banking). Mohon maaf, sistem COD belum tersedia ya Kak. 💳";
  }

  // Lokasi & Offline Store
  if (/\b(toko|lokasi|alamat|offline|cabang|map|maps|daerah|dimana)\b/.test(text)) {
    return "Pangkalan (Toko) fisik Wulita Handmade berlokasi di Gorontalo kak. Kakak bisa merapat langsung atau memilih opsi 'Ambil Sendiri di Pangkalan' saat checkout agar bebas ongkos kirim! 📍";
  }

  // Cara Order / Checkout
  if (/\b(pesan|order|beli|checkout|caranya|keranjang|masukin)\b/.test(text)) {
    return "Gampang banget kak! Pilih produknya -> klik 'Masukkan Palka' -> buka Keranjang -> lalu klik 'Checkout'. Nanti tinggal isi alamat dan pilih cara bayarnya deh! 🛒";
  }

  // Kado / Packaging
  if (/\b(kado|hadiah|box|pita|packaging|bungkus|paking|kardus)\b/.test(text)) {
    return "Bisa banget! 🎁 Setiap karya Wulita dipacking eksklusif dan estetik. Kalau mau dikirim sebagai kado, tulis aja pesannya di kolom 'Catatan Tambahan' saat Checkout ya!";
  }

  // Perawatan Produk
  if (/\b(rawat|air|cuci|mandi|sabun|bersihin|kotor)\b/.test(text)) {
    return "Agar pusaka Wulita tetap berkilau, hindari terkena bahan kimia tajam seperti parfum/lotion berlebih. Jika tidak dipakai, simpan di tempat yang kering ya kak! 💧";
  }

  // Custom Order & Keluhan / Retur (Otomatis diarahkan ke Admin)
  if (/\b(custom|request|ganti|nama|retur|rusak|kembali|garansi|tukar|cacat|komplain|batal|salah)\b/.test(text)) {
    return "Untuk pemesanan *custom* nama, keluhan pesanan, atau retur garansi, yuk langsung ngobrol sama tim kami. Silakan klik tombol **Hubungi Admin (Manusia)** di bawah pesan ini ya kak! 👩‍💻";
  }

  // Kata umpatan / kasar (Bot Mode Santun)
  if (/\b(anjing|babi|bangsat|tolol|bego|goblok)\b/.test(text)) {
    return "Mohon gunakan bahasa yang sopan ya Kak. Tim Wulita Care selalu siap membantu dengan ramah. 🙏";
  }

  // FALLBACK (Jika bot sama sekali tidak tahu jawabannya)
  return "Hmm, Bot Wulita kurang paham maksud kakak. 🥺 Klik tombol **Hubungi Admin (Manusia)** di bawah ini agar kakak dibantu langsung oleh tim kami ya!";
}

// 2. Simpan Pesan & Trigger Bot
export async function sendMessage(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Login dulu ya" };

  const message = formData.get("message") as string;
  const productId = formData.get("product_id") ? parseInt(formData.get("product_id") as string) : null;
  
  // Cek apakah chat sudah di-escalate ke admin
  const lastMsg = await prisma.message.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' }
  });
  const isEscalated = lastMsg?.isEscalated || false;

  // Simpan Pesan User
  await prisma.message.create({
    data: {
      userId: user.id,
      productId,
      message,
      sender: "user",
      isEscalated
    }
  });

  // Jika belum ke admin, Bot menjawab otomatis
  if (!isEscalated) {
    const product = productId ? await prisma.product.findUnique({ where: { id: productId } }) : null;
    const botReply = generateBotReply(message, product);

    await prisma.message.create({
      data: {
        userId: user.id,
        productId,
        message: botReply,
        sender: "bot",
        isFromAdmin: true
      }
    });
  }

  revalidatePath("/chat");
  return { success: true };
}

// 3. Eskalasi ke Admin Manusia
export async function escalateToAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await prisma.message.updateMany({
    where: { userId: user.id },
    data: { isEscalated: true }
  });

  await prisma.message.create({
    data: {
      userId: user.id,
      sender: "system",
      message: "Tentu kak! Mohon tunggu sebentar, Admin Wulita akan segera merespons pesan kakak. 👩‍💻",
      isFromAdmin: true,
      isEscalated: true
    }
  });

  revalidatePath("/chat");
}

// 4. Kembali ke Mode Bot (Akhiri Sesi Admin)
export async function revertToBot() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  try {
    await prisma.message.updateMany({
      where: { userId: user.id },
      data: { isEscalated: false }
    });

    await prisma.message.create({
      data: {
        userId: user.id,
        sender: "system",
        message: "Sesi dengan Admin telah diakhiri. Asisten Otomatis Wulita kembali aktif! 🤖✨",
        isFromAdmin: true,
        isEscalated: false
      }
    });

    revalidatePath("/chat");
    return { success: true };
  } catch (error) {
    console.error("Gagal kembali ke bot:", error);
    return { success: false };
  }
}