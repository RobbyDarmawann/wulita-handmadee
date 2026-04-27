import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('Sedang menghapus data lama (optional)...')
  
  // 1. Upsert Kategori
  const category = await prisma.category.upsert({
    where: { slug: 'gelang' },
    update: {},
    create: {
      name: 'Gelang',
      slug: 'gelang',
      image: 'gelang-kategori.jpg'
    },
  })

  // 2. Upsert Produk & Variant
  const product = await prisma.product.upsert({
    where: { slug: 'gelang-karawo-etnik-gorontalo' },
    update: {},
    create: {
      name: 'Gelang Karawo Etnik Gorontalo',
      slug: 'gelang-karawo-etnik-gorontalo',
      price: 125000,
      stock: 50,
      image: 'gelang-utama.jpg',
      description: 'Gelang handmade premium khas Gorontalo dengan sulaman Karawo autentik.',
      categoryId: category.id,
      variants: {
        create: [
          { 
            name: 'Deep Red Gold', 
            additional_price: 25000, 
            price: 150000, 
            stock: 20, 
            image: 'variant-red.jpg' 
          },
          { 
            name: 'Ocean Blue Silver', 
            additional_price: 0, 
            price: 125000, 
            stock: 30, 
            image: 'variant-blue.jpg' 
          },
        ]
      }
    }
  })

  console.log('✅ Seeding berhasil! Data produk dan varian sudah masuk.');
}

main()
  .catch((e) => {
    console.error('❌ Error saat seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })