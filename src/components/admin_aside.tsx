"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"

import { Button } from "./ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import {
  Bell,
  Home,
  Menu,
  Package,
  Percent,
  ShoppingBag,
  Tag,
  Users,
  X,
  BarChart3,
  Settings,
  LogOut
} from "lucide-react"

export default function AdminAside() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      {/* Top Navbar (Mobile only) */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b p-4 flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)}>
            <Menu className="h-6 w-6" />
          </Button>
          <div className="ml-3 font-semibold text-lg">Бабусин Гостинець</div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
          <Avatar className="h-8 w-8">
            <AvatarImage src="/images/logo.svg" alt="Адміністратор" />
            <AvatarFallback>АД</AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo and Close */}
          <div className="p-4 border-b flex items-center justify-between">
            <Link href="/admin" className="flex items-center">
              <Image src="/images/logo.svg" alt="Логотип" width={40} height={40} className="mr-2" />
              <span className="font-bold text-lg">Admin Panel</span>
            </Link>
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {[
              { href: "/admin", label: "Головна", icon: Home },
              { href: "/admin/orders", label: "Замовлення", icon: ShoppingBag },
              { href: "/admin/products", label: "Товари", icon: Package },
              { href: "/admin/categories", label: "Категорії", icon: Tag },
              { href: "/admin/customers", label: "Користувачі", icon: Users },
              { href: "/admin/settings", label: "Налаштування", icon: Settings },
            ].map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center px-3 py-2 rounded-md text-sm ${
                  pathname === href ? "bg-gray-100 text-primary font-medium" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Icon className="h-5 w-5 mr-3" />
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {/* Overlay for mobile when sidebar is open */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </>
  )
}