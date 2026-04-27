"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/**
 * 1. TAMBAH KE KERANJANG
 * Dilengkapi dengan sinkronisasi User ID untuk menghindari Foreign Key Error
 */
export async function addToCart(formData: FormData) {
  try {
    // 1. Ambil User dari Supabase Auth
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.error("❌ Action AddToCart: User tidak login");
      return { success: false, error: "Silakan login terlebih dahulu" };
    }

    // 2. KUNCI PERBAIKAN: Pastikan User ID ada di tabel public.User (Upsert)
    // Saya tambahkan password: "" agar tidak error "Argument password is missing"
    await prisma.user.upsert({
      where: { id: user.id },
      update: { email: user.email || "" },
      create: { 
        id: user.id, 
        email: user.email || "",
        name: user.user_metadata?.full_name || "Penjelajah Wulita",
        password: "", // <-- FIX UNTUK ERROR MISSING PASSWORD
      },
    });

    const userId = user.id;
    const productId = parseInt(formData.get("productId") as string);
    const price = parseInt(formData.get("price") as string);
    const quantity = parseInt(formData.get("quantity") as string) || 1;
    
    // Ambil variantId jika dikirim, jika tidak null
    const variantIdRaw = formData.get("variantId");
    const variantId = variantIdRaw ? parseInt(variantIdRaw as string) : null;

    let variantName = formData.get("variantName") as string || null;
    if (variantName === "" || variantName === "null") variantName = null;

    console.log(`🛒 Memproses Palka: User ${userId}, Produk ${productId}, Varian ${variantName}`);

    // 3. Cari apakah barang yang sama (Produk & Varian) sudah ada di keranjang
    const existing = await prisma.cart.findFirst({
      where: { 
        userId, 
        productId, 
        variantName: variantName 
      }
    });

    if (existing) {
      // Jika sudah ada, tambahkan quantity-nya
      await prisma.cart.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity }
      });
      console.log("🔄 Quantity diperbarui");
    } else {
      // Jika belum ada, buat record baru
      await prisma.cart.create({
        data: { 
          userId, 
          productId, 
          variantId, // Masukkan variantId jika ada
          variantName, 
          price, 
          quantity 
        }
      });
      console.log("✅ Berhasil simpan ke database");
    }

    // 4. Bersihkan Cache agar UI langsung update
    revalidatePath("/keranjang");
    revalidatePath("/", "layout"); 
    
    return { success: true };
  } catch (error: any) {
    console.error("❌ Gagal menambah ke keranjang:", error.message);
    return { success: false, error: "Gagal terhubung ke database. Pastikan koneksi internet stabil." };
  }
}

/**
 * 2. UPDATE QUANTITY
 * Digunakan untuk tombol + dan - di halaman keranjang
 */
export async function updateCartQty(id: number, increment: number) {
  try {
    const item = await prisma.cart.findUnique({ where: { id } });
    if (!item) return { success: false };

    const newQty = item.quantity + increment;
    
    if (newQty < 1) {
      // Jika qty 0, hapus dari database
      await prisma.cart.delete({ where: { id } });
    } else {
      await prisma.cart.update({
        where: { id },
        data: { quantity: newQty }
      });
    }

    revalidatePath("/keranjang");
    return { success: true };
  } catch (error: any) {
    console.error("❌ Gagal update qty:", error.message);
    return { success: false }; 
  }
}

/**
 * 3. HAPUS ITEM
 * Digunakan untuk tombol Trash/Sampah
 */
export async function removeFromCart(id: number) {
  try {
    await prisma.cart.delete({ 
      where: { id: Number(id) } 
    });
    
    revalidatePath("/keranjang");
    return { success: true };
  } catch (error: any) {
    console.error("❌ Gagal hapus item:", error.message);
    return { success: false }; 
  }
}