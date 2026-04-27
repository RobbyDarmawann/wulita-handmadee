import prisma from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { Plus, Search, Package, Edit3, Tag, Filter } from "lucide-react";
import DeleteProductButton from "./DeleteProductButton";

export const revalidate = 0;

export default async function AdminProduk({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string; stock_status?: string }>;
}) {
  const { search, category, stock_status } = await searchParams;

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
    <div className="max-w-7xl mx-auto space-y-8 py-4">
      {/* Header & Button Tambah */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Katalog Produk</h1>
          <p className="text-gray-500 font-medium">Total {products.length} Maha Karya Wulita</p>
        </div>
        <Link href="/admin/produk/tambah" className="bg-amber-900 hover:bg-black text-white px-8 py-4 rounded-3xl font-black text-sm flex items-center gap-3 shadow-xl shadow-amber-900/20 transition-all active:scale-95">
          <Plus size={20} /> Tambah Produk Baru
        </Link>
      </div>

      {/* FILTER BOX */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100">
        <form className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Cari Nama</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input name="search" defaultValue={search} placeholder="Nama produk..." className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-amber-500" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Kategori</label>
            <select name="category" defaultValue={category} className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-amber-500">
              <option value="">Semua</option>
              {categories.map(c => <option key={c.id} value={c.id.toString()}>{c.name}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Stok</label>
            <select name="stock_status" defaultValue={stock_status} className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-amber-500">
              <option value="">Semua Status</option>
              <option value="tersedia">Tersedia</option>
              <option value="habis">Habis</option>
            </select>
          </div>

          <button type="submit" className="bg-amber-100 text-amber-900 py-3 rounded-2xl font-black text-sm hover:bg-amber-200 transition-all flex items-center justify-center gap-2">
            <Filter size={18} /> Terapkan Filter
          </button>
        </form>
      </div>

      {/* TABEL PRODUK */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50/50 border-b border-gray-100">
            <tr>
              <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400">Produk</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400">Kategori</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400">Harga & Stok</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {products.map((p) => {
              // LOGIKA PENGAMAN URL GAMBAR
              const validImageUrl = p.image && typeof p.image === 'string' && p.image.trim() !== "" 
                ? (p.image.startsWith('/') ? p.image : `/${p.image}`) 
                : null;

              return (
                <tr key={p.id} className="group hover:bg-amber-50/20 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 rounded-2xl bg-gray-100 relative overflow-hidden flex-shrink-0 border border-gray-200 shadow-inner flex items-center justify-center">
                        {validImageUrl ? (
                          <Image 
                            src={validImageUrl} 
                            alt={p.name} 
                            fill 
                            unoptimized 
                            className="object-cover transition-transform group-hover:scale-110 duration-500" 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <Package size={24} />
                          </div>
                        )}
                        {p.discount_price > 0 && (
                          <span className="absolute top-0 right-0 bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-bl-lg z-10">
                            PROMO
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-black text-gray-900 text-base leading-tight">{p.name}</p>
                        <p className="text-xs text-gray-400 font-medium line-clamp-1 mt-1">{p.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-[10px] font-black uppercase border border-amber-100">
                      <Tag size={12} /> {p.category?.name || "Uncategorized"}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="space-y-0.5">
                      {p.discount_price > 0 ? (
                        <>
                          <p className="text-[10px] text-gray-400 line-through decoration-red-500 font-bold">Rp {formatRp(p.price)}</p>
                          <p className="font-black text-red-600">Rp {formatRp(p.discount_price)}</p>
                        </>
                      ) : (
                        <p className="font-black text-amber-950 text-base">Rp {formatRp(p.price)}</p>
                      )}
                      <p className={`text-[11px] font-bold mt-1 ${p.stock <= 0 ? 'text-red-500' : 'text-gray-500'}`}>
                        Stok: <span className="font-black">{p.stock}</span>
                      </p>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link 
                        href={`/admin/produk/edit/${p.id}`} 
                        className="p-3 bg-sky-50 text-sky-600 rounded-xl hover:bg-sky-600 hover:text-white transition-all shadow-sm"
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
        {products.length === 0 && (
          <div className="py-20 text-center">
            <Package size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-400 font-bold italic">Tidak ada produk yang sesuai kriteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}