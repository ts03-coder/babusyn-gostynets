import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

interface ApiError extends Error {
  name: string;
  message: string;
  code?: string;
}

interface DecodedToken {
  id: string;
  role: string;
  iat: number;
  exp: number;
}

const verifyToken = (authHeader: string | null) => {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Не авторизовано");
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
    return decoded.id;
  } catch (error) {
    console.error("Помилка верифікації токена:", error);
    throw new Error("Недійсний токен");
  }
};

interface UpdateOrderInput {
  status?: string;
  comment?: string;
}

// GET /api/orders/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = Number(verifyToken(request.headers.get("Authorization")));
    const orderId = Number(id);

    if (isNaN(orderId) || isNaN(userId)) {
      return NextResponse.json({ error: "Недійсний ID" }, { status: 400 });
    }

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
      include: {
        items: { select: { productId: true, name: true, quantity: true, price: true } },
        user: { select: { name: true, email: true } },
        address: { select: { address: true, city: true, postal: true, fullName: true, phone: true } },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Замовлення не знайдено" }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error: unknown) {
    const apiError = error as ApiError;
    console.error("Помилка при отриманні замовлення:", apiError);
    if (apiError.name === "JsonWebTokenError" || apiError.name === "TokenExpiredError") {
      return NextResponse.json({ error: "Недійсний токен" }, { status: 401 });
    }
    return NextResponse.json({ error: apiError.message || "Внутрішня помилка сервера" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// PUT /api/orders/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = Number(verifyToken(request.headers.get("Authorization")));
    const orderId = Number(id);

    if (isNaN(orderId) || isNaN(userId)) {
      return NextResponse.json({ error: "Недійсний ID" }, { status: 400 });
    }

    const body: UpdateOrderInput = await request.json();
    const { status, comment } = body;

    const validStatuses = ["PENDING", "PROCESSING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ error: "Недійсний статус замовлення" }, { status: 400 });
    }

    const existingOrder = await prisma.order.findFirst({
      where: { id: orderId, userId },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: "Замовлення не знайдено" }, { status: 404 });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: status || existingOrder.status,
        comment: comment !== undefined ? comment : existingOrder.comment,
      },
      include: {
        items: { select: { productId: true, name: true, quantity: true, price: true } },
        address: true,
        user: { select: { name: true, email: true } },
      },
    });

    return NextResponse.json({ order: updatedOrder });
  } catch (error: unknown) {
    const apiError = error as ApiError;
    console.error("Помилка при оновленні замовлення:", apiError);
    if (apiError.name === "JsonWebTokenError" || apiError.name === "TokenExpiredError") {
      return NextResponse.json({ error: "Недійсний токен" }, { status: 401 });
    }
    return NextResponse.json({ error: apiError.message || "Внутрішня помилка сервера" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE /api/orders/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = Number(verifyToken(request.headers.get("Authorization")));
    const orderId = Number(id);

    if (isNaN(orderId) || isNaN(userId)) {
      return NextResponse.json({ error: "Недійсний ID" }, { status: 400 });
    }

    const existingOrder = await prisma.order.findFirst({
      where: { id: orderId, userId },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: "Замовлення не знайдено" }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.orderItem.deleteMany({ where: { orderId } });
      await tx.order.delete({ where: { id: orderId } });
    });

    return NextResponse.json({ message: "Замовлення успішно видалено" });
  } catch (error: unknown) {
    const apiError = error as ApiError;
    console.error("Помилка при видаленні замовлення:", apiError);
    if (apiError.name === "JsonWebTokenError" || apiError.name === "TokenExpiredError") {
      return NextResponse.json({ error: "Недійсний токен" }, { status: 401 });
    }
    return NextResponse.json({ error: apiError.message || "Внутрішня помилка сервера" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
