// FILE: app/admin/pesanan/actions.ts
"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateOrderStatus(orderId: number, newStatus: string) {
  try {
    // 1. Jalankan di dalam transaksi agar aman jika terjadi kegagalan
    await prisma.$transaction(async (tx) => {
      // Ambil data order saat ini untuk mengecek status dan total harga
      const currentOrder = await tx.order.findUnique({
        where: { id: orderId }
      });

      if (!currentOrder) throw new Error("Pesanan tidak ditemukan.");

      // Siapkan data yang akan di-update
      const updateData: any = { status: newStatus };

      // ==============================================================
      // FITUR LOYALITAS: BERIKAN POIN JIKA STATUS MENJADI "SELESAI"
      // ==============================================================
      // Syarat:
      // 1. Status baru adalah "selesai".
      // 2. Pesanan ini belum pernah diberikan poin sebelumnya (pointsEarned == 0).
      // 3. User terkait tidak null (Guest tidak dapat poin).
      if (newStatus.toLowerCase() === "selesai" && currentOrder.pointsEarned === 0 && currentOrder.userId) {
        
        // Aturan: 1% dari total belanja (hanya harga produk/subtotal, ongkir diabaikan)
        // Jika ongkir masuk total: (currentOrder.totalPrice - currentOrder.shippingCost)
        const subtotal = currentOrder.totalPrice - currentOrder.shippingCost;
        
        // Hitung poin (Dibulatkan ke bawah. Misal: 100.900 * 1% = 1009 poin)
        // Maksimal Capping: 5000 Poin (sesuai kesepakatan)
        let calculatedPoints = Math.floor(subtotal * 0.01);
        if (calculatedPoints > 5000) {
          calculatedPoints = 5000;
        }

        // Catat berapa poin yang didapat di tabel Order
        updateData.pointsEarned = calculatedPoints;

        // Tambahkan saldo poin ke tabel User
        await tx.user.update({
          where: { id: currentOrder.userId },
          data: { points: { increment: calculatedPoints } }
        });
      }

      // ==============================================================
      // FITUR KOREKSI: TARIK POIN JIKA STATUS DIBATALKAN (OPSIONAL)
      // ==============================================================
      // Jika Admin tidak sengaja pencet "Selesai", lalu diubah ke "Dibatalkan", kita tarik lagi poinnya
      if (newStatus.toLowerCase() !== "selesai" && currentOrder.pointsEarned > 0 && currentOrder.userId) {
        // Kurangi saldo poin user
        await tx.user.update({
          where: { id: currentOrder.userId },
          // Pastikan poin tidak menjadi minus (meskipun prisma decrement aman, kita cegah bug)
          data: { points: { decrement: currentOrder.pointsEarned } }
        });
        
        // Reset catatan poin di Order
        updateData.pointsEarned = 0;
      }

      // Lakukan update pada order
      await tx.order.update({
        where: { id: orderId },
        data: updateData
      });
    });

    // Refresh halaman list dan detail
    revalidatePath("/admin/pesanan");
    revalidatePath(`/admin/pesanan/${orderId}`);
    
    return { success: true };
  } catch (error: any) {
    console.error("❌ Gagal update status pesanan:", error.message);
    return { success: false, error: "Gagal memperbarui status pesanan." };
  }
}