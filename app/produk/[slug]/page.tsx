import prisma from "@/lib/prisma";
import { notFound } from 'next/navigation';
import ProductDetailClient from './ProductInfoClient';
import { createClient } from "@/lib/supabase/server";

export const revalidate = 0; 

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

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

  if (!product) notFound();

  return <ProductDetailClient product={product} userId={user?.id || null} />;
}