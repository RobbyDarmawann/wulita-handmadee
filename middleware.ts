import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return request.cookies.get(name)?.value },
        set(name: string, value: string, options: any) {
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

  // 1. Ambil data user beserta metadatanya
  const { data: { user } } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

  // 2. Tentukan kelompok rute
  const isAdminPath = path.startsWith('/admin')
  const isProtectedPath = ['/dashboard', '/keranjang', '/pesanan', '/chat'].some(p => path.startsWith(p))
  const isAuthPath = path.startsWith('/login') || path.startsWith('/register')

  const userRole = user?.user_metadata?.role || 'user'
  const isAdmin = userRole === 'admin'

  let finalResponse = supabaseResponse

  // --- ATURAN LALU LINTAS BERDASARKAN ROLE 🚦 ---

  // ATURAN 1: Halaman Login & Register
  if (isAuthPath && user) {
    // Jika sudah login, arahkan ke halaman sesuai rolenya masing-masing
    if (isAdmin) {
      finalResponse = NextResponse.redirect(new URL('/admin/dashboard', request.url))
    } else {
      finalResponse = NextResponse.redirect(new URL('/', request.url)) // User biasa ke Beranda
    }
  } 
  
  // ATURAN 2: Halaman Khusus Admin (/admin/...)
  else if (isAdminPath) {
    if (!user) {
      finalResponse = NextResponse.redirect(new URL('/login', request.url))
    } else if (!isAdmin) {
      // Role nya 'user', tapi maksa masuk ke /admin. Tendang keluar!
      finalResponse = NextResponse.redirect(new URL('/', request.url))
    }
  } 
  
  // ATURAN 3: Halaman Khusus Pelanggan (/keranjang, /pesanan, dll)
  else if (isProtectedPath) {
    if (!user) {
      finalResponse = NextResponse.redirect(new URL('/login', request.url))
    } 
    // Jika admin iseng mau masuk ke /keranjang, lempar balik ke dashboard admin
    else if (isAdmin && path.startsWith('/keranjang')) {
      finalResponse = NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }
  }

  // Transfer Cookies agar sesi aman
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