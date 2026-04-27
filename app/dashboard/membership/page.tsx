import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import MembershipClient from "./MembershipClient";

export const dynamic = "force-dynamic";

export default async function MembershipPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser) redirect("/login");

  const completedOrders = await prisma.order.count({
    where: { userId: user.id, status: 'pesanan selesai' }
  });

  return (
    <div className="bg-[#FAFAFA] min-h-screen">
      <main className="max-w-4xl mx-auto px-4 py-12">
        <MembershipClient user={dbUser} completedOrders={completedOrders} />
      </main>
    </div>
  );
}