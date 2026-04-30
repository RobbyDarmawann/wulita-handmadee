import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PesananListClient from "./PesananListClient";

// PENTING: Ganti force-dynamic dengan revalidate untuk mengurangi connection pool hits
// force-dynamic membuat SETIAP request fetch database baru (paling boros koneksi)
// revalidate 30s: cache 30 detik, cukup untuk user experience tapi tidak membanjiri database
export const revalidate = process.env.NODE_ENV === 'production' ? 30 : 0;

export default async function AdminPesananPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");
  // Opsional: Cek apakah user adalah admin

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="bg-[#FAFAFA] min-h-screen">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <PesananListClient initialOrders={orders} />
      </main>
    </div>
  );
}