import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getCookie } from "cookies-next"
import jwt from "jsonwebtoken"

const prisma = new PrismaClient()

interface JWTPayload {
  role: string;
  id: number;
  email?: string;
}

export async function GET(request: NextRequest) {
  try {
    // Проверка авторизации (только для администраторов)
    const token = await getCookie("token", { req: request }) as string | undefined
    if (!token) {
      return NextResponse.json({ error: "Не авторизовано" }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as unknown as JWTPayload
    if (decoded.role !== "ADMIN") {
      return NextResponse.json({ error: "Доступ заборонено" }, { status: 403 })
    }

    // Текущая дата
    const today = new Date()
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate())

    // Статистика
    const totalRevenue = await prisma.order.aggregate({
      _sum: { total: true },
      where: { createdAt: { gte: lastMonth } },
    })
    const totalOrders = await prisma.order.count({
      where: { createdAt: { gte: lastMonth } },
    })
    const averageOrderValue = totalOrders > 0 ? (totalRevenue._sum.total || 0) / totalOrders : 0
    const newCustomers = await prisma.user.count({
      where: { createdAt: { gte: lastMonth }, role: "USER" },
    })

    const lastMonthRevenue = await prisma.order.aggregate({
      _sum: { total: true },
      where: { createdAt: { gte: new Date(today.getFullYear(), today.getMonth() - 2, 1), lt: lastMonth } },
    })
    const lastMonthOrders = await prisma.order.count({
      where: { createdAt: { gte: new Date(today.getFullYear(), today.getMonth() - 2, 1), lt: lastMonth } },
    })
    const lastMonthCustomers = await prisma.user.count({
      where: { createdAt: { gte: new Date(today.getFullYear(), today.getMonth() - 2, 1), lt: lastMonth }, role: "USER" },
    })

    const revenueChange = lastMonthRevenue._sum.total
      ? ((totalRevenue._sum.total || 0) - lastMonthRevenue._sum.total) / lastMonthRevenue._sum.total * 100
      : 0
    const ordersChange = lastMonthOrders
      ? ((totalOrders - lastMonthOrders) / lastMonthOrders) * 100
      : 0
    const avgOrderChange = lastMonthOrders > 0
      ? ((averageOrderValue - (lastMonthRevenue._sum.total || 0) / lastMonthOrders) / ((lastMonthRevenue._sum.total || 0) / lastMonthOrders)) * 100
      : 0
    const customersChange = lastMonthCustomers
      ? ((newCustomers - lastMonthCustomers) / lastMonthCustomers) * 100
      : 0

    const stats = [
      {
        title: "Загальний дохід",
        value: `₴ ${totalRevenue._sum.total?.toFixed(2) || "0.00"}`,
        change: `${revenueChange >= 0 ? "+" : ""}${revenueChange.toFixed(1)}%`,
        changeType: revenueChange >= 0 ? "positive" : "negative",
      },
      {
        title: "Замовлень",
        value: totalOrders.toString(),
        change: `${ordersChange >= 0 ? "+" : ""}${ordersChange.toFixed(1)}%`,
        changeType: ordersChange >= 0 ? "positive" : "negative",
      },
      {
        title: "Середній чек",
        value: `₴ ${averageOrderValue.toFixed(2)}`,
        change: `${avgOrderChange >= 0 ? "+" : ""}${avgOrderChange.toFixed(1)}%`,
        changeType: avgOrderChange >= 0 ? "positive" : "negative",
      },
      {
        title: "Нових клієнтів",
        value: newCustomers.toString(),
        change: `${customersChange >= 0 ? "+" : ""}${customersChange.toFixed(1)}%`,
        changeType: customersChange >= 0 ? "positive" : "negative",
      },
    ]

    // Последние заказы
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { user: true },
      where: { createdAt: { gte: lastMonth } },
    })

    const formattedRecentOrders = recentOrders.map(order => ({
      id: order.id.toString().padStart(4, "0"),
      customer: order.user.name || "Невідомий",
      status: order.status,
      statusColor: getStatusColor(order.status),
      date: getRelativeTime(order.createdAt),
      total: `₴ ${order.total.toFixed(2)}`,
    }))

    // Товары с низким запасом
    const lowStockProducts = await prisma.product.findMany({
      where: { stock: { lt: 10 } },
      include: { category: true },
    })

    const formattedLowStockProducts = lowStockProducts.map(product => ({
      id: product.id,
      name: product.name,
      stock: product.stock,
      image: product.image || "/placeholder.svg?height=40&width=40",
    }))

    // Популярные товары (на основе количества продаж за последние 30 дней)
    const popularProductsData = await prisma.orderItem.groupBy({
      by: ["productId", "name"],
      _sum: { quantity: true },
      where: { order: { createdAt: { gte: lastMonth } } },
    })

    const totalSales = popularProductsData.reduce((sum, item) => sum + (item._sum.quantity || 0), 0)
    const popularProducts = popularProductsData
      .map(item => ({
        name: item.name || "Невідомий продукт",
        sales: item._sum.quantity || 0,
        percent: totalSales > 0 ? ((item._sum.quantity || 0) / totalSales) * 100 : 0,
      }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5)

    // Данные для графиков (продажи за последние 30 дней)
    const salesByDate = await prisma.order.groupBy({
      by: ["createdAt"],
      _sum: { total: true },
      where: { createdAt: { gte: lastMonth } },
    })

    const salesData = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(lastMonth)
      date.setDate(date.getDate() + i * 5)
      const dayKey = date.toLocaleDateString("uk-UA", { day: "numeric", month: "short" })
      const sale = salesByDate.find(s => new Date(s.createdAt).toLocaleDateString("uk-UA", { day: "numeric", month: "short" }) === dayKey)
      return { name: dayKey, sales: sale?._sum.total || 0 }
    })

    // Данные для круговой диаграммы (по категориям)
    const categorySales = await prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true },
      where: { order: { createdAt: { gte: lastMonth } } },
    })

    const categoryTotals = await Promise.all(
      categorySales
        .filter(item => item.productId !== null) // Фильтруем null значения
        .map(async item => {
          const product = await prisma.product.findUnique({ 
            where: { id: item.productId! }, // Указываем, что productId не null
            include: { category: true } // Явно включаем category
          })
          return { 
            category: product?.category?.name || "Інше", 
            quantity: item._sum.quantity || 0 
          }
        })
    )

    const categoryData = Object.values(
      categoryTotals.reduce((acc, { category, quantity }) => {
        acc[category] = (acc[category] || 0) + quantity
        return acc
      }, {} as Record<string, number>)
    )
      .map((value, index) => ({
        name: Object.keys(categoryTotals.reduce((acc, { category }) => {
          acc[category] = true
          return acc
        }, {} as Record<string, boolean>))[index] || "Інше",
        value,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)

    const totalCategorySales = categoryData.reduce((sum, item) => sum + item.value, 0)
    const formattedCategoryData = categoryData.map(item => ({
      name: item.name,
      value: totalCategorySales > 0 ? (item.value / totalCategorySales) * 100 : 0,
    }))

    return NextResponse.json({
      stats,
      recentOrders: formattedRecentOrders,
      lowStockProducts: formattedLowStockProducts,
      popularProducts,
      salesData,
      categoryData: formattedCategoryData,
    })
  } catch (error: unknown) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return NextResponse.json({ error: "Недійсний токен" }, { status: 401 })
    }
    console.error("Error fetching dashboard data:", error)
    return NextResponse.json({ error: "Внутрішня помилка сервера" }, { status: 500 })
  }
}

// Вспомогательные функции
function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case "доставлено":
      return "green"
    case "в обробці":
      return "blue"
    case "відправлено":
      return "orange"
    case "оплачено":
      return "purple"
    default:
      return "gray"
  }
}

function getRelativeTime(date: Date) {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMin < 60) return `${diffMin} хв тому`
  if (diffHours < 24) return `${diffHours} год тому`
  return `${diffDays} день тому`
}