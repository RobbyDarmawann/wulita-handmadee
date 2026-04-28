import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import NotifikasiClient from "./NotifikasiClient";

export const dynamic = "force-dynamic";

export default async function NotifikasiPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Ambil semua notifikasi user, yang terbaru di atas
  const notifications = await prisma.Notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="bg-[#FAFAFA] min-h-screen pb-20">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <NotifikasiClient initialNotifications={notifications} />
      </main>
    </div>
  );
}