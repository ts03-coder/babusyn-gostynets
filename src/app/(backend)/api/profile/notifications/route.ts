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

    let notificationSettings = await prisma.notificationSettings.findUnique({
      where: { userId },
    });

    // Якщо налаштувань немає, створюємо їх із значеннями за замовчуванням
    if (!notificationSettings) {
      notificationSettings = await prisma.notificationSettings.create({
        data: {
          userId,
          orderNotifications: true,
          promoNotifications: true,
          newsNotifications: false,
        },
      });
    }

    return NextResponse.json({ notificationSettings });
  } catch (error: unknown) {
    const apiError = error as ApiError;
    console.error('Error fetching notification settings:', apiError);
    if (apiError.name === "JsonWebTokenError" || apiError.name === "TokenExpiredError") {
      return NextResponse.json({ error: "Недійсний токен" }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
    const userId = Number(decoded.id);

    const { orderNotifications, promoNotifications, newsNotifications } = await request.json();

    const updatedSettings = await prisma.notificationSettings.upsert({
      where: { userId },
      update: {
        orderNotifications,
        promoNotifications,
        newsNotifications,
      },
      create: {
        userId,
        orderNotifications,
        promoNotifications,
        newsNotifications,
      },
    });

    return NextResponse.json({ message: 'Notification settings updated', notificationSettings: updatedSettings });
  } catch (error: unknown) {
    const apiError = error as ApiError;
    console.error('Error updating notification settings:', apiError);
    if (apiError.name === "JsonWebTokenError" || apiError.name === "TokenExpiredError") {
      return NextResponse.json({ error: "Недійсний токен" }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}