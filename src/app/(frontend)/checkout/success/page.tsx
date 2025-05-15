"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Check, Package, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getCookie } from "cookies-next"

export default function CheckoutSuccessPage() {
  const router = useRouter()
  const [order, setOrder] = useState<any>(null)
  const [address, setAddress] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Отримуємо дані замовлення та адреси з API
  useEffect(() => {
    const fetchOrderAndAddress = async () => {
      try {
        const token = getCookie("token")
        if (!token) {
          setError("Не авторизовано")
          setLoading(false)
          return
        }

        // Отримуємо замовлення
        const orderResponse = await fetch("/api/orders", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (!orderResponse.ok) {
          throw new Error("Не вдалося завантажити замовлення")
        }

        const orderData = await orderResponse.json()
        const latestOrder = orderData.orders[0]
        if (latestOrder) {
          setOrder(latestOrder)

          // Отримуємо адресу, якщо є addressId
          if (latestOrder.addressId) {
            const addressResponse = await fetch(`/api/profile/addresses/${latestOrder.addressId}`, {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            })

            if (!addressResponse.ok) {
              throw new Error("Не вдалося завантажити адресу")
            }

            const addressData = await addressResponse.json()
            setAddress(addressData.address)
          }
        } else {
          setError("Замовлення не знайдено")
        }
      } catch (err: any) {
        setError(err.message || "Помилка при завантаженні замовлення")
      } finally {
        setLoading(false)
      }
    }

    fetchOrderAndAddress()
  }, [])

  if (loading) {
    return <div className="py-16 px-4 text-center">Завантаження...</div>
  }

  if (error || !order) {
    return (
      <div className="py-16 px-4 text-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error || "Замовлення не знайдено"}
        </div>
        <Button onClick={() => router.push("/")}>Повернутися на головну</Button>
      </div>
    )
  }

  // Розрахунок загальної кількості товарів
  const itemCount = order.items.reduce((sum: number, item: any) => sum + item.quantity, 0)
  const subtotal = order.items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0)
  const deliveryPrice = 50.00 // Фіксована вартість доставки
  const total = subtotal + deliveryPrice

  return (
    <div>
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-3xl">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="bg-green-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <Check className="h-10 w-10 text-green-500" />
            </div>

            <h1 className="text-3xl font-bold mb-4">Дякуємо за ваше замовлення!</h1>
            <p className="text-gray-600 mb-6">
              Ваше замовлення #{order.id} успішно оформлено. Ми надіслали підтвердження на вашу електронну пошту.
            </p>

            <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
              <h2 className="text-lg font-semibold mb-4">Деталі замовлення</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Інформація про доставку</h3>
                  <p className="text-sm">
                    {address ? (
                      <>
                        {address.fullName}
                        <br />
                        {address.address}
                        <br />
                        {address.city}, {address.postal}
                        <br />
                        {address.phone}
                      </>
                    ) : (
                      "Адреса не вказана"
                    )}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Спосіб доставки</h3>
                  <p className="text-sm">
                    {order.deliveryMethod || "Нова Пошта (1-3 дні)"}
                  </p>

                  <h3 className="text-sm font-medium text-gray-500 mt-4 mb-2">Спосіб оплати</h3>
                  <p className="text-sm">
                    {order.paymentId ? `Оплата ${order.paymentId}` : "Visa •••• 4242"}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Товари ({itemCount})</span>
                  <span>{subtotal.toFixed(2)} ₴</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Доставка</span>
                  <span>{deliveryPrice.toFixed(2)} ₴</span>
                </div>
                <div className="flex justify-between font-bold text-lg mt-4">
                  <span>Загальна сума</span>
                  <span>{total.toFixed(2)} ₴</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mb-8 flex items-center">
              <Package className="h-10 w-10 text-primary mr-4" />
              <div className="text-left">
                <h3 className="font-medium">Відстежуйте своє замовлення</h3>
                <p className="text-sm text-gray-600">
                  Ви отримаєте номер для відстеження, як тільки ваше замовлення буде відправлено.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button onClick={() => router.push("/profile")}>Перейти до профілю</Button>
              <Link href="/catalog">
                <Button variant="outline">
                  Продовжити покупки
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}