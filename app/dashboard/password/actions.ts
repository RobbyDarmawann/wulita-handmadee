"use server";

import { createClient } from "@/lib/supabase/server";

export async function updatePassword(formData: FormData) {
  try {
    const supabase = await createClient();
    
    const newPassword = formData.get("password") as string;
    const confirmPassword = formData.get("password_confirmation") as string;

    if (newPassword !== confirmPassword) {
      return { success: false, error: "Password baru dan konfirmasi tidak cocok!" };
    }

    if (newPassword.length < 6) {
      return { success: false, error: "Password minimal 6 karakter." };
    }

    // Update password via Supabase Auth
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: "Terjadi kesalahan sistem." };
  }
}