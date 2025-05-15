"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, ChevronLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { getCookie } from "cookies-next"

interface CartItem {
  id: string          // ID самого CartItem (елемента кошика)
  productId: string   // ID продукту
  name: string        // Назва продукту (з product.name)
  image: string       // Зображення продукту (з product.image)
  price: number       // Ціна продукту БЕЗ знижки (з product.price)
  quantity: number    // Кількість (з CartItem.quantity)
  stock?: number      // Додатково: запас продукту (з product.stock)
  discount: number | 0 // Знижка на продукт у ВІДСОТКАХ (з product.discount), наприклад 10 для 10%
  isOnSale: boolean   // Додаємо isOnSale (з product.isOnSale)
}

// Допоміжна функція для форматування елемента кошика з відповіді API
const formatApiCartItem = (apiItem: any): CartItem => {
  return {
    id: apiItem.id,
    productId: apiItem.productId,
    name: apiItem.product.name,
    image: apiItem.product.image || "/placeholder.svg",
    price: apiItem.product.price, // Ціна без знижки
    quantity: apiItem.quantity,
    stock: apiItem.product.stock,
    discount: apiItem.product.discount, // Відсоток знижки
    isOnSale: apiItem.product.isOnSale, // Додаємо isOnSale
  };
};

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const router = useRouter()

  const fetchCart = async () => {
    try {
      setLoading(true)
      const token = getCookie("token")
      
      if (!token) {
        setCartItems([])
        setLoading(false)
        return
      }

      const response = await fetch('/api/cart', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.items && Array.isArray(data.items)) {
          setCartItems(data.items.map(formatApiCartItem))
        } else {
          setCartItems([])
        }
      } else if (response.status === 401) {
        toast.success("Будь ласка, увійдіть у свій обліковий запис.")
        router.push('/')
      } else {
        const error = await response.json()
        console.error('Помилка завантаження кошика:', error)
        toast.error(error.error || "Не вдалося завантажити кошик. Спробуйте пізніше.")
      }
    } catch (error) {
      console.error('Помилка завантаження кошика:', error)
      toast.error("Сталася помилка під час з'єднання з сервером.")
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (productId: string, newQuantity: number) => {
    try {
      setProcessing(true)
      const token = getCookie("token")
      
      const response = await fetch('/api/cart', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ productId, quantity: newQuantity })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.message === "Товар видалено з корзини") {
          setCartItems(prev => prev.filter(item => item.productId !== productId))
          toast.success("Товар видалено з кошика.")
        } else if (data.item) {
          const updatedItem = formatApiCartItem(data.item);
          setCartItems(prev => 
            prev.map(item => 
              item.productId === updatedItem.productId 
                ? updatedItem 
                : item
            )
          )
          toast.success("Кількість товару оновлено.")
        } else {
          console.warn("Кількість товару оновлено, але відповідь API не містить оновлений елемент або повідомлення про видалення:", data);
          toast.info("Кількість товару оновлено (можливо).");
          fetchCart();
        }
      } else if (response.status === 401) {
        toast.error("Будь ласка, увійдіть у свій обліковий запис.")
        router.push('/login')
      } else {
        const error = await response.json()
        console.error('Помилка оновлення кількості:', error)
        toast.error(error.error || "Не вдалося оновити кількість товару.")
        fetchCart()
      }
    } catch (error) {
      console.error('Помилка оновлення кількості:', error)
      toast.error("Сталася помилка під час оновлення кількості.")
    } finally {
      setProcessing(false)
    }
  }

  const removeItem = async (productId: string) => {
    try {
      setProcessing(true)
      const token = getCookie("token")
      
      const response = await fetch(`/api/cart?productId=${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setCartItems(prev => prev.filter(item => item.productId !== productId))
        toast.success("Товар видалено з кошика.")
      } else if (response.status === 401) {
        toast.error("Будь ласка, увійдіть у свій обліковий запис.")
        router.push('/login')
      } else {
        const error = await response.json()
        console.error('Помилка видалення товару:', error)
        toast.error(error.error || "Не вдалося видалити товар з кошика.")
        fetchCart()
      }
    } catch (error) {
      console.error('Помилка видалення товару:', error)
      toast.error("Сталася помилка під час видалення товару.")
    } finally {
      setProcessing(false)
    }
  }

  const clearCart = async () => {
    try {
      setProcessing(true)
      const token = getCookie("token")
      
      const response = await fetch('/api/cart', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setCartItems([])
        toast.success("Кошик очищено.")
      } else if (response.status === 401) {
        toast.error("Будь ласка, увійдіть у свій обліковий запис.")
        router.push('/login')
      } else {
        const error = await response.json()
        console.error('Помилка очищення кошика:', error)
        toast.error(error.error || "Не вдалося очистити кошик.")
        fetchCart()
      }
    } catch (error) {
      console.error('Помилка очищення кошика:', error)
      toast.error("Не вдалося очистити кошик.")
      fetchCart()
    } finally {
      setProcessing(false)
    }
  }

  useEffect(() => {
    fetchCart()
  }, [])

  // Розрахунок загальної суми та знижок
  const subtotal = cartItems.reduce((sum, item) => { // Сума товарів (за оригінальними цінами)
    return sum + item.price * item.quantity;
  }, 0);

  const totalCalculatedDiscount = cartItems.reduce((totalDiscountSum, item) => {
    const discountPercentage = item.discount || 0;
    const itemOriginalTotal = item.price * item.quantity;
    const itemDiscountAmount = (itemOriginalTotal * discountPercentage) / 100;
    return totalDiscountSum + itemDiscountAmount;
  }, 0);
  
  // Разом до сплати = (Сума товарів - Загальна знижка)
  const total = subtotal - totalCalculatedDiscount;

  const isCartEmpty = cartItems.length === 0

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div>
      <div className="py-3 px-4">
        <div className="container mx-auto">
          <div className="flex items-center text-sm text-gray-600">
            <Link href="/" className="hover:text-primary">
              Головна
            </Link>
            <span className="mx-2">/</span>
            <span>Кошик</span>
          </div>
        </div>
      </div>

      <section className="py-8 px-4 bg-white">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold mb-8 flex items-center">
            <ShoppingBag className="mr-3 h-8 w-8" />
            Кошик
          </h1>

          {isCartEmpty ? (
            <div className="text-center py-16 bg-gray-50 rounded-lg">
              <div className="max-w-md mx-auto">
                <Image
                  src="/placeholder.svg"
                  alt="Порожній кошик"
                  width={200}
                  height={200}
                  className="mx-auto mb-6 opacity-50"
                />
                <h2 className="text-2xl font-semibold mb-4">Ваш кошик порожній</h2>
                <p className="text-gray-500 mb-8">
                  Здається, ви ще не додали жодного товару до кошика. Перейдіть до каталогу, щоб знайти найкращі
                  пропозиції.
                </p>
                <Link href="/catalog">
                  <Button className="px-8 py-6 rounded-lg text-base">
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Перейти до каталогу
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="lg:w-2/3">
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="hidden md:grid md:grid-cols-12 text-sm text-gray-500 mb-4 gap-4">
                    <div className="col-span-6">Товар</div>
                    <div className="col-span-2 text-center">Ціна (за од.)</div>
                    <div className="col-span-2 text-center">Кількість</div>
                    <div className="col-span-2 text-right">Сума</div>
                  </div>

                  <div className="space-y-4">
                    {cartItems.map((item) => {
                      const pricePerUnit = item.price; // Оригінальна ціна за одиницю
                      const totalOriginalPriceForLine = pricePerUnit * item.quantity;
                      // Ціна зі знижкою для цього товару
                      const discountedPricePerUnit = item.isOnSale && item.discount > 0 
                        ? pricePerUnit * (1 - item.discount / 100)
                        : pricePerUnit;
                      const totalEffectivePriceForLine = discountedPricePerUnit * item.quantity;

                      return (
                        <div key={item.id} className="bg-white rounded-lg p-4 shadow-sm">
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                            <div className="col-span-1 md:col-span-6 flex items-center">
                              <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
                                <Image
                                  src={item.image || "/placeholder.svg"}
                                  alt={item.name}
                                  width={100}
                                  height={100}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                />
                              </div>
                              <div className="ml-4 flex-1">
                                <h3 className="font-medium">{item.name}</h3>
                                <div className="md:hidden mt-2 flex justify-between items-center">
                                  <div>
                                    <span className="font-bold">{discountedPricePerUnit.toFixed(2)} ₴</span>
                                    {item.isOnSale && item.discount > 0 && (
                                      <span className="block text-xs text-gray-500 line-through">
                                        {pricePerUnit.toFixed(2)} ₴
                                      </span>
                                    )}
                                  </div>
                                  <span className="font-bold text-primary">{totalEffectivePriceForLine.toFixed(2)} ₴</span>
                                </div>
                              </div>
                            </div>

                            <div className="hidden md:block md:col-span-2 text-center font-medium">
                              {discountedPricePerUnit.toFixed(2)} ₴
                              {item.isOnSale && item.discount > 0 && (
                                <span className="block text-xs text-gray-500 line-through">
                                  {pricePerUnit.toFixed(2)} ₴
                                </span>
                              )}
                            </div>

                            <div className="col-span-1 md:col-span-2 flex justify-center">
                              <div className="flex items-center border rounded-lg">
                                <button
                                  onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                  className="px-3 py-1 text-gray-500 hover:text-gray-700"
                                  aria-label="Зменшити кількість"
                                  disabled={processing || item.quantity <= 1}
                                >
                                  <Minus className="h-4 w-4" />
                                </button>
                                <span className="w-10 text-center">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                  className="px-3 py-1 text-gray-500 hover:text-gray-700"
                                  aria-label="Збільшити кількість"
                                  disabled={processing || (item.stock !== undefined && item.quantity >= item.stock)}
                                >
                                  <Plus className="h-4 w-4" />
                                </button>
                              </div>
                            </div>

                            <div className="hidden md:flex md:col-span-2 justify-between items-center">
                              <span className="font-bold text-primary text-right flex-1">
                                {totalEffectivePriceForLine.toFixed(2)} ₴
                                {item.isOnSale && item.discount > 0 && (
                                  <p className="text-xs text-red-500">(-{item.discount}%)</p>
                                )}
                              </span>
                              <button
                                onClick={() => removeItem(item.productId)}
                                className="ml-4 text-gray-400 hover:text-red-500"
                                aria-label="Видалити товар"
                                disabled={processing}
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </div>

                            <div className="md:hidden flex justify-end">
                              <button
                                onClick={() => removeItem(item.productId)}
                                className="text-gray-400 hover:text-red-500"
                                aria-label="Видалити товар"
                                disabled={processing}
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-6 flex justify-between items-center">
                  <Link href="/catalog">
                    <Button variant="outline" className="flex items-center gap-2">
                      <ChevronLeft className="h-4 w-4" />
                      Продовжити покупки
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="text-red-500 hover:text-red-600 border-red-200 hover:border-red-300"
                    onClick={clearCart}
                    disabled={processing}
                  >
                    {processing ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 mr-2" />
                    )}
                    Очистити кошик
                  </Button>
                </div>
              </div>

              <div className="lg:w-1/3">
                <div className="bg-gray-50 rounded-lg p-6 sticky top-4">
                  <h2 className="text-xl font-semibold mb-4">Підсумок замовлення</h2>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Сума товарів:</span>
                      <span className="font-medium">{subtotal.toFixed(2)} ₴</span>
                    </div>
                    {totalCalculatedDiscount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Знижка:</span>
                        <span>-{totalCalculatedDiscount.toFixed(2)} ₴</span>
                      </div>
                    )}
                    <Separator className="my-3" />
                    <div className="flex justify-between text-lg">
                      <span className="font-semibold">Разом до сплати:</span>
                      <span className="font-bold text-primary">{total.toFixed(2)} ₴</span>
                    </div>
                  </div>

                  <Link href="/checkout">
                    <Button className="w-full py-6 text-base rounded-lg" disabled={processing || isCartEmpty}>
                      {processing ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          Оформити замовлення
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}