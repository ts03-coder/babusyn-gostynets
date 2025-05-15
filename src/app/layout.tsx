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
  title: "ТМ Бабусин Гостинець - Натуральні м'ясні продукти України",
  description:
    "ТМ Бабусин Гостинець пропонує якісні м'ясні вироби: ковбаси, шинки, делікатеси. Натуральні інгредієнти, традиційні рецепти, українська якість.",
  keywords: "м'ясні продукти, ТМ Бабусин Гостинець, ковбаси, натуральні делікатеси, український виробник, шинки, м'ясо",
  openGraph: {
    title: "ТМ Бабусин Гостинець - Смачні м'ясні делікатеси",
    description:
      "Смак натуральних м'ясних продуктів від ТМ Бабусин Гостинець. Ковбаси, шинки та делікатеси за традиційними українськими рецептами.",
    url: "https://babusyn-gostynets.com.ua", // Replace with actual URL
    siteName: "ТМ Бабусин Гостинець",
    images: [
      {
        url: "https://babusyn-gostynets.com.ua/og-image.jpg", // Replace with actual image URL
        width: 1200,
        height: 630,
        alt: "М'ясні продукти ТМ Бабусин Гостинець",
      },
    ],
    locale: "uk_UA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ТМ Бабусин Гостинець - Натуральні м'ясні продукти",
    description:
      "Спробуйте смачні ковбаси, шинки та делікатеси від ТМ Бабусин Гостинець, виготовлені за українськими традиціями.",
    images: ["https://babusyn-gostynets.com.ua/twitter-image.jpg"], // Replace with actual image URL
  },
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