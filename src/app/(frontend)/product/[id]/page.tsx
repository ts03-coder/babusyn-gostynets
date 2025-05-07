"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  Heart,
  Share2,
  ShoppingCart,
  Star,
  Truck,
  ShieldCheck,
  RotateCcw,
  Loader2,
} from "lucide-react"
import { useCart } from "@/lib/CartContext"
import ProductCard from "@/components/product-card"

interface Product {
  id: string
  name: string
  description: string
  price: number
  oldPrice?: number | null
  discount: number
  weight: string
  category: string
  category_slug: string
  categoryId: string
  isOnSale: boolean
  inStock: boolean
  images: string[]
  specifications: { name: string; value: string }[]
  ingredients: string
  storage: string
  preparation: string
}

interface RecommendedProduct {
  id: string
  name: string
  price: number
  image: string
  description: string
  isOnSale: boolean
}

export default function ProductPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string
  const { addToCart } = useCart()

  const [product, setProduct] = useState<Product | null>(null)
  const [recommendedProducts, setRecommendedProducts] = useState<RecommendedProduct[]>([])
  const [quantity, setQuantity] = useState(1)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Функція для показу повідомлення про помилку (зникає через 5 секунд)
  const showErrorMessage = (message: string) => {
    setErrorMessage(message)
    setTimeout(() => {
      setErrorMessage(null)
    }, 5000)
  }

  // Завантаження даних товару
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/products/${productId}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Не вдалося завантажити товар")
        }

        if (!data.product) {
          throw new Error("Продукт не знайдено у відповіді API")
        }

        setProduct(data.product)

        // Завантаження рекомендованих товарів
        const recommendedResponse = await fetch(`/api/products?categoryId=${data.product.categoryId}&limit=4`)
        const recommendedData = await recommendedResponse.json()
        if (recommendedResponse.ok && Array.isArray(recommendedData.products)) {
          setRecommendedProducts(
            recommendedData.products
              .filter((p: Product) => p.id !== productId)
              .map((p: Product) => ({
                id: p.id,
                name: p.name,
                price: p.price,
                image: p.images && p.images.length > 0 ? p.images[0] : "/placeholder.svg",
                description: p.description || "",
                isOnSale: p.isOnSale || false,
              }))
          )
        } else {
          console.warn("Не вдалося завантажити рекомендовані товари:", recommendedData)
          setRecommendedProducts([])
        }
      } catch (error: any) {
        showErrorMessage(`Помилка: ${error.message}`)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [productId])

  // Збільшення кількості товару
  const increaseQuantity = () => {
    setQuantity((prev) => prev + 1)
  }

  // Зменшення кількості товару
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1)
    }
  }

  // Додавання товару в корзину
  const handleAddToCart = async () => {
    if (!product) return

    try {
      await addToCart(
        { 
          id: product.id, 
          name: product.name, 
          price: product.price, 
          image: product.images && product.images.length > 0 ? product.images[0] : "/placeholder.svg",
          quantity: quantity // Додано кількість
        },
        () => router.push("/login")
      )
    } catch (error: any) {
      showErrorMessage(`Помилка: ${error.message}`)
    }
  }

  // Додавання товару в список бажань (поки лише консоль)
  const addToWishlist = () => {
    console.log(`Додано в список бажань: ${product?.name}`)
  }

  // Перемикання на наступне зображення
  const nextImage = () => {
    if (!product) return
    setActiveImageIndex((prev) => (prev === product.images.length - 1 ? 0 : prev + 1))
  }

  // Перемикання на попереднє зображення
  const prevImage = () => {
    if (!product) return
    setActiveImageIndex((prev) => (prev === 0 ? product.images.length - 1 : prev - 1))
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg text-gray-500">Товар не знайдено</p>
      </div>
    )
  }

  return (
    <div>
      {/* Повідомлення про помилку */}
      {errorMessage && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
          {errorMessage}
        </div>
      )}

      {/* Хлібні крихти */}
      <div className="bg-gray-50 py-3 px-4">
        <div className="container mx-auto">
          <div className="flex items-center text-sm text-gray-600">
            <Link href="/" className="hover:text-primary">
              Головна
            </Link>
            <span className="mx-2">/</span>
            <Link href="/catalog" className="hover:text-primary">
              Каталог
            </Link>
            <span className="mx-2">/</span>
            <Link href={`/catalog/${product.category_slug}`} className="hover:text-primary">
              {product.category}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">{product.name}</span>
          </div>
        </div>
      </div>

      {/* Основна інформація про товар */}
      <section className="py-8 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {/* Галерея зображень */}
            <div className="space-y-4">
              <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src={product.images[activeImageIndex] || "/placeholder.svg"}
                  alt={product.name}
                  fill
                  className="object-cover"
                />

                {/* Кнопки навігації по зображеннях */}
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow-md hover:bg-white"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow-md hover:bg-white"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>

                {/* Знижка */}
                {product.isOnSale && product.discount > 0 && (
                  <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-medium px-2 py-1 rounded">
                    -{product.discount}%
                  </div>
                )}
              </div>

              {/* Мініатюри зображень */}
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImageIndex(index)}
                    className={`relative w-20 h-20 rounded-md overflow-hidden border-2 ${
                      activeImageIndex === index ? "border-primary" : "border-transparent"
                    }`}
                  >
                    <Image
                      src={image || "/placeholder.svg"}
                      alt={`${product.name} - зображення ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Інформація про товар */}
            <div className="space-y-6">
              <h1 className="text-3xl font-bold">{product.name}</h1>

              {/* Ціна */}
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-primary">{product.price} ₴</span>
                {product.oldPrice && <span className="text-xl text-gray-500 line-through">{product.oldPrice} ₴</span>}
              </div>

              {/* Наявність */}
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${product.inStock ? "bg-green-500" : "bg-red-500"}`}></div>
                <span className="text-sm">{product.inStock ? "В наявності" : "Немає в наявності"}</span>
                <span className="text-sm text-gray-500 ml-2">Вага: {product.weight}</span>
              </div>

              {/* Короткий опис */}
              <p className="text-gray-700 leading-relaxed">{product.description}</p>

              {/* Вибір кількості та додавання в корзину */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center border rounded-lg overflow-hidden w-36">
                  <button
                    onClick={decreaseQuantity}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200"
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <div className="flex-1 text-center py-2">{quantity}</div>
                  <button onClick={increaseQuantity} className="px-3 py-2 bg-gray-100 hover:bg-gray-200">
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <Button onClick={handleAddToCart} className="flex-1 bg-primary hover:bg-primary/90">
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Додати в кошик
                </Button>

                <Button variant="outline" onClick={addToWishlist} className="px-4">
                  <Heart className="h-5 w-5" />
                </Button>
              </div>

              {/* Переваги */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-primary" />
                  <span className="text-sm">Швидка доставка</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <span className="text-sm">Гарантія якості</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Рекомендовані товари */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <h2 className="text-2xl font-bold mb-8">Вам також може сподобатися</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recommendedProducts.map((product) => (
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
        </div>
      </section>
    </div>
  )
}