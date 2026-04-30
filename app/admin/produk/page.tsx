// FILE: app/admin/produk/page.tsx
import prisma from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { Plus, Package, Edit3, Tag, PackageOpen } from "lucide-react";
import DeleteProductButton from "./DeleteProductButton";
import ProductFilter from "./ProductFilter"; // KITA PANGGIL KOMPONEN FILTER BARU DI SINI
import { resolveImageUrl } from "@/lib/image";

export const revalidate = 0;

export default async function AdminProduk({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string; stock_status?: string }>;
}) {
  const { search = "", category = "", stock_status = "" } = await searchParams;

  // Filter Query
  const where: any = {
    AND: [
      search ? { name: { contains: search, mode: 'insensitive' } } : {},
      category ? { categoryId: parseInt(category) } : {},
      stock_status === 'habis' ? { stock: 0 } : stock_status === 'tersedia' ? { stock: { gt: 0 } } : {},
    ]
  };

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.category.findMany({ orderBy: { name: 'asc' } })
  ]);

  const formatRp = (n: number) => new Intl.NumberFormat('id-ID').format(n);

  return (
    <div className="max-w-7xl mx-auto space-y-8 py-4 animate-in fade-in duration-500">
      
      {/* HEADER & BUTTON TAMBAH */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-amber-100/50 shadow-xl shadow-amber-900/5">
        <div>
          <h1 className="text-3xl font-black text-amber-950 tracking-tight">Palka Pusaka</h1>
          <p className="text-amber-900/60 font-medium mt-1 text-sm">Mengelola <strong className="text-amber-700">{products.length}</strong> Maha Karya Wulita Handmade</p>
        </div>
        <Link href="/admin/produk/tambah" className="bg-gradient-to-r from-amber-800 to-amber-950 hover:from-black hover:to-black text-white px-8 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-amber-900/20 transition-all hover:-translate-y-1 active:translate-y-0 group">
          <div className="bg-white/20 p-1 rounded-full group-hover:rotate-90 transition-transform duration-300">
            <Plus size={16} /> 
          </div>
          Tambah Karya Baru
        </Link>
      </div>

      {/* FILTER BOX MEWAH (CLIENT COMPONENT) */}
      <ProductFilter 
        categories={categories} 
        currentSearch={search} 
        currentCategory={category} 
        currentStock={stock_status} 
      />

      {/* TABEL PRODUK ELEGAN (SERVER COMPONENT) */}
      <div className="bg-white rounded-[2.5rem] border border-amber-100/50 shadow-xl shadow-amber-900/5 overflow-hidden relative z-10">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="bg-amber-50/40 border-b border-amber-100/80">
              <tr>
                <th className="px-8 py-6 text-[10px] font-black uppercase text-amber-900/40 tracking-[0.2em] whitespace-nowrap">Maha Karya</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase text-amber-900/40 tracking-[0.2em]">Kategori</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase text-amber-900/40 tracking-[0.2em]">Harga & Ketersediaan</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase text-amber-900/40 tracking-[0.2em] text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-50/60">
              {products.map((p) => {
                const validImageUrl = resolveImageUrl(p.image, "products");
                const discountPrice = p.discount_price ?? 0;

                return (
                  <tr key={p.id} className="group hover:bg-amber-50/20 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-5">
                        <div className="w-20 h-20 rounded-[1.25rem] bg-amber-50/50 relative overflow-hidden flex-shrink-0 border-2 border-amber-100 shadow-inner group-hover:border-amber-300 transition-colors flex items-center justify-center">
                          {validImageUrl ? (
                            <Image src={validImageUrl} alt={p.name} fill unoptimized className="object-cover transition-transform group-hover:scale-110 duration-700" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-amber-900/20 group-hover:text-amber-500 transition-colors">
                              <PackageOpen size={28} />
                            </div>
                          )}
                          {discountPrice > 0 && (
                            <div className="absolute top-0 right-0 bg-gradient-to-r from-red-500 to-red-600 text-white text-[8px] font-black px-2 py-1 rounded-bl-xl z-10 shadow-lg tracking-widest uppercase">
                              PROMO
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-black text-amber-950 text-base leading-tight group-hover:text-amber-700 transition-colors">{p.name}</p>
                          <p className="text-[11px] text-amber-900/50 font-bold line-clamp-1 mt-1.5 max-w-[200px] leading-relaxed">{p.description || "Tidak ada deskripsi."}</p>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-8 py-6">
                      <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50/50 text-amber-700 rounded-xl text-[10px] font-black uppercase tracking-widest border border-amber-100/80">
                        <Tag size={12} className="text-amber-500" /> {p.category?.name || "Tanpa Kategori"}
                      </span>
                    </td>
                    
                    <td className="px-8 py-6">
                      <div className="space-y-1">
                        {discountPrice > 0 ? (
                          <>
                            <p className="text-[10px] text-amber-900/30 line-through decoration-red-500 font-bold">Rp {formatRp(p.price)}</p>
                            <p className="font-black text-red-600 text-base drop-shadow-sm">Rp {formatRp(discountPrice)}</p>
                          </>
                        ) : (
                          <p className="font-black text-amber-950 text-base">Rp {formatRp(p.price)}</p>
                        )}
                        
                        <div className={`inline-flex items-center gap-1.5 mt-2 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${p.stock <= 0 ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
                          <Package size={10} /> Stok: {p.stock}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-3 opacity-20 group-hover:opacity-100 transition-opacity">
                        <Link 
                          href={`/admin/produk/edit/${p.id}`} 
                          className="p-3 bg-white text-sky-600 rounded-xl hover:bg-sky-500 hover:text-white transition-all shadow-sm border border-sky-100 hover:shadow-sky-500/20 hover:-translate-y-0.5"
                          title="Edit Pusaka"
                        >
                          <Edit3 size={18} />
                        </Link>
                        <DeleteProductButton id={p.id} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {/* EMPTY STATE */}
          {products.length === 0 && (
            <div className="py-32 text-center bg-gray-50/30">
              <PackageOpen size={64} className="mx-auto text-amber-200 mb-6" strokeWidth={1.5} />
              <h3 className="text-2xl font-black text-amber-950 mb-2 tracking-tight">Palka Kosong</h3>
              <p className="text-amber-900/50 font-medium max-w-sm mx-auto text-sm">
                Maha karya tidak ditemukan. Coba sesuaikan filter pencarian atau tambahkan pusaka baru.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}