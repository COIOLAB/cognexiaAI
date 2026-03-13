import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CognexiaAI Super Admin Portal | CMMI Level 5 Certified',
  description: 'Enterprise-Grade Industry 5.0 ERP Super Administration - Manage multi-tenant platform with CMMI Level 5, ISO 27001, and SOC 2 Type II certified infrastructure',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
