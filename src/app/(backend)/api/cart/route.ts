import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

// Інтерфейс для JWTPayload
interface JWTPayload {
  id: number; // Тип number, оскільки id у моделі User є Int
  role: string;
}

// Інтерфейс для помилок
interface ApiError extends Error {
  name: string;
  message: string;
  stack?: string;
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

    // Запит до бази даних для отримання корзини з інформацією про продукти
    const cart = await prisma.cart.findUnique({
      where: { userId: decoded.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                price: true,
                image: true,
                stock: true,
                discount: true,
                isOnSale: true, // Додаємо isOnSale
              },
            },
          },
        },
      },
    });

    if (!cart) {
      console.log(`Корзина для користувача ${decoded.id} не знайдена, повертаємо порожній список`);
      return NextResponse.json({ items: [] }, { status: 200 });
    }

    console.log(`Корзина для користувача ${decoded.id} знайдена:`, cart);
    return NextResponse.json({ items: cart.items }, { status: 200 });
  } catch (error: unknown) {
    const apiError = error as ApiError;
    console.error("Помилка в GET /api/cart:", {
      message: apiError.message,
      stack: apiError.stack,
      name: apiError.name,
    });
    if (apiError.name === "JsonWebTokenError" || apiError.name === "TokenExpiredError") {
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
    const { productId, quantity = 1 } = body;

    if (!productId) {
      console.log("Відсутнє обов'язкове поле productId:", { productId });
      return NextResponse.json({ error: "Відсутнє поле productId" }, { status: 400 });
    }

    // Перевірка, чи існує товар у таблиці Product
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      console.log(`Товар із productId ${productId} не знайдено`);
      return NextResponse.json({ error: "Товар не знайдено" }, { status: 404 });
    }

    // Перевірка, чи quantity валідне
    if (quantity < 1) {
      console.log(`Некоректна кількість ${quantity} для товару ${productId}`);
      return NextResponse.json({ error: "Кількість повинна бути більше 0" }, { status: 400 });
    }

    // Перевірка наявності товару на складі
    if (product.stock < quantity) {
      console.log(`Недостатньо товару ${productId} на складі. Запитано: ${quantity}, доступно: ${product.stock}`);
      return NextResponse.json({ error: "Недостатньо товару на складі" }, { status: 400 });
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
      where: { cartId: cart.id, productId },
    });

    if (existingItem) {
      console.log(`Товар ${productId} уже є в корзині, оновлюємо кількість`);
      const newQuantity = existingItem.quantity + quantity;
      if (product.stock < newQuantity) {
        console.log(`Недостатньо товару ${productId} на складі. Запитано: ${newQuantity}, доступно: ${product.stock}`);
        return NextResponse.json({ error: "Недостатньо товару на складі" }, { status: 400 });
      }

      const updatedItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              image: true,
              discount: true,
              stock: true,
              isOnSale: true, // Додаємо isOnSale
            },
          },
        },
      });
      return NextResponse.json({ item: updatedItem }, { status: 200 });
    }

    console.log(`Додаємо новий товар ${productId} до корзини користувача ${decoded.id}`);
    const newItem = await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            image: true,
            discount: true,
            stock: true,
            isOnSale: true, // Додаємо isOnSale
          },
        },
      },
    });

    return NextResponse.json({ item: newItem }, { status: 201 });
  } catch (error: unknown) {
    const apiError = error as ApiError;
    console.error("Помилка в POST /api/cart:", {
      message: apiError.message,
      stack: apiError.stack,
      name: apiError.name,
    });
    if (apiError.name === "JsonWebTokenError" || apiError.name === "TokenExpiredError") {
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
  } catch (error: unknown) {
    const apiError = error as ApiError;
    console.error("Помилка в DELETE /api/cart:", {
      message: apiError.message,
      stack: apiError.stack,
      name: apiError.name,
    });
    if (apiError.name === "JsonWebTokenError" || apiError.name === "TokenExpiredError") {
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
      include: { product: true },
    });

    if (!cartItem) {
      console.log(`Товар ${productId} не знайдений у корзині користувача ${decoded.id}`);
      return NextResponse.json({ error: "Товар не знайдений у корзині" }, { status: 404 });
    }

    // Перевірка наявності товару на складі
    if (cartItem.product.stock < quantity) {
      console.log(`Недостатньо товару ${productId} на складі. Запитано: ${quantity}, доступно: ${cartItem.product.stock}`);
      return NextResponse.json({ error: "Недостатньо товару на складі" }, { status: 400 });
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
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            image: true,
            discount: true,
            stock: true,
            isOnSale: true, // Додаємо isOnSale
          },
        },
      },
    });

    console.log(`Кількість товару ${productId} оновлено до ${quantity}`);
    return NextResponse.json({ item: updatedItem }, { status: 200 });
  } catch (error: unknown) {
    const apiError = error as ApiError;
    console.error("Помилка в PATCH /api/cart:", {
      message: apiError.message,
      stack: apiError.stack,
      name: apiError.name,
    });
    if (apiError.name === "JsonWebTokenError" || apiError.name === "TokenExpiredError") {
      return NextResponse.json({ error: "Недійсний токен" }, { status: 401 });
    }
    return NextResponse.json({ error: "Внутрішня помилка сервера" }, { status: 500 });
  }
}