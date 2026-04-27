import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";

export const dynamic = "force-dynamic";

export default async function ProfileDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id }
  });

  if (!dbUser) redirect("/login");

  // Hitung jumlah pesanan selesai untuk progress level
  const completedOrders = await prisma.order.count({
    where: { 
      userId: user.id,
      status: 'pesanan selesai' 
    }
  });

  return (
    <div className="bg-[#FAFAFA] min-h-screen">
      <main className="max-w-3xl mx-auto px-4 py-12">
        <DashboardClient user={dbUser} completedOrders={completedOrders} />
      </main>
    </div>
  );
}