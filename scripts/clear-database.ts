import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearDatabase() {
  try {
    await prisma.address.deleteMany({});
    await prisma.cart.deleteMany({});
    await prisma.cartItem.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.notificationSettings.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.orderItem.deleteMany({});
    await prisma.paymentMethod.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.slide.deleteMany({});
    await prisma.user.deleteMany({});

    console.log('База данных успешно очищена.');
  } catch (error) {
    console.error('Ошибка при очистке базы данных:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearDatabase();