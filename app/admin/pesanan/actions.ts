// FILE: app/admin/pesanan/actions.ts
"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateOrderStatus(orderId: number, newStatus: string) {
  try {
    console.log(`[POIN SYSTEM] Memulai update order #${orderId} ke status: "${newStatus}"`);
    
    // 1. Jalankan di dalam transaksi
    await prisma.$transaction(async (tx) => {
      const currentOrder = await tx.order.findUnique({
        where: { id: orderId }
      });

      if (!currentOrder) throw new Error("Pesanan tidak ditemukan.");

      const updateData: any = { status: newStatus };
      
      // BERSIHKAN STRING STATUS DARI SPASI GAIB & HURUF BESAR
      const cleanStatus = newStatus.trim().toLowerCase();
      
      console.log(`[POIN SYSTEM] Status Bersih: "${cleanStatus}", Poin Order Saat Ini: ${currentOrder.pointsEarned}, UserID: ${currentOrder.userId}`);

      // ==============================================================
      // FITUR LOYALITAS: BERIKAN POIN JIKA STATUS MENJADI "SELESAI"
      // ==============================================================
    if (cleanStatus.includes("selesai") && currentOrder.pointsEarned === 0 && currentOrder.userId) {
        
        const subtotal = currentOrder.totalPrice - currentOrder.shippingCost;
        let calculatedPoints = Math.floor(subtotal / 1000);
        if (calculatedPoints > 5000) calculatedPoints = 5000;

        console.log(`[POIN SYSTEM] ✅ Syarat terpenuhi! Memberikan ${calculatedPoints} Poin ke User ${currentOrder.userId}`);

        updateData.pointsEarned = calculatedPoints;

        await tx.user.update({
          where: { id: currentOrder.userId },
          data: { points: { increment: calculatedPoints } }
        });
      } 
      // ==============================================================
      // FITUR KOREKSI: TARIK POIN JIKA STATUS BATAL / MUNDUR
      // ==============================================================
      else if (!cleanStatus.includes("selesai") && currentOrder.pointsEarned > 0 && currentOrder.userId) {
        
        console.log(`[POIN SYSTEM] ⚠️ Status mundur! Menarik kembali ${currentOrder.pointsEarned} Poin dari User ${currentOrder.userId}`);
        
        await tx.user.update({
          where: { id: currentOrder.userId },
          data: { points: { decrement: currentOrder.pointsEarned } }
        });
        
        updateData.pointsEarned = 0;
      } else {
        console.log(`[POIN SYSTEM] ℹ️ Tidak ada perubahan poin untuk transaksi ini.`);
      }
      // Lakukan update pada order
      await tx.order.update({
        where: { id: orderId },
        data: updateData
      });
    });

    // ==============================================================
    // SAPU JAGAT CACHE (Ini yang bikin poin langsung muncul!)
    // ==============================================================
    revalidatePath("/admin/pesanan");
    revalidatePath(`/admin/pesanan/${orderId}`);
    
    // Memaksa SELURUH halaman (termasuk Profil dan Navbar user) untuk refresh data terbaru dari database
    revalidatePath("/", "layout"); 
    
    return { success: true };
  } catch (error: any) {
    console.error("❌ Gagal update status pesanan:", error.message);
    return { success: false, error: "Gagal memperbarui status pesanan." };
  }
}