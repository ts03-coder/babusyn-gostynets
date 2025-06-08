"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "@/components/product-card";
import { CartProvider } from "@/lib/CartContext";
import axios from "axios";

// Создаем api за пределами компонента
const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  isOnSale: boolean;
  discount: number;
  createdAt: string;
}

interface Slide {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  link: string;
}

export default function Home() {
  const [saleProducts, setSaleProducts] = useState<Product[]>([]);
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [saleResponse, newResponse, slidesResponse] = await Promise.all([
        api.get("/products?onlyOnSale=true&limit=4"),
        api.get("/products?sort=new&limit=4"),
        api.get("/slides"),
      ]);

      const saleData = saleResponse.data;
      const newData = newResponse.data;
      const slidesData = slidesResponse.data;

      // Перевірка статусу відповідей
      if (!(saleResponse.status >= 200 && saleResponse.status < 300))
        throw new Error(saleData.error || "Не вдалося завантажити акційні товари");
      if (!(newResponse.status >= 200 && newResponse.status < 300))
        throw new Error(newData.error || "Не вдалося завантажити новинки");
      if (!(slidesResponse.status >= 200 && slidesResponse.status < 300))
        throw new Error(slidesData.error || "Не вдалося завантажити слайди");

      setSaleProducts(saleData.products || []);
      setNewProducts(newData.products || []);
      setSlides(slidesData.slides || []);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(`Помилка: ${error.response?.data?.error || error.message}`);
      } else if (error instanceof Error) {
        setErrorMessage(`Помилка: ${error.message}`);
      } else {
        setErrorMessage("Сталася невідома помилка.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []); // Убираем api из зависимостей

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (slides.length === 0) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [slides.length]);

  const goToSlide = (index: number) => setCurrentSlide(index);
  const goToPreviousSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  const goToNextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);

  const Slider = () => (
    <section className="relative w-full h-[500px] bg-gray-200">
      {slides.length > 0 ? (
        <>
          <Image
            src={slides[currentSlide].image}
            alt={slides[currentSlide].title}
            fill
            className="object-cover"
            priority={currentSlide === 0}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black/40">
            <h1 className="text-4xl font-bold mb-2">{slides[currentSlide].title}</h1>
            <p className="text-lg mb-4">{slides[currentSlide].subtitle}</p>
            <a
              href={slides[currentSlide].link}
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition"
            >
              Дізнатися більше
            </a>
          </div>
          <button
            onClick={goToPreviousSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow-md"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={goToNextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow-md"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full ${
                  currentSlide === index ? "bg-primary" : "bg-white/60"
                }`}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-gray-500">
          {isLoading ? "Завантаження слайдів..." : "Слайди не знайдено"}
        </div>
      )}
    </section>
  );

  const ProductSection = ({
    title,
    products,
    isLoading,
  }: {
    title: string;
    products: Product[];
    isLoading: boolean;
  }) => (
    <section className="py-12 px-4 bg-red-50">
      <div className="container mx-auto">
        <h2 className="text-2xl font-bold mb-8">{title}</h2>
        {isLoading ? (
          <div className="text-center">Завантаження...</div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
          <div className="text-center text-gray-500">
            {title === "Акції" ? "Акційних товарів немає" : "Новинок немає"}
          </div>
        )}
      </div>
    </section>
  );

  return (
    <CartProvider>
      <div>
        <Slider />
        {errorMessage && (
          <div className="container mx-auto py-4">
            <div className="bg-red-100 text-red-800 p-4 rounded-lg">{errorMessage}</div>
          </div>
        )}
        <ProductSection title="Акції" products={saleProducts} isLoading={isLoading} />
        <ProductSection title="Новинки" products={newProducts} isLoading={isLoading} />
      </div>
    </CartProvider>
  );
}