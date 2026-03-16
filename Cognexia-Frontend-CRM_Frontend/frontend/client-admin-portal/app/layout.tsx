import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import { QueryProvider } from '@/lib/query-client'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { AuthHashHandler } from '@/components/AuthHashHandler'
import { AuthInitializer } from '@/components/AuthInitializer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CognexiaAI Client Admin Portal | CMMI Level 5 Certified',
  description: 'Enterprise-Grade Industry 5.0 ERP Platform - Manage your organization with CMMI Level 5, ISO 27001, and SOC 2 Type II certified infrastructure',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>
          <AuthInitializer />
          <AuthHashHandler />
          {children}
          <Toaster position="top-right" />
          <Sonner />
        </QueryProvider>
      </body>
    </html>
  )
}
