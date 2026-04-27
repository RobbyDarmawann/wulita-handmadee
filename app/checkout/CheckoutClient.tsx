// FILE: app/checkout/CheckoutClient.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { processCheckout } from "./actions";
import { Loader2 } from "lucide-react";

export default function CheckoutClient({ cartItems = [], user }: { cartItems: any[], user: any }) {
  const router = useRouter();
  
  const [deliveryOption, setDeliveryOption] = useState("diantar");
  const [inputNama, setInputNama] = useState(user?.name || "");
  const [inputPhone, setInputPhone] = useState("");
  const [inputAddress, setInputAddress] = useState("");
  const [isPending, setIsPending] = useState(false);

  // PENGAMAN: Pastikan cartItems adalah array yang valid
  const validItems = Array.isArray(cartItems) ? cartItems : [];
  
  const subtotal = validItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const ongkir = deliveryOption === "diantar" ? 15000 : 0;
  const total = subtotal + ongkir;

  const formatRp = (angka: number) => new Intl.NumberFormat('id-ID').format(angka);

  const isiOtomatis = () => {
    setInputNama(user?.name || "");
    setInputPhone("08123456789"); // Ganti jika ada field phone di tabel User
    setInputAddress("Alamat Wulita"); // Ganti jika ada field address di tabel User
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    const formData = new FormData(e.currentTarget);

    const res = await processCheckout(formData);
    if (res.success) {
      router.push(`/pembayaran/${res.orderId}`); 
    } else {
      alert(res.error);
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-12">
      <div className="lg:col-span-2 space-y-8">
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-gray-900">Detail Pengiriman</h2>
            <button type="button" onClick={isiOtomatis} className="text-sm font-bold text-amber-700 bg-amber-50 border border-amber-200 px-4 py-2 rounded-xl hover:bg-amber-100 transition-colors">
              Gunakan Data Profil
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Nama Penerima *</label>
              <input required name="recipient_name" value={inputNama} onChange={e => setInputNama(e.target.value)} className="w-full px-5 py-3.5 bg-gray-50 border rounded-2xl outline-none focus:ring-2 focus:ring-amber-500" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Nomor WhatsApp *</label>
              <input required name="phone_number" value={inputPhone} onChange={e => setInputPhone(e.target.value)} className="w-full px-5 py-3.5 bg-gray-50 border rounded-2xl outline-none focus:ring-2 focus:ring-amber-500" />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">Opsi Pengiriman *</label>
            <select name="delivery_option" value={deliveryOption} onChange={e => setDeliveryOption(e.target.value)} className="w-full px-5 py-3.5 bg-gray-50 border rounded-2xl cursor-pointer outline-none focus:ring-2 focus:ring-amber-500">
              <option value="diantar">Kurir Lokal (Diantar - Rp 15.000)</option>
              <option value="diambil">Ambil Sendiri di Toko (Gratis)</option>
            </select>
          </div>

          {deliveryOption === "diantar" && (
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-2">Alamat Lengkap *</label>
              <textarea required name="shipping_address" value={inputAddress} onChange={e => setInputAddress(e.target.value)} rows={3} className="w-full px-5 py-3.5 bg-gray-50 border rounded-2xl outline-none focus:ring-2 focus:ring-amber-500"></textarea>
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Catatan Tambahan</label>
            <textarea name="customer_notes" rows={2} placeholder="Cth: Tolong packing yang rapi ya..." className="w-full px-5 py-3.5 bg-gray-50 border rounded-2xl outline-none focus:ring-2 focus:ring-amber-500"></textarea>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Metode Pembayaran</h2>
          <select required name="payment_method" className="w-full px-5 py-3.5 bg-gray-50 border rounded-2xl cursor-pointer outline-none focus:ring-2 focus:ring-amber-500">
            <option value="">-- Pilih Metode --</option>
            <option value="BCA">Transfer Bank BCA</option>
            <option value="QRIS">QRIS</option>
          </select>
        </div>
      </div>

      <div className="lg:col-span-1">
        <div className="bg-amber-50 p-8 rounded-3xl border border-amber-100 sticky top-28">
          <h2 className="text-xl font-bold text-amber-900 mb-6">Ringkasan Pesanan</h2>
          
          <div className="space-y-4 mb-6">
            {validItems.length > 0 ? (
              validItems.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-600 truncate pr-4">{item.quantity}x {item.product?.name}</span>
                  <span className="font-bold text-gray-900">Rp {formatRp(item.price * item.quantity)}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 italic">Keranjang kosong.</p>
            )}
          </div>

          <hr className="border-amber-200 mb-6" />
          
          <div className="space-y-3 mb-6 text-sm text-amber-800">
            <div className="flex justify-between"><span>Subtotal</span><span className="font-bold">Rp {formatRp(subtotal)}</span></div>
            <div className="flex justify-between"><span>Ongkos Kirim</span><span className="font-bold">{ongkir === 0 ? 'Gratis' : `Rp ${formatRp(ongkir)}`}</span></div>
          </div>
          
          <div className="flex justify-between mb-8 text-xl font-black text-amber-950 pt-4 border-t-2 border-amber-200">
            <span>Total Tagihan</span><span>Rp {formatRp(total)}</span>
          </div>
          
          <button type="submit" disabled={isPending || validItems.length === 0} className="w-full bg-amber-900 text-white py-4 rounded-2xl font-bold hover:bg-amber-800 flex justify-center disabled:bg-gray-400 disabled:cursor-not-allowed">
            {isPending ? <Loader2 className="animate-spin" /> : "Buat Pesanan Sekarang"}
          </button>
        </div>
      </div>
    </form>
  );
}