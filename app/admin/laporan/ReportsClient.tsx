"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { exportToExcel } from "./actions";
import { FileDown, TrendingUp, Users } from "lucide-react";

export default function ReportsClient({ initialData, currentMonth, currentYear }: any) {
  const router = useRouter();
  const [isExporting, setIsExporting] = useState(false);
  const [sm, setSm] = useState(currentMonth);
  const [sy, setSy] = useState(currentYear);

  const formatRp = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);
  const formatNumber = (n: number) => new Intl.NumberFormat('id-ID').format(n);

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
    <div className="mx-auto max-w-7xl p-6 space-y-8 text-gray-800">
      <div className="mb-8 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Laporan & Analitik</h1>
            <p className="mt-1 text-sm text-gray-500">Pantau performa penjualan Wulita Handmade per periode.</p>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="mb-2 block text-[10px] font-semibold uppercase tracking-widest text-gray-400">Bulan</label>
              <select
                value={sm}
                onChange={e => setSm(parseInt(e.target.value))}
                className="cursor-pointer rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-4 pr-10 text-sm font-medium text-gray-700 outline-none transition-all focus:border-amber-500 focus:ring-2 focus:ring-amber-500"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('id-ID', { month: 'long' })}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-[10px] font-semibold uppercase tracking-widest text-gray-400">Tahun</label>
              <select
                value={sy}
                onChange={e => setSy(parseInt(e.target.value))}
                className="cursor-pointer rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-4 pr-10 text-sm font-medium text-gray-700 outline-none transition-all focus:border-amber-500 focus:ring-2 focus:ring-amber-500"
              >
                {[0, 1, 2].map(i => <option key={2026 - i} value={2026 - i}>{2026 - i}</option>)}
              </select>
            </div>

            <button
              onClick={() => router.push(`/admin/laporan?month=${sm}&year=${sy}`)}
              className="rounded-xl bg-amber-900 px-6 py-2.5 font-semibold text-white shadow-md transition-colors hover:bg-amber-800 active:scale-95"
            >
              Terapkan Filter
            </button>

            <button
              onClick={handleExport}
              disabled={isExporting}
              className="ml-auto flex items-center gap-2 rounded-xl bg-green-600 px-6 py-2.5 font-semibold text-white shadow-md transition-colors hover:bg-green-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 md:ml-2"
            >
              {isExporting ? "..." : <><FileDown size={18} /> Export Excel</>}
            </button>
          </div>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="group relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-amber-50 transition-transform duration-500 group-hover:scale-150" />
          <div className="relative z-10">
            <p className="mb-1 text-sm font-semibold text-gray-500">Total Pemasukan</p>
            <h3 className="text-3xl font-semibold tracking-tight text-gray-900">{formatRp(initialData.totalIncome)}</h3>
          </div>
        </div>
        <div className="group relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-blue-50 transition-transform duration-500 group-hover:scale-150" />
          <div className="relative z-10">
            <p className="mb-1 text-sm font-semibold text-gray-500">Total Pesanan Selesai</p>
            <h3 className="text-3xl font-semibold tracking-tight text-gray-900">{formatNumber(initialData.totalTransactions)} <span className="text-sm font-medium text-gray-400">Transaksi</span></h3>
          </div>
        </div>
        <div className="group relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-green-50 transition-transform duration-500 group-hover:scale-150" />
          <div className="relative z-10">
            <p className="mb-1 text-sm font-semibold text-gray-500">Produk Terjual</p>
            <h3 className="text-3xl font-semibold tracking-tight text-gray-900">{formatNumber(initialData.totalItemsSold)} <span className="text-sm font-medium text-gray-400">Pcs</span></h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm lg:col-span-2">
          <div className="flex items-center gap-3 border-b border-gray-100 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-900">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2v0h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Rincian Transaksi</h2>
              <p className="text-sm text-gray-500">Daftar transaksi selesai pada periode yang dipilih.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50 text-xs uppercase tracking-wider text-gray-400">
                <th className="p-4 font-semibold">Tanggal</th>
                <th className="p-4 font-semibold">Order ID</th>
                <th className="p-4 font-semibold">Pelanggan</th>
                <th className="p-4 text-right font-semibold">Total Transaksi</th>
              </tr>
            </thead>
              <tbody className="divide-y divide-gray-50">
                {initialData.orders.length ? (
                  initialData.orders.map((o: any) => (
                    <tr key={o.id} className="transition-colors hover:bg-gray-50/30">
                      <td className="p-4">
                        <p className="text-sm font-medium text-gray-900">{new Date(o.createdAt).toLocaleDateString('id-ID')}</p>
                        <p className="mt-0.5 text-[10px] text-gray-400">{new Date(o.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex rounded-md border border-amber-100 bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">
                          #ORD-{o.id}
                        </span>
                      </td>
                      <td className="p-4 text-sm font-medium text-gray-700">{o.recipientName}</td>
                      <td className="p-4 text-right">
                        <p className="font-semibold text-gray-900">{formatRp(o.totalPrice)}</p>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="p-10 text-center" colSpan={4}>
                      <p className="text-sm italic text-gray-400">Tidak ada transaksi selesai pada periode ini.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <TrendingUp size={20} />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">5 Produk Paling Laris</h2>
            </div>

            <div className="space-y-3">
              {initialData.topProducts.length ? initialData.topProducts.map((p: any, i: number) => (
                <div key={i} className="flex items-center gap-3 rounded-2xl border border-transparent p-3 transition-colors hover:border-gray-100 hover:bg-gray-50">
                  <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold ${i === 0 ? 'bg-amber-100 text-amber-700' : i === 1 ? 'bg-gray-100 text-gray-600' : i === 2 ? 'bg-orange-100 text-orange-800' : 'bg-gray-50 text-gray-400'}`}>
                    {i + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">{p.productName}</p>
                    <p className="mt-0.5 text-xs text-gray-500">{formatNumber(p._sum.quantity)} item</p>
                  </div>
                  <div className="flex-shrink-0 rounded-lg border border-green-200 bg-green-50 px-2 py-1 text-xs font-semibold text-green-700">
                    {p._sum.quantity} Terjual
                  </div>
                </div>
              )) : (
                <div className="py-6 text-center">
                  <p className="text-sm italic text-gray-400">Belum ada barang terjual di bulan ini.</p>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <Users size={20} />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Top Sultan</h2>
            </div>

            <div className="space-y-4">
              {initialData.topCustomers?.length ? initialData.topCustomers.map((tc: any, i: number) => {
                const customerName = tc.name || tc.user?.name || 'Tamu';
                const totalSpent = tc.totalSpent ?? tc._sum?.totalPrice ?? 0;
                const tier = (tc.membership_tier || tc.user?.membership_tier || 'bronze').toLowerCase();

                return (
                  <div key={i} className="flex items-center justify-between gap-4 rounded-2xl border border-transparent p-3 transition-colors hover:border-gray-100 hover:bg-gray-50">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-600">
                        {customerName.trim().slice(0, 1).toUpperCase() || '?'}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-gray-900">{customerName}</p>
                        <div className="mt-0.5 flex items-center gap-2">
                          <span className={`rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white ${tier === 'gold' ? 'bg-yellow-500' : tier === 'silver' ? 'bg-gray-400' : 'bg-amber-700'}`}>
                            {tier}
                          </span>
                          <p className="text-[10px] font-medium text-gray-500">{tc.totalOrders || tc._count?.orders || 0} Order</p>
                        </div>
                      </div>
                    </div>
                    <p className="flex-shrink-0 text-sm font-semibold text-amber-900">{formatRp(totalSpent)}</p>
                  </div>
                );
              }) : (
                <div className="py-6 text-center">
                  <p className="text-sm italic text-gray-400">Belum ada pelanggan bulan ini.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}