import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
      const authHeader = request.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
  
      const token = authHeader.split(' ')[1];
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
      const userId = decoded.id;
  
      const addressId = parseInt(params.id); // Помилка: params.id використовується синхронно
      if (isNaN(addressId)) {
        return NextResponse.json({ error: 'Invalid address ID' }, { status: 400 });
      }
  
      const address = await prisma.address.findUnique({
        where: { id: addressId, userId },
      });
  
      if (!address) {
        return NextResponse.json({ error: 'Address not found' }, { status: 404 });
      }
  
      return NextResponse.json({ address });
    } catch (error) {
      console.error('Error fetching address:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }