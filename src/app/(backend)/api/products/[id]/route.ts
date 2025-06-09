import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";
import { promises as fs } from "fs";
import path from "path";

interface JWTPayload {
  id: string;
  role: string;
  iat: number;
  exp: number;
}

interface ApiError extends Error {
  name: string;
  message: string;
  code?: string;
}

const verifyToken = (authHeader: string | null): JWTPayload => {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Не авторизовано");
  }

  const token = authHeader.split(" ")[1];
  return jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
};

// GET /api/products/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const authHeader = request.headers.get("Authorization");
    if (authHeader) {
      verifyToken(authHeader); // авторизация опциональна
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!product) {
      return NextResponse.json({ error: "Товар не знайдено" }, { status: 404 });
    }

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

    return NextResponse.json({ product: formattedProduct }, { status: 200 });
  } catch (error: unknown) {
    const apiError = error as ApiError;
    if (apiError.name === "JsonWebTokenError" || apiError.name === "TokenExpiredError") {
      return NextResponse.json({ error: "Недійсний токен" }, { status: 401 });
    }
    return NextResponse.json({ error: apiError.message || "Внутрішня помилка сервера" }, { status: 500 });
  }
}

// PUT /api/products/[id]
export async function PUT(request: NextRequest) {
  try {
    const decoded = verifyToken(request.headers.get("Authorization"));
    if (decoded.role !== "ADMIN") {
      return NextResponse.json({ error: "Не авторизовано" }, { status: 401 });
    }

    const formData = await request.formData();
    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const categoryId = formData.get("categoryId") as string;
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

    if (!id || !name || !categoryId || isNaN(price) || !sku || !status) {
      return NextResponse.json({ error: "Обов'язкові поля відсутні" }, { status: 400 });
    }

    const existingProduct = await prisma.product.findUnique({ where: { id } });
    if (!existingProduct) {
      return NextResponse.json({ error: "Продукт не знайдено" }, { status: 404 });
    }

    let imagePath = existingProduct.image;
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

    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) {
      return NextResponse.json({ error: "Категорію не знайдено" }, { status: 404 });
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        categoryId: category.id,
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

// DELETE /api/products/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const decoded = verifyToken(request.headers.get("Authorization"));
    if (decoded.role !== "ADMIN") {
      return NextResponse.json({ error: "Не авторизовано" }, { status: 401 });
    }

    if (!id) {
      return NextResponse.json({ error: "ID продукту є обов'язковим" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return NextResponse.json({ error: "Продукт не знайдено" }, { status: 404 });
    }

    if (product.image) {
      const imagePath = path.join("public", product.image);
      try {
        await fs.unlink(imagePath);
      } catch (err) {
        console.warn("Не вдалося видалити зображення:", err);
      }
    }

    await prisma.product.delete({ where: { id } });

    return NextResponse.json({ message: "Продукт успішно видалено" }, { status: 200 });
  } catch (error: unknown) {
    const apiError = error as ApiError;
    console.error("DELETE error:", apiError);
    if (apiError.name === "JsonWebTokenError" || apiError.name === "TokenExpiredError") {
      return NextResponse.json({ error: "Недійсний токен" }, { status: 401 });
    }
    return NextResponse.json({ error: apiError.message || "Внутрішня помилка сервера" }, { status: 500 });
  }
}

// Отключение встроенного bodyParser (на случай, если используется pages router — в app router не обязательно)
export const config = {
  api: {
    bodyParser: false,
  },
};
