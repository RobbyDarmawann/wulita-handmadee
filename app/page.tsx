import prisma from "@/lib/prisma";
import HomeClient from "./HomeClient";

export const metadata = {
  title: "Wulita Handmade | Kemewahan Kerajinan Gorontalo",
  description: "Koleksi perhiasan handmade eksklusif yang dirajut dengan cinta.",
};

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ cari?: string; kategori?: string }>;
}) {
  const { cari, kategori } = await searchParams;

  const [categories, productsRaw] = await Promise.all([
    prisma.category.findMany({
      select: { id: true, name: true, slug: true, image: true }, 
      orderBy: { name: 'asc' }
    }),
    prisma.product.findMany({
      include: {
        category: true,
      },
      where: {
        AND: [
          cari ? { name: { contains: cari, mode: 'insensitive' } } : {},
          kategori ? { category: { slug: kategori } } : {},
        ]
      },
      orderBy: { createdAt: 'desc' }, // Ambil yang terbaru dulu
      take: 20 // Ambil stok lebih banyak untuk di-sort
    })
  ]);

  // LOGIKA SORTING: Produk Promo Paling Atas
  const sortedProducts = [...productsRaw].sort((a, b) => {
    const aPromo = a.discount_price && a.discount_price > 0 ? 1 : 0;
    const bPromo = b.discount_price && b.discount_price > 0 ? 1 : 0;
    
    // Jika B promo dan A tidak, B naik ke atas
    return bPromo - aPromo;
  }).slice(0, 8); // Tetap tampilkan 8 produk saja di landing page

  return (
    <HomeClient 
      initialCategories={categories} 
      initialProducts={sortedProducts} 
      currentSearch={cari}
      currentCategory={kategori}
    />
  );
}