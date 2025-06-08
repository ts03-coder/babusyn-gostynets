import { Suspense } from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Footer from "@/components/footer";
import Header from "@/components/header";
import { Toaster } from "@/components/ui/sonner"
import { CartProvider } from "@/lib/CartContext";

const inter = Inter({ subsets: ["latin", "cyrillic"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL('https://babusyn-gostynets.vercel.app'),
  title: {
    default: 'Бабусин Гостинець - Інтернет-магазин',
    template: '%s | Бабусин Гостинець'
  },
  description: 'Інтернет-магазин Бабусин Гостинець - широкий вибір товарів за доступними цінами. Швидка доставка по всій Україні.',
  keywords: ['інтернет-магазин', 'мясні продукти', 'свіже м\'ясо', 'доставка', 'акції', 'знижки'],
  authors: [{ name: 'Бабусин Гостинець' }],
  creator: 'Бабусин Гостинець',
  publisher: 'Бабусин Гостинець',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'uk_UA',
    url: 'https://babusyn-gostynets.vercel.app',
    siteName: 'Бабусин Гостинець',
    title: 'Бабусин Гостинець - Інтернет-магазин',
    description: 'Інтернет-магазин Бабусин Гостинець - широкий вибір товарів за доступними цінами. Швидка доставка по всій Україні.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Бабусин Гостинець'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Бабусин Гостинець - Інтернет-магазин',
    description: 'Інтернет-магазин Бабусин Гостинець - широкий вибір товарів за доступними цінами. Швидка доставка по всій Україні.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  }
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ua">
      <body className={`${inter.className} antialiased min-h-screen`}>
        <CartProvider>
          <Header />
            <Toaster position="top-right"/>
              <Suspense fallback={<div>Завантаження...</div>}>
              {children}
              </Suspense>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}