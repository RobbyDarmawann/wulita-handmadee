import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ReviewListClient from "./ReviewListClient";

export const dynamic = "force-dynamic";

export default async function AdminReviewPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Pastikan login (Bisa tambahkan cek role admin di sini)
  if (!user) redirect("/login");

  // Ambil semua ulasan dengan relasi terkait
  const reviews = await prisma.review.findMany({
    include: {
      user: { select: { name: true } },
      product: { select: { name: true, slug: true } },
    },
    orderBy: { createdAt: 'desc' }
  });

  // Ambil data OrderItem secara terpisah untuk mencari varian (mirip logika Blade)
  // Kita ambil varian name berdasarkan orderId dan productId yang ada di ulasan
  const orderItems = await prisma.orderItem.findMany({
    where: {
      orderId: { in: reviews.map(r => r.orderId).filter(id => id !== null) as number[] }
    },
    select: {
      orderId: true,
      productId: true,
      variantName: true
    }
  });

  // Gabungkan data varian ke dalam objek review
  const reviewsWithVariants = reviews.map(review => {
    const itemInfo = orderItems.find(item => 
      item.orderId === review.orderId && item.productId === review.productId
    );
    return {
      ...review,
      variantName: itemInfo?.variantName || null
    };
  });

  return (
    <div className="bg-[#FAFAFA] min-h-screen">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Manajemen Ulasan</h1>
          <p className="text-gray-500 font-medium mt-1">Lihat dan balas masukan dari pelanggan setia Wulita Handmade.</p>
        </div>
        
        <ReviewListClient initialReviews={reviewsWithVariants} />
      </main>
    </div>
  );
}