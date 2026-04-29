import prisma from "@/lib/prisma";
import { notFound } from 'next/navigation';
import ProductDetailClient from './ProductInfoClient';
import { createClient } from "@/lib/supabase/server";

export const revalidate = 3600; // Cache 1 jam untuk performance di Vercel

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  try {
    // Fetch user dengan error handling
    let userId: string | null = null;
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.auth.getUser();
      
      if (!error && data?.user?.id) {
        userId = data.user.id;
      }
    } catch (authError) {
      console.error('Auth error:', authError);
      // Lanjut tanpa user - tidak perlu crash halaman
    }

    // Fetch product dengan error handling
    const product = await prisma.product.findUnique({
      where: { slug: slug },
      include: {
        category: true,
        variants: true, 
        reviews: {
          include: { user: true },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!product) {
      notFound();
    }

    return <ProductDetailClient product={product} userId={userId} />;
  } catch (error) {
    console.error('Error loading product page:', error);
    throw error; // Lempar error ke Error Boundary
  }
}