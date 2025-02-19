import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/contexts/AuthContext';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: "SubWise - Subscription Management",
  description: "Track and manage all your subscriptions in one place",
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
