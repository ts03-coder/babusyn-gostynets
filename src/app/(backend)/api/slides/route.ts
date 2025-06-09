import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";

// Інтерфейс для JWTPayload
interface JWTPayload {
  id: string;
  role: string;
}

interface ApiError extends Error {
  name: string;
  message: string;
  code?: string;
}

// GET: Отримання всіх слайдів
export async function GET() {
  try {
    const slides = await prisma.slide.findMany({
      orderBy: {
        createdAt: "asc",
      },
      select: {
        id: true,
        title: true,
        subtitle: true,
        image: true,
        link: true,
      },
    });

    return NextResponse.json({ slides }, { status: 200 });
  } catch (error: unknown) {
    const apiError = error as ApiError;
    console.error('Error fetching slides:', apiError);
    return NextResponse.json({ error: "Внутрішня помилка сервера" }, { status: 500 });
  }
}

// POST: Створення нового слайду
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
    const title = formData.get("title") as string;
    const subtitle = formData.get("subtitle") as string;
    const link = formData.get("link") as string;
    const imageFile = formData.get("image") as File | null;

    if (!title || !subtitle || !link || !imageFile) {
      return NextResponse.json({ error: "Усі поля обов'язкові" }, { status: 400 });
    }

    // Валідація файлу
    const allowedTypes = /jpeg|jpg|png/;
    const maxFileSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.test(imageFile.type)) {
      return NextResponse.json({ error: "Дозволені лише файли зображень (jpeg, jpg, png)" }, { status: 400 });
    }

    if (imageFile.size > maxFileSize) {
      return NextResponse.json({ error: "Розмір файлу перевищує 5MB" }, { status: 400 });
    }

    // Збереження файлу
    const buffer = Buffer.from(await imageFile.arrayBuffer());
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const fileExt = path.extname(imageFile.name);
    const fileName = `${uniqueSuffix}${fileExt}`;
    const filePath = path.join("public/uploads", fileName);

    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, buffer);

    const imagePath = `/uploads/${fileName}`;

    // Створюємо слайд у базі даних
    const slide = await prisma.slide.create({
      data: {
        title,
        subtitle,
        image: imagePath,
        link,
      },
    });

    return NextResponse.json({ slide }, { status: 201 });
  } catch (error: unknown) {
    const apiError = error as ApiError;
    if (apiError.name === "JsonWebTokenError" || apiError.name === "TokenExpiredError") {
      return NextResponse.json({ error: "Недійсний токен" }, { status: 401 });
    }
    console.error('Error creating slide:', apiError);
    return NextResponse.json({ error: "Внутрішня помилка сервера" }, { status: 500 });
  }
}

// PUT: Оновлення слайду
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

    const url = new URL(request.url);
    const id = url.pathname.split("/").pop();
    if (!id) {
      return NextResponse.json({ error: "ID слайду відсутній" }, { status: 400 });
    }

    // Отримуємо FormData
    const formData = await request.formData();
    const title = formData.get("title") as string;
    const subtitle = formData.get("subtitle") as string;
    const link = formData.get("link") as string;
    const imageFile = formData.get("image") as File | null;

    if (!title || !subtitle || !link) {
      return NextResponse.json({ error: "Усі поля (крім зображення) обов'язкові" }, { status: 400 });
    }

    // Отримання існуючого слайду
    const existingSlide = await prisma.slide.findUnique({ where: { id } });
    if (!existingSlide) {
      return NextResponse.json({ error: "Слайд не знайдено" }, { status: 404 });
    }

    let imagePath = existingSlide.image;

    // Якщо завантажено нове зображення, видаляємо старе та зберігаємо нове
    if (imageFile) {
      // Валідація файлу
      const allowedTypes = /jpeg|jpg|png/;
      const maxFileSize = 5 * 1024 * 1024; // 5MB

      if (!allowedTypes.test(imageFile.type)) {
        return NextResponse.json({ error: "Дозволені лише файли зображень (jpeg, jpg, png)" }, { status: 400 });
      }

      if (imageFile.size > maxFileSize) {
        return NextResponse.json({ error: "Розмір файлу перевищує 5MB" }, { status: 400 });
      }

      // Видалення старого файлу
      const oldFilePath = path.join(process.cwd(), "public", existingSlide.image);
      try {
        await fs.unlink(oldFilePath);
      } catch (err) {
        console.error("Помилка видалення старого файлу:", err);
      }

      // Збереження нового файлу
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const fileExt = path.extname(imageFile.name);
      const fileName = `${uniqueSuffix}${fileExt}`;
      const filePath = path.join("public/uploads", fileName);

      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, buffer);

      imagePath = `/uploads/${fileName}`;
    }

    const slide = await prisma.slide.update({
      where: { id },
      data: {
        title,
        subtitle,
        image: imagePath,
        link,
      },
    });

    return NextResponse.json({ slide }, { status: 200 });
  } catch (error: unknown) {
    const apiError = error as ApiError;
    if (apiError.name === "JsonWebTokenError" || apiError.name === "TokenExpiredError") {
      return NextResponse.json({ error: "Недійсний токен" }, { status: 401 });
    }
    if (apiError.code === "P2025") {
      return NextResponse.json({ error: "Слайд не знайдено" }, { status: 404 });
    }
    console.error('Error updating slide:', apiError);
    return NextResponse.json({ error: "Внутрішня помилка сервера" }, { status: 500 });
  }
}

// DELETE: Видалення слайду
export async function DELETE(request: NextRequest) {
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

    const url = new URL(request.url);
    const id = url.pathname.split("/").pop();
    if (!id) {
      return NextResponse.json({ error: "ID слайду відсутній" }, { status: 400 });
    }

    // Отримання слайду для видалення файлу
    const slide = await prisma.slide.findUnique({ where: { id } });
    if (!slide) {
      return NextResponse.json({ error: "Слайд не знайдено" }, { status: 404 });
    }

    // Видалення файлу з файлової системи
    const filePath = path.join(process.cwd(), "public", slide.image);
    try {
      await fs.unlink(filePath);
    } catch (err) {
      console.error("Помилка видалення файлу:", err);
    }

    await prisma.slide.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Слайд успішно видалено" }, { status: 200 });
  } catch (error: unknown) {
    const apiError = error as ApiError;
    if (apiError.name === "JsonWebTokenError" || apiError.name === "TokenExpiredError") {
      return NextResponse.json({ error: "Недійсний токен" }, { status: 401 });
    }
    if (apiError.code === "P2025") {
      return NextResponse.json({ error: "Слайд не знайдено" }, { status: 404 });
    }
    console.error('Error deleting slide:', apiError);
    return NextResponse.json({ error: "Внутрішня помилка сервера" }, { status: 500 });
  }
}