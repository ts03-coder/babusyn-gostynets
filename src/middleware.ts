import { NextResponse, NextRequest } from "next/server";
import { getCookie } from "cookies-next";
import jwt from "jsonwebtoken";

// Функція для декодування JWT токена
function decodeToken(token: string) {
  try {
    const decoded = jwt.decode(token) as { role?: string } | null;
    console.log("Decoded token MiddlWare:", decoded);
    return decoded;
  } catch (error) {
    console.error("Помилка декодування токена:", error);
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Список маршрутів, які потребують авторизації
  const protectedRoutes = ["/profile", "/cart"];
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  const isAdminRoute = pathname.startsWith("/admin");

  // Отримуємо токен із cookies
  const token = await getCookie("token", { req: request });

  // Перевірка для захищених маршрутів (/profile, /cart)
  if (isProtectedRoute) {
    if (!token || typeof token !== "string") {
      console.log("Токен відсутній для захищеного маршруту:", pathname);
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Декодуємо токен для перевірки його валідності
    const decoded = decodeToken(token);
    if (!decoded) {
      console.log("Недійсний токен для захищеного маршруту:", pathname);
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Якщо токен валідний, дозволяємо доступ
    return NextResponse.next();
  }

  // Перевірка для адмінських маршрутів (/admin)
  if (isAdminRoute) {
    if (!token || typeof token !== "string") {
      console.log("Токен відсутній для адмінського маршруту:", pathname);
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Декодуємо токен для перевірки ролі
    const decoded = decodeToken(token);
    if (!decoded || decoded.role !== "ADMIN") {
      console.log("Недостатньо прав доступу для адмінського маршруту:", { pathname, decoded });
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Якщо роль ADMIN, дозволяємо доступ
    return NextResponse.next();
  }

  // Для всіх інших маршрутів дозволяємо доступ
  return NextResponse.next();
}

// Налаштування middleware для маршрутів
export const config = {
  matcher: ["/admin/:path*", "/profile/:path*", "/cart/:path*"],
};