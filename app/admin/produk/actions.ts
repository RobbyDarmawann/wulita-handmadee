"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

async function uploadImage(file: FormDataEntryValue | null, subFolder: string) {
  if (!file) return null;

  try {
    const f: any = file;
    const bytes = await f.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileName = `${Date.now()}-${f.name.replace(/\s+/g, '-')}`;
    const uploadDir = join(process.cwd(), "public/uploads", subFolder);

    await mkdir(uploadDir, { recursive: true });

    const fullPath = join(uploadDir, fileName);
    await writeFile(fullPath, buffer);

    return `/uploads/${subFolder}/${fileName}`;
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

// --- 2. ACTION: UPDATE PRODUK (DENGAN LOGIKA VARIAN DINAMIS) ---
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
  await prisma.product.delete({ where: { id } });
  revalidatePath("/admin/produk");
  revalidatePath("/");
}