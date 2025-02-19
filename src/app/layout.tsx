import type { Metadata } from "next";
import "./globals.css";
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/contexts/AuthContext';
import { ClientLayout } from '@/components/ClientLayout';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: "SubsWise - Subscription Management",
  description: "Track and manage all your subscriptions in one place",
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <ClientLayout>{children}</ClientLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
