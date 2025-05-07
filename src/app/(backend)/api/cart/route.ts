import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

// Інтерфейс для JWTPayload
interface JWTPayload {
  id: number; // Тип number, оскільки id у моделі User є Int
  role: string;
}

// GET: Отримання корзини користувача
export async function GET(request: NextRequest) {
  try {
    // Перевірка заголовка авторизації
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("Відсутній або некоректний заголовок Authorization");
      return NextResponse.json({ error: "Не авторизовано" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      console.log("Токен відсутній у заголовку Authorization");
      return NextResponse.json({ error: "Не авторизовано" }, { status: 401 });
    }

    // Перевірка JWT_SECRET
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET не визначений у змінних оточення");
      return NextResponse.json({ error: "Помилка конфігурації сервера" }, { status: 500 });
    }

    // Декодування токена
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JWTPayload;
    if (!decoded.id) {
      console.error("Токен не містить userId:", decoded);
      return NextResponse.json({ error: "Недійсний токен: відсутній userId" }, { status: 401 });
    }

    console.log("Декодований токен:", decoded);

    // Запит до бази даних для отримання корзини
    const cart = await prisma.cart.findUnique({
      where: { userId: decoded.id }, // decoded.id є числом (Int), що відповідає схемі
      include: { items: true },
    });

    if (!cart) {
      console.log(`Корзина для користувача ${decoded.id} не знайдена, повертаємо порожній список`);
      return NextResponse.json({ items: [] }, { status: 200 });
    }

    console.log(`Корзина для користувача ${decoded.id} знайдена:`, cart);
    return NextResponse.json({ items: cart.items }, { status: 200 });
  } catch (error: any) {
    console.error("Помилка в GET /api/cart:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return NextResponse.json({ error: "Недійсний токен" }, { status: 401 });
    }
    return NextResponse.json({ error: "Внутрішня помилка сервера" }, { status: 500 });
  }
}

// POST: Додавання товару в корзину
export async function POST(request: NextRequest) {
  try {
    // Перевірка авторизації
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("Відсутній або некоректний заголовок Authorization");
      return NextResponse.json({ error: "Не авторизовано" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      console.log("Токен відсутній у заголовку Authorization");
      return NextResponse.json({ error: "Не авторизовано" }, { status: 401 });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET не визначений у змінних оточення");
      return NextResponse.json({ error: "Помилка конфігурації сервера" }, { status: 500 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JWTPayload;
    if (!decoded.id) {
      console.error("Токен не містить userId:", decoded);
      return NextResponse.json({ error: "Недійсний токен: відсутній userId" }, { status: 401 });
    }

    console.log("Декодований токен:", decoded);

    // Отримання даних із тіла запиту
    const body = await request.json();
    const { id, name, price, image } = body;

    if (!id || !name || price === undefined || !image) {
      console.log("Відсутні обов'язкові поля:", { id, name, price, image });
      return NextResponse.json({ error: "Відсутні обов'язкові поля" }, { status: 400 });
    }

    // Перевірка, чи існує корзина для користувача
    let cart = await prisma.cart.findUnique({
      where: { userId: decoded.id },
    });

    if (!cart) {
      console.log(`Корзина для користувача ${decoded.id} не існує, створюємо нову`);
      cart = await prisma.cart.create({
        data: { userId: decoded.id },
      });
    }

    // Перевірка, чи товар уже є в корзині
    const existingItem = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId: id },
    });

    if (existingItem) {
      console.log(`Товар ${id} уже є в корзині, оновлюємо кількість`);
      const updatedItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + 1 },
      });
      return NextResponse.json({ item: updatedItem }, { status: 200 });
    }

    console.log(`Додаємо новий товар ${id} до корзини користувача ${decoded.id}`);
    const newItem = await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: id,
        name,
        price,
        image,
        quantity: 1,
      },
    });

    return NextResponse.json({ item: newItem }, { status: 201 });
  } catch (error: any) {
    console.error("Помилка в POST /api/cart:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return NextResponse.json({ error: "Недійсний токен" }, { status: 401 });
    }
    return NextResponse.json({ error: "Внутрішня помилка сервера" }, { status: 500 });
  }
}

// DELETE: Видалення товару або очищення корзини
export async function DELETE(request: NextRequest) {
  try {
    // Перевірка авторизації
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("Відсутній або некоректний заголовок Authorization");
      return NextResponse.json({ error: "Не авторизовано" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      console.log("Токен відсутній у заголовку Authorization");
      return NextResponse.json({ error: "Не авторизовано" }, { status: 401 });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET не визначений у змінних оточення");
      return NextResponse.json({ error: "Помилка конфігурації сервера" }, { status: 500 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JWTPayload;
    if (!decoded.id) {
      console.error("Токен не містить userId:", decoded);
      return NextResponse.json({ error: "Недійсний токен: відсутній userId" }, { status: 401 });
    }

    console.log("Декодований токен:", decoded);

    // Отримання productId із параметрів запиту
    const url = new URL(request.url);
    const productId = url.searchParams.get("productId");

    // Перевірка, чи існує корзина
    const cart = await prisma.cart.findUnique({
      where: { userId: decoded.id },
    });

    if (!cart) {
      console.log(`Корзина для користувача ${decoded.id} не знайдена`);
      return NextResponse.json({ error: "Корзина не знайдена" }, { status: 404 });
    }

    if (productId) {
      // Видалення одного товару
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id, productId },
      });
      console.log(`Товар ${productId} видалено з корзини користувача ${decoded.id}`);
      return NextResponse.json({ message: "Товар видалено з корзини" }, { status: 200 });
    } else {
      // Очищення всієї корзини
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id },
      });
      console.log(`Корзина користувача ${decoded.id} очищена`);
      return NextResponse.json({ message: "Корзина очищена" }, { status: 200 });
    }
  } catch (error: any) {
    console.error("Помилка в DELETE /api/cart:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return NextResponse.json({ error: "Недійсний токен" }, { status: 401 });
    }
    return NextResponse.json({ error: "Внутрішня помилка сервера" }, { status: 500 });
  }
}

// PATCH: Оновлення кількості товару в корзині
export async function PATCH(request: NextRequest) {
  try {
    // Перевірка авторизації
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("Відсутній або некоректний заголовок Authorization");
      return NextResponse.json({ error: "Не авторизовано" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      console.log("Токен відсутній у заголовку Authorization");
      return NextResponse.json({ error: "Не авторизовано" }, { status: 401 });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET не визначений у змінних оточення");
      return NextResponse.json({ error: "Помилка конфігурації сервера" }, { status: 500 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JWTPayload;
    if (!decoded.id) {
      console.error("Токен не містить userId:", decoded);
      return NextResponse.json({ error: "Недійсний токен: відсутній userId" }, { status: 401 });
    }

    console.log("Декодований токен:", decoded);

    // Отримання даних із тіла запиту
    const body = await request.json();
    const { productId, quantity } = body;

    if (!productId || quantity === undefined) {
      console.log("Відсутні обов'язкові поля:", { productId, quantity });
      return NextResponse.json({ error: "Відсутні обов'язкові поля" }, { status: 400 });
    }

    // Перевірка, чи існує корзина
    const cart = await prisma.cart.findUnique({
      where: { userId: decoded.id },
    });

    if (!cart) {
      console.log(`Корзина для користувача ${decoded.id} не знайдена`);
      return NextResponse.json({ error: "Корзина не знайдена" }, { status: 404 });
    }

    // Перевірка, чи існує товар у корзині
    const cartItem = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId },
    });

    if (!cartItem) {
      console.log(`Товар ${productId} не знайдений у корзині користувача ${decoded.id}`);
      return NextResponse.json({ error: "Товар не знайдений у корзині" }, { status: 404 });
    }

    // Якщо кількість < 1, видаляємо товар
    if (quantity < 1) {
      await prisma.cartItem.delete({
        where: { id: cartItem.id },
      });
      console.log(`Товар ${productId} видалено з корзини через кількість < 1`);
      return NextResponse.json({ message: "Товар видалено з корзини" }, { status: 200 });
    }

    // Оновлення кількості
    const updatedItem = await prisma.cartItem.update({
      where: { id: cartItem.id },
      data: { quantity },
    });

    console.log(`Кількість товару ${productId} оновлено до ${quantity}`);
    return NextResponse.json({ item: updatedItem }, { status: 200 });
  } catch (error: any) {
    console.error("Помилка в PATCH /api/cart:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return NextResponse.json({ error: "Недійсний токен" }, { status: 401 });
    }
    return NextResponse.json({ error: "Внутрішня помилка сервера" }, { status: 500 });
  }
}