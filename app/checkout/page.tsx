// FILE: app/checkout/page.tsx
import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import CheckoutClient from "./CheckoutClient";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Ambil data profil user untuk isi otomatis
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });

  // Ambil data keranjang
  const cartItems = await prisma.cart.findMany({
    where: { userId: user.id },
    include: { product: true },
  });

  // Cegah masuk kalau keranjang kosong
  if (cartItems.length === 0) {
    redirect("/keranjang");
  }

  return (
    <div className="bg-[#FAFAFA] min-h-screen">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-black text-gray-900 mb-8">Pengiriman & Pembayaran</h1>
        
        {/* Di sini kita lempar data dari server ke Client Component */}
        <CheckoutClient cartItems={cartItems} user={dbUser} />
      </main>
    </div>
  );
}