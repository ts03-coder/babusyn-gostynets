import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';

interface DecodedToken {
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

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
    const userId = Number(decoded.id);

    const addresses = await prisma.address.findMany({
      where: { userId },
    });

    if (!addresses) {
      return NextResponse.json({ error: 'No addresses found' }, { status: 404 });
    }

    return NextResponse.json({ addresses });
  } catch (error: unknown) {
    const apiError = error as ApiError;
    console.error('Error fetching addresses:', apiError);
    if (apiError.name === "JsonWebTokenError" || apiError.name === "TokenExpiredError") {
      return NextResponse.json({ error: "Недійсний токен" }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Не авторизовано' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    let userId: number;

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
      userId = Number(decoded.id);
    } catch (error: unknown) {
      const apiError = error as ApiError;
      console.error('Error verifying token:', apiError);
      return NextResponse.json({ error: 'Недійсний токен' }, { status: 401 });
    }

    const body = await request.json();
    const { title, fullName, phone, address, city, postal } = body;

    // Валідація обов'язкових полів
    if (!fullName || !phone || !address || !city) {
      return NextResponse.json({ error: 'Будь ласка, заповніть усі обов\'язкові поля' }, { status: 400 });
    }

    // Створюємо нову адресу
    const newAddress = await prisma.address.create({
      data: {
        userId,
        title: title || 'Нова адреса',
        fullName,
        phone,
        address,
        city,
        postal: postal || null,
        isDefault: (await prisma.address.count({ where: { userId } })) === 0,
      },
    });

    return NextResponse.json({ address: newAddress }, { status: 201 });
  } catch (error: unknown) {
    const apiError = error as ApiError;
    console.error('Помилка при створенні адреси:', apiError);
    return NextResponse.json({ error: 'Помилка сервера' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}