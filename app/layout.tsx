"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Tentukan apakah halaman saat ini adalah bagian dari Admin Panel
  // Kita cek apakah URL-nya dimulai dengan "/admin"
  const isAdminPage = pathname.startsWith("/admin");

  return (
    <html lang="id">
      <body className="antialiased">
        {/* Tampilkan Navbar HANYA jika BUKAN halaman admin */}
        {!isAdminPage && <Navbar />}
        
        <main>{children}</main>
      </body>
    </html>
  );
}