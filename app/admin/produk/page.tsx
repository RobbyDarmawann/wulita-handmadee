import prisma from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { Plus, Search, Package, Edit3, Tag, Filter, ChevronDown, PackageOpen } from "lucide-react";
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

  // --- STYLING KHUSUS UNTUK TAMPILAN MEWAH ---
  const inputStyle = "w-full px-5 py-3.5 bg-amber-50/30 border-2 border-amber-100/80 rounded-[1.25rem] text-sm font-bold text-amber-950 outline-none focus:border-amber-400 focus:ring-[4px] focus:ring-amber-500/10 transition-all shadow-inner placeholder:text-amber-900/40 appearance-none";
  const labelStyle = "text-[10px] font-black text-amber-900/50 uppercase tracking-[0.2em] ml-2 mb-2 block";

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

      {/* FILTER BOX MEWAH (TANPA STATE REACT) */}
      <div className="bg-gradient-to-br from-amber-50/80 to-[#F3E5DC]/50 p-8 rounded-[2.5rem] shadow-xl shadow-amber-900/5 border-2 border-white relative z-20">
        <form className="grid grid-cols-1 md:grid-cols-12 gap-5 items-end">
          
          <div className="md:col-span-4 space-y-1.5">
            <label className={labelStyle}>Pencarian Karya</label>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-900/40 group-focus-within:text-amber-600 transition-colors" size={18} />
              <input name="search" defaultValue={search} placeholder="Ketik nama pusaka..." className={`${inputStyle} pl-12`} />
            </div>
          </div>

          <div className="md:col-span-3 space-y-1.5">
            <label className={labelStyle}>Kategori</label>
            <div className="relative group">
              {/* appearance-none untuk mematikan panah kaku bawaan browser */}
              <select name="category" defaultValue={category} className={`${inputStyle} cursor-pointer pr-10 relative z-10 bg-transparent`}>
                <option value="" className="text-gray-900 font-bold py-2">Semua Kategori</option>
                {categories.map(c => <option key={c.id} value={c.id.toString()} className="text-gray-900 font-medium py-2">{c.name}</option>)}
              </select>
              {/* Ikon panah elegan untuk menutupi panah kaku */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-900/40 group-focus-within:text-amber-600 group-hover:text-amber-600 transition-colors pointer-events-none z-0">
                 <ChevronDown size={18} />
              </div>
              {/* Latar belakang input semu */}
              <div className="absolute inset-0 bg-white/50 rounded-[1.25rem] pointer-events-none -z-10"></div>
            </div>
          </div>

          <div className="md:col-span-3 space-y-1.5">
            <label className={labelStyle}>Status Palka</label>
            <div className="relative group">
              <select name="stock_status" defaultValue={stock_status} className={`${inputStyle} cursor-pointer pr-10 relative z-10 bg-transparent`}>
                <option value="" className="text-gray-900 font-bold">Semua Status</option>
                <option value="tersedia" className="text-green-700 font-bold">Tersedia</option>
                <option value="habis" className="text-red-600 font-bold">Palka Kosong (Habis)</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-900/40 group-focus-within:text-amber-600 group-hover:text-amber-600 transition-colors pointer-events-none z-0">
                 <ChevronDown size={18} />
              </div>
              <div className="absolute inset-0 bg-white/50 rounded-[1.25rem] pointer-events-none -z-10"></div>
            </div>
          </div>

          <div className="md:col-span-2">
            <button type="submit" className="w-full bg-amber-100/80 text-amber-900 border-2 border-amber-200 py-3.5 rounded-[1.25rem] font-black text-xs uppercase tracking-widest hover:bg-amber-900 hover:text-white hover:border-amber-900 transition-all flex items-center justify-center gap-2 shadow-sm">
              <Filter size={16} /> Saring
            </button>
          </div>
        </form>
      </div>

      {/* TABEL PRODUK ELEGAN */}
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
                const validImageUrl = p.image && typeof p.image === 'string' && p.image.trim() !== "" 
                  ? (p.image.startsWith('/') ? p.image : `/${p.image}`) 
                  : null;

                return (
                  <tr key={p.id} className="group hover:bg-amber-50/20 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-5">
                        <div className="w-20 h-20 rounded-[1.25rem] bg-amber-50/50 relative overflow-hidden flex-shrink-0 border-2 border-amber-100 shadow-inner group-hover:border-amber-300 transition-colors flex items-center justify-center">
                          {validImageUrl ? (
                            <Image 
                              src={validImageUrl} 
                              alt={p.name} 
                              fill 
                              unoptimized 
                              className="object-cover transition-transform group-hover:scale-110 duration-700" 
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-amber-900/20 group-hover:text-amber-500 transition-colors">
                              <PackageOpen size={28} />
                            </div>
                          )}
                          {p.discount_price > 0 && (
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
                        {p.discount_price > 0 ? (
                          <>
                            <p className="text-[10px] text-amber-900/30 line-through decoration-red-500 font-bold">Rp {formatRp(p.price)}</p>
                            <p className="font-black text-red-600 text-base drop-shadow-sm">Rp {formatRp(p.discount_price)}</p>
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
                        {/* Tombol Hapus memanggil Client Component */}
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