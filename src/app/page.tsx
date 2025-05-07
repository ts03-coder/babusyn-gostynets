"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "@/components/product-card";
import { CartProvider } from "@/lib/CartContext";

interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  isOnSale: boolean;
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

  // Завантаження даних при першому рендері
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Завантаження акційних товарів
        const saleResponse = await fetch("/api/products?onlyOnSale=true&limit=4");
        const saleData = await saleResponse.json();
        if (!saleResponse.ok) {
          throw new Error(saleData.error || "Не вдалося завантажити акційні товари");
        }
        setSaleProducts(saleData.products);

        // Завантаження новинок
        const newResponse = await fetch("/api/products?sort=new&limit=4");
        const newData = await newResponse.json();
        if (!newResponse.ok) {
          throw new Error(newData.error || "Не вдалося завантажити новинки");
        }
        setNewProducts(newData.products);

        // Завантаження слайдів
        const slidesResponse = await fetch("/api/slides");
        const slidesData = await slidesResponse.json();
        if (!slidesResponse.ok) {
          throw new Error(slidesData.error || "Не вдалося завантажити слайди");
        }
        setSlides(slidesData.slides);
      } catch (error: any) {
        setErrorMessage(`Помилка: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Автоматична зміна слайдів
  useEffect(() => {
    if (slides.length === 0) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000); // Зміна слайду кожні 5 секунд

    return () => clearInterval(interval);
  }, [slides.length]);

  // Обробники навігації слайдера
  const goToPreviousSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <CartProvider>
      <div>
        {/* Слайдер */}
        <section className="relative w-full h-[500px] bg-gray-200">
          {slides.length > 0 ? (
            <>
              {/* Зображення слайдера */}
              <Image
                src={slides[currentSlide].image}
                alt={slides[currentSlide].title}
                fill
                className="object-cover"
                priority
              />

              {/* Текст слайдера */}
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

              {/* Кнопки навігації слайдера */}
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

              {/* Індикатори слайдера */}
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

        {/* Повідомлення про помилку */}
        {errorMessage && (
          <div className="container mx-auto py-4">
            <div className="bg-red-100 text-red-800 p-4 rounded-lg">
              {errorMessage}
            </div>
          </div>
        )}

        {/* Секція акційних товарів */}
        <section className="py-12 px-4 bg-red-50">
          <div className="container mx-auto">
            <h2 className="text-2xl font-bold mb-8">Акції</h2>

            {isLoading ? (
              <div className="text-center">Завантаження...</div>
            ) : saleProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {saleProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    description={product.description}
                    image={product.image}
                    price={product.price}
                    isOnSale={product.isOnSale}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500">Акційних товарів немає</div>
            )}
          </div>
        </section>

        {/* Секція новинок */}
        <section className="py-12 px-4 bg-red-50">
          <div className="container mx-auto">
            <h2 className="text-2xl font-bold mb-8">Новинки</h2>

            {isLoading ? (
              <div className="text-center">Завантаження...</div>
            ) : newProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {newProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    description={product.description}
                    image={product.image}
                    price={product.price}
                    isOnSale={product.isOnSale}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500">Новинок немає</div>
            )}
          </div>
        </section>
      </div>
    </CartProvider>
  );
}