"use server";

import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function processCheckout(formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Silakan login ulang." };

    const recipientName = formData.get("recipient_name") as string;
    const phoneNumber = formData.get("phone_number") as string;
    const deliveryOption = formData.get("delivery_option") as string;
    const shippingAddress = formData.get("shipping_address") as string || null;
    const customerNotes = formData.get("customer_notes") as string || null;
    const paymentMethod = formData.get("payment_method") as string;
    const isUsingPoints = formData.get("use_points") === "true";

    const [cartItems, dbUser] = await Promise.all([
      prisma.cart.findMany({ where: { userId: user.id }, include: { product: true } }),
      prisma.user.findUnique({ where: { id: user.id }, select: { points: true } })
    ]);

    if (cartItems.length === 0) return { success: false, error: "Keranjang kosong!" };
    if (!dbUser) return { success: false, error: "Data pengguna tidak ditemukan." };

    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingCost = deliveryOption === 'diantar' ? 15000 : 0;
    const initialTotalPrice = subtotal + shippingCost; 

    let finalTotalPrice = initialTotalPrice;
    let pointsToDeduct = 0;

    if (isUsingPoints && dbUser.points > 0) {
      const maxAllowedPoints = Math.floor(initialTotalPrice * 0.5 / 10);
      pointsToDeduct = Math.min(dbUser.points, maxAllowedPoints);
      finalTotalPrice = initialTotalPrice - (pointsToDeduct * 10);
    }

    const newOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId: user.id,
          recipientName,
          phoneNumber,
          deliveryOption,
          shippingAddress: deliveryOption === 'diantar' ? shippingAddress : null,
          shippingCost,
          totalPrice: finalTotalPrice, 
          paymentMethod,
          customerNotes,
          status: "menunggu pembayaran",
          pointsUsed: pointsToDeduct, 
          items: {
            create: cartItems.map(item => ({
              productId: item.productId,
              productName: item.product.name,
              variantId: item.variantId, 
              variantName: item.variantName,
              price: item.price,
              quantity: item.quantity
            }))
          }
        }
      });

      for (const item of cartItems) {
        let activeVariantId = item.variantId;
        
        if (!activeVariantId && item.variantName) {
          const foundVariant = await tx.productVariant.findFirst({
            where: { productId: item.productId, name: item.variantName }
          });
          if (foundVariant) activeVariantId = foundVariant.id;
        }

        if (activeVariantId) {
          await tx.productVariant.update({
            where: { id: activeVariantId },
            data: { stock: { decrement: item.quantity } }
          });
        } else {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } }
          });
        }
      }

      await tx.cart.deleteMany({ where: { userId: user.id } });

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