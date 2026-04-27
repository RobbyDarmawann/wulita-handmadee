"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function uploadPaymentReceipt(formData: FormData) {
  try {
    const supabase = await createClient();
    
    // 1. Ekstrak data dari FormData
    const orderId = parseInt(formData.get("orderId") as string);
    const file = formData.get("receipt") as File;

    if (!file || file.size === 0) {
      return { success: false, error: "File bukti pembayaran kosong atau tidak terbaca." };
    }

    // KUNCI PERBAIKAN 1: Konversi File browser ke ArrayBuffer lalu ke Buffer Node.js
    // Supabase di sisi server Next.js jauh lebih stabil menerima Buffer dibanding objek File mentah
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 2. Buat nama file unik agar tidak bentrok
    const fileExt = file.name.split('.').pop();
    const fileName = `order-${orderId}-${Date.now()}.${fileExt}`;

    // 3. Upload Buffer ke Supabase Storage (Bucket: 'receipts')
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('receipts')
      .upload(fileName, buffer, {
        contentType: file.type, // KUNCI PERBAIKAN 2: Beritahu Supabase ini file gambar
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error("Supabase Upload Error:", uploadError);
      // KUNCI PERBAIKAN 3: Kirim pesan error asli dari Supabase agar mudah dilacak
      return { success: false, error: `Gagal dari Supabase: ${uploadError.message}` };
    }

    // 4. Ambil URL Publik dari gambar yang baru diupload
    const { data: publicUrlData } = supabase.storage
      .from('receipts')
      .getPublicUrl(fileName);

    const receiptUrl = publicUrlData.publicUrl;

    // 5. Update Database Order
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentReceipt: receiptUrl,
        status: "dibayar" // Status berubah otomatis!
      }
    });

    // 6. Refresh halaman
    revalidatePath(`/pembayaran/${orderId}`);
    return { success: true };

  } catch (error: any) {
    console.error("❌ System Error:", error.message);
    return { success: false, error: "Terjadi kesalahan sistem saat memproses pembayaran." };
  }
}