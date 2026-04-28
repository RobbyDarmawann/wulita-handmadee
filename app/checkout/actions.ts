// FILE: app/checkout/actions.ts
"use server";

import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function processCheckout(formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Silakan login ulang." };

    // 1. Ambil Data dari Form
    const recipientName = formData.get("recipient_name") as string;
    const phoneNumber = formData.get("phone_number") as string;
    const deliveryOption = formData.get("delivery_option") as string;
    const shippingAddress = formData.get("shipping_address") as string || null;
    const customerNotes = formData.get("customer_notes") as string || null;
    const paymentMethod = formData.get("payment_method") as string;
    
    // Ambil data Poin dari form
    const isUsingPoints = formData.get("use_points") === "true";

    // 2. Ambil Keranjang dan Data User (untuk verifikasi saldo poin asli)
    const [cartItems, dbUser] = await Promise.all([
      prisma.cart.findMany({ where: { userId: user.id }, include: { product: true } }),
      prisma.user.findUnique({ where: { id: user.id }, select: { points: true } })
    ]);

    if (cartItems.length === 0) return { success: false, error: "Keranjang kosong!" };
    if (!dbUser) return { success: false, error: "Data pengguna tidak ditemukan." };

    // 3. Kalkulasi Total Asli di Server (Anti Hack)
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingCost = deliveryOption === 'diantar' ? 15000 : 0;
    const initialTotalPrice = subtotal + shippingCost; 

    // 4. Kalkulasi Poin di Server
    let finalTotalPrice = initialTotalPrice;
    let pointsToDeduct = 0;

    if (isUsingPoints && dbUser.points > 0) {
      // Hitung batas maksimal poin yang bisa dipakai (50% dari total)
      const maxAllowedPoints = Math.floor(initialTotalPrice * 0.5 / 10);
      
      // Ambil poin terkecil: antara saldo user ATAU batas maksimal
      pointsToDeduct = Math.min(dbUser.points, maxAllowedPoints);
      
      // Hitung diskon dalam rupiah
      const discountRupiah = pointsToDeduct * 10;
      
      // Kurangi total harga
      finalTotalPrice = initialTotalPrice - discountRupiah;
    }

    // 5. TRANSACTION: Buat Order -> Hapus Keranjang -> Kurangi Saldo Poin
    const newOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId: user.id,
          recipientName,
          phoneNumber,
          deliveryOption,
          shippingAddress: deliveryOption === 'diantar' ? shippingAddress : null,
          shippingCost,
          totalPrice: finalTotalPrice, // Simpan harga yang SUDAH dipotong diskon
          paymentMethod,
          customerNotes,
          status: "menunggu pembayaran",
          pointsUsed: pointsToDeduct, // Catat poin yang dipakai di tabel order
          items: {
            create: cartItems.map(item => ({
              productId: item.productId,
              productName: item.product.name,
              variantName: item.variantName,
              price: item.price,
              quantity: item.quantity
            }))
          }
        }
      });

      // Hapus isi keranjang
      await tx.cart.deleteMany({ where: { userId: user.id } });

      // JIKA PAKAI POIN: Kurangi saldo poin user
      if (pointsToDeduct > 0) {
        await tx.user.update({
          where: { id: user.id },
          data: { points: { decrement: pointsToDeduct } }
        });
      }

      return order;
    });

    revalidatePath("/keranjang");
    revalidatePath("/checkout");
    return { success: true, orderId: newOrder.id };
  } catch (error: any) {
    console.error("❌ Checkout Gagal:", error.message);
    return { success: false, error: "Gagal membuat pesanan." };
  }
} 