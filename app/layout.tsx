import { Poppins } from "next/font/google";
import Navbar from "@/components/Navbar";
import { ToastProvider, ToastContainer } from "@/context/ToastContext";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
  display: "swap",
});

// Client component untuk pathname logic

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className={`${poppins.variable} font-sans antialiased`}>
        <ToastProvider>
          <Navbar />
          <main>{children}</main>
          <ToastContainer />
        </ToastProvider>
      </body>
    </html>
  );
}