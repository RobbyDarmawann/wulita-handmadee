"use server";

import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Sesi tidak valid." };

    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const address = formData.get("address") as string;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        name: name,
        phone_number: phone, // Sesuaikan dengan schema Kapten (phone_number)
        address: address,
      }
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/edit");
    return { success: true };
  } catch (error: any) {
    console.error("Gagal update profil:", error.message);
    return { success: false, error: "Gagal memperbarui profil." };
  }
}