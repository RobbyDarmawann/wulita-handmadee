import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import EditProdukForm from "./EditProdukForm";

export default async function EditProdukPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: { variants: true } // Pastikan relasinya benar
    }),
    prisma.category.findMany({ orderBy: { name: 'asc' } })
  ]);

  if (!product) notFound();

  return (
    <div className="max-w-7xl mx-auto py-6 px-4">
      <Link 
        href="/admin/produk" 
        className="flex items-center gap-2 text-sm font-black text-gray-400 hover:text-amber-700 transition-colors mb-8 uppercase tracking-widest"
      >
        <ChevronLeft size={18} /> Kembali ke Gudang
      </Link>

      <EditProdukForm product={product} categories={categories} />
    </div>
  );
}