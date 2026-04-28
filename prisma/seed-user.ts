import { PrismaClient } from '@prisma/client'
import { createClient } from '@supabase/supabase-js'

const prisma = new PrismaClient()

// Menggunakan Service Role Key untuk bypass sistem keamanan Supabase
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function main() {
  console.log('⚓ Memulai proses Seeding...')

  const emailAdmin = 'adminwulita@gmail.com'
  const passwordAdmin = 'password123'

  // 1. BUAT AKUN DI SUPABASE AUTH
  console.log('1. Membuat akun di Supabase Auth...')
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: emailAdmin,
    password: passwordAdmin,
    email_confirm: true, // Otomatis terkonfirmasi
    user_metadata: {
      name: 'Admin Wulita',
      role: 'admin' // <-- KUNCI UTAMA AGAR DIBACA MIDDLEWARE SEBAGAI ADMIN
    }
  })

  if (authError) {
    if (authError.message.includes('already registered')) {
      console.log('⚠️ Akun Supabase Auth sudah ada, lanjut ke sinkronisasi Prisma...')
    } else {
      console.error('❌ Gagal membuat akun Supabase:', authError.message)
      return
    }
  } else {
    console.log('✅ Akun Supabase Auth berhasil dibuat!')
  }

  // Ambil ID user dari authData jika baru dibuat, atau cari secara manual jika sudah ada
  let userId = authData?.user?.id
  if (!userId) {
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
    const foundUser = existingUsers.users.find(u => u.email === emailAdmin)
    userId = foundUser?.id
  }

  // 2. SINKRONISASI KE TABEL PUBLIC (PRISMA)
  if (userId) {
    console.log('2. Sinkronisasi data ke database Prisma...')
    const user = await prisma.user.upsert({
      where: { email: emailAdmin },
      update: {
        name: 'Admin Wulita',
      },
      create: {
        id: userId, // Pastikan ID di public tabel SAMA PERSIS dengan ID Auth
        email: emailAdmin,
        name: 'Admin Wulita',
      }
    })
    console.log('✅ Akun Prisma berhasil disinkronkan!')
    console.table([user])
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })