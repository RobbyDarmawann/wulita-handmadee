import prisma from '@/lib/prisma'; // <--- INI KUNCI UTAMANYA BIAR GAK ERROR LIMIT KONEKSI
import Link from 'next/link';
import AdminChart from '@/components/AdminChart';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

// Revalidate setiap 60 detik di production, disable caching di development
// Ini penting untuk Vercel serverless: hindari setiap request hit database
export const revalidate = process.env.NODE_ENV === 'production' ? 60 : 0;

export default async function DashboardPage() {
  // OPTIMASI: Batasi Promise.all hanya untuk critical data
  // Sisanya fetch sequential atau cached untuk menghindari connection pool exhaustion
  const [
    totalOrdersCount,
    totalCustomers,
    pendingVerifications,
    completedOrders
  ] = await Promise.all([
    prisma.order.count(),
    prisma.user.count({ where: { role: 'customer' } }),
    prisma.order.count({ where: { status: { in: ['menunggu pembayaran', 'dibayar'] } } }),
    prisma.order.findMany({ where: { status: 'pesanan selesai' } }) // Sesuaikan dengan status skema baru
  ]);

  // OPTIMASI: Fetch non-critical data sequential (bukan concurrent)
  // Ini lebih lambat tapi tidak membuka banyak koneksi sekaligus
  const recentOrders = await prisma.order.findMany({ 
    take: 5, 
    orderBy: { createdAt: 'desc' } 
  });
  
  const lowStockItems = await prisma.product.findMany({ 
    where: { stock: { lt: 5 } }, 
    take: 5 
  });

  // Total Pendapatan dari pesanan selesai (Gunakan camelCase: totalPrice)
  const totalRevenue = completedOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);

  // Format Uang Rupiah
  const formatRp = (angka: number) => new Intl.NumberFormat('id-ID').format(angka);

  // Data Dummy Grafik (Nanti bisa diganti algoritma Prisma GroupBy)
  const chartDates = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
  const chartData = [150000, 450000, 300000, 800000, 600000, 1200000, 950000];

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Ikhtisar Toko Wulita</h1>
        <p className="text-gray-500 mt-1 font-medium">Selamat datang kembali! Ini performa penjualan hari ini.</p>
      </div>

      {/* 4 KOTAK STATISTIK ATAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Pendapatan */}
        <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-lg transition-all">
          <div className="absolute -right-6 -top-6 w-28 h-28 bg-emerald-50 rounded-full z-0 transition-transform duration-500 group-hover:scale-125"></div>
          <div className="relative z-10">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Pendapatan</p>
            <h3 className="text-3xl font-black text-gray-900 tracking-tight">Rp {formatRp(totalRevenue)}</h3>
          </div>
        </div>

        {/* Card 2: Total Pesanan */}
        <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-lg transition-all">
          <div className="absolute -right-6 -top-6 w-28 h-28 bg-sky-50 rounded-full z-0 transition-transform duration-500 group-hover:scale-125"></div>
          <div className="relative z-10">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Pesanan</p>
            <h3 className="text-3xl font-black text-gray-900 tracking-tight">{formatRp(totalOrdersCount)} <span className="text-sm font-bold text-gray-400">Order</span></h3>
          </div>
        </div>

        {/* Card 3: Verifikasi (Amber Pulse) */}
        <div className="bg-amber-50/50 rounded-[2rem] p-6 border border-amber-200 shadow-sm relative overflow-hidden group hover:bg-amber-50 transition-all">
          <div className="absolute -right-6 -top-6 w-28 h-28 bg-amber-100 rounded-full z-0 transition-transform duration-500 group-hover:scale-125"></div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-2">Perlu Diproses</p>
            <div className="flex items-end justify-between mt-1">
              <h3 className="text-3xl font-black text-amber-900 animate-pulse">{pendingVerifications}</h3>
              {pendingVerifications > 0 && (
                <Link href="/admin/pesanan" className="text-[10px] font-black uppercase bg-amber-900 hover:bg-amber-800 text-white px-4 py-2 rounded-xl transition-all shadow-md hover:-translate-y-0.5">
                  Cek Antrean
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Card 4: Pelanggan */}
        <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-lg transition-all">
          <div className="absolute -right-6 -top-6 w-28 h-28 bg-purple-50 rounded-full z-0 transition-transform duration-500 group-hover:scale-125"></div>
          <div className="relative z-10">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Pelanggan Aktif</p>
            <h3 className="text-3xl font-black text-gray-900 tracking-tight">{formatRp(totalCustomers)} <span className="text-sm font-bold text-gray-400">User</span></h3>
          </div>
        </div>
      </div>

      {/* GRID BAWAH: CHART & LIST */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Kiri: Grafik (Span 2) */}
        <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="font-black text-gray-900 text-xl tracking-tight">Tren Pendapatan</h3>
              <p className="text-sm text-gray-500 mt-1 font-medium">Grafik omzet bersih 7 hari terakhir</p>
            </div>
            <Link href="/admin/laporan" className="text-xs font-black text-amber-700 hover:text-white bg-amber-50 hover:bg-amber-700 px-4 py-2 rounded-xl transition-all uppercase tracking-wider">
              Laporan Detail
            </Link>
          </div>
          
          <div className="relative h-72 md:h-full min-h-[300px] w-full">
            <AdminChart labels={chartDates} data={chartData} />
          </div>
        </div>

        {/* Kanan: Order & Stok */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          
          {/* Order Terbaru */}
          <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-gray-900 text-lg">Order Terbaru</h3>
              <Link href="/admin/pesanan" className="text-[10px] font-black uppercase text-gray-400 hover:text-amber-600">Lihat Semua</Link>
            </div>

            <div className="space-y-4">
              {recentOrders.length > 0 ? recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-2xl transition-colors border border-transparent hover:border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-black text-gray-500 shadow-inner uppercase">
                      {/* Perbaikan di sini: recipientName */}
                      {order.recipientName?.substring(0, 1) || '?'}
                    </div>
                    <div>
                      {/* Perbaikan di sini: recipientName */}
                      <p className="font-bold text-gray-900 text-sm line-clamp-1">{order.recipientName || 'Pelanggan'}</p>
                      <p className={`text-[9px] font-black uppercase tracking-wider mt-0.5 ${order.status === 'menunggu pembayaran' ? 'text-red-500' : 'text-amber-600'}`}>
                        {order.status.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {/* Perbaikan di sini: totalPrice */}
                    <p className="font-black text-amber-900 text-sm">Rp {formatRp(order.totalPrice)}</p>
                  </div>
                </div>
              )) : (
                <p className="text-center text-sm text-gray-400 italic py-6">Belum ada pesanan masuk.</p>
              )}
            </div>
          </div>

          {/* Stok Menipis */}
          <div className="bg-red-50/40 p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-red-100 flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />
                <h3 className="font-black text-red-900 text-lg">Stok Menipis!</h3>
              </div>
              <Link href="/admin/produk" className="text-[10px] font-black uppercase text-red-600 bg-red-100 hover:bg-red-600 hover:text-white px-3 py-1.5 rounded-lg transition-all shadow-sm">
                Restock
              </Link>
            </div>

            <div className="space-y-3">
              {lowStockItems.length > 0 ? lowStockItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-red-100 shadow-sm">
                  <div>
                    <p className="font-bold text-gray-900 text-sm line-clamp-1">{item.name}</p>
                    <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mt-1">Sisa Stok Limit</p>
                  </div>
                  <div className="text-right bg-red-50 px-4 py-2 rounded-xl border border-red-100">
                    <p className="font-black text-red-600 text-lg">{item.stock}</p>
                  </div>
                </div>
              )) : (
                <div className="flex flex-col items-center justify-center py-8 h-full opacity-80">
                  <div className="w-14 h-14 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-3 shadow-sm border border-green-200">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <p className="text-sm text-green-700 font-bold">Semua Stok Aman</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}