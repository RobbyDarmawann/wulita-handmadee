"use client";

import { Trash2 } from "lucide-react";
import { deleteProduct } from "./actions";

export default function DeleteProductButton({ id }: { id: number }) {
  const handleDelete = async () => {
    if (confirm("Hapus produk ini secara permanen dari katalog?")) {
      await deleteProduct(id);
    }
  };

  return (
    <button 
      onClick={handleDelete}
      className="p-3 bg-red-50 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
      title="Hapus Produk"
    >
      <Trash2 size={18} />
    </button>
  );
}