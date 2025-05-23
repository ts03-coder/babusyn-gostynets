import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

// Типи для типізації даних
interface OrderItemInput {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

interface OrderInput {
  items: OrderItemInput[];
  addressId: number;
  paymentId?: string;
  deliveryMethod?: string;
  comment?: string;
  total: number;
}

interface UpdateOrderInput {
  status?: string;
  comment?: string;
}

// Мідлвар для перевірки авторизації
const verifyToken = (authHeader: string | null) => {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Не авторизовано");
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    return decoded.id;
  } catch (err) {
    throw new Error("Недійсний токен");
  }
};

export async function GET(request: Request) {
  try {
    const { userId, role } = verifyToken(request.headers.get("Authorization"));

    // Перевірка, чи є користувач адміністратором
    if (role !== "ADMIN") {
      // Якщо не адмін, повертаємо лише замовлення користувача
      const orders = await prisma.order.findMany({
        where: { userId },
        include: {
          items: {
            select: {
              productId: true,
              name: true,
              quantity: true,
              price: true,
            },
          },
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          address: {
            select: {
              address: true,
              city: true,
              postal: true,
              fullName: true,
              phone: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json({ orders });
    }

    // Для адміністраторів повертаємо всі замовлення
    const orders = await prisma.order.findMany({
      include: {
        items: {
          select: {
            productId: true,
            name: true,
            quantity: true,
            price: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        address: {
          select: {
            address: true,
            city: true,
            postal: true,
            fullName: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ orders });
  } catch (error: any) {
    console.error("Помилка отримання замовлень:", error);
    if (error.message === "Не авторизовано" || error.message === "Недійсний токен") {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: "Внутрішня помилка сервера" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// POST - Створення нового замовлення
export async function POST(request: Request) {
  try {
    const userId = verifyToken(request.headers.get("Authorization"));

    const body: OrderInput = await request.json();
    const { items, addressId, paymentId, deliveryMethod, comment, total } = body;

    // Валідація вхідних даних
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Товари відсутні або мають некоректний формат" },
        { status: 400 }
      );
    }
    if (!total || typeof total !== "number") {
      return NextResponse.json(
        { error: "Загальна сума відсутня або некоректна" },
        { status: 400 }
      );
    }
    if (!addressId || typeof addressId !== "number") {
      return NextResponse.json(
        { error: "Адреса доставки відсутня або має некоректний формат" },
        { status: 400 }
      );
    }
    for (const item of items) {
      if (!item.productId || !item.name || !item.quantity || !item.price) {
        return NextResponse.json(
          { error: "Усі товари повинні мати productId, name, quantity та price" },
          { status: 400 }
        );
      }
    }

    // Перевірка існування кошика
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: true },
    });

    if (!cart) {
      return NextResponse.json({ error: "Кошик не знайдено" }, { status: 404 });
    }

    // Створення замовлення в транзакції
    const order = await prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          userId,
          addressId,
          paymentId,
          deliveryMethod,
          status: "PENDING",
          total,
          comment,
          createdAt: new Date(),
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              name: item.name,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: {
          items: true,
          address: true,
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });

      // Очищення кошика
      const cartItems = await tx.cartItem.findMany({
        where: { cartId: cart.id },
      });

      for (const orderItem of createdOrder.items) {
        const matchingCartItems = cartItems.filter(
          (cartItem) =>
            cartItem.productId === orderItem.productId &&
            cartItem.quantity >= orderItem.quantity
        );

        if (matchingCartItems.length > 0) {
          matchingCartItems.sort((a, b) => b.quantity - a.quantity);

          let remainingQuantity = orderItem.quantity;
          for (const cartItem of matchingCartItems) {
            if (remainingQuantity <= 0) break;

            const quantityToDelete = Math.min(remainingQuantity, cartItem.quantity);
            if (quantityToDelete === cartItem.quantity) {
              await tx.cartItem.delete({
                where: { id: cartItem.id },
              });
            } else {
              await tx.cartItem.update({
                where: { id: cartItem.id },
                data: { quantity: cartItem.quantity - quantityToDelete },
              });
            }
            remainingQuantity -= quantityToDelete;
          }
        }
      }

      return createdOrder;
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error: any) {
    console.error("Помилка при створенні замовлення:", error);
    if (error.message === "Не авторизовано" || error.message === "Недійсний токен") {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: "Внутрішня помилка сервера" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

