import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma  from "@/lib/prisma";

interface JWTPayload {
  id: string;
  role: string;
}

export async function GET(request: NextRequest) {
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

    const users = await prisma.user.findMany({
      where: {
        role: "USER",
      },
      include: {
        orders: true,
      },
    });

    return NextResponse.json({ users }, { status: 200 });
  } catch (error: any) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return NextResponse.json({ error: "Недійсний токен" }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || "Внутрішня помилка сервера" }, { status: 500 });
  }
}