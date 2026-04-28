// FILE: app/admin/produk/ProductFilter.tsx
"use client";

import { useState } from "react";
import { Search, Filter, ChevronDown, Check } from "lucide-react";

export default function ProductFilter({ 
  categories, 
  currentSearch, 
  currentCategory, 
  currentStock 
}: { 
  categories: any[], 
  currentSearch: string, 
  currentCategory: string, 
  currentStock: string 
}) {
  // State untuk form
  const [searchQuery, setSearchQuery] = useState(currentSearch);
  const [selectedCategory, setSelectedCategory] = useState(currentCategory);
  const [selectedStock, setSelectedStock] = useState(currentStock);

  // State untuk buka/tutup dropdown melayang
  const [isCatOpen, setIsCatOpen] = useState(false);
  const [isStockOpen, setIsStockOpen] = useState(false);

  const stockOptions = [
    { value: "", label: "Semua Status" },
    { value: "tersedia", label: "Tersedia", color: "text-green-700" },
    { value: "habis", label: "Palka Kosong (Habis)", color: "text-red-600" }
  ];

  const activeCatLabel = selectedCategory ? categories.find(c => c.id.toString() === selectedCategory)?.name : "Semua Kategori";
  const activeStock = stockOptions.find(s => s.value === selectedStock) || stockOptions[0];

  const inputStyle = "w-full px-5 py-3.5 bg-amber-50/30 border-2 border-amber-100/80 rounded-[1.25rem] text-sm font-bold text-amber-950 outline-none focus:border-amber-400 focus:ring-[4px] focus:ring-amber-500/10 transition-all shadow-inner placeholder:text-amber-900/40";
  const labelStyle = "text-[10px] font-black text-amber-900/50 uppercase tracking-[0.2em] ml-2 mb-2 block";

  return (
    <div className="bg-gradient-to-br from-amber-50/80 to-[#F3E5DC]/50 p-8 rounded-[2.5rem] shadow-xl shadow-amber-900/5 border-2 border-white relative z-20">
      <form action="/admin/produk" method="GET" className="grid grid-cols-1 md:grid-cols-12 gap-5 items-end">
        
        {/* INPUT TERSEMBUNYI (Agar form GET tetap bekerja saat submit) */}
        <input type="hidden" name="category" value={selectedCategory} />
        <input type="hidden" name="stock_status" value={selectedStock} />

        {/* 1. Pencarian */}
        <div className="md:col-span-4 space-y-1.5">
          <label className={labelStyle}>Pencarian Karya</label>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-900/40 group-focus-within:text-amber-600 transition-colors" size={18} />
            <input name="search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Ketik nama pusaka..." className={`${inputStyle} pl-12`} />
          </div>
        </div>

        {/* 2. CUSTOM DROPDOWN: KATEGORI */}
        <div className="md:col-span-3 space-y-1.5 relative">
          <label className={labelStyle}>Kategori</label>
          <div
            onClick={() => setIsCatOpen(!isCatOpen)}
            className={`${inputStyle} cursor-pointer flex justify-between items-center group relative z-20 ${isCatOpen ? 'border-amber-400 ring-[4px] ring-amber-500/10' : 'hover:border-amber-300'}`}
          >
            <span className={`truncate pr-4 ${selectedCategory ? 'text-amber-950' : 'text-gray-900'}`}>{activeCatLabel}</span>
            <ChevronDown className={`transition-all duration-300 ${isCatOpen ? 'rotate-180 text-amber-600' : 'text-amber-900/40'}`} size={18} />
          </div>

          {isCatOpen && <div className="fixed inset-0 z-10" onClick={() => setIsCatOpen(false)}></div>}

          {isCatOpen && (
            <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-[1.25rem] border border-amber-100 shadow-xl shadow-amber-900/10 overflow-hidden z-30 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="max-h-60 overflow-y-auto custom-scrollbar p-2">
                <div
                  onClick={() => { setSelectedCategory(""); setIsCatOpen(false); }}
                  className={`px-4 py-3.5 cursor-pointer rounded-xl flex justify-between items-center transition-all mb-1 ${selectedCategory === "" ? 'bg-amber-50' : 'hover:bg-gray-50'}`}
                >
                  <span className={`text-sm font-bold ${selectedCategory === "" ? 'text-amber-950' : 'text-gray-600'}`}>Semua Kategori</span>
                  {selectedCategory === "" && <Check size={16} className="text-amber-600" />}
                </div>
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    onClick={() => { setSelectedCategory(cat.id.toString()); setIsCatOpen(false); }}
                    className={`px-4 py-3.5 cursor-pointer rounded-xl flex justify-between items-center transition-all mb-1 ${selectedCategory === cat.id.toString() ? 'bg-amber-50' : 'hover:bg-gray-50'}`}
                  >
                    <span className={`text-sm font-bold ${selectedCategory === cat.id.toString() ? 'text-amber-950' : 'text-gray-600'}`}>{cat.name}</span>
                    {selectedCategory === cat.id.toString() && <Check size={16} className="text-amber-600" />}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 3. CUSTOM DROPDOWN: STATUS STOK */}
        <div className="md:col-span-3 space-y-1.5 relative">
          <label className={labelStyle}>Status Palka</label>
          <div
            onClick={() => setIsStockOpen(!isStockOpen)}
            className={`${inputStyle} cursor-pointer flex justify-between items-center group relative z-20 ${isStockOpen ? 'border-amber-400 ring-[4px] ring-amber-500/10' : 'hover:border-amber-300'}`}
          >
            <span className={`truncate pr-4 ${activeStock.value !== "" ? 'font-black ' + activeStock.color : 'text-gray-900'}`}>{activeStock.label}</span>
            <ChevronDown className={`transition-all duration-300 ${isStockOpen ? 'rotate-180 text-amber-600' : 'text-amber-900/40'}`} size={18} />
          </div>

          {isStockOpen && <div className="fixed inset-0 z-10" onClick={() => setIsStockOpen(false)}></div>}

          {isStockOpen && (
            <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-[1.25rem] border border-amber-100 shadow-xl shadow-amber-900/10 overflow-hidden z-30 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-2">
                {stockOptions.map((opt) => (
                  <div
                    key={opt.value}
                    onClick={() => { setSelectedStock(opt.value); setIsStockOpen(false); }}
                    className={`px-4 py-3.5 cursor-pointer rounded-xl flex justify-between items-center transition-all mb-1 ${selectedStock === opt.value ? 'bg-amber-50' : 'hover:bg-gray-50'}`}
                  >
                    <span className={`text-sm font-bold ${selectedStock === opt.value ? 'text-amber-950' : opt.color || 'text-gray-600'}`}>{opt.label}</span>
                    {selectedStock === opt.value && <Check size={16} className="text-amber-600" />}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 4. TOMBOL FILTER */}
        <div className="md:col-span-2">
          <button type="submit" className="w-full bg-amber-100/80 text-amber-900 border-2 border-amber-200 py-3.5 rounded-[1.25rem] font-black text-xs uppercase tracking-widest hover:bg-amber-900 hover:text-white hover:border-amber-900 transition-all flex items-center justify-center gap-2 shadow-sm">
            <Filter size={16} /> Saring
          </button>
        </div>
      </form>
    </div>
  );
}