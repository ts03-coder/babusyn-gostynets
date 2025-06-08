"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { CreditCard, MapPin, Truck, ShoppingBag, Check, AlertCircle, Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { getCookie } from "cookies-next"
import { toast } from "sonner"

interface CartItem {
  id: string          // ID елемента кошика
  productId: string   // ID продукту
  name: string        // Назва продукту (з product.name)
  image: string       // Зображення продукту (з product.image)
  price: number       // Ціна продукту без знижки (з product.price)
  quantity: number    // Кількість (з CartItem.quantity)
  stock?: number      // Запас продукту (з product.stock)
  discount: number | 0 // Знижка на продукт у відсотках (з product.discount)
  isOnSale: boolean   // Чи є товар на розпродажі (з product.isOnSale)
}

interface Address {
  id: string
  title: string
  fullName: string
  phone: string
  address: string
  city: string
  postal: string
  isDefault: boolean
}

interface PaymentMethod {
  id: string
  type: string
  last4: string
  expiry: string
  isDefault: boolean
}

interface CartResponse {
  items: CartItem[]
}

// Функція для форматування елемента кошика з відповіді API
const formatApiCartItem = (apiItem: any): CartItem => {
  return {
    id: apiItem.id,
    productId: apiItem.productId || apiItem.product.id,
    name: apiItem.product.name,
    image: apiItem.product.image || "/placeholder.svg",
    price: apiItem.product.price,
    quantity: apiItem.quantity,
    stock: apiItem.product.stock,
    discount: apiItem.product.discount || 0,
    isOnSale: apiItem.product.isOnSale,
  };
};

export default function CheckoutPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [addresses, setAddresses] = useState<Address[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null)
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null)
  const [deliveryMethod, setDeliveryMethod] = useState("nova-poshta")
  const [comment, setComment] = useState("")
  const [loading, setLoading] = useState(false)
  const [processing, setProcessing] = useState(false) // Для оновлення кількості та видалення
  const [success, setSuccess] = useState(false)
  const [showNewAddressForm, setShowNewAddressForm] = useState(false)
  const [newAddress, setNewAddress] = useState({
    title: "",
    fullName: "",
    phone: "",
    address: "",
    city: "",
    postal: "",
  })

  // Розрахунок загальної суми та знижок
  const subtotal = cartItems.reduce((sum, item) => {
    return sum + item.price * item.quantity;
  }, 0);

  const totalCalculatedDiscount = cartItems.reduce((totalDiscountSum, item) => {
    const discountPercentage = item.discount || 0;
    const itemOriginalTotal = item.price * item.quantity;
    const itemDiscountAmount = (itemOriginalTotal * discountPercentage) / 100;
    return totalDiscountSum + itemDiscountAmount;
  }, 0);

  // Динамічна ціна доставки
  const deliveryPrice = cartItems.length > 0 
    ? (deliveryMethod === "pickup" ? 0 : deliveryMethod === "nova-poshta" ? 50 : 40) 
    : 0;

  // Загальна сума = (Сума товарів - Загальна знижка) + Доставка
  const total = subtotal - totalCalculatedDiscount + deliveryPrice;

  useEffect(() => {
    const token = getCookie("token")

    if (!token) {
      toast.error("Будь ласка, увійдіть у свій обліковий запис.")
      router.push("/")
      return
    }

    const fetchCart = async () => {
      setLoading(true)
      try {
        const response = await fetch("/api/cart", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          if (data.items && Array.isArray(data.items)) {
            setCartItems(data.items.map(formatApiCartItem))
          } else {
            setCartItems([])
          }
        } else if (response.status === 401) {
          toast.error("Будь ласка, увійдіть у свій обліковий запис.")
          router.push("/login")
        } else {
          const error = await response.json()
          console.error("Помилка завантаження кошика:", error)
          toast.error(error.error || "Не вдалося завантажити кошик. Спробуйте пізніше.")
        }
      } catch (error) {
        console.error("Помилка завантаження кошика:", error)
        toast.error("Сталася помилка під час з'єднання з сервером.")
      } finally {
        setLoading(false)
      }
    }

    const fetchAddresses = async () => {
      try {
        const response = await fetch("/api/profile/addresses", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.status === 401 || response.status === 403) {
          toast.error("Сесія закінчилася. Будь ласка, увійдіть знову.")
          router.push("/login")
          return
        }

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Не вдалося завантажити адреси")
        }

        const data = await response.json()
        if (Array.isArray(data.addresses)) {
          setAddresses(data.addresses)
          const defaultAddress = data.addresses.find((addr: Address) => addr.isDefault)
          if (defaultAddress) {
            setSelectedAddress(String(defaultAddress.id))
          }
        } else if (data.error) {
          toast.error(data.error)
          setAddresses([])
        }
      } catch (err: any) {
        console.warn(`Пропуск адрес через помилку: ${err.message}`)
        setAddresses([])
      }
    }

    const fetchPaymentMethods = async () => {
      try {
        const response = await fetch("/api/profile/payment-methods", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.status === 401 || response.status === 403) {
          toast.error("Сесія закінчилася. Будь ласка, увійдіть знову.")
          router.push("/login")
          return
        }

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Не вдалося завантажити способи оплати")
        }

        const data = await response.json()
        if (Array.isArray(data)) {
          setPaymentMethods(data)
          const defaultPayment = data.find((pm: PaymentMethod) => pm.isDefault)
          if (defaultPayment) {
            setSelectedPayment(defaultPayment.id)
          }
        } else if (data.error) {
          toast.error(data.error)
          setPaymentMethods([])
        }
      } catch (err: any) {
        console.warn(`Пропуск способів оплати через помилку: ${err.message}`)
        setPaymentMethods([])
      }
    }

    fetchCart()
    fetchAddresses()
    fetchPaymentMethods()
  }, [router])

  const fetchCart = async () => {
    try {
      setLoading(true)
      const token = getCookie("token")

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
        toast.error("Будь ласка, увійдіть у свій обліковий запис.")
        router.push('/login')
      } else {
        const error = await response.json()
        console.error('Помилка завантаження кошика:', error)
        toast.error(error.error || "Не вдалося завантажити кошик. Спробуйте пізніше.")
      }
    } catch (error) {
      console.error('Помилка завантаження кошикаThreshold', error)
      toast.error("Сталася помилка під час з'єднання з сервером.")
    } finally {
      setLoading(false)
    }
  }

  const handleQuantityChange = async (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return

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
        if (data.message === "Товар удален из корзины") {
          setCartItems(prev => prev.filter(item => item.productId !== productId))
          toast.success("Товар видалено з кошика.")
        } else if (data.item) {
          const updatedItem = formatApiCartItem(data.item)
          setCartItems(prev => 
            prev.map(item => 
              item.productId === updatedItem.productId 
                ? updatedItem 
                : item
            )
          )
          toast.success("Кількість товару оновлено.")
        } else {
          console.warn("Кількість товару оновлено, але відповідь API не містить оновлений елемент:", data)
          toast.info("Кількість товару оновлено (можливо).")
          fetchCart()
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

  const handleRemoveItem = async (productId: string) => {
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

  const handleNewAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewAddress((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddNewAddress = async () => {
    if (!newAddress.fullName || !newAddress.phone || !newAddress.address || !newAddress.city) {
      toast.error("Будь ласка, заповніть усі обов'язкові поля")
      return
    }

    setLoading(true)

    try {
      const token = getCookie("token")
      if (!token) {
        throw new Error("Не авторизовано")
      }

      const response = await fetch("/api/profile/addresses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newAddress.title,
          fullName: newAddress.fullName,
          phone: newAddress.phone,
          address: newAddress.address,
          city: newAddress.city,
          postal: newAddress.postal,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Не вдалося додати адресу")
      }

      const data = await response.json()
      setAddresses((prev) => [...prev, data.address])
      setSelectedAddress(String(data.address.id))
      setShowNewAddressForm(false)
      setNewAddress({
        title: "",
        fullName: "",
        phone: "",
        address: "",
        city: "",
        postal: "",
      })
      toast.success("Адресу успішно додано.")
    } catch (err: any) {
      toast.error(`Помилка під час додавання адреси: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleNextStep = () => {
    if (step === 1) {
      if (cartItems.length === 0) {
        toast.error("Ваш кошик порожній")
        return
      }
      setStep(2)
    } else if (step === 2) {
      if (!selectedAddress) {
        toast.error("Будь ласка, виберіть адресу доставки")
        return
      }
      setStep(3)
    }
  }

  const handlePrevStep = () => {
    setStep((prev) => Math.max(1, prev - 1))
  }

  const handlePlaceOrder = async () => {
    if (!selectedPayment) {
      toast.error("Будь ласка, виберіть спосіб оплати")
      return
    }

    setLoading(true)

    try {
      const token = getCookie("token")
      if (!token) {
        throw new Error("Не авторизовано")
      }

      const orderData = {
        items: cartItems,
        addressId: selectedAddress ? parseInt(selectedAddress) : null,
        paymentId: selectedPayment,
        deliveryMethod,
        comment,
        total,
      }

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Не вдалося оформити замовлення")
      }

      setSuccess(true)
      setTimeout(() => {
        router.push("/checkout/success")
      }, 2000)
    } catch (err: any) {
      toast.error(`Помилка під час оформлення замовлення: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  if (success) {
    return (
      <div>
        <div className="container mx-auto py-16 px-4 text-center">
          <div className="bg-green-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <Check className="h-10 w-10 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Замовлення успішно оформлено!</h1>
          <p className="text-gray-600 mb-8">
            Дякуємо за ваше замовлення. Ми надіслали деталі на вашу електронну пошту.
          </p>
          <div className="flex justify-center gap-4">
            <Button onClick={() => router.push("/profile")}>Перейти до профілю</Button>
            <Button variant="outline" onClick={() => router.push("/")}>
              Повернутися на головну
            </Button>
          </div>
    </div>
      </div>
    )
  }

  return (
    <div>
      <div className="bg-gray-50 py-3 px-4">
        <div className="container mx-auto">
          <div className="flex items-center text-sm text-gray-600">
            <Link href="/" className="hover:text-primary">
              Головна
            </Link>
            <span className="mx-2">/</span>
            <Link href="/cart" className="hover:text-primary">
              Кошик
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">Оформлення замовлення</span>
          </div>
        </div>
      </div>

      <section className="py-8 px-4 bg-white">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold mb-8">Оформлення замовлення</h1>

          <div className="mb-8">
            <div className="flex items-center justify-between max-w-3xl mx-auto">
              <div className={`flex flex-col items-center ${step >= 1 ? "text-primary" : "text-gray-400"}`}>
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${step >= 1 ? "bg-primary text-white" : "bg-gray-200"}`}
                >
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <span className="text-sm">Кошик</span>
              </div>
              <div className={`flex-1 h-1 mx-2 ${step >= 2 ? "bg-primary" : "bg-gray-200"}`}></div>
              <div className={`flex flex-col items-center ${step >= 2 ? "text-primary" : "text-gray-400"}`}>
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${step >= 2 ? "bg-primary text-white" : "bg-gray-200"}`}
                >
                  <Truck className="h-5 w-5" />
                </div>
                <span className="text-sm">Доставка</span>
              </div>
              <div className={`flex-1 h-1 mx-2 ${step >= 3 ? "bg-primary" : "bg-gray-200"}`}></div>
              <div className={`flex flex-col items-center ${step >= 3 ? "text-primary" : "text-gray-400"}`}>
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${step >= 3 ? "bg-primary text-white" : "bg-gray-200"}`}
                >
                  <CreditCard className="h-5 w-5" />
                </div>
                <span className="text-sm">Оплата</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {step === 1 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Товари в кошику</h2>

                  {loading ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                      <ShoppingBag className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500">Завантаження...</p>
                    </div>
                  ) : cartItems.length > 0 ? (
                    <div className="space-y-4">
                      {cartItems.map((item) => {
                        const pricePerUnit = item.price
                        const totalOriginalPriceForLine = pricePerUnit * item.quantity
                        const discountedPricePerUnit = item.isOnSale && item.discount > 0 
                          ? pricePerUnit * (1 - item.discount / 100)
                          : pricePerUnit
                        const totalEffectivePriceForLine = discountedPricePerUnit * item.quantity

                        return (
                          <div key={item.id} className="flex items-center bg-gray-50 p-4 rounded-lg">
                            <div className="h-20 w-20 bg-white rounded overflow-hidden mr-4">
                              <Image
                                src={item.image || "/placeholder.svg"}
                                alt={item.name}
                                width={80}
                                height={80}
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium">{item.name}</h3>
                              <div className="flex items-center mt-1">
                                <span className="font-bold">{discountedPricePerUnit.toFixed(2)} ₴</span>
                                {item.isOnSale && item.discount > 0 && (
                                  <span className="ml-2 text-sm text-gray-500 line-through">{item.price.toFixed(2)} ₴</span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center">
                              <button
                                className="w-8 h-8 flex items-center justify-center border rounded-l-md"
                                onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                                disabled={processing || item.quantity <= 1}
                              >
                                -
                              </button>
                              <div className="w-10 h-8 flex items-center justify-center border-t border-b">
                                {item.quantity}
                              </div>
                              <button
                                className="w-8 h-8 flex items-center justify-center border rounded-r-md"
                                onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                                disabled={processing || (item.stock !== undefined && item.quantity >= item.stock)}
                              >
                                +
                              </button>
                            </div>
                            <div className="ml-4 text-right">
                              <div className="font-bold">
                                {totalEffectivePriceForLine.toFixed(2)} ₴
                              </div>
                              <button
                                className="text-red-500 mt-1 text-sm flex items-center"
                                onClick={() => handleRemoveItem(item.productId)}
                                disabled={processing}
                              >
                                <Trash2 className="h-3 w-3 mr-1" />
                                Видалити
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                      <ShoppingBag className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium mb-2">Ваш кошик порожній</h3>
                      <p className="text-gray-500 mb-6">
                        Додайте товари до кошика, щоб продовжити оформлення замовлення
                      </p>
                      <Link href="/catalog">
                        <Button>Перейти до каталогу</Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {step === 2 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Адреса доставки</h2>

                  {addresses.length > 0 && (
                    <div className="space-y-4 mb-6">
                      <RadioGroup value={selectedAddress || ""} onValueChange={setSelectedAddress}>
                        {addresses.map((address) => (
                          <div key={address.id} className="flex items-start">
                            <RadioGroupItem value={address.id} id={address.id} className="mt-1" />
                            <div className="ml-3 flex-1">
                              <Label htmlFor={address.id} className="font-medium flex items-center">
                                {address.title}
                                {address.isDefault && (
                                  <span className="ml-2 text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                                    За замовчуванням
                                  </span>
                                )}
                              </Label>
                              <div className="text-sm text-gray-600 mt-1">
                                <p>{address.fullName}</p>
                                <p>{address.phone}</p>
                                <p>
                                  {address.address}, {address.city}, {address.postal}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  )}

                  {!showNewAddressForm ? (
                    <Button variant="outline" className="mb-6" onClick={() => setShowNewAddressForm(true)}>
                      <MapPin className="h-4 w-4 mr-2" />
                      Додати нову адресу
                    </Button>
                  ) : (
                    <Card className="mb-6">
                      <CardContent className="pt-6">
                        <h3 className="font-semibold mb-4">Нова адреса</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="title">Назва адреси</Label>
                            <Input
                              id="title"
                              name="title"
                              placeholder="Наприклад: Дім, Робота"
                              value={newAddress.title}
                              onChange={handleNewAddressChange}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="fullName">Ім'я та прізвище*</Label>
                            <Input
                              id="fullName"
                              name="fullName"
                              required
                              value={newAddress.fullName}
                              onChange={handleNewAddressChange}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phone">Телефон *</Label>
                            <Input
                              id="phone"
                              name="phone"
                              required
                              value={newAddress.phone}
                              onChange={handleNewAddressChange}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="city">Місто *</Label>
                            <Input
                              id="city"
                              name="city"
                              required
                              value={newAddress.city}
                              onChange={handleNewAddressChange}
                            />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="address">Адреса *</Label>
                            <Input
                              id="address"
                              name="address"
                              placeholder="Вулиця, будинок, квартира"
                              required
                              value={newAddress.address}
                              onChange={handleNewAddressChange}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="postal">Поштовий індекс</Label>
                            <Input
                              id="postal"
                              name="postal"
                              value={newAddress.postal}
                              onChange={handleNewAddressChange}
                            />
                          </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                          <Button onClick={handleAddNewAddress} disabled={loading}>
                            {loading ? "Збереження..." : "Зберегти адресу"}
                          </Button>
                          <Button variant="outline" onClick={() => setShowNewAddressForm(false)}>
                            Скасувати
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <h2 className="text-xl font-semibold mb-4">Спосіб доставки</h2>

                  <RadioGroup value={deliveryMethod} onValueChange={setDeliveryMethod} className="space-y-4 mb-6">
                    <div className="flex items-start">
                      <RadioGroupItem value="nova-poshta" id="nova-poshta" className="mt-1" />
                      <div className="ml-3 flex-1">
                        <Label htmlFor="nova-poshta" className="font-medium">
                          Нова Пошта
                        </Label>
                        <p className="text-sm text-gray-600">Доставка 1-3 дні</p>
                      </div>
                      <div className="font-medium">50 ₴</div>
                    </div>
                    <div className="flex items-start">
                      <RadioGroupItem value="ukrposhta" id="ukrposhta" className="mt-1" />
                      <div className="ml-3 flex-1">
                        <Label htmlFor="ukrposhta" className="font-medium">
                          Укрпошта
                        </Label>
                        <p className="text-sm text-gray-600">Доставка 3-5 днів</p>
                      </div>
                      <div className="font-medium">40 ₴</div>
                    </div>
                    <div className="flex items-start">
                      <RadioGroupItem value="pickup" id="pickup" className="mt-1" />
                      <div className="ml-3 flex-1">
                        <Label htmlFor="pickup" className="font-medium">
                          Самовивіз
                        </Label>
                        <p className="text-sm text-gray-600">м. Київ, вул. Хрещатик, 1</p>
                      </div>
                      <div className="font-medium">Безкоштовно</div>
                    </div>
                  </RadioGroup>
                </div>
              )}

              {step === 3 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Спосіб оплати</h2>

                  <RadioGroup
                    value={selectedPayment || ""}
                    onValueChange={setSelectedPayment}
                    className="space-y-4 mb-6"
                  >
                    {paymentMethods.map((payment) => (
                      <div key={payment.id} className="flex items-start">
                        <RadioGroupItem value={payment.id} id={payment.id} className="mt-1" />
                        <div className="ml-3 flex-1">
                          <Label htmlFor={payment.id} className="font-medium flex items-center">
                            {payment.type} •••• {payment.last4}
                            {payment.isDefault && (
                              <span className="ml-2 text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                                За замовчуванням
                              </span>
                            )}
                          </Label>
                          <p className="text-sm text-gray-600">Термін дії: {payment.expiry}</p>
                        </div>
                      </div>
                    ))}
                    <div className="flex items-start">
                      <RadioGroupItem value="cash" id="cash" className="mt-1" />
                      <div className="ml-3 flex-1">
                        <Label htmlFor="cash" className="font-medium">
                          Оплата при отриманні
                        </Label>
                        <p className="text-sm text-gray-600">Готівкою або карткою при отриманні</p>
                      </div>
                    </div>
                  </RadioGroup>

                  <h2 className="text-xl font-semibold mb-4">Коментар до замовлення</h2>
                  <div className="mb-6">
                    <Textarea
                      placeholder="Додаткова інформація до замовлення (необов’язково)"
                      className="min-h-[100px]"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-between mt-8">
                {step > 1 ? (
                  <Button variant="outline" onClick={handlePrevStep}>
                    Назад
                  </Button>
                ) : (
                  <Link href="/cart">
                    <Button variant="outline">Повернутися до кошика</Button>
                  </Link>
                )}

                {step < 3 ? (
                  <Button onClick={handleNextStep}>Продовжити</Button>
                ) : (
                  <Button onClick={handlePlaceOrder} disabled={loading} className="min-w-[150px]">
                    {loading ? "Оформлення..." : "Оформити замовлення"}
                  </Button>
                )}
              </div>
            </div>

            <div>
              <div className="bg-gray-50 rounded-lg p-6 sticky top-4">
                <h2 className="text-xl font-semibold mb-4">Підсумок замовлення</h2>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Товари (
                      {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                      )
                    </span>
                    <span>{subtotal.toFixed(2)} ₴</span>
                  </div>
                  {totalCalculatedDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Знижка:</span>
                      <span>-{totalCalculatedDiscount.toFixed(2)} ₴</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Доставка</span>
                    <span>{deliveryPrice.toFixed(2)} ₴</span>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="flex justify-between font-bold text-lg">
                  <span>Загальна сума</span>
                  <span>{total.toFixed(2)} ₴</span>
                </div>

                {step === 3 && (
                  <div className="mt-6">
                    <p className="text-sm text-gray-600 mb-4">
                      Натискаючи кнопку "Оформити замовлення", ви погоджуєтеся з нашими умовами використання та
                      політикою конфіденційності.
                    </p>
                    <Button onClick={handlePlaceOrder} disabled={loading} className="w-full">
                      {loading ? "Оформлення..." : "Оформити замовлення"}
                    </Button>
                  </div>
                )}
              </div>

              <div className="mt-6 bg-gray-50 rounded-lg p-4">
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <CreditCard className="h-4 w-4 mr-2" />
                  <span>Безпечна оплата</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Truck className="h-4 w-4 mr-2" />
                  <span>Швидка доставка по всій Україні</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}