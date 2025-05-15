import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { email, phone, password, name } = await request.json();

    // Перевірка, що хоча б email або phone надано
    if (!email && !phone) {
      return NextResponse.json(
        { error: 'Email or phone is required' },
        { status: 400 }
      );
    }

    // Перевірка, що пароль надано
    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    // Перевірка, що ім'я надано
    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    // Перевірка, чи користувач уже існує
    if (email) {
      const existingUserByEmail = await prisma.user.findUnique({
        where: { email },
      });
      if (existingUserByEmail) {
        return NextResponse.json(
          { error: 'User with this email already exists' },
          { status: 400 }
        );
      }
    }

    if (phone) {
      const existingUserByPhone = await prisma.user.findUnique({
        where: { phone },
      });
      if (existingUserByPhone) {
        return NextResponse.json(
          { error: 'User with this phone already exists' },
          { status: 400 }
        );
      }
    }

    // Хешування пароля
    const hashedPassword = await bcrypt.hash(password, 10);

    // Створення нового користувача
    const user = await prisma.user.create({
      data: {
        email: email || null,
        phone: phone || null,
        password: hashedPassword,
        name, // Додаємо ім'я
      },
    });

    // Генерація JWT токена
    const token = jwt.sign(
      { id: user.id, email: user.email, phone: user.phone, name: user.name, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    return NextResponse.json(
      {
        message: 'User registered and authenticated successfully',
        user: { id: user.id, email: user.email, phone: user.phone, name: user.name, role: user.role },
        token,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}