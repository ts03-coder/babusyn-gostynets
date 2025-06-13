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

// Інтерфейс для помилок
interface ApiError extends Error {
  name: string;
  message: string;
  code?: string;
}

// Типи для фільтрів
interface ProductWhere {
  name?: {
    contains: string;
    mode: "insensitive";
  };
  categoryId?: {
    in: string[];
  };
  price?: {
    gte: number;
    lte: number;
  };
  isOnSale?: boolean;
}

interface ProductOrderBy {
  price?: "asc" | "desc";
  createdAt?: "desc";
  id?: "asc";
}

// Функція для обробки GET-запиту (отримання всіх продуктів)
export async function GET(request: NextRequest) {
  try {
    // Перевірка авторизації (необов'язкова)
    let isAdmin = false;
    const authHeader = request.headers.get("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
      if (decoded.role === "ADMIN") {
        isAdmin = true;
      }
    }

    // Отримання параметрів запиту
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "9");
    const skip = (page - 1) * limit;
    const search = url.searchParams.get("search") || "";
    const categories = url.searchParams.get("categories")?.split(",") || [];
    const priceMin = parseFloat(url.searchParams.get("priceMin") || "0");
    const priceMax = parseFloat(url.searchParams.get("priceMax") || "1000");
    const onlyOnSale = url.searchParams.get("onlyOnSale") === "true";
    const sort = url.searchParams.get("sort") || "popular";

    // Побудова умов для фільтрації
    const where: ProductWhere = {};

    if (search) {
      where.name = {
        contains: search,
        mode: "insensitive",
      };
    }

    if (categories.length > 0) {
      where.categoryId = {
        in: categories,
      };
    }

    where.price = {
      gte: priceMin,
      lte: priceMax,
    };

    if (onlyOnSale) {
      where.isOnSale = true;
    }

    // Побудова сортування
    const orderBy: ProductOrderBy = {};
    switch (sort) {
      case "price-asc":
        orderBy.price = "asc";
        break;
      case "price-desc":
        orderBy.price = "desc";
        break;
      case "new":
        orderBy.createdAt = "desc";
        break;
      default:
        // За популярністю (можна додати окреме поле для популярності)
        orderBy.id = "asc";
        break;
    }

    // Запит до бази даних
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          categoryId: true,
          price: true,
          stock: true,
          sku: true,
          status: true,
          description: true,
          ingredients: true,
          image: true,
          isOnSale: true,
          discount: true,
          salePrice: true,
          saleStartDate: true,
          saleEndDate: true,
          category: isAdmin ? true : undefined,
        },
      }),
      prisma.product.count({ where }),
    ]);

    console.log("Products:", products); // Додано для налагодження
    return NextResponse.json({ products, total }, { status: 200 });
  } catch (error: unknown) {
    const apiError = error as ApiError;
    if (apiError.name === "JsonWebTokenError" || apiError.name === "TokenExpiredError") {
      return NextResponse.json({ error: "Недійсний токен" }, { status: 401 });
    }
    return NextResponse.json({ error: "Внутрішня помилка сервера" }, { status: 500 });
  }
}

// Функція для обробки POST-запиту (додавання нового продукту)
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
    const categoryId = formData.get("categoryId") as string; // Змінено з category на categoryId
    const price = parseFloat(formData.get("price") as string);
    const stock = parseInt(formData.get("stock") as string);
    const sku = formData.get("sku") as string;
    const status = formData.get("status") as string;
    const description = formData.get("description") as string;
    const ingredients = formData.get("ingredients") as string;
    const imageFile = formData.get("image") as File | null;
    const isOnSale = formData.get("isOnSale") === "true";
    const discount = isOnSale ? parseInt(formData.get("discount") as string) : 0;
    const salePrice = isOnSale ? parseFloat(formData.get("salePrice") as string) : price;
    const saleStartDate = formData.get("saleStartDate") as string;
    const saleEndDate = formData.get("saleEndDate") as string;

    if (!name || !categoryId || !price || !sku || !status) {
      return NextResponse.json({ error: "Обов'язкові поля відсутні" }, { status: 400 });
    }

    let imagePath: string | null = null;
    if (imageFile) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const fileName = `${Date.now()}-${imageFile.name}`;
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      const filePath = path.join(uploadDir, fileName);

      try {
        await fs.mkdir(uploadDir, { recursive: true });
        await fs.writeFile(filePath, buffer);
        imagePath = `/uploads/${fileName}`;
      } catch (error) {
        console.error('Error saving file:', error);
        return NextResponse.json({ error: "Помилка при збереженні файлу" }, { status: 500 });
      }
    }

    // Знаходимо категорію за ID
    const categoryRecord = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!categoryRecord) {
      return NextResponse.json({ error: "Категорію не знайдено" }, { status: 404 });
    }

    // Створюємо новий продукт
    const product = await prisma.product.create({
      data: {
        name,
        categoryId: categoryRecord.id,
        price,
        stock,
        sku,
        status,
        description,
        ingredients,
        image: imagePath,
        isOnSale,
        discount,
        salePrice,
        saleStartDate: isOnSale ? saleStartDate : null,
        saleEndDate: isOnSale ? saleEndDate : null,
      },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error: unknown) {
    const apiError = error as ApiError;
    if (apiError.name === "JsonWebTokenError" || apiError.name === "TokenExpiredError") {
      return NextResponse.json({ error: "Недійсний токен" }, { status: 401 });
    }
    return NextResponse.json({ error: apiError.message || "Внутрішня помилка сервера" }, { status: 500 });
  }
}

// Налаштування для Next.js API (вимикаємо парсинг тіла за замовчуванням)
export const config = {
  api: {
    bodyParser: false,
  },
};