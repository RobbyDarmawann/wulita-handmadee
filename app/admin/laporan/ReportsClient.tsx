"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { exportToExcel } from "./actions";
// PERBAIKAN: Menambahkan 'Package' ke dalam import
import { FileDown, TrendingUp, Users, ChevronDown, Check, Activity, Wallet, ShoppingBag, Package } from "lucide-react";

export default function ReportsClient({ initialData, currentMonth, currentYear }: any) {
  const router = useRouter();
  const [isExporting, setIsExporting] = useState(false);
  const [sm, setSm] = useState(currentMonth);
  const [sy, setSy] = useState(currentYear);

  // State untuk Custom Dropdown
  const [isMonthOpen, setIsMonthOpen] = useState(false);
  const [isYearOpen, setIsYearOpen] = useState(false);

  const formatRp = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);
  const formatNumber = (n: number) => new Intl.NumberFormat('id-ID').format(n);

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: new Date(0, i).toLocaleString('id-ID', { month: 'long' })
  }));

  const years = [0, 1, 2].map(i => ({
    value: 2026 - i,
    label: (2026 - i).toString()
  }));

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const base64 = await exportToExcel(sm, sy);
      if (!base64) throw new Error("Export failed");
      const byteCharacters = atob(base64!);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) byteNumbers[i] = byteCharacters.charCodeAt(i);
      const blob = new Blob([new Uint8Array(byteNumbers)], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `Laporan_Wulita_${sm}_${sy}.xlsx`; a.click();
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    } catch (e) { alert("Gagal export"); } finally { setIsExporting(false); }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER & FILTER */}
      <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-amber-100/50 shadow-xl shadow-amber-900/5 relative z-30">
        <div className="flex flex-col lg:flex-row justify-between gap-8 lg:items-end">
          <div>
            <h1 className="text-3xl font-black text-amber-950 tracking-tight flex items-center gap-3">
              <Activity className="text-amber-600" size={32} /> Analitik Wulita
            </h1>
            <p className="mt-2 text-sm font-medium text-amber-900/60">Pantau performa penjualan dan data sultan per periode.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-end gap-4 relative z-40">
            
            {/* Custom Dropdown: Bulan */}
            <div className="w-full sm:w-48 relative">
              <label className="block text-[10px] font-black text-amber-900/50 uppercase tracking-widest mb-2">Bulan</label>
              <div 
                onClick={() => { setIsMonthOpen(!isMonthOpen); setIsYearOpen(false); }}
                className={`w-full py-3.5 px-5 bg-amber-50/30 border-2 rounded-[1.25rem] text-sm font-bold cursor-pointer flex justify-between items-center transition-all shadow-inner ${isMonthOpen ? 'border-amber-400 ring-[4px] ring-amber-500/10 text-amber-950' : 'border-amber-100/80 text-amber-950 hover:border-amber-300'}`}
              >
                <span>{months.find(m => m.value === sm)?.label}</span>
                <ChevronDown size={18} className={`transition-transform duration-300 ${isMonthOpen ? 'rotate-180 text-amber-600' : 'text-amber-900/40'}`} />
              </div>

              {isMonthOpen && <div className="fixed inset-0 z-10" onClick={() => setIsMonthOpen(false)}></div>}

              {isMonthOpen && (
                <div className="absolute top-full right-0 mt-2 w-full bg-white rounded-[1.25rem] border border-amber-100 shadow-xl shadow-amber-900/10 overflow-hidden z-30 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="max-h-64 overflow-y-auto custom-scrollbar p-2">
                    {months.map((m) => (
                      <div 
                        key={m.value}
                        onClick={() => { setSm(m.value); setIsMonthOpen(false); }}
                        className={`px-4 py-3 cursor-pointer rounded-xl flex justify-between items-center transition-all mb-1 ${sm === m.value ? 'bg-amber-50' : 'hover:bg-gray-50'}`}
                      >
                        <span className={`text-sm font-bold ${sm === m.value ? 'text-amber-950' : 'text-gray-600'}`}>
                          {m.label}
                        </span>
                        {sm === m.value && <Check size={16} className="text-amber-600 animate-in zoom-in" />}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Custom Dropdown: Tahun */}
            <div className="w-full sm:w-36 relative">
              <label className="block text-[10px] font-black text-amber-900/50 uppercase tracking-widest mb-2">Tahun</label>
              <div 
                onClick={() => { setIsYearOpen(!isYearOpen); setIsMonthOpen(false); }}
                className={`w-full py-3.5 px-5 bg-amber-50/30 border-2 rounded-[1.25rem] text-sm font-bold cursor-pointer flex justify-between items-center transition-all shadow-inner ${isYearOpen ? 'border-amber-400 ring-[4px] ring-amber-500/10 text-amber-950' : 'border-amber-100/80 text-amber-950 hover:border-amber-300'}`}
              >
                <span>{years.find(y => y.value === sy)?.label}</span>
                <ChevronDown size={18} className={`transition-transform duration-300 ${isYearOpen ? 'rotate-180 text-amber-600' : 'text-amber-900/40'}`} />
              </div>

              {isYearOpen && <div className="fixed inset-0 z-10" onClick={() => setIsYearOpen(false)}></div>}

              {isYearOpen && (
                <div className="absolute top-full right-0 mt-2 w-full bg-white rounded-[1.25rem] border border-amber-100 shadow-xl shadow-amber-900/10 overflow-hidden z-30 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-2">
                    {years.map((y) => (
                      <div 
                        key={y.value}
                        onClick={() => { setSy(y.value); setIsYearOpen(false); }}
                        className={`px-4 py-3 cursor-pointer rounded-xl flex justify-between items-center transition-all mb-1 ${sy === y.value ? 'bg-amber-50' : 'hover:bg-gray-50'}`}
                      >
                        <span className={`text-sm font-bold ${sy === y.value ? 'text-amber-950' : 'text-gray-600'}`}>
                          {y.label}
                        </span>
                        {sy === y.value && <Check size={16} className="text-amber-600 animate-in zoom-in" />}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => router.push(`/admin/laporan?month=${sm}&year=${sy}`)}
              className="w-full sm:w-auto rounded-[1.25rem] bg-amber-950 px-6 py-4 font-black text-xs uppercase tracking-widest text-white shadow-xl shadow-amber-900/20 transition-all hover:bg-black hover:-translate-y-1 active:translate-y-0"
            >
              Terapkan Filter
            </button>

            <button
              onClick={handleExport}
              disabled={isExporting}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-[1.25rem] bg-green-600 px-6 py-4 font-black text-xs uppercase tracking-widest text-white shadow-xl shadow-green-600/20 transition-all hover:bg-green-700 hover:-translate-y-1 active:translate-y-0 disabled:bg-gray-300 disabled:shadow-none disabled:transform-none disabled:cursor-not-allowed sm:ml-4"
            >
              {isExporting ? "Memproses..." : <><FileDown size={16} /> Export Excel</>}
            </button>
          </div>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 relative z-10">
        <div className="group relative overflow-hidden rounded-[2.5rem] border border-amber-100/50 bg-gradient-to-br from-white to-amber-50/30 p-8 shadow-xl shadow-amber-900/5 transition-all hover:-translate-y-2 hover:shadow-2xl">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-amber-100/40 transition-transform duration-700 group-hover:scale-150" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
               <div className="p-3 bg-amber-100 text-amber-700 rounded-xl"><Wallet size={24} /></div>
               <p className="text-[10px] font-black uppercase tracking-widest text-amber-900/50">Total Pemasukan</p>
            </div>
            <h3 className="text-4xl font-black tracking-tighter text-amber-950">{formatRp(initialData.totalIncome)}</h3>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-[2.5rem] border border-blue-100/50 bg-gradient-to-br from-white to-blue-50/30 p-8 shadow-xl shadow-blue-900/5 transition-all hover:-translate-y-2 hover:shadow-2xl">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-blue-100/40 transition-transform duration-700 group-hover:scale-150" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
               <div className="p-3 bg-blue-100 text-blue-700 rounded-xl"><ShoppingBag size={24} /></div>
               <p className="text-[10px] font-black uppercase tracking-widest text-blue-900/50">Pesanan Selesai</p>
            </div>
            <h3 className="text-4xl font-black tracking-tighter text-blue-950">{formatNumber(initialData.totalTransactions)} <span className="text-lg font-bold text-blue-900/40 tracking-normal">Transaksi</span></h3>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-[2.5rem] border border-green-100/50 bg-gradient-to-br from-white to-green-50/30 p-8 shadow-xl shadow-green-900/5 transition-all hover:-translate-y-2 hover:shadow-2xl">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-green-100/40 transition-transform duration-700 group-hover:scale-150" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
               <div className="p-3 bg-green-100 text-green-700 rounded-xl"><Package size={24} /></div>
               <p className="text-[10px] font-black uppercase tracking-widest text-green-900/50">Produk Terjual</p>
            </div>
            <h3 className="text-4xl font-black tracking-tighter text-green-950">{formatNumber(initialData.totalItemsSold)} <span className="text-lg font-bold text-green-900/40 tracking-normal">Pcs</span></h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 relative z-10">
        
        {/* TABEL RINCIAN TRANSAKSI */}
        <div className="overflow-hidden rounded-[2.5rem] border border-amber-100/50 bg-white shadow-xl shadow-amber-900/5 lg:col-span-2">
          <div className="flex items-center gap-4 border-b border-amber-50 p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 border border-amber-100 shadow-inner">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2v0h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-black text-amber-950 tracking-tight">Riwayat Transaksi</h2>
              <p className="text-xs font-bold text-amber-900/50 mt-0.5">Daftar transaksi yang berstatus Selesai.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-amber-50 bg-amber-50/20 text-[10px] uppercase tracking-[0.2em] font-black text-amber-900/40">
                <th className="px-8 py-5">Tanggal</th>
                <th className="px-8 py-5">Order ID</th>
                <th className="px-8 py-5">Pelanggan</th>
                <th className="px-8 py-5 text-right">Total Transaksi</th>
              </tr>
            </thead>
              <tbody className="divide-y divide-amber-50">
                {initialData.orders.length ? (
                  initialData.orders.map((o: any) => (
                    <tr key={o.id} className="transition-colors hover:bg-amber-50/30 group">
                      <td className="px-8 py-5">
                        <p className="text-sm font-bold text-amber-950 group-hover:text-amber-700 transition-colors">{new Date(o.createdAt).toLocaleDateString('id-ID')}</p>
                        <p className="mt-1 text-[10px] font-bold text-amber-900/40">{new Date(o.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
                      </td>
                      <td className="px-8 py-5">
                        <span className="inline-flex rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-black tracking-widest text-amber-800">
                          #ORD-{o.id}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-sm font-bold text-gray-700">{o.recipientName}</td>
                      <td className="px-8 py-5 text-right">
                        <p className="font-black text-amber-950 text-base">Rp {formatRp(o.totalPrice)}</p>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="p-20 text-center" colSpan={4}>
                      <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-200"><Activity size={32}/></div>
                      <p className="text-amber-900/50 font-black">Tidak ada transaksi bulan ini.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* KOLOM KANAN: LEADERBOARDS */}
        <div className="space-y-8">
          
          <div className="rounded-[2.5rem] border border-amber-100/50 bg-white p-8 shadow-xl shadow-amber-900/5">
            <div className="mb-6 flex items-center gap-4 border-b border-amber-50 pb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-100">
                <TrendingUp size={24} />
              </div>
              <h2 className="text-lg font-black text-amber-950 tracking-tight">Top 5 Pusaka</h2>
            </div>

            <div className="space-y-3">
              {initialData.topProducts.length ? initialData.topProducts.map((p: any, i: number) => (
                <div key={i} className="flex items-center gap-4 rounded-[1.25rem] border border-transparent p-3 transition-colors hover:border-amber-100/50 hover:bg-amber-50/30 group">
                  <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-base font-black shadow-inner border ${i === 0 ? 'bg-gradient-to-br from-yellow-300 to-yellow-500 text-yellow-900 border-yellow-400' : i === 1 ? 'bg-gradient-to-br from-gray-200 to-gray-400 text-gray-800 border-gray-300' : i === 2 ? 'bg-gradient-to-br from-orange-300 to-orange-500 text-orange-950 border-orange-400' : 'bg-gray-50 text-gray-400 border-gray-100'}`}>
                    {i + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-amber-950 group-hover:text-amber-700 transition-colors">{p.productName}</p>
                    <p className="mt-0.5 text-[10px] font-black uppercase tracking-widest text-amber-900/40">Terjual</p>
                  </div>
                  <div className="flex-shrink-0 rounded-xl border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-black text-green-700 shadow-sm">
                    {p._sum.quantity} Pcs
                  </div>
                </div>
              )) : (
                <div className="py-10 text-center">
                  <p className="text-sm font-bold text-amber-900/40">Belum ada pusaka yang terjual.</p>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[2.5rem] border border-amber-100/50 bg-white p-8 shadow-xl shadow-amber-900/5">
            <div className="mb-6 flex items-center gap-4 border-b border-amber-50 pb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-100">
                <Users size={24} />
              </div>
              <h2 className="text-lg font-black text-amber-950 tracking-tight">Top Sultan</h2>
            </div>

            <div className="space-y-3">
              {initialData.topCustomers?.length ? initialData.topCustomers.map((tc: any, i: number) => {
                const customerName = tc.name || tc.user?.name || 'Tamu';
                const totalSpent = tc.totalSpent ?? tc._sum?.totalPrice ?? 0;
                const tier = (tc.membership_tier || tc.user?.membership_tier || 'bronze').toLowerCase();

                return (
                  <div key={i} className="flex items-center justify-between gap-4 rounded-[1.25rem] border border-transparent p-3 transition-colors hover:border-amber-100/50 hover:bg-amber-50/30 group">
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-amber-200 text-lg font-black text-amber-900 shadow-inner border border-amber-300">
                        {customerName.trim().slice(0, 1).toUpperCase() || '?'}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-amber-950 group-hover:text-amber-700 transition-colors">{customerName}</p>
                        <div className="mt-1 flex items-center gap-2">
                          <span className={`rounded-md px-1.5 py-0.5 text-[8px] font-black uppercase tracking-[0.2em] shadow-sm text-white ${tier === 'gold' ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' : tier === 'silver' ? 'bg-gradient-to-r from-gray-400 to-gray-500' : 'bg-gradient-to-r from-amber-700 to-amber-900'}`}>
                            {tier}
                          </span>
                          <p className="text-[10px] font-black text-amber-900/40 tracking-wider">{tc.totalOrders || tc._count?.orders || 0} ORDER</p>
                        </div>
                      </div>
                    </div>
                    <p className="flex-shrink-0 text-sm font-black text-amber-900 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">Rp {formatRp(totalSpent)}</p>
                  </div>
                );
              }) : (
                <div className="py-10 text-center">
                  <p className="text-sm font-bold text-amber-900/40">Belum ada pelanggan bulan ini.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}