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

    const paymentMethods = await prisma.paymentMethod.findMany({
      where: { userId },
    });

    if (!paymentMethods) {
      return NextResponse.json({ error: 'No payment methods found' }, { status: 404 });
    }
    
    return NextResponse.json({ paymentMethods });
  } catch (error: unknown) {
    const apiError = error as ApiError;
    console.error('Error fetching payment methods:', apiError);
    if (apiError.name === "JsonWebTokenError" || apiError.name === "TokenExpiredError") {
      return NextResponse.json({ error: "Недійсний токен" }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}