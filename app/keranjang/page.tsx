import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import KeranjangClient from "./KeranjangClient";

// PAKSA HALAMAN SELALU AMBIL DATA TERBARU
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CartPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Ambil data keranjang asli
  const cartItems = await prisma.cart.findMany({
    where: { userId: user.id },
    include: {
      product: {
        select: {
          name: true,
          image: true,
          slug: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="bg-[#FAFAFA] min-h-screen text-gray-800">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-black text-gray-900 mb-8 uppercase tracking-tighter">
          Keranjang Pusaka
        </h1>
        <KeranjangClient initialItems={cartItems} />
      </main>
    </div>
  );
}