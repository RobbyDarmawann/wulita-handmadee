"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function NavbarWrapper() {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith("/admin");

  return !isAdminPage ? <Navbar /> : null;
}
