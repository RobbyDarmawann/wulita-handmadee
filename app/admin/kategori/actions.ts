"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

async function saveImage(image: FormDataEntryValue | null) {
  if (!(image instanceof File) || image.size === 0) return null;

  // Validasi ukuran file maksimal 10MB
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  if (image.size > MAX_FILE_SIZE) {
    throw new Error(`File terlalu besar. Maksimal 10MB, file Anda ${(image.size / 1024 / 1024).toFixed(2)}MB`);
  }

  try {
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Buat nama file unik
    const fileName = `${Date.now()}-${image.name.replace(/\s+/g, '-')}`;
    const uploadDir = join(process.cwd(), "public/uploads/categories");
    const fullPath = join(uploadDir, fileName);

    // Pastikan folder ada
    await mkdir(uploadDir, { recursive: true });
    
    // Tulis file
    await writeFile(fullPath, buffer);
    
    // Return path yang diawali dengan slash agar valid sebagai URL internal Next.js
    return `/uploads/categories/${fileName}`;
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