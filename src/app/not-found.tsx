import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Home, ArrowLeft, ShoppingBag } from "lucide-react"

export default function NotFound() {
  return (
      <main className="flex-grow flex items-center justify-center py-16 px-4">
        <div className="container max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <div className="relative w-64 h-64 mx-auto mb-6">
              <Image src="/placeholder.svg?height=256&width=256" alt="404 Ілюстрація" fill className="object-contain" />
            </div>

            <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
            <h2 className="text-2xl font-semibold mb-4">Сторінку не знайдено</h2>
            <p className="text-gray-600 max-w-lg mx-auto mb-8">
              Вибачте, але сторінка, яку ви шукаєте, не існує або була переміщена. Перевірте URL-адресу або
              скористайтеся одним із посилань нижче.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button asChild size="lg" className="gap-2">
                <Link href="/">
                  <Home className="h-5 w-5" />
                  На головну
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="gap-2">
                <Link href="/catalog">
                  <ShoppingBag className="h-5 w-5" />
                  До каталогу
                </Link>
              </Button>
              <Button variant="ghost" size="lg" className="gap-2" onClick={() => window.history.back()}>
                <ArrowLeft className="h-5 w-5" />
                Повернутися назад
              </Button>
            </div>
          </div>
        </div>
      </main>
  )
}
