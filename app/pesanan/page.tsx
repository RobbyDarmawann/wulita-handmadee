import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PesananClient from "./PesananClient";

export const dynamic = "force-dynamic";

export default async function RiwayatPesananPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Ambil semua pesanan beserta item produk di dalamnya
  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    include: { 
      items: {
        include: { product: true } // Supaya gambar produk bisa muncul
      } 
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="bg-[#FAFAFA] min-h-screen">
      <main className="max-w-5xl mx-auto px-4 py-12">
        <PesananClient orders={orders} />
      </main>
    </div>
  );
}