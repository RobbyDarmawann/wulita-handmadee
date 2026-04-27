"use server";

import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function submitReview(formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Silakan login." };

    const orderId = parseInt(formData.get("orderId") as string);
    const productId = parseInt(formData.get("productId") as string);
    const rating = parseInt(formData.get("rating") as string);
    const comment = formData.get("comment") as string;
    const file = formData.get("image") as File;

    let imageUrl = null;

    // 1. Upload Gambar ke Bucket 'reviews' jika ada
    if (file && file.size > 0) {
      const fileExt = file.name.split('.').pop();
      const fileName = `review-${user.id}-${Date.now()}.${fileExt}`;
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const { data, error } = await supabase.storage
        .from('reviews')
        .upload(fileName, buffer, { contentType: file.type });

      if (error) throw new Error("Gagal upload gambar");
      
      const { data: publicUrl } = supabase.storage.from('reviews').getPublicUrl(fileName);
      imageUrl = publicUrl.publicUrl;
    }

    // 2. Simpan ke Database
    await prisma.review.create({
      data: {
        userId: user.id,
        productId,
        orderId,
        rating,
        comment,
        image: imageUrl
      }
    });

    revalidatePath(`/pesanan`);
    revalidatePath(`/produk/${productId}`);
    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: "Gagal mengirim ulasan." };
  }
}