// FILE: app/admin/pesanan/actions.ts
"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ==============================================================
// 📱 HELPER: FUNGSI PENGIRIM WHATSAPP VIA FONNTE
// ==============================================================
async function sendWhatsApp(targetRaw: string, message: string) {
  const token = process.env.FONNTE_TOKEN;
  
  if (!token) {
    console.warn("[WA SYSTEM] Peringatan: FONNTE_TOKEN belum diisi di file .env");
    return;
  }

  // PEMBERSIH NOMOR (Sangat Penting untuk Fonnte!)
  // Hilangkan semua karakter kecuali angka
  let target = targetRaw.replace(/\D/g, ''); 
  // Jika diawali 0, ganti jadi 62
  if (target.startsWith('0')) {
    target = '62' + target.substring(1);
  }
  // Jika diawali 62 tapi kurang dari 10 digit, kemungkinan salah ketik
  if (target.length < 10) return;

  try {
    const response = await fetch("https://api.fonnte.com/send", {
      method: "POST",
      headers: {
        "Authorization": token,
      },
      body: new URLSearchParams({
        target: target,
        message: message,
        // Kita tidak pakai countryCode lagi karena nomor sudah diseragamkan jadi '62' di atas
      }),
    });
    
    const result = await response.json();
    console.log(`[WA SYSTEM] Respon Fonnte:`, result);
  } catch (error) {
    console.error("[WA SYSTEM] ❌ Gagal mengirim pesan WA:", error);
  }
}

// ==============================================================
// 🛠️ FUNGSI UTAMA: UPDATE STATUS PESANAN
// ==============================================================
export async function updateOrderStatus(orderId: number, newStatus: string) {
  try {
    console.log(`[SYSTEM] Memulai update order #${orderId} ke status: "${newStatus}"`);
    
    let pointsGivenForWA = 0; 

    // 1. UPDATE DATABASE (TRANSAKSI AMAN)
    const updatedOrder = await prisma.$transaction(async (tx) => {
      const currentOrder = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true } 
      });

      if (!currentOrder) throw new Error("Pesanan tidak ditemukan.");

      const updateData: any = { status: newStatus };
      const cleanStatus = newStatus.trim().toLowerCase();
      const oldStatus = currentOrder.status.trim().toLowerCase();

      const isNowCancelled = cleanStatus === "pembayaran ditolak" || cleanStatus === "dibatalkan";
      const wasCancelled = oldStatus === "pembayaran ditolak" || oldStatus === "dibatalkan";

      if (isNowCancelled && !wasCancelled) {
        for (const item of currentOrder.items) {
          if (item.variantId) {
            await tx.productVariant.update({ where: { id: item.variantId }, data: { stock: { increment: item.quantity } } });
          } else if (item.productId) { 
            await tx.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } });
          }
        }
        if (currentOrder.pointsUsed > 0 && currentOrder.userId) {
          await tx.user.update({ where: { id: currentOrder.userId }, data: { points: { increment: currentOrder.pointsUsed } } });
        }
      } 
      else if (!isNowCancelled && wasCancelled) {
        for (const item of currentOrder.items) {
          if (item.variantId) {
            await tx.productVariant.update({ where: { id: item.variantId }, data: { stock: { decrement: item.quantity } } });
          } else if (item.productId) {
            await tx.product.update({ where: { id: item.productId }, data: { stock: { decrement: item.quantity } } });
          }
        }
        if (currentOrder.pointsUsed > 0 && currentOrder.userId) {
          await tx.user.update({ where: { id: currentOrder.userId }, data: { points: { decrement: currentOrder.pointsUsed } } });
        }
      }

      if (cleanStatus.includes("selesai") && currentOrder.pointsEarned === 0 && currentOrder.userId) {
        const subtotal = currentOrder.totalPrice - currentOrder.shippingCost;
        let calculatedPoints = Math.floor(subtotal / 1000); 
        if (calculatedPoints > 5000) calculatedPoints = 5000; 

        updateData.pointsEarned = calculatedPoints;
        pointsGivenForWA = calculatedPoints; 

        await tx.user.update({ where: { id: currentOrder.userId }, data: { points: { increment: calculatedPoints } } });
      } else if (!cleanStatus.includes("selesai") && currentOrder.pointsEarned > 0 && currentOrder.userId) {
        await tx.user.update({ where: { id: currentOrder.userId }, data: { points: { decrement: currentOrder.pointsEarned } } });
        updateData.pointsEarned = 0;
      }

      const result = await tx.order.update({
        where: { id: orderId },
        data: updateData
      });

      return { ...currentOrder, ...result };
    });

    // ==============================================================
    // 2. TRIGGER WHATSAPP NOTIFICATION
    // ==============================================================
    const targetNumber = updatedOrder.phoneNumber;
    const customerName = updatedOrder.recipientName;
    const cleanStatus = newStatus.trim().toLowerCase();
    let waMessage = "";

    if (cleanStatus === "dibayar") {
      waMessage = `Halo Kak ${customerName}! Pembayaran untuk pesanan Wulita Handmade *#ORD-${orderId}* sudah kami terima. Saat ini maha karya pesanan Kakak sedang kami siapkan dengan teliti. Mohon ditunggu ya! ✨`;
    } 
    else if (cleanStatus === "sedang_dikirim") {
      waMessage = `Halo Kak ${customerName}! Pesanan Wulita Handmade *#ORD-${orderId}* Kakak sedang dalam perjalanan menuju lokasi (dikirim via kurir lokal/Maxim). Pastikan Kakak/Perwakilan siap di lokasi ya! 🛵📦`;
    } 
    else if (cleanStatus === "siap_diambil") {
      waMessage = `Halo Kak ${customerName}! Kabar gembira, pesanan Wulita Handmade *#ORD-${orderId}* Kakak sudah siap untuk diambil di Pangkalan (Toko) Wulita. Kami tunggu kedatangannya! 🎁✨`;
    } 
    else if (cleanStatus.includes("selesai")) {
      const pointMsg = pointsGivenForWA > 0 ? ` Kakak mendapatkan tambahan *${pointsGivenForWA} Poin Rewards* lho! ` : " ";
      waMessage = `Halo Kak ${customerName}! Pesanan *#ORD-${orderId}* telah selesai. Terima kasih sudah mengapresiasi kerajinan Gorontalo bersama Wulita Handmade!${pointMsg}Ditunggu orderan selanjutnya ya Kak. 💖`;
    } 
    else if (cleanStatus === "pembayaran ditolak" || cleanStatus === "dibatalkan") {
      waMessage = `Halo Kak ${customerName}. Mohon maaf, pesanan Wulita Handmade *#ORD-${orderId}* Kakak terpaksa kami batalkan / tolak pembayarannya. Jika ada pertanyaan atau kendala, silakan hubungi tim admin kami kembali. 🙏`;
    }

    if (waMessage !== "") {
      sendWhatsApp(targetNumber, waMessage); 
    }

    revalidatePath("/admin/pesanan");
    revalidatePath(`/admin/pesanan/${orderId}`);
    revalidatePath("/katalog"); 
    revalidatePath("/", "layout"); 
    
    return { success: true };
  } catch (error: any) {
    console.error("❌ Gagal update status pesanan:", error.message);
    return { success: false, error: "Gagal memperbarui status pesanan." };
  }
}