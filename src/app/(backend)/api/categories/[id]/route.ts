import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";
import { promises as fs } from "fs";
import path from "path";

// Інтерфейс для payload JWT
interface JWTPayload {
  id: string;
  role: string;
  iat: number;
  exp: number;
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
    const imageFile = formData.get("image") as File | null;

    if (!name || !slug) {
      return NextResponse.json({ error: "Назва та slug є обов'язковими" }, { status: 400 });
    }

    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return NextResponse.json({ error: "Категорію не знайдено" }, { status: 404 });
    }

    let imagePath = existingCategory.image;

    if (imageFile) {
      if (imagePath) {
        const oldImagePath = path.join("public", imagePath);
        try {
          await fs.unlink(oldImagePath);
        } catch (err) {
          console.warn("Не вдалося видалити старе зображення:", err);
        }
      }

      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const fileName = `${Date.now()}-${imageFile.name}`;
      const filePath = path.join("public/uploads", fileName);

      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, buffer);

      imagePath = `/uploads/${fileName}`;
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        image: imagePath,
      },
    });

    return NextResponse.json({ category }, { status: 200 });
  } catch (error: any) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return NextResponse.json({ error: "Недійсний токен" }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || "Внутрішня помилка сервера" }, { status: 500 });
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
      console.log("User is not an ADMIN");
      return NextResponse.json({ error: "Не авторизовано" }, { status: 401 });
    }

    console.log(`Fetching category with ID: ${id}`); // Log Prisma query
    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      console.log(`Category with ID ${id} not found`);
      return NextResponse.json({ error: "Категорію не знайдено" }, { status: 404 });
    }

    if (category.image) {
      const imagePath = path.join("public", category.image);
      console.log(`Attempting to delete image at: ${imagePath}`); // Log file deletion
      try {
        await fs.unlink(imagePath);
        console.log(`Image at ${imagePath} deleted successfully`);
      } catch (err) {
        console.warn(`Failed to delete image at ${imagePath}:`, err);
        // Continue with deletion even if image deletion fails
      }
    }

    console.log(`Deleting category with ID: ${id}`); // Log category deletion
    await prisma.category.delete({
      where: { id },
    });

    console.log(`Category with ID ${id} deleted successfully`);
    return NextResponse.json({ message: "Категорію успішно видалено" }, { status: 200 });
  } catch (error: any) {
    console.error(`Error in DELETE /api/categories/${id}:`, error); // id is now accessible
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return NextResponse.json({ error: "Недійсний токен" }, { status: 401 });
    }
    if (error.code === "P2003") {
      // Prisma foreign key constraint error
      console.log(`Foreign key constraint violation for category ID: ${id}`); // id is now accessible
      return NextResponse.json(
        { error: "Неможливо видалити категорію, оскільки вона використовується в інших записах" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Внутрішня помилка сервера" },
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