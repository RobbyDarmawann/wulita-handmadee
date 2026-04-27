"use client";

import { useState } from "react";
import { replyToReview, deleteReview } from "./actions";
import { Star, MessageSquare, Trash2, CheckCircle, ExternalLink, ImageIcon, Loader2 } from "lucide-react";
import Link from "next/link";

export default function ReviewListClient({ initialReviews }: { initialReviews: any[] }) {
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [replies, setReplies] = useState<Record<number, string>>({});

  const handleReply = async (id: number) => {
    if (!replies[id]) return alert("Tulis balasan dulu, Kapten!");
    
    setLoadingId(id);
    const res = await replyToReview(id, replies[id]);
    if (!res.success) alert(res.error);
    setLoadingId(null);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus ulasan ini secara permanen?")) return;
    
    setLoadingId(id);
    const res = await deleteReview(id);
    if (!res.success) alert(res.error);
    setLoadingId(null);
  };

  const formatDate = (date: any) => new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-xs text-gray-400 uppercase tracking-widest border-b border-gray-100 bg-gray-50/50">
              <th className="p-6 font-black w-1/4">Info & Pesanan</th>
              <th className="p-6 font-black w-1/3">Rating & Komentar</th>
              <th className="p-6 font-black text-center">Foto</th>
              <th className="p-6 font-black w-1/4">Tanggapan Anda</th>
              <th className="p-6 font-black text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {initialReviews.length > 0 ? initialReviews.map((review) => (
              <tr key={review.id} className="align-top hover:bg-gray-50/30 transition-colors group">
                <td className="p-6">
                  <Link href={`/produk/${review.product?.slug}`} target="_blank" className="font-bold text-gray-900 leading-tight hover:text-amber-600 transition-colors line-clamp-2 mb-4 flex items-center gap-1">
                    {review.product?.name} <ExternalLink size={12} />
                  </Link>
                  
                  {review.orderId && (
                    <div className="bg-gray-50 p-3 rounded-2xl border border-gray-200 shadow-sm mb-4">
                      <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-black">
                        <span className="text-gray-400">Order ID:</span>
                        <span className="text-amber-600">#{review.orderId}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-auto">
                    <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-xs font-black shadow-inner uppercase">
                      {review.user?.name?.substring(0, 1)}
                    </div>
                    <div>
                      <p className="text-xs text-amber-950 font-black leading-none">{review.user?.name}</p>
                      <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase">{formatDate(review.createdAt)}</p>
                    </div>
                  </div>
                </td>

                <td className="p-6">
                  <div className="flex text-amber-400 mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} size={16} fill={star <= review.rating ? "currentColor" : "none"} className={star <= review.rating ? "" : "text-gray-200"} />
                    ))}
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed font-medium italic">
                    "{review.comment || 'Tidak ada komentar'}"
                  </p>
                </td>

                <td className="p-6 text-center">
                  {review.image ? (
                    <a href={review.image} target="_blank" rel="noreferrer" className="inline-block group/img">
                      <img src={review.image} alt="Ulasan" className="w-20 h-20 object-cover rounded-2xl border-2 border-gray-100 shadow-sm transition-transform group-hover/img:scale-110" />
                    </a>
                  ) : (
                    <div className="w-20 h-20 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center mx-auto text-gray-300">
                      <ImageIcon size={24} />
                    </div>
                  )}
                </td>

                <td className="p-6">
                  {review.admin_reply ? (
                    <div className="bg-amber-50 p-4 rounded-[1.5rem] border border-amber-100 shadow-sm relative overflow-hidden">
                      <div className="absolute -right-2 -top-2 opacity-10">
                        <MessageSquare size={40} className="text-amber-900" />
                      </div>
                      <p className="text-[9px] font-black text-amber-900 uppercase tracking-widest mb-2 flex items-center gap-1">
                        <CheckCircle size={10} /> Sudah Dibalas
                      </p>
                      <p className="text-xs text-amber-800 leading-relaxed font-bold">"{review.admin_reply}"</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <textarea 
                        placeholder="Tulis balasan terima kasih..."
                        value={replies[review.id] || ""}
                        onChange={(e) => setReplies({...replies, [review.id]: e.target.value})}
                        className="w-full text-xs rounded-2xl border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-amber-500 transition-all p-4 leading-relaxed outline-none resize-none h-24 font-medium"
                      />
                      <button 
                        onClick={() => handleReply(review.id)}
                        disabled={loadingId === review.id}
                        className="bg-amber-900 text-white text-[10px] font-black uppercase tracking-[0.2em] py-2.5 px-5 rounded-xl hover:bg-black self-end shadow-lg shadow-amber-900/20 transition-all flex items-center gap-2"
                      >
                        {loadingId === review.id ? <Loader2 size={12} className="animate-spin" /> : "Kirim"}
                      </button>
                    </div>
                  )}
                </td>

                <td className="p-6 text-right">
                  <button 
                    onClick={() => handleDelete(review.id)}
                    disabled={loadingId === review.id}
                    className="text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 p-3 rounded-2xl transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                  >
                    {loadingId === review.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="py-24 text-center">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                    <MessageSquare className="w-10 h-10 text-gray-200" />
                  </div>
                  <p className="text-gray-900 font-black text-xl mb-1">Belum Ada Ulasan</p>
                  <p className="text-sm text-gray-400 font-medium">Ulasan pelanggan akan muncul di sini otomatis.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}