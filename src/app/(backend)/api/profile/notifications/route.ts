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
  } catch (error) {
    console.error('Error fetching notification settings:', error);
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
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const userId = decoded.id;

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
  } catch (error) {
    console.error('Error updating notification settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}