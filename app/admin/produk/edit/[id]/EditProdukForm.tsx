"use client";

import { useState } from "react";
import { Plus, Trash2, ImageIcon, Save, RefreshCcw } from "lucide-react";
import ImagePreview from "../../../ImagePreview";
import { updateProduct } from "../../actions";
import { useRouter } from "next/navigation";

export default function EditProdukForm({ product, categories }: any) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Inisialisasi state dengan data dari database
  const [variants, setVariants] = useState(
    product.variants.map((v: any) => ({
      ...v,
      isExisting: true,
      deleteFlag: false,
      tempImagePreview: v.image 
    }))
  );

  // Kalkulasi Stok Otomatis
  const totalStock = variants
    .filter((v: any) => !v.deleteFlag)
    .reduce((acc: number, curr: any) => acc + (parseInt(curr.stock) || 0), 0);

  const toggleDeleteVariant = (index: number) => {
    const newVariants = [...variants];
    if (!newVariants[index].isExisting) {
      // Jika varian baru (belum di DB), langsung hapus dari state
      setVariants(variants.filter((_, i) => i !== index));
    } else {
      // Jika varian lama, tandai untuk dihapus di server
      newVariants[index].deleteFlag = !newVariants[index].deleteFlag;
      setVariants(newVariants);
    }
  };

  const updateVariantStock = (index: number, val: string) => {
    const newVariants = [...variants];
    newVariants[index].stock = val;
    setVariants(newVariants);
  };

  return (
    <form action={async (formData) => {
      setLoading(true);
      await updateProduct(product.id, formData);
      router.push("/admin/produk");
    }} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      <div className="lg:col-span-2 space-y-8">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
          <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3">
            <span className="w-10 h-10 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center text-sm font-black">01</span>
            Edit Informasi Dasar
          </h3>
          <div className="space-y-6">
            <input name="name" defaultValue={product.name} required className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold shadow-inner" />
            <textarea name="description" defaultValue={product.description} rows={5} className="w-full p-4 bg-gray-50 border-none rounded-2xl shadow-inner" />
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-black text-gray-900 flex items-center gap-3">
              <span className="w-10 h-10 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center text-sm font-black">02</span>
              Manajemen Varian
            </h3>
            <button 
              type="button" 
              onClick={() => setVariants([...variants, { id: Date.now(), name: "", price: "", stock: 0, isExisting: false, deleteFlag: false }])}
              className="px-4 py-2 bg-amber-50 text-amber-700 rounded-xl text-xs font-black uppercase hover:bg-amber-100 transition-all"
            >
              + Tambah Varian Baru
            </button>
          </div>

          <div className="space-y-4">
            {variants.map((v: any, index: number) => (
              <div key={v.id} className={`grid grid-cols-1 md:grid-cols-4 gap-4 p-5 rounded-3xl border transition-all ${v.deleteFlag ? 'bg-red-50/50 opacity-40 grayscale border-red-100' : 'bg-gray-50 border-gray-100'}`}>
                {/* Hidden Fields untuk Server Logic */}
                {v.isExisting && <input type="hidden" name={`variants[${index}][id]`} value={v.id} />}
                <input type="hidden" name={`variants[${index}][delete]`} value={v.deleteFlag ? "1" : "0"} />

                <input name={`variants[${index}][name]`} defaultValue={v.name} placeholder="Nama" required={!v.deleteFlag} disabled={v.deleteFlag} className="px-4 py-3 rounded-xl border-none bg-white text-xs font-bold shadow-sm" />
                <input name={`variants[${index}][price]`} defaultValue={v.price === product.price ? "" : v.price} type="number" placeholder="Harga Khusus" disabled={v.deleteFlag} className="px-4 py-3 rounded-xl border-none bg-white text-xs font-bold shadow-sm" />
                <input name={`variants[${index}][stock]`} value={v.stock} type="number" onChange={(e) => updateVariantStock(index, e.target.value)} required={!v.deleteFlag} disabled={v.deleteFlag} className="px-4 py-3 rounded-xl border-none bg-white text-xs font-bold shadow-sm" />
                
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => toggleDeleteVariant(index)} className={`p-3 rounded-xl shadow-sm transition-all ${v.deleteFlag ? 'bg-green-500 text-white' : 'bg-red-50 text-red-500 hover:bg-red-500 hover:text-white'}`}>
                    {v.deleteFlag ? <RefreshCcw size={16} /> : <Trash2 size={16} />}
                  </button>
                  <input type="file" name={`variants[${index}][image]`} accept="image/*" disabled={v.deleteFlag} className="text-[10px] w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="lg:col-span-1 space-y-8">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
          <h3 className="text-sm font-black mb-4 uppercase tracking-widest text-center">Foto Utama</h3>
          <ImagePreview name="image" defaultValue={product.image} />
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-6">
          <select name="category_id" defaultValue={product.categoryId} required className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold">
            {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input name="price" type="number" defaultValue={product.price} required className="w-full p-4 bg-gray-50 border-none rounded-2xl font-black text-amber-900" />
          <input name="discount_price" type="number" defaultValue={product.discount_price} className="w-full p-4 bg-red-50 border-none rounded-2xl font-bold text-red-600" placeholder="Harga Promo" />
          
          <div className="p-4 bg-gray-100 rounded-2xl text-center">
            <p className="text-[10px] font-black uppercase text-gray-400">Total Stok Tersedia</p>
            <p className="text-2xl font-black text-gray-900">{totalStock}</p>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-amber-900 hover:bg-black text-white py-5 rounded-[2rem] font-black shadow-xl transition-all flex items-center justify-center gap-3">
            {loading ? "Menyimpan..." : <><Save size={20} /> Simpan Perubahan</>}
          </button>
        </div>
      </div>
    </form>
  );
}