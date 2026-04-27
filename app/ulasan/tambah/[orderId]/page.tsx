import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import ReviewFormClient from "./ReviewFormClient";

export const dynamic = "force-dynamic";

export default async function AddReviewPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Ambil data order beserta produknya (Gunakan include untuk mengambil relasi product)
  const order = await prisma.order.findUnique({
    where: { id: parseInt(orderId) },
    include: { 
      items: { 
        include: { 
          product: true 
        } 
      } 
    }
  });

  // Validasi: Jika order tidak ada atau bukan milik user tersebut
  if (!order || order.userId !== user.id) notFound();

  // Cari ID produk yang sudah pernah diulas di order ini agar tidak dobel
  const existingReviews = await prisma.review.findMany({
    where: { 
      orderId: order.id, 
      userId: user.id 
    },
    select: { productId: true }
  });

  const reviewedProductIds = existingReviews.map(r => r.productId);

  return (
    <div className="bg-[#FAFAFA] min-h-screen py-12">
      <main className="max-w-3xl mx-auto px-4">
        
        {/* Header Kembali ke Dashboard */}
        <div className="mb-8">
          <Link href="/pesanan" className="text-sm font-bold text-amber-700 hover:text-amber-900 mb-4 inline-block transition-colors">
            &larr; Kembali ke Pesanan Saya
          </Link>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Nilai Pesanan #{order.id}</h1>
          <p className="text-gray-500 mt-1 font-medium">Bagikan pengalamanmu memakai kerajinan tangan dari kami.</p>
        </div>

        {/* List Produk yang akan diulas */}
        <div className="space-y-8">
          {order.items.map((item) => (
            <ReviewFormClient 
              key={item.id} 
              item={item} 
              orderId={order.id} 
              isReviewed={reviewedProductIds.includes(item.productId ?? 0)} 
            />
          ))}
        </div>
      </main>
    </div>
  );
}