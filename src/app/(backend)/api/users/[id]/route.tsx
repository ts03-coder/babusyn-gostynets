import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

interface JWTPayload {
  id: string;
  role: string;
}

interface ApiError extends Error {
  name: string;
  message: string;
  code?: string;
}

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

    const { id, name, email, phone } = await request.json();

    if (!id || !name || !email || !phone) {
      return NextResponse.json({ error: "Обов'язкові поля відсутні" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "Клієнта не знайдено" }, { status: 404 });
    }

    if (existingUser.role !== "USER") {
      return NextResponse.json({ error: "Можна редагувати лише клієнтів з роллю USER" }, { status: 403 });
    }

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { name, email, phone },
    });

    return NextResponse.json({ user }, { status: 200 });
  } catch (error: unknown) {
    const apiError = error as ApiError;
    if (apiError.name === "JsonWebTokenError" || apiError.name === "TokenExpiredError") {
      return NextResponse.json({ error: "Недійсний токен" }, { status: 401 });
    }
    if (apiError.code === "P2002") {
      return NextResponse.json({ error: "Email або телефон уже використовується" }, { status: 400 });
    }
    console.error('Error updating user:', apiError);
    return NextResponse.json({ error: apiError.message || "Внутрішня помилка сервера" }, { status: 500 });
  }
}

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
      return NextResponse.json({ error: "ID клієнта не вказано" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "Клієнта не знайдено" }, { status: 404 });
    }

    if (existingUser.role !== "USER") {
      return NextResponse.json({ error: "Можна видаляти лише клієнтів з роллю USER" }, { status: 403 });
    }

    await prisma.user.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: "Клієнта успішно видалено" }, { status: 200 });
  } catch (error: unknown) {
    const apiError = error as ApiError;
    if (apiError.name === "JsonWebTokenError" || apiError.name === "TokenExpiredError") {
      return NextResponse.json({ error: "Недійсний токен" }, { status: 401 });
    }
    console.error('Error deleting user:', apiError);
    return NextResponse.json({ error: apiError.message || "Внутрішня помилка сервера" }, { status: 500 });
  }
}