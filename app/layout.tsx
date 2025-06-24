import { Inter } from 'next/font/google'
import './globals.css'
import ThemeInitializer from '@/components/ui/ThemeInitializer'
import ClientLayout from '@/components/ui/ClientLayout'
import '@/lib/service-worker' // Register service worker

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#3B82F6" />
        <title>Review Response Generator</title>
        <meta name="description" content="AI-powered review response generator for businesses" />
      </head>
      <body className={inter.className}>
        <ThemeInitializer />
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  )
} 