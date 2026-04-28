"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { processCheckout } from "./actions"; 
import { Loader2, Coins, ChevronDown, Sparkles, Check } from "lucide-react";

type CartItem = {
  id: number;
  productId: number;
  price: number;
  quantity: number;
  product?: { name: string };
};

export default function CheckoutClient({ cartItems = [], user }: { cartItems: CartItem[], user: any }) {
  const router = useRouter();
  
  const [deliveryOption, setDeliveryOption] = useState("diantar");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [inputNama, setInputNama] = useState("");
  const [inputPhone, setInputPhone] = useState(""); 
  const [inputAddress, setInputAddress] = useState(""); 
  
  const [isPending, setIsPending] = useState(false);
  const [usePoints, setUsePoints] = useState(false);
  
  const [isDeliveryOpen, setIsDeliveryOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const validItems = Array.isArray(cartItems) ? cartItems : [];
  const subtotal = validItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const ongkir = deliveryOption === "diantar" ? 15000 : 0;
  const initialTotal = subtotal + ongkir;

  const userPoints = user?.points || 0;
  const maxPointsAllowedToUse = Math.floor(initialTotal * 0.5 / 10); 
  const pointsToUse = Math.min(userPoints, maxPointsAllowedToUse);
  const discountFromPoints = pointsToUse * 10;
  const finalTotal = usePoints ? initialTotal - discountFromPoints : initialTotal;

  const formatRp = (angka: number) => new Intl.NumberFormat('id-ID').format(angka);

  const isiOtomatis = () => {
    setInputNama(user?.name || "");
    setInputPhone(user?.phone_number || ""); 
    setInputAddress(user?.address || ""); 
  };

  const handleSubmit = async (formData: FormData) => {
    if (!paymentMethod) {
      alert("Pilih metode pembayaran terlebih dahulu, Kapten!");
      return;
    }

    setIsPending(true);
    
    formData.append("delivery_option", deliveryOption);
    formData.append("payment_method", paymentMethod);
    formData.append("use_points", usePoints ? "true" : "false");
    formData.append("points_used", usePoints ? pointsToUse.toString() : "0");
    formData.append("points_discount", usePoints ? discountFromPoints.toString() : "0");

    try {
      const res = await processCheckout(formData);
      if (res.success) {
        router.push(`/pembayaran/${res.orderId}`); 
      } else {
        alert(res.error || "Terjadi kesalahan saat memproses pesanan.");
        setIsPending(false);
      }
    } catch (error) {
      alert("Sistem gagal merespon. Coba lagi.");
      setIsPending(false);
    }
  };

  const inputStyle = "w-full px-5 py-4 bg-amber-50/30 border-2 border-amber-100/80 rounded-[1.25rem] outline-none focus:border-amber-400 focus:ring-[4px] focus:ring-amber-500/10 transition-all duration-300 text-amber-950 placeholder:text-amber-900/30 font-medium shadow-inner";
  const labelStyle = "block text-[10px] font-black text-amber-900/60 uppercase tracking-widest mb-2";

  const deliveryOptions = [
    { id: "diantar", label: "Kurir Lokal Wulita (Diantar - Rp 15.000)" },
    { id: "diambil", label: "Ambil Sendiri di Pangkalan (Gratis)" }
  ];
  
  const paymentOptions = [
    { id: "BCA", label: "Transfer Bank BCA (Manual)" },
    { id: "QRIS", label: "Pindai QRIS (Semua E-Wallet/Bank)" }
  ];

  return (
    <form action={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-12 items-start">
      <div className="lg:col-span-2 space-y-8">
        
        <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-amber-100/50 shadow-2xl shadow-amber-900/5 relative z-20">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
            <h2 className="text-2xl font-black text-amber-950 tracking-tight">Detail Ekspedisi</h2>
            <button type="button" onClick={isiOtomatis} className="text-xs font-black tracking-widest uppercase text-amber-700 bg-amber-50 border-2 border-amber-100 px-5 py-2.5 rounded-2xl hover:bg-amber-100 transition-all flex items-center justify-center gap-2 group">
              <Sparkles size={14} className="text-amber-500 group-hover:scale-110 transition-transform" /> Gunakan Data Profil
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className={labelStyle}>Nama Penerima *</label>
              <input required name="recipient_name" value={inputNama} onChange={e => setInputNama(e.target.value)} placeholder="Contoh: Budi Santoso" className={inputStyle} />
            </div>
            <div>
              <label className={labelStyle}>Nomor WhatsApp *</label>
              <input required name="phone_number" value={inputPhone} onChange={e => setInputPhone(e.target.value)} placeholder="0812xxxx" className={inputStyle} />
            </div>
          </div>

          <div className="mb-6 relative">
            <label className={labelStyle}>Opsi Pengiriman *</label>
            
            <div 
              onClick={() => setIsDeliveryOpen(!isDeliveryOpen)}
              className={`${inputStyle} cursor-pointer flex justify-between items-center group relative z-20 ${isDeliveryOpen ? 'border-amber-400 ring-[4px] ring-amber-500/10' : ''}`}
            >
              <span className="text-amber-950 font-bold truncate pr-4">
                {deliveryOptions.find(opt => opt.id === deliveryOption)?.label}
              </span>
              <ChevronDown className={`text-amber-900/40 group-hover:text-amber-600 transition-all duration-300 ${isDeliveryOpen ? 'rotate-180 text-amber-600' : ''}`} size={20} />
            </div>

            {isDeliveryOpen && <div className="fixed inset-0 z-10" onClick={() => setIsDeliveryOpen(false)}></div>}

            {isDeliveryOpen && (
              <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-[1.25rem] border border-amber-100 shadow-xl shadow-amber-900/10 overflow-hidden z-30 animate-in fade-in slide-in-from-top-2 duration-200">
                {deliveryOptions.map((opt) => (
                  <div 
                    key={opt.id}
                    onClick={() => { setDeliveryOption(opt.id); setIsDeliveryOpen(false); }}
                    className="px-5 py-4 cursor-pointer flex justify-between items-center hover:bg-amber-50/50 transition-colors border-b border-gray-50 last:border-0 group/item"
                  >
                    <span className={`text-sm font-medium transition-colors ${deliveryOption === opt.id ? 'text-amber-950 font-bold' : 'text-amber-900/70 group-hover/item:text-amber-900'}`}>
                      {opt.label}
                    </span>
                    {deliveryOption === opt.id && <Check size={16} className="text-amber-600 animate-in zoom-in duration-200" />}
                  </div>
                ))}
              </div>
            )}
          </div>

          {deliveryOption === "diantar" && (
            <div className="mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
              <label className={labelStyle}>Alamat Lengkap *</label>
              <textarea required name="shipping_address" value={inputAddress} onChange={e => setInputAddress(e.target.value)} rows={3} placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan..." className={inputStyle}></textarea>
            </div>
          )}

          <div>
            <label className={labelStyle}>Catatan Tambahan</label>
            <textarea name="customer_notes" rows={2} placeholder="Cth: Tolong packing yang rapi pakai pita emas..." className={inputStyle}></textarea>
          </div>
        </div>

        <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-amber-100/50 shadow-2xl shadow-amber-900/5 relative z-10">
          <h2 className="text-2xl font-black text-amber-950 tracking-tight mb-6">Metode Pembayaran</h2>
          
          <div className="relative">
            <div 
              onClick={() => setIsPaymentOpen(!isPaymentOpen)}
              className={`${inputStyle} cursor-pointer flex justify-between items-center group relative z-20 ${isPaymentOpen ? 'border-amber-400 ring-[4px] ring-amber-500/10' : ''}`}
            >
              <span className={`font-bold truncate pr-4 ${paymentMethod ? 'text-amber-950' : 'text-amber-900/40'}`}>
                {paymentMethod ? paymentOptions.find(opt => opt.id === paymentMethod)?.label : "-- Pilih Cara Bayar --"}
              </span>
              <ChevronDown className={`text-amber-900/40 group-hover:text-amber-600 transition-all duration-300 ${isPaymentOpen ? 'rotate-180 text-amber-600' : ''}`} size={24} />
            </div>

            {isPaymentOpen && <div className="fixed inset-0 z-10" onClick={() => setIsPaymentOpen(false)}></div>}

            {isPaymentOpen && (
              <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-[1.25rem] border border-amber-100 shadow-xl shadow-amber-900/10 overflow-hidden z-30 animate-in fade-in slide-in-from-top-2 duration-200">
                {paymentOptions.map((opt) => (
                  <div 
                    key={opt.id}
                    onClick={() => { setPaymentMethod(opt.id); setIsPaymentOpen(false); }}
                    className="px-5 py-4 cursor-pointer flex justify-between items-center hover:bg-amber-50/50 transition-colors border-b border-gray-50 last:border-0 group/item"
                  >
                    <span className={`text-sm font-medium transition-colors ${paymentMethod === opt.id ? 'text-amber-950 font-bold' : 'text-amber-900/70 group-hover/item:text-amber-900'}`}>
                      {opt.label}
                    </span>
                    {paymentMethod === opt.id && <Check size={18} className="text-amber-600 animate-in zoom-in duration-200" />}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="lg:col-span-1">
        <div className="bg-gradient-to-b from-[#F3E5DC]/80 to-amber-50 p-8 md:p-10 rounded-[2.5rem] border-2 border-white shadow-2xl shadow-amber-900/10 lg:sticky lg:top-28">
          <h2 className="text-xl font-black text-amber-950 tracking-tight mb-6 flex items-center gap-2">
            Ringkasan Pesanan
          </h2>
          
          <div className="space-y-4 mb-6">
            {validItems.length > 0 ? (
              validItems.map((item) => (
                <div key={item.id} className="flex justify-between text-sm group">
                  <span className="text-amber-900/70 truncate pr-4 font-medium group-hover:text-amber-950 transition-colors">
                    <span className="font-bold text-amber-700">{item.quantity}x</span> {item.product?.name}
                  </span>
                  <span className="font-black text-amber-950 whitespace-nowrap">Rp {formatRp(item.price * item.quantity)}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-amber-900/50 font-bold italic text-center py-4">Palka masih kosong.</p>
            )}
          </div>

          <div className="h-px bg-amber-200/60 w-full mb-6" />
          
          <div className="space-y-3 mb-6 text-sm">
            <div className="flex justify-between text-amber-900/80 font-medium">
              <span>Subtotal</span>
              <span className="font-black text-amber-950">Rp {formatRp(subtotal)}</span>
            </div>
            <div className="flex justify-between text-amber-900/80 font-medium">
              <span>Ongkos Kirim</span>
              <span className="font-black text-amber-950">{ongkir === 0 ? 'Gratis' : `Rp ${formatRp(ongkir)}`}</span>
            </div>
            {usePoints && discountFromPoints > 0 && (
               <div className="flex justify-between text-green-600 animate-in fade-in slide-in-from-bottom-2">
                 <span className="font-bold flex items-center gap-1.5"><Coins size={14}/> Potongan Poin</span>
                 <span className="font-black">- Rp {formatRp(discountFromPoints)}</span>
               </div>
            )}
          </div>

          {userPoints > 0 && (
            <div className="mb-6 p-5 bg-white/60 backdrop-blur-sm rounded-[1.5rem] border border-white shadow-sm flex items-start gap-4 transition-all hover:bg-white">
              <div className="bg-gradient-to-br from-amber-400 to-amber-600 text-white p-2 rounded-xl shadow-md shrink-0">
                <Coins size={20} />
              </div>
              <div className="w-full">
                <p className="font-black text-amber-950 text-sm mb-0.5 tracking-tight">Wulita Rewards</p>
                <p className="text-[11px] font-bold text-amber-900/60 mb-3">
                  Tersedia: <strong className="text-amber-600">{formatRp(userPoints)} Poin</strong>
                </p>
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative flex items-center pt-0.5">
                    <input 
                      type="checkbox" 
                      checked={usePoints} 
                      onChange={(e) => setUsePoints(e.target.checked)}
                      className="peer appearance-none w-5 h-5 border-2 border-amber-200 rounded-lg checked:bg-amber-500 checked:border-amber-500 cursor-pointer transition-all focus:ring-4 focus:ring-amber-500/20"
                    />
                    <svg className="absolute w-5 h-5 text-white p-0.5 opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-xs font-bold text-amber-900/80 leading-tight group-hover:text-amber-950 transition-colors">
                    Pakai <span className="text-amber-600">{pointsToUse} poin</span> untuk potongan Rp {formatRp(discountFromPoints)}
                  </span>
                </label>
              </div>
            </div>
          )}
          
          <div className="flex justify-between items-center mb-8 pt-6 border-t-2 border-dashed border-amber-200/80">
            <span className="text-[10px] font-black tracking-widest uppercase text-amber-900/50">Total Tagihan</span>
            <span className="text-3xl font-black text-amber-950 tracking-tighter">Rp {formatRp(finalTotal)}</span>
          </div>
          
          <button type="submit" disabled={isPending || validItems.length === 0} className="w-full bg-amber-950 text-white py-5 rounded-[1.25rem] font-black tracking-[0.15em] uppercase text-xs hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-900/20 active:translate-y-0 transition-all flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:text-gray-500 disabled:shadow-none disabled:cursor-not-allowed">
            {isPending ? <Loader2 className="animate-spin" /> : "Proses Pembayaran"}
          </button>
        </div>
      </div>
    </form>
  );
}