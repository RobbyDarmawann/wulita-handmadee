"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js"; // Gunakan client standar untuk upload file

// --- INISIALISASI SUPABASE CLIENT KHUSUS STORAGE ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- HELPER SAKTI: SIMPAN GAMBAR KE SUPABASE STORAGE ---
async function uploadImage(file: FormDataEntryValue | null, subFolder: string) {
  if (!(file instanceof File) || file.size === 0) return null;
  
  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Bikin nama file unik agar tidak bentrok
    const fileName = `${subFolder}/${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    
    // 1. Upload ke bucket bernama 'images' di Supabase
    const { data, error } = await supabase
      .storage
      .from('images') // Pastikan Kapten sudah membuat bucket 'images' di Supabase!
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (error) {
      console.error("Supabase Upload Error:", error.message);
      return null;
    }

    // 2. Dapatkan URL Publik dari gambar yang baru diupload
    const { data: publicUrlData } = supabase
      .storage
      .from('images')
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl; // Kembalikan URL panjangnya ke database Prisma
    
  } catch (error) {
    console.error("Gagal upload gambar:", error);
    return null;
  }
}

// --- 1. ACTION: TAMBAH PRODUK BARU ---
export async function addProduct(formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const price = parseInt(formData.get("price") as string) || 0;
  const discount_price = parseInt(formData.get("discount_price") as string) || 0;
  const categoryId = parseInt(formData.get("category_id") as string);
  const mainImage = formData.get("image");
  const slug = name.toLowerCase().replace(/\s+/g, '-');

  const mainImageUrl = await uploadImage(mainImage, "products");

  const variantMap = new Map();
  Array.from(formData.entries()).forEach(([key, value]) => {
    const match = key.match(/variants\[(.+?)\]\[(\w+)\]/);
    if (match) {
      const [_, index, field] = match;
      if (!variantMap.has(index)) variantMap.set(index, {});
      variantMap.get(index)[field] = value;
    }
  });

  try {
    await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          name, slug, description, price, discount_price, categoryId,
          image: mainImageUrl || "",
          stock: 0, 
        }
      });

      let calculatedTotalStock = 0;

      for (const [_, v] of variantMap) {
        const vStock = parseInt(v.stock) || 0;
        calculatedTotalStock += vStock;
        const vImageFile = v.image;
        const vImageUrl = await uploadImage(vImageFile, "variants");

        await tx.productVariant.create({
          data: {
            name: v.name,
            price: parseInt(v.price) || product.price,
            stock: vStock,
            image: vImageUrl || "",
            productId: product.id
          }
        });
      }

      await tx.product.update({
        where: { id: product.id },
        data: { stock: calculatedTotalStock }
      });
    });

    revalidatePath("/admin/produk");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error Add Product:", error);
    throw new Error("Gagal menambah produk baru.");
  }
}

// --- 2. ACTION: UPDATE PRODUK ---
export async function updateProduct(id: number, formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const price = parseInt(formData.get("price") as string) || 0;
  const discount_price = parseInt(formData.get("discount_price") as string) || 0;
  const categoryId = parseInt(formData.get("category_id") as string);
  const mainImage = formData.get("image");
  const slug = name.toLowerCase().replace(/\s+/g, '-');

  const variantMap = new Map();
  Array.from(formData.entries()).forEach(([key, value]) => {
    const match = key.match(/variants\[(.+?)\]\[(\w+)\]/);
    if (match) {
      const [_, index, field] = match;
      if (!variantMap.has(index)) variantMap.set(index, {});
      variantMap.get(index)[field] = value;
    }
  });

  try {
    await prisma.$transaction(async (tx) => {
      const updateData: any = { name, slug, description, price, discount_price, categoryId };
      
      // Jika Admin mengunggah gambar baru, upload ke Supabase
      const mainImageUrl = await uploadImage(mainImage, "products");
      if (mainImageUrl) updateData.image = mainImageUrl;

      const product = await tx.product.update({
        where: { id },
        data: updateData
      });

      let calculatedTotalStock = 0;

      for (const [_, v] of variantMap) {
        const isDeleted = v.delete === "1"; 
        const variantId = v.id ? parseInt(v.id) : null;

        if (isDeleted) {
          if (variantId) {
            await tx.productVariant.delete({ where: { id: variantId } });
          }
          continue;
        }

        const vStock = parseInt(v.stock) || 0;
        calculatedTotalStock += vStock;
        
        // Cek jika ada gambar varian baru
        const vImageFile = v.image;
        const vImageUrl = await uploadImage(vImageFile, "variants");

        if (variantId) {
          const vUpdateData: any = {
            name: v.name,
            price: parseInt(v.price) || product.price,
            stock: vStock,
          };
          if (vImageUrl) vUpdateData.image = vImageUrl;
          
          await tx.productVariant.update({
            where: { id: variantId },
            data: vUpdateData
          });
        } else {
          await tx.productVariant.create({
            data: {
              name: v.name,
              price: parseInt(v.price) || product.price,
              stock: vStock,
              image: vImageUrl || "",
              productId: product.id
            }
          });
        }
      }

      await tx.product.update({
        where: { id: product.id },
        data: { stock: calculatedTotalStock }
      });
    });

    revalidatePath("/admin/produk");
    revalidatePath(`/produk/${slug}`);
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error Update Product:", error);
    throw new Error("Gagal memperbarui produk.");
  }
}

// --- 3. ACTION: HAPUS PRODUK ---
export async function deleteProduct(id: number) {
  // Catatan: Idealnya Kapten juga menghapus gambar fisik di Supabase di sini, 
  // tapi untuk saat ini menghapus data di Prisma sudah cukup.
  await prisma.product.delete({ where: { id } });
  revalidatePath("/admin/produk");
  revalidatePath("/");
}