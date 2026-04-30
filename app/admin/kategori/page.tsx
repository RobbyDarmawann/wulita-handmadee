import prisma from "@/lib/prisma";
import { addCategory } from "./actions"; 
import { Plus, Edit3, Link as LinkIcon, Tags } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import DeleteButton from "./DeleteButton"; 
import ImagePreview from "../ImagePreview"; // Komponen preview yang kita buat
import { resolveImageUrl } from "@/lib/image";

// Cache halaman admin kategori selama 60 detik untuk Vercel
// Mengurangi beban koneksi database yang terbatas
export const revalidate = process.env.NODE_ENV === 'production' ? 60 : 0;

export default async function AdminKategori() {
  // 1. Ambil data kategori beserta hitungan produk di dalamnya
  const categories = await prisma.category.findMany({
    include: { 
      _count: { 
        select: { products: true } 
      } 
    },
    orderBy: { name: 'asc' }
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-4">
      
      {/* HEADER HALAMAN */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Manajemen Kategori</h1>
          <p className="text-gray-500 font-medium mt-1 text-sm">Organisir koleksi Wulita agar pelanggan mudah menemukan yang mereka cari.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* --- PANEL KIRI: FORM TAMBAH BARU (Server Side Form) --- */}
        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm sticky top-28">
            <h3 className="text-xl font-black text-amber-950 mb-6 flex items-center gap-2">
              <Plus className="text-amber-600" /> Tambah Baru
            </h3>
            
            <form action={addCategory} className="space-y-6">
              {/* Nama Kategori */}
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 ml-1 tracking-widest">Nama Kategori</label>
                <input 
                  name="name"
                  type="text" 
                  required
                  placeholder="Contoh: Gelang Karawo"
                  className="w-full mt-2 px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-amber-500 text-sm font-bold placeholder:text-gray-300 transition-all shadow-inner"
                />
              </div>

              {/* Upload Gambar dengan Preview (Client Component) */}
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 ml-1 tracking-widest">Visual Kategori</label>
                <ImagePreview name="image" />
              </div>

              <button className="w-full bg-amber-900 hover:bg-amber-950 text-white py-4 rounded-2xl font-black text-sm transition-all shadow-xl shadow-amber-900/20 active:scale-95 flex items-center justify-center gap-2">
                Simpan Kategori
              </button>
            </form>
          </div>
        </div>

        {/* --- PANEL KANAN: TABEL DAFTAR KATEGORI --- */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 border-b border-gray-100">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">Informasi Kategori</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {categories.length > 0 ? (
                  categories.map((cat) => (
                    <tr key={cat.id} className="group hover:bg-amber-50/30 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-5">
                          {/* Gambar Kategori dengan Validasi URL aman */}
                          <div className="w-16 h-16 rounded-2xl bg-gray-100 border border-gray-200 flex-shrink-0 overflow-hidden relative shadow-inner flex items-center justify-center">
                            {resolveImageUrl(cat.image, "categories") ? (
                              <Image 
                                src={resolveImageUrl(cat.image, "categories")!} 
                                alt={cat.name} 
                                fill 
                                unoptimized
                                className="object-cover transition-transform group-hover:scale-110 duration-500" 
                              />
                            ) : (
                              <Tags size={24} className="text-gray-300" />
                            )}
                          </div>
                          
                          <div>
                            <p className="font-black text-gray-900 text-lg leading-tight group-hover:text-amber-900 transition-colors">
                              {cat.name}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-gray-400 font-bold mt-1.5 uppercase tracking-tighter">
                              <LinkIcon size={12} className="text-amber-500/50" />
                              <span>/kategori/{cat.slug}</span>
                              <span className="mx-2 text-gray-200">|</span>
                              <span className="text-sky-600">{cat._count.products} Produk</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-end gap-3">
                          {/* Tombol Edit */}
                          <Link 
                            href={`/admin/kategori/edit/${cat.id}`}
                            className="p-3 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-600 hover:text-white transition-all shadow-sm"
                            title="Ubah Kategori"
                          >
                            <Edit3 size={18} />
                          </Link>

                          {/* Tombol Hapus (Client Component) */}
                          <DeleteButton id={cat.id} />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2} className="px-8 py-24 text-center">
                      <div className="max-w-xs mx-auto opacity-20">
                        <Tags size={64} className="mx-auto mb-4" />
                        <p className="text-xl font-black uppercase tracking-widest text-gray-900">Belum Ada Kategori</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}