import Link from "next/link"
import { Facebook, Instagram, MapPin, Phone } from "lucide-react"

export default function Footer() {
  return (
    <footer className="relative bg-white border-t py-6 px-4">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Копірайт */}
          <div className="text-gray-600 text-sm">
            © {new Date().getFullYear()} Бабусин Гостинець. Всі права захищені.
          </div>

          {/* Адреса */}
          <div className="flex items-center text-gray-600 text-sm">
            <MapPin className="h-4 w-4 mr-2" />
            Волинська обл. Ковельський район, с. Межисить
          </div>

          {/* Контакти та соціальні мережі */}
          <div className="flex items-center gap-4">
            <Link
              href="https://instagram.com"
              target="_blank"
              aria-label="Instagram"
              className="text-gray-600 hover:text-primary"
            >
              <Instagram className="h-5 w-5" />
            </Link>
            <Link
              href="https://facebook.com"
              target="_blank"
              aria-label="Facebook"
              className="text-gray-600 hover:text-primary"
            >
              <Facebook className="h-5 w-5" />
            </Link>
            <div className="flex items-center text-gray-600 text-sm ml-2">
              <Phone className="h-4 w-4 mr-2" />
              +38 (012) 345-67-89
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
