import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";
import { promises as fs } from "fs";
import path from "path";

// Визначаємо інтерфейс для JWT payload
interface JWTPayload {
  id: string;
  role: string;
  iat: number;
  exp: number;
}

// Функція для обробки GET-запиту (отримання всіх категорій)
export async function GET(request: NextRequest) {
  try {
    // Перевірка авторизації (необов’язкова)
    let isAdmin = false;
    const authHeader = request.headers.get("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
      if (decoded.role === "ADMIN") {
        isAdmin = true;
      }
    }

    // Якщо це запит від адміна, повертаємо додаткові поля (наприклад, slug, description)
    const categories = await prisma.category.findMany({
      orderBy: {
        id: "asc",
      },
      select: {
        id: true,
        name: true,
        slug: isAdmin ? true : undefined,
        description: isAdmin ? true : undefined,
        image: true,
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    const formattedCategories = categories.map((category) => ({
      ...category,
      productsCount: category._count.products,
      // Видаляємо поля, які не потрібні для звичайних користувачів
      ...(isAdmin ? {} : { slug: undefined, description: undefined }),
    }));

    return NextResponse.json({ categories: formattedCategories }, { status: 200 });
  } catch (error: any) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return NextResponse.json({ error: "Недійсний токен" }, { status: 401 });
    }
    return NextResponse.json({ error: "Внутрішня помилка сервера" }, { status: 500 });
  }
}

// Функція для обробки POST-запиту (додавання нової категорії)
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Не авторизовано" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    if (decoded.role !== "ADMIN") {
      return NextResponse.json({ error: "Не авторизовано" }, { status: 401 });
    }

    // Отримуємо FormData
    const formData = await request.formData();
    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string;
    const description = formData.get("description") as string;
    const imageFile = formData.get("image") as File | null;

    if (!name || !slug) {
      return NextResponse.json({ error: "Назва та slug є обов'язковими" }, { status: 400 });
    }

    let imagePath: string | null = null;
    if (imageFile) {
      // Конвертуємо File у Buffer
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const fileName = `${Date.now()}-${imageFile.name}`;
      const filePath = path.join("public/uploads", fileName);

      // Зберігаємо файл
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, buffer);

      // Зберігаємо відносний шлях до файлу
      imagePath = `/uploads/${fileName}`;
    }

    // Створюємо нову категорію у базі даних
    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
        image: imagePath,
      },
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error: any) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return NextResponse.json({ error: "Недійсний токен" }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || "Внутрішня помилка сервера" }, { status: 500 });
  }
}

// Налаштування для Next.js API (вимикаємо парсинг тіла за замовчуванням)
export const config = {
  api: {
    bodyParser: false,
  },
};