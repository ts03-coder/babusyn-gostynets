"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { CreditCard, MapPin, Truck, ShoppingBag, Check, AlertCircle, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
  isOnSale?: boolean
  salePrice?: number
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
  const [error, setError] = useState<string | null>(null)
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

  // Розрахунок підсумкової вартості
  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.isOnSale && item.salePrice ? item.salePrice : item.price
    return sum + price * item.quantity
  }, 0)

  const deliveryPrice = 50 // Вартість доставки
  const total = subtotal + deliveryPrice

  // Завантаження даних при монтуванні компонента
  useEffect(() => {
    // Імітація завантаження даних з API
    // В реальному проекті тут будуть запити до API

    // Завантаження товарів з кошика
    const mockCartItems: CartItem[] = [
      {
        id: "1",
        name: "Стейк Рібай",
        price: 599,
        quantity: 1,
        image: "/placeholder.svg?height=80&width=80",
        isOnSale: true,
        salePrice: 509,
      },
      {
        id: "2",
        name: "Домашні Ковбаси",
        price: 349,
        quantity: 2,
        image: "/placeholder.svg?height=80&width=80",
      },
    ]
    setCartItems(mockCartItems)

    // Завантаження адрес
    const mockAddresses: Address[] = [
      {
        id: "addr1",
        title: "Домашня",
        fullName: "Іван Петренко",
        phone: "+380 (67) 123-4567",
        address: "вул. Хрещатик, 1, кв. 10",
        city: "Київ",
        postal: "01001",
        isDefault: true,
      },
      {
        id: "addr2",
        title: "Робоча",
        fullName: "Іван Петренко",
        phone: "+380 (67) 123-4567",
        address: "вул. Велика Васильківська, 72, офіс 14",
        city: "Київ",
        postal: "03150",
        isDefault: false,
      },
    ]
    setAddresses(mockAddresses)

    // Встановлення адреси за замовчуванням
    const defaultAddress = mockAddresses.find((addr) => addr.isDefault)
    if (defaultAddress) {
      setSelectedAddress(defaultAddress.id)
    }

    // Завантаження способів оплати
    const mockPaymentMethods: PaymentMethod[] = [
      {
        id: "pm1",
        type: "Visa",
        last4: "4242",
        expiry: "04/25",
        isDefault: true,
      },
      {
        id: "pm2",
        type: "MasterCard",
        last4: "5678",
        expiry: "09/26",
        isDefault: false,
      },
    ]
    setPaymentMethods(mockPaymentMethods)

    // Встановлення способу оплати за замовчуванням
    const defaultPayment = mockPaymentMethods.find((pm) => pm.isDefault)
    if (defaultPayment) {
      setSelectedPayment(defaultPayment.id)
    }
  }, [])

  // Обробник зміни кількості товару
  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return

    setCartItems((prevItems) => prevItems.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item)))
  }

  // Обробник видалення товару
  const handleRemoveItem = (id: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id))
  }

  // Обробник зміни полів нової адреси
  const handleNewAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewAddress((prev) => ({ ...prev, [name]: value }))
  }

  // Обробник додавання нової адреси
  const handleAddNewAddress = () => {
    // Валідація форми
    if (!newAddress.fullName || !newAddress.phone || !newAddress.address || !newAddress.city) {
      setError("Будь ласка, заповніть всі обов'язкові поля")
      return
    }

    // Створення нової адреси
    const newAddr: Address = {
      id: `addr${Date.now()}`,
      title: newAddress.title || "Нова адреса",
      fullName: newAddress.fullName,
      phone: newAddress.phone,
      address: newAddress.address,
      city: newAddress.city,
      postal: newAddress.postal,
      isDefault: addresses.length === 0, // Якщо це перша адреса, робимо її за замовчуванням
    }

    setAddresses((prev) => [...prev, newAddr])
    setSelectedAddress(newAddr.id)
    setShowNewAddressForm(false)
    setNewAddress({
      title: "",
      fullName: "",
      phone: "",
      address: "",
      city: "",
      postal: "",
    })
  }

  // Обробник переходу до наступного кроку
  const handleNextStep = () => {
    if (step === 1) {
      if (cartItems.length === 0) {
        setError("Ваш кошик порожній")
        return
      }
      setError(null)
      setStep(2)
    } else if (step === 2) {
      if (!selectedAddress) {
        setError("Будь ласка, виберіть адресу доставки")
        return
      }
      setError(null)
      setStep(3)
    }
  }

  // Обробник переходу до попереднього кроку
  const handlePrevStep = () => {
    setError(null)
    setStep((prev) => Math.max(1, prev - 1))
  }

  // Обробник оформлення замовлення
  const handlePlaceOrder = async () => {
    if (!selectedPayment) {
      setError("Будь ласка, виберіть спосіб оплати")
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Імітація запиту до API для створення замовлення
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Успішне оформлення замовлення
      setSuccess(true)

      // Очищення кошика (в реальному проекті)
      // await clearCart()

      // Перенаправлення на сторінку успішного оформлення через 2 секунди
      setTimeout(() => {
        router.push("/checkout/success")
      }, 2000)
    } catch (err) {
      setError("Помилка при оформленні замовлення. Спробуйте ще раз.")
    } finally {
      setLoading(false)
    }
  }

  // Якщо замовлення успішно оформлено, показуємо повідомлення
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
      {/* Хлібні крихти */}
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

          {/* Індикатор прогресу */}
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

          {/* Повідомлення про помилку */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Основний контент (ліва колонка) */}
            <div className="lg:col-span-2">
              {/* Крок 1: Кошик */}
              {step === 1 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Товари в кошику</h2>

                  {cartItems.length > 0 ? (
                    <div className="space-y-4">
                      {cartItems.map((item) => (
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
                              {item.isOnSale && item.salePrice ? (
                                <>
                                  <span className="line-through text-gray-500 text-sm mr-2">{item.price} ₴</span>
                                  <span className="font-bold text-red-600">{item.salePrice} ₴</span>
                                </>
                              ) : (
                                <span className="font-bold">{item.price} ₴</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center">
                            <button
                              className="w-8 h-8 flex items-center justify-center border rounded-l-md"
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            >
                              -
                            </button>
                            <div className="w-10 h-8 flex items-center justify-center border-t border-b">
                              {item.quantity}
                            </div>
                            <button
                              className="w-8 h-8 flex items-center justify-center border rounded-r-md"
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            >
                              +
                            </button>
                          </div>
                          <div className="ml-4 text-right">
                            <div className="font-bold">
                              {(
                                (item.isOnSale && item.salePrice ? item.salePrice : item.price) * item.quantity
                              ).toFixed(2)}{" "}
                              ₴
                            </div>
                            <button
                              className="text-red-500 mt-1 text-sm flex items-center"
                              onClick={() => handleRemoveItem(item.id)}
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Видалити
                            </button>
                          </div>
                        </div>
                      ))}
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

              {/* Крок 2: Доставка */}
              {step === 2 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Адреса доставки</h2>

                  {/* Вибір існуючої адреси */}
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

                  {/* Кнопка додавання нової адреси */}
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
                            <Label htmlFor="fullName">Ім'я та прізвище *</Label>
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
                          <Button onClick={handleAddNewAddress}>Зберегти адресу</Button>
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

              {/* Крок 3: Оплата */}
              {step === 3 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Спосіб оплати</h2>

                  {/* Вибір способу оплати */}
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
                      placeholder="Додаткова інформація до замовлення (необов'язково)"
                      className="min-h-[100px]"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Кнопки навігації */}
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

            {/* Підсумок замовлення (права колонка) */}
            <div>
              <div className="bg-gray-50 rounded-lg p-6 sticky top-4">
                <h2 className="text-xl font-semibold mb-4">Підсумок замовлення</h2>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Товари ({cartItems.reduce((sum, item) => sum + item.quantity, 0)})
                    </span>
                    <span>{subtotal.toFixed(2)} ₴</span>
                  </div>
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
                      Натискаючи кнопку "Оформити замовлення", ви погоджуєтесь з нашими умовами використання та
                      політикою конфіденційності.
                    </p>
                    <Button onClick={handlePlaceOrder} disabled={loading} className="w-full">
                      {loading ? "Оформлення..." : "Оформити замовлення"}
                    </Button>
                  </div>
                )}
              </div>

              {/* Інформація про безпеку */}
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
