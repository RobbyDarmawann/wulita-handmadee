// app/admin/chat/page.tsx
import prisma from "@/lib/prisma";
import AdminChatClient from "./AdminChatClient";

export default async function AdminChatPage({ searchParams }: any) {
  const { user_id } = await searchParams;

  // 1. Daftar user yang pernah chat
  const chats = await prisma.message.findMany({
    distinct: ['userId'],
    include: { user: true },
    orderBy: { createdAt: 'desc' }
  });

  // 2. Pesan untuk user yang dipilih
  const messages = user_id ? await prisma.message.findMany({
    where: { userId: user_id },
    include: { product: true },
    orderBy: { createdAt: 'asc' }
  }) : [];

  const activeUser = user_id ? await prisma.user.findUnique({ where: { id: user_id } }) : null;

  return (
    <div className="p-6 h-[calc(100vh-100px)]">
      <AdminChatClient chatLists={chats} messages={messages} activeUser={activeUser} />
    </div>
  );
}