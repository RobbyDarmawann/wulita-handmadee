"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Search, Eye, PackageX, ChevronDown, Check } from "lucide-react";

export default function PesananListClient({ initialOrders }: { initialOrders: any[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("semua");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State untuk Custom Dropdown

  const filteredOrders = initialOrders.filter((order) => {
    const matchesSearch = 
      order.recipientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toString().includes(searchQuery);
    const matchesStatus = statusFilter === "semua" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatRp = (angka: number) => new Intl.NumberFormat('id-ID').format(angka);
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const getStatusStyle = (status: string) => {
    const styles: Record<string, string> = {
      'menunggu pembayaran': 'bg-gray-100 text-gray-600 border-gray-200',
      'dibayar': 'bg-blue-100 text-blue-800 border-blue-200',
      'dikemas': 'bg-purple-100 text-purple-800 border-purple-200',
      'siap_diambil': 'bg-sky-100 text-sky-800 border-sky-300 font-black',
      'sedang_dikirim': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'pesanan selesai': 'bg-green-100 text-green-800 border-green-200',
      'dibatalkan': 'bg-red-100 text-red-800 border-red-200',
      'pembayaran ditolak': 'bg-red-100 text-red-800 border-red-200',
    };
    return styles[status.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const statusOptions = [
    { value: "semua", label: "Semua Status" },
    { value: "menunggu pembayaran", label: "Menunggu Pembayaran" },
    { value: "dibayar", label: "Sudah Dibayar" },
    { value: "dikemas", label: "Dikemas" },
    { value: "siap_diambil", label: "Siap Diambil" },
    { value: "sedang_dikirim", label: "Sedang Dikirim" },
    { value: "pesanan selesai", label: "Selesai" },
    { value: "dibatalkan", label: "Dibatalkan" },
    { value: "pembayaran ditolak", label: "Pembayaran Ditolak" },
  ];

  const getActiveLabel = () => statusOptions.find(opt => opt.value === statusFilter)?.label || "Pilih Status";

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* HEADER & FILTER */}
      <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-amber-100/50 shadow-xl shadow-amber-900/5">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-amber-950 tracking-tight">Daftar Pesanan</h1>
            <p className="text-amber-900/60 mt-1 font-medium text-sm">Kelola dan pantau semua transaksi pelanggan.</p>
          </div>

          <div className="flex flex-col sm:flex-row w-full md:w-auto items-end gap-4 relative z-20">
            {/* Input Pencarian */}
            <div className="w-full sm:w-auto">
              <label className="block text-[10px] font-black text-amber-900/50 uppercase tracking-widest mb-2">Pencarian</label>
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-900/40 group-focus-within:text-amber-600 transition-colors" size={18} />
                <input 
                  type="text" 
                  placeholder="Cari ID atau Nama..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-64 pl-11 pr-4 py-3.5 bg-amber-50/30 border-2 border-amber-100/80 rounded-[1.25rem] text-sm font-bold text-amber-950 placeholder:text-amber-900/40 focus:ring-[4px] focus:ring-amber-500/10 focus:border-amber-400 outline-none transition-all shadow-inner"
                />
              </div>
            </div>
            
            {/* Custom Dropdown Filter */}
            <div className="w-full sm:w-auto relative">
              <label className="block text-[10px] font-black text-amber-900/50 uppercase tracking-widest mb-2">Filter Status</label>
              <div 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`w-full sm:w-56 py-3.5 px-5 bg-white border-2 rounded-[1.25rem] text-sm font-bold cursor-pointer flex justify-between items-center transition-all ${isDropdownOpen ? 'border-amber-400 ring-[4px] ring-amber-500/10 text-amber-950' : 'border-amber-100/80 text-amber-900/70 hover:border-amber-300'}`}
              >
                <span className="truncate pr-4">{getActiveLabel()}</span>
                <ChevronDown size={18} className={`transition-transform duration-300 ${isDropdownOpen ? 'rotate-180 text-amber-600' : 'text-amber-900/40'}`} />
              </div>

              {isDropdownOpen && <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)}></div>}

              {isDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-full sm:w-56 bg-white rounded-[1.25rem] border border-amber-100 shadow-xl shadow-amber-900/10 overflow-hidden z-30 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="max-h-64 overflow-y-auto custom-scrollbar">
                    {statusOptions.map((opt) => (
                      <div 
                        key={opt.value}
                        onClick={() => { setStatusFilter(opt.value); setIsDropdownOpen(false); }}
                        className="px-5 py-3.5 cursor-pointer flex justify-between items-center hover:bg-amber-50/80 transition-colors border-b border-amber-50/50 last:border-0 group/item"
                      >
                        <span className={`text-xs font-bold transition-colors ${statusFilter === opt.value ? 'text-amber-950' : 'text-amber-900/60 group-hover/item:text-amber-900'}`}>
                          {opt.label}
                        </span>
                        {statusFilter === opt.value && <Check size={14} className="text-amber-600 animate-in zoom-in duration-200" />}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-amber-100/50 overflow-hidden relative z-10">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-amber-50/30 border-b border-amber-100/80">
                <th className="py-5 px-6 text-[10px] font-black text-amber-900/50 uppercase tracking-[0.2em]">Order ID / Waktu</th>
                <th className="py-5 px-6 text-[10px] font-black text-amber-900/50 uppercase tracking-[0.2em]">Pelanggan</th>
                <th className="py-5 px-6 text-[10px] font-black text-amber-900/50 uppercase tracking-[0.2em]">Status</th>
                <th className="py-5 px-6 text-[10px] font-black text-amber-900/50 uppercase tracking-[0.2em] text-right">Total</th>
                <th className="py-5 px-6 text-[10px] font-black text-amber-900/50 uppercase tracking-[0.2em] text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-50">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-amber-50/30 transition-colors group">
                    <td className="py-5 px-6">
                      <p className="font-black text-amber-950 text-sm tracking-tight">#ORD-{order.id}</p>
                      <p className="text-xs text-amber-900/50 font-medium mt-1">{formatDate(order.createdAt)}</p>
                    </td>
                    <td className="py-5 px-6">
                      <p className="font-bold text-amber-950 text-sm">{order.recipientName}</p>
                      <span className={`inline-block mt-1 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${order.deliveryOption === 'diambil' ? 'bg-sky-50 text-sky-700 border border-sky-100' : 'bg-indigo-50 text-indigo-700 border border-indigo-100'}`}>
                        {order.deliveryOption}
                      </span>
                    </td>
                    <td className="py-5 px-6">
                      <span className={`px-3 py-1.5 text-[9px] font-black rounded-full border uppercase tracking-widest ${getStatusStyle(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-5 px-6 text-right">
                      <p className="font-black text-amber-950">Rp {formatRp(order.totalPrice)}</p>
                    </td>
                    <td className="py-5 px-6 text-center">
                      <Link href={`/admin/pesanan/${order.id}`} className="inline-flex items-center justify-center p-2.5 bg-white text-amber-900/40 hover:bg-amber-900 hover:text-white rounded-xl transition-all border border-amber-100 shadow-sm hover:shadow-md hover:border-amber-900 hover:-translate-y-0.5">
                        <Eye size={18} />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-32 text-center bg-gray-50/30">
                    <PackageX className="w-16 h-16 text-amber-200 mx-auto mb-4" />
                    <p className="text-amber-950 font-black text-xl mb-1 tracking-tight">Palka Kosong</p>
                    <p className="text-amber-900/50 text-sm font-medium">Tidak ada pesanan yang sesuai dengan pencarian Anda.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}