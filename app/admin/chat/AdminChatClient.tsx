"use client";

import Link from "next/link";
import { Send, MessageSquare, ExternalLink, Package, User, Clock } from "lucide-react";
import { sendMessage } from "@/app/chat/actions";
import { useState, useEffect, useRef } from "react";

export default function AdminChatClient({ chatLists, messages, activeUser }: any) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");

  // Auto scroll ke bawah setiap ada pesan baru
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 flex overflow-hidden h-[calc(100vh-140px)] animate-in fade-in duration-500">
      
      {/* SIDEBAR: DAFTAR OBROLAN */}
      <div className="w-1/3 border-r border-gray-100 flex flex-col bg-gray-50/30">
        <div className="p-6 border-b border-gray-100 bg-white">
          <h2 className="font-black text-2xl text-gray-900 tracking-tight flex items-center gap-3">
            <MessageSquare className="text-amber-600" /> Obrolan
          </h2>
        </div>

        <div className="flex-grow overflow-y-auto scrollbar-hide">
          {chatLists.length > 0 ? chatLists.map((c: any) => (
            <Link 
              key={c.userId} 
              href={`/admin/chat?user_id=${c.userId}`}
              className={`flex items-center gap-4 p-5 hover:bg-white transition-all border-b border-gray-50 group ${
                activeUser?.id === c.userId ? 'bg-white border-l-4 border-l-amber-600 shadow-sm' : ''
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-amber-900 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-amber-900/20 group-hover:scale-110 transition-transform">
                {c.user.name[0].toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-bold text-gray-900 truncate">{c.user.name}</h3>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                    <Clock size={10} /> {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-gray-500 truncate font-medium">{c.message}</p>
              </div>
            </Link>
          )) : (
            <div className="p-10 text-center text-gray-400 text-sm font-bold italic opacity-50">Belum ada obrolan masuk.</div>
          )}
        </div>
      </div>

      {/* AREA CHAT UTAMA */}
      <div className="flex-grow flex flex-col bg-white">
        {activeUser ? (
          <>
            {/* Header Aktif User */}
            <div className="px-8 py-5 border-b border-gray-100 flex items-center gap-4 bg-white/80 backdrop-blur-md sticky top-0 z-10">
              <div className="w-10 h-10 rounded-full bg-amber-700 text-white flex items-center justify-center font-black shadow-md">
                {activeUser.name[0].toUpperCase()}
              </div>
              <div>
                <h2 className="font-black text-gray-900 leading-none">{activeUser.name}</h2>
                <p className="text-[10px] text-green-500 font-black uppercase tracking-[0.2em] mt-1 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Pelanggan Aktif
                </p>
              </div>
            </div>

            {/* Area Pesan */}
            <div ref={scrollRef} className="flex-grow overflow-y-auto p-8 space-y-6 bg-[#FAFAFA] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
              {messages.map((m: any) => {
                const isMe = m.sender === 'admin' || m.isFromAdmin;
                return (
                  <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] space-y-2`}>
                      <div className={`p-4 rounded-[1.5rem] shadow-sm relative ${
                        isMe 
                          ? 'bg-amber-900 text-white rounded-tr-none' 
                          : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'
                      }`}>
                        
                        {/* Konteks Produk */}
                        {m.product && !isMe && (
                          <Link href={`/produk/${m.product.slug}`} target="_blank" className="block bg-gray-50 hover:bg-amber-50 rounded-xl p-3 mb-3 border border-gray-200 transition-colors group/prod">
                            <div className="flex items-center gap-3">
                              <img src={m.product.image} className="w-10 h-10 rounded-lg object-cover shadow-sm" />
                              <div>
                                <p className="text-[9px] text-gray-400 uppercase font-black tracking-widest">Bertanya Tentang:</p>
                                <p className="text-xs font-black text-gray-800 line-clamp-1 group-hover/prod:text-amber-700">{m.product.name}</p>
                              </div>
                              <ExternalLink size={12} className="ml-auto text-gray-300" />
                            </div>
                          </Link>
                        )}

                        <p className="text-sm leading-relaxed font-medium">{m.message}</p>
                        <p className={`text-[9px] mt-2 font-black uppercase opacity-50 ${isMe ? 'text-right' : 'text-left'}`}>
                          {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input Area */}
            <div className="p-6 bg-white border-t border-gray-100">
              <form 
                action={async (fd) => { 
                  fd.append("user_id_target", activeUser.id); 
                  await sendMessage(fd); 
                  setInput(""); 
                }} 
                className="flex items-end gap-4 bg-gray-50 p-2 rounded-[2rem] border border-gray-100 focus-within:border-amber-500 focus-within:bg-white transition-all shadow-inner"
              >
                <textarea 
                  name="message" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-grow bg-transparent border-none focus:ring-0 px-5 py-3 text-sm font-medium outline-none resize-none min-h-[50px] max-h-[150px]" 
                  placeholder={`Ketik balasan untuk ${activeUser.name}...`}
                  required
                />
                <button type="submit" className="bg-amber-900 text-white p-4 rounded-full hover:bg-black transition-all shadow-xl shadow-amber-900/20 active:scale-95 group">
                  <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center p-12 text-center text-gray-400 opacity-60">
            <div className="w-24 h-24 bg-amber-50 text-amber-200 rounded-full flex items-center justify-center mb-6 border-2 border-dashed border-amber-100">
              <MessageSquare size={48} />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">Pilih Obrolan</h3>
            <p className="text-sm font-medium max-w-xs">Silakan pilih salah satu pelanggan di sebelah kiri untuk membalas pesan mereka.</p>
          </div>
        )}
      </div>
    </div>
  );
}