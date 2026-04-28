"use client";

import { usePathname } from "next/navigation";
import { Poppins } from "next/font/google";
import Navbar from "@/components/Navbar";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"], // Ambil semua ketebalan
  variable: "--font-poppins", // Buat variabel CSS
});
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
    <html lang="id" className={poppins.className}>
      <body className="antialiased">
        {/* Tampilkan Navbar HANYA jika BUKAN halaman admin */}
        {!isAdminPage && <Navbar />}
        
        <main>{children}</main>
      </body>
    </html>
  );
}