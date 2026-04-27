import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PasswordClient from "./PasswordClient";

export const dynamic = "force-dynamic";

export default async function PasswordPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="bg-[#FAFAFA] min-h-screen text-gray-800">
      <main className="max-w-xl mx-auto px-4 py-12">
        <PasswordClient />
      </main>
    </div>
  );
}