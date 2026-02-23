import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { createClient } from '@/lib/supabase/server'

export async function generateMetadata(): Promise<Metadata> {
  let faviconUrl = '/favicon.ico'

  try {
    const supabase = await createClient()
    const { data } = await supabase.from('site_settings').select('logo_url').eq('id', 'main').single()
    if (data?.logo_url) {
      faviconUrl = data.logo_url
    }
  } catch {
    // fallback to default favicon
  }

  return {
    title: {
      default: 'Pet Story Club — ร้านสินค้าสัตว์เลี้ยงออนไลน์',
      template: '%s | Pet Story Club',
    },
    description: 'ช้อปสินค้าสัตว์เลี้ยงคุณภาพดี ส่งตรงถึงบ้าน — อาหาร ของเล่น เครื่องนอน และอีกมากมาย',
    keywords: 'สัตว์เลี้ยง, สินค้าสัตว์เลี้ยง, ร้านสัตว์เลี้ยง, อาหารสัตว์, ของเล่นสัตว์',
    icons: {
      icon: faviconUrl,
      shortcut: faviconUrl,
      apple: faviconUrl,
    },
    openGraph: {
      title: 'Pet Story Club',
      description: 'ร้านค้าออนไลน์สำหรับสัตว์เลี้ยงครบวงจร',
      type: 'website',
      locale: 'th_TH',
    },
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Prompt:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#fff',
              color: '#0f172a',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
              fontSize: '14px',
            },
            success: {
              iconTheme: { primary: '#f97316', secondary: '#fff' },
            },
          }}
        />
      </body>
    </html>
  )
}
