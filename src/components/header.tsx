"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import axios from "axios"
import { Search, ShoppingCart, Menu, X, User, LogOut, Heart, Package } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import AuthModal from "@/components/auth-modal"

interface User {
  name: string
  email: string
  avatar?: string
}

export default function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  // Серверна перевірка авторизації
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      axios
        .get("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setUser({
            name: response.data.user.name || "Користувач",
            email: response.data.user.email || "",
            avatar: undefined, // Додавайте аватар, якщо він є в даних користувача
          })
          setIsAuthenticated(true)
        })
        .catch((error) => {
          console.error("Error verifying token:", error)
          localStorage.removeItem("token")
          setIsAuthenticated(false)
          setUser(null)
        })
    }
  }, [])

  const openAuthModal = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsAuthModalOpen(true)
  }

  const onLogout = () => {
    localStorage.removeItem("token")
    setIsAuthenticated(false)
    setUser(null)
  }

  return (
    <>
      <header className="w-full py-4 px-4 bg-white border-b">
        <div className="container mx-auto flex items-center justify-between">
          {/* Логотип - завжди видимий */}
          <Link href="/" className="flex items-center">
            <Image src="/images/logo.svg" alt="Бабусин Гостинець" width={40} height={40} className="mr-2" />
          </Link>

          {/* Пошук - прихований на мобільних, показується при натисканні на іконку */}
          <div
            className={`${
              isSearchOpen ? "flex absolute top-16 left-0 right-0 z-10 px-4 py-2 bg-white shadow-md" : "hidden"
            } md:relative md:flex md:top-0 md:shadow-none md:py-0 md:px-0 md:flex-1 md:max-w-xl md:mx-4`}
          >
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="search"
                placeholder="Пошук товарів..."
                className="pl-10 pr-4 py-2 w-full rounded-full border focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
            {isSearchOpen && (
              <Button variant="ghost" size="icon" className="ml-2 md:hidden" onClick={() => setIsSearchOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>

          {/* Мобільні іконки - видимі тільки на мобільних */}
          <div className="flex items-center space-x-2 md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(!isSearchOpen)}>
              <Search className="h-5 w-5" />
            </Button>

            <Link href="/cart">
              <Button variant="ghost" size="icon">
                <ShoppingCart className="h-5 w-5" />
              </Button>
            </Link>

            {/* Мобільне меню */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                {isAuthenticated && user ? (
                  <>
                    <div className="mb-6 mt-4">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <nav className="flex flex-col space-y-4 ml-5">
                      <Link href="/catalog" className="flex items-center text-lg font-medium py-2">
                        <span>Каталог</span>
                      </Link>
                      <Link href="/about" className="flex items-center text-lg font-medium py-2">
                        <span>Про нас</span>
                      </Link>
                      <Link href="/orders" className="flex items-center text-lg font-medium py-2">
                        <Package className="h-5 w-5 mr-2" />
                        <span>Мої замовлення</span>
                      </Link>
                      <Link href="/cart" className="flex items-center text-lg font-medium py-2">
                        <ShoppingCart className="h-5 w-5 mr-2" />
                        <span>Кошик</span>
                      </Link>
                      <button
                        onClick={onLogout}
                        className="flex items-center text-lg font-medium py-2 text-left w-full bg-transparent border-none text-red-500"
                      >
                        <LogOut className="h-5 w-5 mr-2" />
                        <span>Вихід</span>
                      </button>
                    </nav>
                  </>
                ) : (
                  <nav className="flex flex-col space-y-4 ml-5 mt-8">
                    <Link href="/catalog" className="flex items-center text-lg font-medium py-2">
                      <span>Каталог</span>
                    </Link>
                    <Link href="/about" className="flex items-center text-lg font-medium py-2">
                      <span>Про нас</span>
                    </Link>
                    <Link href="/cart" className="flex items-center text-lg font-medium py-2">
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      <span>Кошик</span>
                    </Link>
                    <button
                      onClick={openAuthModal}
                      className="flex items-center text-lg font-medium py-2 text-left w-full bg-transparent border-none"
                    >
                      <User className="h-5 w-5 mr-2" />
                      <span>Вхід</span>
                    </button>
                  </nav>
                )}
              </SheetContent>
            </Sheet>
          </div>

          {/* Десктопне меню - видиме тільки на планшетах і більше */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/catalog" className="flex items-center text-sm font-medium">
              <Menu className="h-5 w-5 mr-1" />
              <span>Каталог</span>
            </Link>
            <Link href="/about" className="flex items-center text-sm font-medium">
              <span>Про нас</span>
            </Link>
            {isAuthenticated && user ? (
              <>
                <Link href="/cart" className="flex items-center text-sm font-medium">
                  <ShoppingCart className="h-5 w-5 mr-1" />
                  <span>Кошик</span>
                </Link>
                {/* User dropdown menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center h-9 px-2">
                      <span className="text-sm font-medium">{user.name}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span>Мій профіль</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/orders" className="cursor-pointer">
                        <Package className="mr-2 h-4 w-4" />
                        <span>Мої замовлення</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onLogout} className="text-red-500 cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Вихід</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link href="/cart" className="flex items-center text-sm font-medium">
                  <ShoppingCart className="h-5 w-5 mr-1" />
                  <span>Кошик</span>
                </Link>
                <button
                  onClick={openAuthModal}
                  className="flex items-center text-sm font-medium bg-transparent border-none cursor-pointer"
                >
                  <User className="h-5 w-5 mr-1" />
                  <span>Вхід</span>
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Модальне вікно авторизації */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  )
}