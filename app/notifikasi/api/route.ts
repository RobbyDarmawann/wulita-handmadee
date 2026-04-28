import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (body.action === 'markAsRead') {
      const id = Number(body.id);
      if (!id) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
      await prisma.Notification.updateMany({ where: { id, userId: user.id }, data: { isRead: true } });
      return NextResponse.json({ success: true });
    }

    if (body.action === 'markAll') {
      await prisma.Notification.updateMany({ where: { userId: user.id, isRead: false }, data: { isRead: true } });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Bad action' }, { status: 400 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
