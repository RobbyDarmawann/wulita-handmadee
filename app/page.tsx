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

  const [categories, products] = await Promise.all([
    prisma.category.findMany({
      // SEKARANG KITA AMBIL JUGA FIELD IMAGE-NYA
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
      orderBy: { createdAt: 'desc' },
      take: 8 
    })
  ]);

  return (
    <HomeClient 
      initialCategories={categories} 
      initialProducts={products} 
      currentSearch={cari}
      currentCategory={kategori}
    />
  );
}