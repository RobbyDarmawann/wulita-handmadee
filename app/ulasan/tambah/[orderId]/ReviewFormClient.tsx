"use client";

import { useState } from "react";
import { submitReview } from "../../actions";
import { Star, Upload, CheckCircle, Loader2 } from "lucide-react";

export default function ReviewFormClient({ item, orderId, isReviewed }: any) {
  const [isPending, setIsPending] = useState(false);
  const [done, setDone] = useState(isReviewed);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    const formData = new FormData(e.currentTarget);
    formData.append("orderId", orderId.toString());
    formData.append("productId", item.productId.toString());

    const res = await submitReview(formData);
    if (res.success) {
      setDone(true);
    } else {
      addToast(res.error, "error");
    }
    setIsPending(false);
  };

  if (done) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
        <CheckCircle className="text-green-500 w-12 h-12 mb-3" />
        <p className="font-bold text-gray-900">Ulasan Dikirim!</p>
        <p className="text-sm text-gray-500">Terima kasih telah berbagi pengalaman.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm flex flex-col md:flex-row gap-8">
      <div className="w-full md:w-1/3">
        <img src={item.product.image} className="w-full h-48 object-cover rounded-2xl border border-gray-50" />
        <h3 className="font-bold text-gray-900 mt-4">{item.productName}</h3>
        <p className="text-xs font-black text-amber-600 uppercase mt-1">Varian: {item.variantName || 'Standar'}</p>
      </div>

      <form onSubmit={handleSubmit} className="w-full md:w-2/3 space-y-5">
        <div>
          <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Berapa Bintang?</label>
          <select name="rating" required className="w-full rounded-2xl border-gray-200 bg-gray-50 p-4 font-bold outline-none focus:ring-2 focus:ring-amber-400 transition-all cursor-pointer">
            <option value="5">⭐⭐⭐⭐⭐ (Sangat Puas)</option>
            <option value="4">⭐⭐⭐⭐ (Puas)</option>
            <option value="3">⭐⭐⭐ (Cukup)</option>
            <option value="2">⭐⭐ (Kurang)</option>
            <option value="1">⭐ (Sangat Kurang)</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Komentar Ulasan</label>
          <textarea name="comment" rows={3} placeholder="Ceritakan kualitas bahan produk ini..." className="w-full rounded-2xl border-gray-200 bg-gray-50 p-5 outline-none focus:ring-2 focus:ring-amber-400 transition-all"></textarea>
        </div>

        <div>
          <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Foto Produk</label>
          <div className="relative border-2 border-dashed border-gray-200 rounded-2xl p-4 hover:bg-amber-50 transition-colors flex items-center gap-3">
            <Upload className="text-gray-400" size={20} />
            <input type="file" name="image" accept="image/*" className="text-xs text-gray-500 cursor-pointer" />
          </div>
        </div>

        <button disabled={isPending} className="w-full bg-amber-900 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-amber-900/20 hover:bg-black transition-all flex justify-center">
          {isPending ? <Loader2 className="animate-spin" /> : "Kirim Ulasan Sekarang"}
        </button>
      </form>
    </div>
  );
}