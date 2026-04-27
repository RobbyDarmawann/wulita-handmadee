import { MapPin, Sparkles, Heart, Award } from "lucide-react";

export const metadata = {
  title: "Tentang Kami - Wulita Handmade",
  description: "Dedikasi kami dalam melestarikan kerajinan tangan autentik dengan sentuhan modern.",
};

export default function TentangKamiPage() {
  return (
    <div className="bg-[#FAFAFA] text-gray-800 antialiased min-h-screen">
      <main>
        {/* HERO SECTION */}
        <section className="bg-amber-950 py-24 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          <div className="max-w-4xl mx-auto px-4 relative z-10">
            <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
              Cerita di Balik <span className="text-amber-500 underline decoration-amber-500/30">Wulita</span>
            </h1>
            <p className="text-amber-100 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto font-medium">
              Dedikasi kami dalam melestarikan kerajinan tangan autentik dengan sentuhan modern untuk setiap sudut hunian Anda.
            </p>
          </div>
        </section>

        {/* VISI MISI SECTION */}
        <section className="max-w-6xl mx-auto px-4 py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="relative group">
              <div className="aspect-square bg-amber-100 rounded-[3.5rem] overflow-hidden shadow-2xl rotate-3 transition-transform duration-700 group-hover:rotate-0">
                {/* Menggunakan Logo sebagai visual utama */}
                <img 
                  src="/images/logo.png" 
                  alt="Wulita Handmade Logo"
                  className="w-full h-full object-cover -rotate-3 scale-110 group-hover:rotate-0 group-hover:scale-100 transition-all duration-700"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-white p-8 rounded-3xl shadow-2xl hidden lg:block border border-gray-100 animate-bounce-slow">
                <p className="text-amber-900 font-black text-3xl">100%</p>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Handmade</p>
              </div>
            </div>

            <div className="space-y-8">
              <div className="inline-block px-5 py-2 bg-amber-100 text-amber-800 rounded-full text-xs font-black uppercase tracking-widest">
                Visi & Misi
              </div>
              <h2 className="text-4xl font-black text-gray-900 leading-tight tracking-tight">
                Membangun Keindahan Dari <br />
                <span className="text-amber-700">Tangan Terampil</span>
              </h2>
              
              <div className="text-gray-600 space-y-6 leading-relaxed text-lg">
                <p>
                  Wulita Handmade bermula dari sebuah garasi kecil dengan mimpi besar untuk memperkenalkan keindahan kerajinan tangan lokal ke dunia yang lebih luas. Setiap anyaman, setiap jahitan, dan setiap detail yang kami buat adalah bentuk penghargaan kami terhadap seni tradisional.
                </p>
                <p>
                  Kami percaya bahwa barang buatan tangan memiliki &quot;jiwa&quot; yang tidak bisa digantikan oleh mesin pabrikan. Itulah mengapa kami selalu memastikan kualitas material terbaik dan proses pengerjaan yang teliti untuk setiap pelanggan kami.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-8 border-t border-gray-100">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-700 flex-shrink-0">
                    <Sparkles size={24} />
                  </div>
                  <div>
                    <h4 className="font-black text-gray-900 uppercase text-xs tracking-wider">Bahan Alami</h4>
                    <p className="text-sm text-gray-500 mt-1 font-medium">Menggunakan material pilihan dari alam.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-700 flex-shrink-0">
                    <Heart size={24} />
                  </div>
                  <div>
                    <h4 className="font-black text-gray-900 uppercase text-xs tracking-wider">Kustomisasi</h4>
                    <p className="text-sm text-gray-500 mt-1 font-medium">Pesanan bisa disesuaikan dengan keinginan Anda.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* WORKSHOP & MAPS */}
        <section className="bg-white py-24 border-t border-gray-100">
          <div className="max-w-5xl mx-auto px-4 text-center">
            <h3 className="text-3xl font-black text-gray-900 mb-10 tracking-tight">Kunjungi Workshop Kami</h3>
            
            <div className="rounded-[3rem] overflow-hidden shadow-2xl border-[12px] border-white group relative h-[500px]">
              {/* Maps Iframe */}
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.658257053531!2d123.0371661!3d0.5592813!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x327ed46006427db9%3A0x67398e09e30a574d!2sJl.%20Beringin%2C%20Tuladenggi%2C%20Kec.%20Dungingi%2C%20Kota%20Gorontalo%2C%20Gorontalo!5e0!3m2!1sid!2sid!4v1700000000000!5m2!1sid!2sid"
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                className="grayscale hover:grayscale-0 transition-all duration-1000"
              ></iframe>
            </div>

            <div className="mt-12 space-y-3">
              <div className="flex items-center justify-center gap-3 text-amber-900">
                <MapPin className="w-8 h-8" />
                <span className="font-black text-2xl tracking-tight">Workshop Wulita Handmade</span>
              </div>
              <p className="text-gray-500 text-lg font-medium">
                Jl. Beringin, Kel. Tuladenggi, Kec. Dungingi, Gorontalo, Indonesia
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-400 font-black tracking-[0.2em] uppercase">
            © 2026 Wulita Handmade. Crafting with Love.
          </p>
        </div>
      </footer>
    </div>
  );
}