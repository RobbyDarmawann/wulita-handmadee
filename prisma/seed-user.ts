// prisma/seed-user.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // PAKAI EMAIL AKUN VIP
  const testEmail = 'raja@wulita.com'; 

  console.log('⏳ Mengambil data dari Prisma & Menambahkan Transaksi...');
  
  const user = await prisma.user.findUnique({
    where: { email: testEmail },
  });

  if (!user) {
    console.error('❌ User tidak ditemukan! Pastikan sudah jalankan SQL VIP tadi.');
    return;
  }

  const product = await prisma.product.findFirst();
  
  if (product) {
    console.log(`📦 Menambahkan transaksi untuk: ${user.name}`);

    // Bersihkan data lama
    await prisma.cart.deleteMany({ where: { userId: user.id } });
    await prisma.orderItem.deleteMany({ where: { order: { userId: user.id } } });
    await prisma.order.deleteMany({ where: { userId: user.id } });
    await prisma.review.deleteMany({ where: { userId: user.id } });

    // 1. Masukkan barang ke Keranjang
    await prisma.cart.create({
      data: { userId: user.id, productId: product.id, quantity: 2 }
    });

    // 2. Buatkan histori Order
    await prisma.order.create({
      data: {
        userId: user.id,
        recipient_name: user.name,
        phone_number: user.phone_number || '081299998888',
        address: user.address || 'Istana Gorontalo',
        status: 'COMPLETED',
        total_price: product.price * 2,
        items: {
          create: [{ productId: product.id, product_name: product.name, price: product.price, quantity: 2 }]
        }
      }
    });

    // 3. Buatkan Review
    await prisma.review.create({
      data: { userId: user.id, productId: product.id, rating: 5, comment: 'Sangat memuaskan!' }
    });

    console.log('🎉 SEEDING TRANSAKSI SELESAI!');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());