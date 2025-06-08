import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

// Інтерфейс для payload JWT
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

// Обробка PUT-запиту (оновлення категорії)
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> } // Updated typing
) {
  try {
    const params = await context.params; // Await params
    const { id } = params;

    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Не авторизовано" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;

    if (decoded.role !== "ADMIN") {
      return NextResponse.json({ error: "Не авторизовано" }, { status: 401 });
    }

    const formData = await request.formData();
    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string;
    const description = formData.get("description") as string;

    if (!name || !slug) {
      return NextResponse.json({ error: "Назва та slug є обов'язковими" }, { status: 400 });
    }

    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return NextResponse.json({ error: "Категорію не знайдено" }, { status: 404 });
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
        slug,
        description
      },
    });

    return NextResponse.json({ category }, { status: 200 });
  } catch (error: unknown) {
    const apiError = error as ApiError;
    if (apiError.name === "JsonWebTokenError" || apiError.name === "TokenExpiredError") {
      return NextResponse.json({ error: "Недійсний токен" }, { status: 401 });
    }
    return NextResponse.json({ error: apiError.message || "Внутрішня помилка сервера" }, { status: 500 });
  }
}

// Обробка DELETE-запиту (видалення категорії)
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params; // Await params outside try
  const { id } = params; // Define id outside try

  try {
    console.log(`Attempting to delete category with ID: ${id}`); // Log ID

    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("Missing or invalid Authorization header");
      return NextResponse.json({ error: "Не авторизовано" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    console.log("Verifying JWT token"); // Log JWT step
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not defined");
      return NextResponse.json({ error: "Серверна помилка: відсутній ключ JWT" }, { status: 500 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JWTPayload;
    console.log(`Decoded JWT: ${JSON.stringify(decoded)}`); // Log decoded token

    if (decoded.role !== "ADMIN") {
      return NextResponse.json({ error: "Не авторизовано" }, { status: 401 });
    }

    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      return NextResponse.json({ error: "Категорію не знайдено" }, { status: 404 });
    }

    await prisma.category.delete({
      where: { id },
    });

    console.log(`Category with ID ${id} deleted successfully`);
    return NextResponse.json({ message: "Категорію успішно видалено" }, { status: 200 });
  } catch (error: unknown) {
    const apiError = error as ApiError;
    console.error(`Error in DELETE /api/categories/${id}:`, apiError);
    if (apiError.name === "JsonWebTokenError" || apiError.name === "TokenExpiredError") {
      return NextResponse.json({ error: "Недійсний токен" }, { status: 401 });
    }
    if (apiError.code === "P2003") {
      console.log(`Foreign key constraint violation for category ID: ${id}`);
      return NextResponse.json(
        { error: "Неможливо видалити категорію, оскільки вона використовується в інших записах" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: apiError.message || "Внутрішня помилка сервера" },
      { status: 500 }
    );
  }
}

// Налаштування Next.js API (вимикаємо bodyParser для FormData)
export const config = {
  api: {
    bodyParser: false,
  },
};