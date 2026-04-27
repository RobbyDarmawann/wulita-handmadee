"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateOrderStatus(orderId: number, newStatus: string) {
  try {
    await prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus }
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