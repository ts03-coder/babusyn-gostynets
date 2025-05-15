"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import { Search, ShoppingCart, Menu, X, User, LogOut, Package, Wrench } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AuthModal from "@/components/auth-modal";
import { getCookie, deleteCookie } from "cookies-next";
import { ServerHeader } from "./ServerHeader";
import { useDebounce } from "use-debounce";
import useSWR from "swr";

interface User {
  name: string;
  email: string;
  avatar?: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
}

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export default function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery] = useDebounce(searchQuery, 300);
  const [isSearchResultsVisible, setIsSearchResultsVisible] = useState(false);

  const { data: searchResults, isLoading } = useSWR(
    debouncedQuery.trim() ? `/api/products?search=${debouncedQuery}&limit=5` : null,
    fetcher,
    { dedupingInterval: 5000 }
  );

  const isSearchResultsVisibleState = !!debouncedQuery && !!searchResults?.products?.length;

  // Функція для перевірки токена
  const verifyToken = async () => {
    const token = getCookie("token");
    if (!token) {
      setIsAuthenticated(false);
      setUser(null);
      return;
    }

    try {
      const response = await axios.get("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser({
        name: response.data.user.name || "Користувач",
        email: response.data.user.email || "",
      });
      setIsAuthenticated(true);
    } catch (error: any) {
      if (axios.isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 403)) {
        deleteCookie("token");
      }
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  // Оновлюємо стан при монтуванні компонента
  useEffect(() => {
    verifyToken();
  }, []);

  const handleAuthSuccess = () => {
    verifyToken();
    setIsAuthModalOpen(false);
  };

  const onLogout = () => {
    deleteCookie("token");
    setIsAuthenticated(false);
    setUser(null);
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/catalog?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <>
      <header className="w-full py-4 px-4 bg-white border-b">
        <div className="container mx-auto flex items-center justify-between">
          {/* Логотип */}
          <ServerHeader />

          {/* Пошук */}
          <div
            className={`${
              isSearchOpen
                ? "flex absolute top-16 left-0 right-0 z-10 px-4 py-2 bg-white shadow-md"
                : "hidden"
            } md:flex md:static md:shadow-none md:py-0 md:px-0 md:flex-1 md:max-w-xl md:mx-4`}
          >
            <div className="relative w-full">
              <form onSubmit={handleSearchSubmit} aria-label="Пошук товарів">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="search"
                  placeholder="Пошук товарів..."
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  onFocus={() => debouncedQuery.trim() && setIsSearchResultsVisible(true)}
                  onBlur={() => setTimeout(() => setIsSearchResultsVisible(false), 200)}
                  className="pl-10 pr-4 py-2 w-full rounded-full border focus:ring-2 focus:ring-primary focus:border-primary"
                />

                {isSearchResultsVisibleState && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-lg shadow-lg z-20 max-h-96 overflow-y-auto">
                    {isLoading ? (
                      <div className="p-3 text-center text-gray-500">Завантаження...</div>
                    ) : searchResults?.products?.length > 0 ? (
                      <>
                        {searchResults.products.map((product: Product) => (
                          <Link
                            key={product.id}
                            href={`/product/${product.id}`}
                            className="flex items-center p-3 hover:bg-gray-100"
                          >
                            {product.image ? (
                              <Image
                                src={product.image}
                                alt={product.name}
                                width={40}
                                height={40}
                                className="mr-3 rounded"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gray-200 rounded mr-3" />
                            )}
                            <div>
                              <p className="text-sm font-medium">{product.name}</p>
                              <p className="text-xs text-gray-500">{product.price} ₴</p>
                            </div>
                          </Link>
                        ))}
                        {searchResults.products.length >= 5 && (
                          <Link
                            href={`/catalog?search=${encodeURIComponent(searchQuery)}`}
                            className="flex items-center p-3 hover:bg-gray-100 text-primary font-medium"
                          >
                            Показати всі результати
                          </Link>
                        )}
                      </>
                    ) : (
                      <div className="p-3 text-center text-gray-500">Нічого не знайдено</div>
                    )}
                  </div>
                )}
              </form>
            </div>
            {isSearchOpen && (
              <Button variant="ghost" size="icon" className="ml-2 md:hidden" onClick={() => setIsSearchOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>

          {/* Навігація для мобільних */}
          <div className="flex items-center space-x-2 md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(!isSearchOpen)}>
              <Search className="h-5 w-5" />
            </Button>

            <Link href="/cart">
              <Button variant="ghost" size="icon">
                <ShoppingCart className="h-5 w-5" />
              </Button>
            </Link>

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
                      <Link href="/profile?tab=orders" className="flex items-center text-lg font-medium py-2">
                        <Package className="h-5 w-5 mr-2" />
                        <span>Мої замовлення</span>
                      </Link>
                      <Link href="/admin" className="flex items-center text-lg font-medium py-2">
                        <Wrench className="h-5 w-5 mr-2" />
                        <span>Панель адміністратора</span>
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
                      onClick={(e) => {
                        e.preventDefault();
                        setIsAuthModalOpen(true);
                      }}
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

          {/* Навігація для десктопу */}
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
                      <Link href="/profile?tab=orders" className="cursor-pointer">
                        <Package className="mr-2 h-4 w-4" />
                        <span>Мої замовлення</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="cursor-pointer">
                        <Wrench className="mr-2 h-4 w-4" />
                        <span>Панель адміністратора</span>
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
                  onClick={() => setIsAuthModalOpen(true)}
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

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </>
  );
}