"use client"; // <--- Ini wajib agar bisa pakai onClick dan confirm()

import { Trash2 } from "lucide-react";
import { deleteCategory } from "./actions";

interface DeleteButtonProps {
  id: number;
}

export default function DeleteButton({ id }: DeleteButtonProps) {
  const handleDelete = async () => {
    // Sekarang confirm() bisa jalan karena ini Client Component
    const setuju = confirm("Hapus kategori ini? Pastikan kategori sudah kosong dari produk agar data tidak berantakan.");
    
    if (setuju) {
      await deleteCategory(id);
    }
  };

  return (
    <button 
      onClick={handleDelete}
      className="p-3 bg-red-50 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
      title="Hapus Kategori"
    >
      <Trash2 size={18} />
    </button>
  );
}