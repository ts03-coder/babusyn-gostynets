import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

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

interface UpdateOrderInput {
  status?: string;
  comment?: string;
}

// GET /:id - Отримання окремого замовлення
export async function GET_ID(request: Request, { params }: { params: { id: string } }) {
  try {
    const userId = verifyToken(request.headers.get("Authorization"));
    const orderId = parseInt(params.id);

    if (isNaN(orderId)) {
      return NextResponse.json({ error: "Недійсний ID замовлення" }, { status: 400 });
    }

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
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
    });

    if (!order) {
      return NextResponse.json({ error: "Замовлення не знайдено" }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error: any) {
    console.error("Помилка отримання замовлення:", error);
    if (error.message === "Не авторизовано" || error.message === "Недійсний токен") {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: "Внутрішня помилка сервера" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// PUT /:id - Оновлення замовлення (статусу та коментаря)
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const userId = verifyToken(request.headers.get("Authorization"));
    const orderId = parseInt(params.id);

    if (isNaN(orderId)) {
      return NextResponse.json({ error: "Недійсний ID замовлення" }, { status: 400 });
    }

    const body: UpdateOrderInput = await request.json();
    const { status, comment } = body;

    // Перевірка валідності статусу
    const validStatuses = [
      "PENDING",
      "PROCESSING",
      "PAID",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
    ];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ error: "Недійсний статус замовлення" }, { status: 400 });
    }

    // Перевірка існування замовлення
    const existingOrder = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
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
        items: {
          select: {
            productId: true,
            name: true,
            quantity: true,
            price: true,
          },
        },
        address: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ order: updatedOrder });
  } catch (error: any) {
    console.error("Помилка оновлення замовлення:", error);
    if (error.message === "Не авторизовано" || error.message === "Недійсний токен") {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: "Внутрішня помилка сервера" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE /:id - Видалення замовлення
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const userId = verifyToken(request.headers.get("Authorization"));
    const orderId = parseInt(params.id);

    if (isNaN(orderId)) {
      return NextResponse.json({ error: "Недійсний ID замовлення" }, { status: 400 });
    }

    const existingOrder = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: "Замовлення не знайдено" }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      // Видалення елементів замовлення
      await tx.orderItem.deleteMany({
        where: { orderId },
      });

      // Видалення самого замовлення
      await tx.order.delete({
        where: { id: orderId },
      });
    });

    return NextResponse.json({ message: "Замовлення успішно видалено" });
  } catch (error: any) {
    console.error("Помилка видалення замовлення:", error);
    if (error.message === "Не авторизовано" || error.message === "Недійсний токен") {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: "Внутрішня помилка сервера" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}