import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import OrderDetailClient from "./OrderDetailClient";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const order = await prisma.order.findUnique({
    where: { id: parseInt(id) },
    include: { items: true } // Ambil rincian barang juga
  });

  if (!order) notFound();

  return (
    <div className="bg-[#FAFAFA] min-h-screen">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <OrderDetailClient order={order} />
      </main>
    </div>
  );
}