import prisma from "@/lib/prisma";
import { updateCategory } from "../../actions";
import Link from "next/link";
import { ChevronLeft, Save } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import ImagePreview from "../../../ImagePreview"; // Import komponen preview

export default async function EditKategori({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const category = await prisma.category.findUnique({
    where: { id: parseInt(id) }
  });

  if (!category) notFound();

  // Membungkus action dengan ID kategori
  const updateWithId = updateCategory.bind(null, category.id);

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <Link href="/admin/kategori" className="flex items-center gap-2 text-sm font-black text-gray-400 hover:text-amber-700 transition-colors mb-8 uppercase tracking-widest">
        <ChevronLeft size={18} /> Kembali ke Gudang
      </Link>

      <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl shadow-gray-200/50 relative overflow-hidden">
        {/* Dekorasi sudut ala Wulita */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-50 rounded-full" />

        <div className="relative z-10">
          <h2 className="text-3xl font-black text-amber-950 mb-2">Edit Kategori</h2>
          <p className="text-gray-400 text-sm font-medium mb-10 italic">Sesuaikan nama atau visual dari pusaka {category.name}.</p>

          <form action={async (formData) => {
            "use server";
            await updateWithId(formData);
            redirect("/admin/kategori");
          }} encType="multipart/form-data" className="space-y-8">
            
            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 ml-1 tracking-widest">Nama Kategori</label>
              <input 
                name="name" 
                type="text" 
                defaultValue={category.name}
                required
                className="w-full mt-2 px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-amber-500 text-sm font-bold text-gray-800 transition-all shadow-inner" 
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 ml-1 tracking-widest">Visual Kategori</label>
              {/* Image Preview dengan nilai default gambar lama */}
              <ImagePreview name="image" defaultValue={category.image} />
              <p className="text-[9px] font-bold text-gray-300 mt-3 uppercase text-center tracking-wider">
                * Biarkan kosong jika tidak ingin mengganti gambar lama
              </p>
            </div>

            <div className="pt-4">
              <button className="w-full bg-amber-950 hover:bg-black text-white py-5 rounded-2xl font-black text-sm transition-all shadow-2xl shadow-amber-950/40 flex items-center justify-center gap-3 active:scale-[0.98]">
                <Save size={20} /> Simpan Perubahan
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}