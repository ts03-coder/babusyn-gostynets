"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Check, Package, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function CheckoutSuccessPage() {
  const router = useRouter()
  const orderNumber = "ORD-" + Math.floor(10000 + Math.random() * 90000)

  // Перевірка, чи користувач дійсно оформив замовлення
  useEffect(() => {
    // В реальному проекті тут можна перевірити наявність замовлення в localStorage або через API
    const hasOrder = localStorage.getItem("lastOrder")

    // Якщо немає замовлення, перенаправляємо на головну
    if (!hasOrder) {
      // Для демонстрації закоментовано
      // router.push('/')
    }
  }, [router])

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
              Ваше замовлення #{orderNumber} успішно оформлено. Ми надіслали підтвердження на вашу електронну пошту.
            </p>

            <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
              <h2 className="text-lg font-semibold mb-4">Деталі замовлення</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Інформація про доставку</h3>
                  <p className="text-sm">
                    Іван Петренко
                    <br />
                    вул. Хрещатик, 1, кв. 10
                    <br />
                    Київ, 01001
                    <br />
                    +380 (67) 123-4567
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Спосіб доставки</h3>
                  <p className="text-sm">Нова Пошта (1-3 дні)</p>

                  <h3 className="text-sm font-medium text-gray-500 mt-4 mb-2">Спосіб оплати</h3>
                  <p className="text-sm">Visa •••• 4242</p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Товари (3)</span>
                  <span>1,207.00 ₴</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Доставка</span>
                  <span>50.00 ₴</span>
                </div>
                <div className="flex justify-between font-bold text-lg mt-4">
                  <span>Загальна сума</span>
                  <span>1,257.00 ₴</span>
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
