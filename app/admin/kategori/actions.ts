"use server";

import prisma from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

async function saveImage(image: FormDataEntryValue | null) {
  const isFileLike =
    !!image &&
    typeof image === "object" &&
    typeof (image as File).arrayBuffer === "function" &&
    typeof (image as File).name === "string" &&
    typeof (image as File).size === "number";

  if (!isFileLike || (image as File).size === 0) return null;

  const imageFile = image as File;

  // Validasi ukuran file maksimal 10MB
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  if (imageFile.size > MAX_FILE_SIZE) {
    throw new Error(`File terlalu besar. Maksimal 10MB, file Anda ${(imageFile.size / 1024 / 1024).toFixed(2)}MB`);
  }

  try {
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileExt = imageFile.name.split(".").pop() || "png";
    const fileName = `categories-${Date.now()}.${fileExt}`;

    const { error } = await supabaseAdmin.storage
      .from("categories")
      .upload(fileName, buffer, {
        contentType: imageFile.type,
        upsert: false,
      });

    if (error) throw error;

    const { data } = supabaseAdmin.storage.from("categories").getPublicUrl(fileName);
    return data.publicUrl;
  } catch (error) {
    console.error("Gagal menyimpan gambar:", error);
    return null;
  }
}

export async function addCategory(formData: FormData) {
  const name = formData.get("name") as string;
  const imageFile = formData.get("image");
  const slug = name.toLowerCase().replace(/\s+/g, '-');

  const imageUrl = await saveImage(imageFile);

  await prisma.category.create({
    data: { 
      name, 
      slug, 
      image: imageUrl 
    }
  });

  revalidatePath("/admin/kategori");
  revalidatePath("/kategori");
  revalidatePath("/admin/produk/tambah");
}

export async function updateCategory(id: number, formData: FormData) {
  const name = formData.get("name") as string;
  const imageFile = formData.get("image");
  const slug = name.toLowerCase().replace(/\s+/g, '-');

  const data: any = { name, slug };

  const newImageUrl = await saveImage(imageFile);
  if (newImageUrl) {
    data.image = newImageUrl;
  }

  await prisma.category.update({
    where: { id },
    data
  });

  revalidatePath("/admin/kategori");
  revalidatePath("/kategori");
  revalidatePath("/admin/produk/tambah");
}

export async function deleteCategory(id: number) {
  try {
    await prisma.category.delete({ where: { id } });
    revalidatePath("/admin/kategori");
  } catch (error) {
    console.error("Gagal menghapus kategori:", error);
  }
}