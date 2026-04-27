"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// 1. Fungsi untuk Membalas Ulasan
export async function replyToReview(reviewId: number, reply: string) {
  try {
    await prisma.review.update({
      where: { id: reviewId },
      data: { admin_reply: reply }
    });

    revalidatePath("/admin/ulasan");
    return { success: true };
  } catch (error: any) {
    console.error("❌ Gagal membalas ulasan:", error.message);
    return { success: false, error: "Gagal mengirim balasan." };
  }
}

// 2. Fungsi untuk Menghapus Ulasan
export async function deleteReview(reviewId: number) {
  try {
    await prisma.review.delete({
      where: { id: reviewId }
    });

    revalidatePath("/admin/ulasan");
    return { success: true };
  } catch (error: any) {
    console.error("❌ Gagal menghapus ulasan:", error.message);
    return { success: false, error: "Gagal menghapus ulasan." };
  }
}