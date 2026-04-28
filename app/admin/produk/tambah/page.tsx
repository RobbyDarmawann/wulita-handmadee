import prisma from "@/lib/prisma";
import TambahProdukForm from "./TambahProdukForm";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const revalidate = 0;

export default async function TambahProdukPage() {
  // Ambil kategori untuk pilihan dropdown
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' }
  });

  return (
    <div className="max-w-7xl mx-auto py-6 px-4">
      <Link 
        href="/admin/produk" 
        className="flex items-center gap-2 text-sm font-black text-gray-400 hover:text-amber-700 transition-colors mb-8 uppercase tracking-widest"
      >
        <ChevronLeft size={18} /> Kembali ke Gudang
      </Link>

      <TambahProdukForm categories={categories} />
    </div>
  );
}