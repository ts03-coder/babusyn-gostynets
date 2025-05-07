import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import AdminAside from "@/components/admin_aside";
import Footer from "@/components/footer";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: "Панель адміністратора | ТМ 'Бабусин гостинець'",
  description:
    "Якісні м'ясні продукти від українського виробника. Натуральні інгредієнти та традиційні рецепти від ТМ 'Бабусин гостинець'.",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`${inter.className} antialiased flex min-h-screen bg-gray-100`}>
      <AdminAside />
      {children}
    </div>
  );
}