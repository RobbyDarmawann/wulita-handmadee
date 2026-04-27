import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PaymentClient from "./PaymentClient";

export const dynamic = "force-dynamic";

export default async function PaymentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const order = await prisma.order.findUnique({
    where: { id: parseInt(id) } // id integer sesuai skema baru
  });

  if (!order || order.userId !== user.id) notFound();

  return (
    <div className="bg-[#FAFAFA] min-h-screen">
      <main className="max-w-3xl mx-auto px-4 py-12">
        <PaymentClient order={order} />
      </main>
    </div>
  );
}