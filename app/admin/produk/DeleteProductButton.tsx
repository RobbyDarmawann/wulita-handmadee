"use client";

import { Trash2 } from "lucide-react";
import { deleteProduct } from "./actions";

export default function DeleteProductButton({ id }: { id: number }) {
  const handleDelete = async () => {
    if (confirm("Hapus produk ini secara permanen dari palka katalog? Tindakan ini tidak dapat dibatalkan.")) {
      await deleteProduct(id);
    }
  };

  return (
    <button 
      onClick={handleDelete}
      className="p-3 bg-white border border-red-100 text-red-400 rounded-xl hover:bg-red-500 hover:text-white hover:border-red-500 transition-all hover:shadow-lg hover:shadow-red-500/20 hover:-translate-y-0.5 active:translate-y-0"
      title="Hapus Product"
    >
      <Trash2 size={18} />
    </button>
  );
}