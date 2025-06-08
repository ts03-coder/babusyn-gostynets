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

export async function PUT(request: Request) {
  try {
    // Перевірка авторизації
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
    const userId = Number(decoded.id);

    // Отримуємо дані з тіла запиту
    const { name, email, phone } = await request.json();

    // Валідація даних
    if (!name && !email && !phone) {
      return NextResponse.json(
        { error: 'At least one field (name, email, or phone) must be provided' },
        { status: 400 }
      );
    }

    if (email) {
      const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!isEmailValid) {
        return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
      }
      // Перевірка, чи email уже зайнятий іншим користувачем
      const existingUser = await prisma.user.findFirst({
        where: { email, NOT: { id: userId } },
      });
      if (existingUser) {
        return NextResponse.json({ error: 'Email is already in use' }, { status: 409 });
      }
    }

    if (phone) {
      const isPhoneValid = /^\+?\d{10,15}$/.test(phone);
      if (!isPhoneValid) {
        return NextResponse.json({ error: 'Invalid phone format' }, { status: 400 });
      }
      // Перевірка, чи телефон уже зайнятий іншим користувачем
      const existingUser = await prisma.user.findFirst({
        where: { phone, NOT: { id: userId } },
      });
      if (existingUser) {
        return NextResponse.json({ error: 'Phone is already in use' }, { status: 409 });
      }
    }

    // Оновлюємо користувача в базі
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name || undefined,
        email: email || undefined,
        phone: phone || undefined,
      },
      select: { id: true, name: true, email: true, phone: true },
    });

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error: unknown) {
    const apiError = error as ApiError;
    console.error('Profile update error:', apiError);
    if (apiError.name === "JsonWebTokenError" || apiError.name === "TokenExpiredError") {
      return NextResponse.json({ error: "Недійсний токен" }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}