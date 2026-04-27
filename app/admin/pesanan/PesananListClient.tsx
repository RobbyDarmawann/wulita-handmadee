"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Eye, PackageX } from "lucide-react";

export default function PesananListClient({ initialOrders }: { initialOrders: any[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("semua");

  // Real-time filtering tanpa perlu submit form
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
    };
    return styles[status.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-8">
      {/* HEADER & FILTER */}
      <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Daftar Pesanan</h1>
            <p className="text-gray-500 mt-1 font-medium">Kelola dan pantau semua transaksi pelanggan.</p>
          </div>

          <div className="flex flex-col sm:flex-row w-full md:w-auto items-end gap-3">
            <div className="w-full sm:w-auto">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Pencarian</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="ID atau Nama..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-64 pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                />
              </div>
            </div>
            
            <div className="w-full sm:w-auto">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Filter Status</label>
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-48 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold text-gray-700 py-3 px-4 focus:ring-2 focus:ring-amber-500 outline-none cursor-pointer"
              >
                <option value="semua">Semua Status</option>
                <option value="menunggu pembayaran">Menunggu Pembayaran</option>
                <option value="dibayar">Dibayar</option>
                <option value="dikemas">Dikemas</option>
                <option value="siap_diambil">Siap Diambil</option>
                <option value="sedang_dikirim">Sedang Dikirim</option>
                <option value="pesanan selesai">Selesai</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="py-5 px-6 text-xs font-black text-gray-400 uppercase tracking-widest">Order ID / Waktu</th>
                <th className="py-5 px-6 text-xs font-black text-gray-400 uppercase tracking-widest">Pelanggan</th>
                <th className="py-5 px-6 text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="py-5 px-6 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Total</th>
                <th className="py-5 px-6 text-xs font-black text-gray-400 uppercase tracking-widest text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-amber-50/30 transition-colors group">
                    <td className="py-5 px-6">
                      <p className="font-black text-amber-950 text-sm">#ORD-{order.id}</p>
                      <p className="text-xs text-gray-500 font-medium mt-1">{formatDate(order.createdAt)}</p>
                    </td>
                    <td className="py-5 px-6">
                      <p className="font-bold text-gray-900 text-sm">{order.recipientName}</p>
                      <span className={`inline-block mt-1 text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider ${order.deliveryOption === 'diambil' ? 'bg-sky-50 text-sky-700' : 'bg-indigo-50 text-indigo-700'}`}>
                        {order.deliveryOption}
                      </span>
                    </td>
                    <td className="py-5 px-6">
                      <span className={`px-3 py-1.5 text-[10px] font-black rounded-full border uppercase tracking-widest ${getStatusStyle(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-5 px-6 text-right">
                      <p className="font-black text-amber-900">Rp {formatRp(order.totalPrice)}</p>
                    </td>
                    <td className="py-5 px-6 text-center">
                      <Link href={`/admin/pesanan/${order.id}`} className="inline-flex items-center justify-center p-2.5 bg-white text-gray-400 hover:bg-amber-900 hover:text-white hover:border-amber-900 rounded-xl transition-all border border-gray-200 shadow-sm group-hover:shadow-md">
                        <Eye size={18} />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <PackageX className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-900 font-black text-lg mb-1">Pesanan Tidak Ditemukan</p>
                    <p className="text-gray-500 text-sm font-medium">Coba gunakan kata kunci atau status yang berbeda.</p>
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