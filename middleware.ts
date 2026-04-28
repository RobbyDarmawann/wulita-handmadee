import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Setup response bawaan
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return request.cookies.get(name)?.value },
        set(name: string, value: string, options: any) {
          // Pastikan cookie juga di-set di request agar bisa dibaca langsung
          request.cookies.set({ name, value, ...options })
          supabaseResponse = NextResponse.next({ request })
          supabaseResponse.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          request.cookies.set({ name, value: '', ...options })
          supabaseResponse = NextResponse.next({ request })
          supabaseResponse.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // 1. Ambil data user (sekaligus me-refresh sesi jika hampir kedaluwarsa)
  const { data: { user } } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

  // 2. Tentukan kelompok rute
  const isAdminPath = path.startsWith('/admin')
  const isProtectedPath = ['/dashboard', '/keranjang', '/pesanan', '/chat'].some(p => path.startsWith(p))
  const isAuthPath = path.startsWith('/login') || path.startsWith('/register')

  // 3. Deteksi Admin (Sesuai dengan logika email di Navbar Kapten)
  const isAdmin = user?.email === 'admin@wulita.com'

  let finalResponse = supabaseResponse

  // --- ATURAN LALU LINTAS 🚦 ---

  // ATURAN 1: Halaman Login & Register
  if (isAuthPath && user) {
    // Jika sudah login tapi iseng buka halaman /login, tendang ke area masing-masing
    finalResponse = NextResponse.redirect(new URL(isAdmin ? '/admin/dashboard' : '/', request.url))
  } 
  
  // ATURAN 2: Halaman Khusus Admin (/admin/...)
  else if (isAdminPath) {
    if (!user) {
      // Penumpang gelap (belum login), lempar ke login
      finalResponse = NextResponse.redirect(new URL('/login', request.url))
    } else if (!isAdmin) {
      // Sudah login tapi bukan admin (User biasa nyasar), lempar ke Beranda
      finalResponse = NextResponse.redirect(new URL('/', request.url))
    }
  } 
  
  // ATURAN 3: Halaman Khusus User Tertentu (/keranjang, /pesanan, /chat, /dashboard)
  else if (isProtectedPath && !user) {
    // Belum login tapi mau buka keranjang/pesanan
    finalResponse = NextResponse.redirect(new URL('/login', request.url))
  }

  // --- KUNCI PENTING: TRANSFER COOKIES ---
  // Jika terjadi pengalihan rute (redirect), kita harus memastikan cookie sesi 
  // yang baru saja direfresh oleh Supabase tidak hilang/tertinggal.
  if (finalResponse !== supabaseResponse) {
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      finalResponse.cookies.set(cookie.name, cookie.value)
    })
  }

  return finalResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}