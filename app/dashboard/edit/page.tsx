import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import EditProfileClient from "./EditProfileClient";

export const dynamic = "force-dynamic";

export default async function EditProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser) redirect("/login");

  return (
    <div className="bg-[#FAFAFA] min-h-screen text-gray-800">
      <main className="max-w-xl mx-auto px-4 py-12">
        <EditProfileClient user={dbUser} />
      </main>
    </div>
  );
}