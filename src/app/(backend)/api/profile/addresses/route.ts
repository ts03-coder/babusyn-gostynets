import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const userId = decoded.id;

    const addresses = await prisma.address.findMany({
      where: { userId },
    });

    if (!addresses) {
      return NextResponse.json({ error: 'No addresses found' }, { status: 404 });
    }

    return NextResponse.json({ addresses });
  } catch (error) {
    console.error('Error fetching addresses:', error);
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
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
      userId = decoded.id;
    } catch (err) {
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
  } catch (error: any) {
    console.error('Помилка при створенні адреси:', error);
    return NextResponse.json({ error: 'Помилка сервера' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}