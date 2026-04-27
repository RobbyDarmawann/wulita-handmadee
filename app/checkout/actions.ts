"use server";

import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function processCheckout(formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Silakan login ulang." };

    // 1. Ambil Data dari Form (Sesuai name atribut di HTML)
    const recipientName = formData.get("recipient_name") as string;
    const phoneNumber = formData.get("phone_number") as string;
    const deliveryOption = formData.get("delivery_option") as string;
    const shippingAddress = formData.get("shipping_address") as string || null;
    const customerNotes = formData.get("customer_notes") as string || null;
    const paymentMethod = formData.get("payment_method") as string;

    // 2. Ambil Keranjang
    const cartItems = await prisma.cart.findMany({
      where: { userId: user.id },
      include: { product: true }
    });

    if (cartItems.length === 0) return { success: false, error: "Keranjang kosong!" };

    // 3. Kalkulasi Total
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingCost = deliveryOption === 'diantar' ? 15000 : 0;
    const totalPrice = subtotal + shippingCost; 

    // 4. TRANSACTION: Buat Order -> Pindah Item -> Hapus Keranjang
    const newOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId: user.id,
          recipientName,
          phoneNumber,
          deliveryOption,
          shippingAddress: deliveryOption === 'diantar' ? shippingAddress : null,
          shippingCost,
          totalPrice,
          paymentMethod,
          customerNotes,
          status: "menunggu pembayaran",
          items: {
            create: cartItems.map(item => ({
              productId: item.productId,
              productName: item.product.name, // Simpan histori nama
              variantName: item.variantName,
              price: item.price,
              quantity: item.quantity
            }))
          }
        }
      });

      await tx.cart.deleteMany({ where: { userId: user.id } });
      return order;
    });

    revalidatePath("/keranjang");
    return { success: true, orderId: newOrder.id };
  } catch (error: any) {
    console.error("❌ Checkout Gagal:", error.message);
    return { success: false, error: "Gagal membuat pesanan." };
  }
}