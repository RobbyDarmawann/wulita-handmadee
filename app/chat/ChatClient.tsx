"use client";

import { useEffect, useRef, useState } from "react";
// PERHATIKAN: Saya tambahkan revertToBot di import
import { sendMessage, escalateToAdmin, revertToBot } from "./actions";
import { Send, X, Headphones, Bot, User, ChevronRight, Power } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ChatClient({ initialMessages, productContext, isEscalated }: any) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [msg, setMsg] = useState("");
  const [activeProduct, setActiveProduct] = useState(productContext);
  const [isEndingSession, setIsEndingSession] = useState(false);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [initialMessages]);

  const handleEndSession = async () => {
    setIsEndingSession(true);
    await revertToBot();
    setIsEndingSession(false);
    router.refresh();
  };

  return (
    <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden flex flex-col h-[700px] relative animate-in zoom-in-95 duration-300">
      
      {/* Header Premium */}
      <div className="bg-amber-950 p-6 flex items-center gap-4 relative z-10">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none"></div>
        <div className="w-12 h-12 bg-white rounded-2xl p-1.5 shadow-xl rotate-3 group flex-shrink-0">
          <img src="/images/logo.png" className="w-full h-full object-contain -rotate-3" />
        </div>
        <div className="relative z-10 flex-grow">
          <h2 className="text-white font-black text-lg tracking-tight">Wulita Care</h2>
          <p className="text-amber-400 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-1.5 mt-0.5">
            <span className={`w-2 h-2 rounded-full animate-pulse ${isEscalated ? 'bg-red-400' : 'bg-green-400'}`}></span>
            {isEscalated ? 'Admin Online' : 'Asisten Otomatis'}
          </p>
        </div>
      </div>

      {/* Daftar Pesan */}
      <div ref={scrollRef} className="flex-grow overflow-y-auto p-6 space-y-6 bg-gray-50/50 scrollbar-hide">
        
        {/* Welcome Message */}
        <div className="flex justify-start">
          <div className="bg-white border border-gray-100 shadow-sm px-5 py-3 rounded-2xl rounded-tl-none max-w-[85%] animate-in slide-in-from-left duration-500">
            <p className="text-[10px] font-black text-amber-600 mb-1 uppercase tracking-widest">🤖 Wulita Assistant</p>
            <p className="text-sm font-medium text-gray-700 leading-relaxed">Halo Kak! Selamat datang di Wulita Handmade. Ada yang bisa kami bantu? 😊</p>
          </div>
        </div>

        {initialMessages.map((m: any) => {
          const isUser = m.sender === 'user';
          return (
            <div key={m.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in duration-300`}>
              <div className={`max-w-[85%] space-y-1.5`}>
                <div className={`p-4 rounded-2xl shadow-sm relative ${
                  isUser 
                    ? 'bg-amber-900 text-white rounded-tr-none' 
                    : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'
                }`}>
                  {!isUser && <p className="text-[9px] font-black text-amber-600 mb-1 uppercase tracking-[0.2em]">{m.sender}</p>}
                  <p className="text-sm leading-relaxed font-medium">{m.message}</p>
                  
                  {/* Tombol Escalation dari Bot */}
                  {m.sender === 'bot' && !isEscalated && (
                    <div className="mt-4 pt-3 border-t border-gray-50 flex flex-col gap-2">
                      <p className="text-[10px] font-bold text-gray-400">Belum membantu?</p>
                      <button 
                        onClick={() => escalateToAdmin()} 
                        className="w-full py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-amber-200 flex items-center justify-center gap-2"
                      >
                        <Headphones size={14} /> Hubungi Admin (Manusia)
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input Area */}
      <div className="p-6 bg-white border-t border-gray-100 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
        
        {/* BANNER AKTIF ADMIN (BARU) */}
        {isEscalated && (
          <div className="mb-4 bg-red-50 p-3 rounded-2xl border border-red-100 flex items-center justify-between group animate-in slide-in-from-bottom-2 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-red-500 shadow-sm">
                <Headphones size={14} />
              </div>
              <div className="min-w-0 pr-2">
                <p className="text-[9px] font-black text-red-800 uppercase tracking-widest">Sesi Admin Aktif</p>
                <p className="text-[10px] font-bold text-red-900/60 leading-tight mt-0.5">Pesan dibalas manual.</p>
              </div>
            </div>
            <button 
              onClick={handleEndSession} 
              disabled={isEndingSession}
              className="px-3 py-2 bg-white text-red-600 border border-red-200 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-sm flex items-center gap-1 flex-shrink-0 disabled:opacity-50"
            >
              <Power size={12} /> {isEndingSession ? '...' : 'Akhiri'}
            </button>
          </div>
        )}

        {activeProduct && !isEscalated && (
          <div className="mb-4 bg-amber-50 p-3 rounded-2xl border border-amber-100 flex items-center justify-between group animate-in slide-in-from-bottom-2">
            <div className="flex items-center gap-3">
              <img src={activeProduct.image} className="w-10 h-10 rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform" />
              <div className="min-w-0">
                <p className="text-[9px] font-black text-amber-800 uppercase tracking-widest">Tanya Produk:</p>
                <p className="text-xs font-bold text-gray-900 truncate w-40">{activeProduct.name}</p>
              </div>
            </div>
            <button onClick={() => setActiveProduct(null)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
              <X size={16} />
            </button>
          </div>
        )}

        <form action={async (fd) => { await sendMessage(fd); setMsg(""); }} className="flex gap-3 items-end">
          <input type="hidden" name="product_id" value={activeProduct?.id || ""} />
          <textarea 
            name="message" 
            value={msg} 
            onChange={(e) => setMsg(e.target.value)}
            required
            rows={1}
            placeholder={isEscalated ? "Tulis pesan untuk Admin..." : "Tanya stok atau info ke Bot..."}
            className="flex-grow rounded-[1.5rem] border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-transparent px-5 py-3.5 text-sm font-medium resize-none outline-none transition-all shadow-inner"
            onInput={(e: any) => {
                e.target.style.height = 'auto';
                e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
            }}
          />
          <button type="submit" className="bg-amber-900 text-white rounded-full aspect-square w-12 h-12 flex items-center justify-center hover:bg-black transition-all shadow-xl shadow-amber-900/20 active:scale-90 flex-shrink-0 group">
            <Send size={20} className="ml-1 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </button>
        </form>
      </div>
    </div>
  );
}