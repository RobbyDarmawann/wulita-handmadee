// app/chat/page.tsx (Server Component)
import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ChatClient from "./ChatClient.tsx";

export default async function ChatPage({ searchParams }: { searchParams: Promise<{ product_id?: string }> }) {
  const { product_id } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const messages = await prisma.message.findMany({
    where: { userId: user.id },
    include: { product: true },
    orderBy: { createdAt: 'asc' }
  });

  const product = product_id ? await prisma.product.findUnique({ where: { id: parseInt(product_id) } }) : null;
  const isEscalated = messages.some(m => m.isEscalated);

  return (
    <main className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4">
      <ChatClient 
        initialMessages={messages} 
        productContext={product} 
        isEscalated={isEscalated} 
      />
    </main>
  );
}