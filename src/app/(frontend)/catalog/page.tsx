"use client"

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import ProductCard from "@/components/product-card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Filter, SlidersHorizontal, ChevronDown, ChevronUp, X } from "lucide-react";
import { CartProvider } from "@/lib/CartContext";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
  productsCount: number;
}

interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  categoryId: string;
  isOnSale: boolean;
  discount: number;
  createdAt: string;
}

interface ApiError extends Error {
  response?: {
    data?: {
      error?: string;
    };
  };
}

const sortOptions = [
  { value: "popular", label: "За популярністю" },
  { value: "price-asc", label: "Від дешевих до дорогих" },
  { value: "price-desc", label: "Від дорогих до дешевих" },
  { value: "new", label: "Новинки" },
];

export default function CatalogPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Зчитуємо параметр search із URL для початкового значення
  const initialSearchQuery = searchParams.get("search") || "";
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [onlyOnSale, setOnlyOnSale] = useState(false);
  const [sortBy, setSortBy] = useState("popular");
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const productsPerPage = 9;
  const [error, setError] = useState<string | null>(null);

  // Завантаження даних при зміні фільтрів або сторінки
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Завантаження категорій
        const categoriesResponse = await fetch("/api/categories");
        const categoriesData = await categoriesResponse.json();
        if (!categoriesResponse.ok) {
          throw new Error(categoriesData.error || "Не вдалося завантажити категорії");
        }
        setCategories(categoriesData.categories);

        // Побудова параметрів для запиту
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: productsPerPage.toString(),
          search: searchQuery,
          priceMin: priceRange[0].toString(),
          priceMax: priceRange[1].toString(),
          onlyOnSale: onlyOnSale.toString(),
          sort: sortBy,
        });

        if (selectedCategories.length > 0) {
          params.set("categories", selectedCategories.join(","));
        }

        // Оновлення URL із параметрами
        const newUrl = `/catalog?${params.toString()}`;
        router.push(newUrl, { scroll: false });

        // Завантаження товарів
        const productsResponse = await fetch(`/api/products?${params}`);
        const productsData = await productsResponse.json();
        if (!productsResponse.ok) {
          throw new Error(productsData.error || "Не вдалося завантажити товари");
        }
        setProducts(productsData.products);
        setTotalPages(Math.ceil(productsData.total / productsPerPage));
      } catch (error: unknown) {
        const apiError = error as ApiError;
        console.error("Помилка при отриманні товарів:", apiError);
        setError(apiError.response?.data?.error || "Помилка при завантаженні товарів");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentPage, searchQuery, selectedCategories, priceRange, onlyOnSale, sortBy, router]);

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories([...selectedCategories, categoryId]);
    } else {
      setSelectedCategories(selectedCategories.filter((id) => id !== categoryId));
    }
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategories([]);
    setPriceRange([0, 1000]);
    setOnlyOnSale(false);
    setSortBy("popular");
    setCurrentPage(1);
    router.push("/catalog", { scroll: false }); // Скидаємо URL
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <CartProvider>
      <div>
        <div className="py-3 px-4">
          <div className="container mx-auto">
            <div className="flex items-center text-sm text-gray-600">
              <Link href="/" className="hover:text-primary">
                Головна
              </Link>
              <span className="mx-2">/</span>
              <span>Каталог</span>
            </div>
          </div>
        </div>

        <section className="py-8 px-4 bg-white">
          <div className="container mx-auto">
            <h1 className="text-3xl font-bold mb-8">Каталог продукції</h1>

            <div className="lg:hidden flex justify-between items-center mb-4">
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => setIsFilterVisible(!isFilterVisible)}
              >
                <Filter className="h-4 w-4" />
                Фільтри
                {isFilterVisible ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>

              <div className="flex items-center gap-2">
                <Label htmlFor="mobile-sort" className="text-sm">
                  Сортувати:
                </Label>
                <select
                  id="mobile-sort"
                  className="border rounded p-1 text-sm"
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
              <div
                className={`${isFilterVisible ? "block" : "hidden"} lg:block lg:w-1/4 bg-gray-50 p-4 rounded-lg sticky top-4 self-start`}
              >
                <div className="flex justify-between items-center mb-4 lg:hidden">
                  <h2 className="font-semibold">Фільтри</h2>
                  <Button variant="ghost" size="icon" onClick={() => setIsFilterVisible(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="mb-6">
                  <h3 className="font-medium mb-2">Пошук</h3>
                  <Input
                    type="search"
                    placeholder="Введіть назву товару..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full"
                  />
                </div>

                <div className="mb-6">
                  <h3 className="font-medium mb-2">Категорії</h3>
                  {categories.length > 0 ? (
                    <div className="space-y-2">
                      {categories.map((category) => (
                        <div key={category.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`category-${category.id}`}
                            checked={selectedCategories.includes(category.id)}
                            onCheckedChange={(checked) => handleCategoryChange(category.id, checked as boolean)}
                          />
                          <Label htmlFor={`category-${category.id}`}>
                            {category.name} ({category.productsCount})
                          </Label>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Категорії не знайдено</p>
                  )}
                  {selectedCategories.length > 0 && (
                    <Button variant="link" className="text-xs p-0 h-auto mt-2" onClick={() => setSelectedCategories([])}>
                      Очистити вибір
                    </Button>
                  )}
                </div>

                <div className="mb-6">
                  <h3 className="font-medium mb-2">Ціна</h3>
                  <div className="mb-4">
                    <Slider
                      defaultValue={[0, 1000]}
                      max={1000}
                      step={10}
                      value={priceRange}
                      onValueChange={(value) => {
                        setPriceRange(value);
                        setCurrentPage(1);
                      }}
                      className="my-4"
                    />
                    <div className="flex justify-between text-sm">
                      <span>{priceRange[0]} ₴</span>
                      <span>{priceRange[1]} ₴</span>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="sale-only"
                      checked={onlyOnSale}
                      onCheckedChange={(checked) => {
                        setOnlyOnSale(checked as boolean);
                        setCurrentPage(1);
                      }}
                    />
                    <Label htmlFor="sale-only">Тільки акційні товари</Label>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button className="w-1/2" onClick={resetFilters} variant="outline">
                    Скинути
                  </Button>
                  <Button className="w-1/2">Застосувати</Button>
                </div>
              </div>

              <div className="lg:w-3/4">
                <div className="hidden lg:flex justify-between mb-4">
                  <div className="text-sm text-gray-500">
                    Знайдено товарів: <span className="font-medium">{products.length}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4" />
                    <span className="text-sm">Сортувати:</span>
                    <select
                      className="border rounded p-1 text-sm"
                      value={sortBy}
                      onChange={(e) => {
                        setSortBy(e.target.value);
                        setCurrentPage(1);
                      }}
                    >
                      {sortOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {isLoading ? (
                  <div className="text-center py-12">
                    <p className="text-lg text-gray-500">Завантаження...</p>
                  </div>
                ) : products.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => (
                      <ProductCard
                        key={product.id}
                        id={product.id}
                        name={product.name}
                        description={product.description}
                        image={product.image}
                        price={product.price}
                        isOnSale={product.isOnSale}
                        discount={product.discount}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-lg text-gray-500">Товари не знайдено</p>
                    <p className="text-sm text-gray-400 mt-2">Спробуйте змінити параметри фільтрації</p>
                    <Button className="mt-4" onClick={resetFilters}>
                      Скинути фільтри
                    </Button>
                  </div>
                )}

                {!isLoading && products.length > 0 && (
                  <div className="mt-8 flex justify-center">
                    <nav className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <ChevronUp className="h-4 w-4 rotate-270" />
                      </Button>
                      {[...Array(totalPages)].map((_, index) => {
                        const page = index + 1;
                        return (
                          <Button
                            key={page}
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(page)}
                            className={currentPage === page ? "bg-primary text-white" : ""}
                          >
                            {page}
                          </Button>
                        );
                      })}
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronDown className="h-4 w-4 rotate-270" />
                      </Button>
                    </nav>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </CartProvider>
  );
}