"use server";

import prisma from "@/lib/prisma";

export async function fetchAdminData() {
  try {
    // 1. Hitung Pesanan yang Perlu Diproses (Dibayar / Dikemas)
    const pendingOrdersCount = await prisma.order.count({
      where: { status: { in: ['dibayar', 'dikemas'] } }
    });

    // 2. Hitung Ulasan yang Belum Dibalas Admin
    const unrepliedReviewsCount = await prisma.review.count({
      where: { admin_reply: null }
    });

    // 3. Cek Stok Menipis (Kurang dari atau sama dengan 5)
    const lowStockProducts = await prisma.product.findMany({
      where: { stock: { lte: 5 } },
      select: { id: true, name: true, stock: true },
      take: 10,
      orderBy: { stock: 'asc' }
    });

    // 4. Cek Pesanan Baru Masuk (Status 'dibayar') untuk Notifikasi
    const newOrders = await prisma.order.findMany({
      where: { status: 'dibayar' },
      select: { id: true, recipientName: true, createdAt: true, totalPrice: true },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    return {
      pendingOrdersCount,
      unrepliedReviewsCount,
      lowStockProducts,
      newOrders
    };
  } catch (error) {
    console.error("Gagal menarik data admin:", error);
    return { pendingOrdersCount: 0, unrepliedReviewsCount: 0, lowStockProducts: [], newOrders: [] };
  }
}