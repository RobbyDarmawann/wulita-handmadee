"use server";

import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// 1. Logika Bot Pintar
function generateBotReply(message: string, product: any) {
  const text = message.toLowerCase().replace(/[^\w\s]/g, '');

  if (/\b(halo|hi|hai|min|admin|permisi)\b/.test(text)) {
    return "Halo kak! 👋 Selamat datang di Wulita Care. Ada yang bisa Bot bantu jawab seputar produk, stok, atau pengiriman?";
  }
  if (/\b(ready|ada|stok|sisa|masih|habis)\b/.test(text)) {
    if (product) {
      return product.stock > 0 
        ? `Kabar baik! **${product.name}** masih ready stok **${product.stock} pcs**. Yuk di-checkout! ✨`
        : `Yah, **${product.name}** sedang habis kak. 🥺 Cek produk lainnya ya!`;
    }
    return "Boleh tahu nama produk yang ingin kakak cek stoknya?";
  }
  if (/\b(kirim|ongkir|kurir|lama|sampai|lokasi)\b/.test(text)) {
    return "🚚 Pengiriman: Pesanan sebelum jam 15.00 dikirim hari ini. Ongkir lokal Rp 15.000 atau Ambil di Toko (Gratis)!";
  }
  if (/\b(custom|request|ganti|nama)\b/.test(text)) {
    return "Untuk pemesanan *custom*, silakan klik tombol **Chat dengan Admin** di bawah ya! 🎨";
  }
  return "Hmm, Bot Wulita kurang paham. Klik **Chat dengan Admin** agar dibantu tim kami! 🥺";
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
      message: "Tentu kak! Mohon tunggu sebentar, Admin Wulita segera merespons. 👩‍💻",
      isFromAdmin: true,
      isEscalated: true
    }
  });

  revalidatePath("/chat");
}