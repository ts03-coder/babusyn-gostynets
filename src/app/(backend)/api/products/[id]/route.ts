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

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    // Перевірка авторизації (опціонально, якщо потрібна)
    const authHeader = request.headers.get("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
      if (!decoded) {
        return NextResponse.json({ error: "Недійсний токен" }, { status: 401 });
      }
    }

    // Знаходимо продукт за ID
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Товар не знайдено" }, { status: 404 });
    }

    // Форматування даних для відповіді
    const formattedProduct = {
      id: product.id,
      name: product.name,
      description: product.description || "",
      price: product.salePrice && product.isOnSale ? product.salePrice : product.price,
      oldPrice: product.isOnSale ? product.price : null,
      discount: product.discount || 0,
      weight: "300 г",
      category: product.category?.name || "",
      category_slug: product.category?.slug || "",
      categoryId: product.categoryId,
      isOnSale: product.isOnSale || false,
      inStock: product.stock > 0,
      images: [product.image || "/placeholder.svg?height=600&width=600"],
      ingredients: product.ingredients || "",
    };
    
    console.log("Formatted product:", formattedProduct);
    return NextResponse.json({ product: formattedProduct }, { status: 200 });
  } catch (error: unknown) {
    const apiError = error as ApiError;
    if (apiError.name === "JsonWebTokenError" || apiError.name === "TokenExpiredError") {
      return NextResponse.json({ error: "Недійсний токен" }, { status: 401 });
    }
    return NextResponse.json({ error: apiError.message || "Внутрішня помилка сервера" }, { status: 500 });
  }
}

// Функція для обробки PUT-запиту (оновлення продукту)
export async function PUT(request: NextRequest) {
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
    const id = formData.get("id") as string;
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

    if (!id || !name || !categoryId || !price || !sku || !status) {
      return NextResponse.json({ error: "Обов'язкові поля відсутні" }, { status: 400 });
    }

    // Знаходимо існуючий продукт
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Продукт не знайдено" }, { status: 404 });
    }

    let imagePath = existingProduct.image;
    if (imageFile) {
      // Видаляємо старе зображення, якщо воно існує
      if (imagePath) {
        const oldImagePath = path.join("public", imagePath);
        try {
          await fs.unlink(oldImagePath);
        } catch (err) {
          console.warn("Не вдалося видалити старе зображення:", err);
        }
      }

      // Зберігаємо нове зображення
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const fileName = `${Date.now()}-${imageFile.name}`;
      const filePath = path.join("public/uploads", fileName);

      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, buffer);

      imagePath = `/uploads/${fileName}`;
    }

    // Знаходимо категорію за ID
    const categoryRecord = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!categoryRecord) {
      return NextResponse.json({ error: "Категорію не знайдено" }, { status: 404 });
    }

    // Оновлюємо продукт
    const product = await prisma.product.update({
      where: { id },
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

    return NextResponse.json({ product }, { status: 200 });
  } catch (error: unknown) {
    const apiError = error as ApiError;
    if (apiError.name === "JsonWebTokenError" || apiError.name === "TokenExpiredError") {
      return NextResponse.json({ error: "Недійсний токен" }, { status: 401 });
    }
    return NextResponse.json({ error: apiError.message || "Внутрішня помилка сервера" }, { status: 500 });
  }
}

// Функція для обробки DELETE-запиту (видалення продукту)
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params; // Await params outside try
  const id = params.id; // Define id outside try

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

    if (!id) {
      return NextResponse.json({ error: "ID продукту є обов'язковим" }, { status: 400 });
    }

    // Знаходимо продукт
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json({ error: "Продукт не знайдено" }, { status: 404 });
    }

    // Видаляємо зображення, якщо воно існує
    if (product.image) {
      const imagePath = path.join("public", product.image);
      try {
        await fs.unlink(imagePath);
      } catch (err) {
        console.warn("Не вдалося видалити зображення:", err);
      }
    }

    // Видаляємо продукт
    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Продукт успішно видалено" }, { status: 200 });
  } catch (error: unknown) {
    const apiError = error as ApiError;
    console.error(`Error in DELETE /api/products/${id}:`, apiError);
    if (apiError.name === "JsonWebTokenError" || apiError.name === "TokenExpiredError") {
      return NextResponse.json({ error: "Недійсний токен" }, { status: 401 });
    }
    return NextResponse.json({ error: "Внутрішня помилка сервера" }, { status: 500 });
  }
}

// Налаштування для Next.js API (вимикаємо парсинг тіла за замовчуванням)
export const config = {
  api: {
    bodyParser: false,
  },
};