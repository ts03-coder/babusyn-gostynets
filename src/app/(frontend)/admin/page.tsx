"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  BarChart3,
  Bell,
  Calendar,
  CreditCard,
  DollarSign,
  Home,
  LogOut,
  Package,
  Percent,
  Settings,
  ShoppingBag,
  Tag,
  Users,
  Menu,
  X,
  ChevronDown,
  Search,
} from "lucide-react"
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

export default function AdminDashboard() {
  // Приклад даних для статистики
  const stats = [
    {
      title: "Загальний дохід",
      value: "₴ 124,563",
      change: "+12.5%",
      changeType: "positive",
      icon: <DollarSign className="h-5 w-5 text-muted-foreground" />,
    },
    {
      title: "Замовлень",
      value: "432",
      change: "+8.2%",
      changeType: "positive",
      icon: <ShoppingBag className="h-5 w-5 text-muted-foreground" />,
    },
    {
      title: "Середній чек",
      value: "₴ 288",
      change: "+3.1%",
      changeType: "positive",
      icon: <CreditCard className="h-5 w-5 text-muted-foreground" />,
    },
    {
      title: "Нових клієнтів",
      value: "54",
      change: "-2.5%",
      changeType: "negative",
      icon: <Users className="h-5 w-5 text-muted-foreground" />,
    },
  ]

  // Приклад даних для останніх замовлень
  const recentOrders = [
    {
      id: "ORD-7652",
      customer: "Олена Петренко",
      status: "Доставлено",
      statusColor: "green",
      date: "15 хв тому",
      total: "₴ 1,245",
    },
    {
      id: "ORD-7651",
      customer: "Іван Ковальчук",
      status: "В обробці",
      statusColor: "blue",
      date: "2 год тому",
      total: "₴ 845",
    },
    {
      id: "ORD-7650",
      customer: "Марія Шевченко",
      status: "Відправлено",
      statusColor: "orange",
      date: "5 год тому",
      total: "₴ 1,650",
    },
    {
      id: "ORD-7649",
      customer: "Андрій Мельник",
      status: "Оплачено",
      statusColor: "purple",
      date: "1 день тому",
      total: "₴ 450",
    },
    {
      id: "ORD-7648",
      customer: "Наталія Бондаренко",
      status: "Доставлено",
      statusColor: "green",
      date: "1 день тому",
      total: "₴ 2,150",
    },
  ]

  // Приклад даних для товарів, які закінчуються
  const lowStockProducts = [
    {
      id: "PRD-1234",
      name: "Стейк Рібай",
      stock: 5,
      image: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "PRD-2345",
      name: "Філе Міньйон",
      stock: 3,
      image: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "PRD-3456",
      name: "Домашні Ковбаси",
      stock: 7,
      image: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "PRD-4567",
      name: "Фермерська Качка",
      stock: 2,
      image: "/placeholder.svg?height=40&width=40",
    },
  ]

  // Приклад даних для популярних товарів
  const popularProducts = [
    { name: "Стейк Рібай", sales: 124, percent: 25 },
    { name: "Філе Міньйон", sales: 98, percent: 20 },
    { name: "Домашні Ковбаси", sales: 84, percent: 17 },
    { name: "Фермерська Качка", sales: 65, percent: 13 },
    { name: "Хамон Серрано", sales: 43, percent: 9 },
  ]

  // Дані для графіків
  const salesData = [
    { name: "1 Тра", sales: 4000 },
    { name: "5 Тра", sales: 3000 },
    { name: "10 Тра", sales: 5000 },
    { name: "15 Тра", sales: 2780 },
    { name: "20 Тра", sales: 1890 },
    { name: "25 Тра", sales: 2390 },
    { name: "30 Тра", sales: 3490 },
  ]

  const categoryData = [
    { name: "Стейки", value: 35 },
    { name: "Ковбаси", value: 25 },
    { name: "Птиця", value: 20 },
    { name: "Напівфабрикати", value: 15 },
    { name: "Делікатеси", value: 5 },
  ]

  const COLORS = ["#ff5722", "#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

  return (
      <div className="flex-1 lg:ml-0 pt-16 lg:pt-0">
        <div className="p-6">
          {/* Заголовок сторінки */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Дашборд</h1>
              <p className="text-gray-500 mt-1">Огляд показників вашого магазину</p>
            </div>
          </div>

          {/* Статистика */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {stats.map((stat, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                      <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                    </div>
                    <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center">
                      {stat.icon}
                    </div>
                  </div>
                  <div className="mt-4">
                    <span
                      className={`text-xs font-medium ${
                        stat.changeType === "positive" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {stat.change} з минулого місяця
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Графіки */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Продажі за останні 30 днів</CardTitle>
                <CardDescription>Загальна сума продажів: ₴ 124,563</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={salesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ff5722" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#ff5722" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <CartesianGrid strokeDasharray="3 3" />
                      <Tooltip />
                      <Area type="monotone" dataKey="sales" stroke="#ff5722" fillOpacity={1} fill="url(#colorSales)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Продажі за категоріями</CardTitle>
                <CardDescription>Розподіл продажів за категоріями товарів</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Останні замовлення та Товари на складі */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Останні замовлення</CardTitle>
                  <CardDescription>Останні 5 замовлень у вашому магазині</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  Переглянути всі
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-xs text-gray-500 border-b">
                        <th className="pb-2 font-medium">ID</th>
                        <th className="pb-2 font-medium">Клієнт</th>
                        <th className="pb-2 font-medium">Статус</th>
                        <th className="pb-2 font-medium">Дата</th>
                        <th className="pb-2 font-medium text-right">Сума</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order) => (
                        <tr key={order.id} className="border-b last:border-0">
                          <td className="py-3 text-sm font-medium">{order.id}</td>
                          <td className="py-3 text-sm">{order.customer}</td>
                          <td className="py-3 text-sm">
                            <Badge
                              variant="outline"
                              className={`bg-${order.statusColor}-100 text-${order.statusColor}-700 hover:bg-${order.statusColor}-100`}
                            >
                              {order.status}
                            </Badge>
                          </td>
                          <td className="py-3 text-sm text-gray-500">{order.date}</td>
                          <td className="py-3 text-sm font-medium text-right">{order.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <Tabs defaultValue="low-stock">
                <CardHeader className="pb-0">
                  <div className="flex items-center justify-between">
                    <CardTitle>Склад</CardTitle>
                    <TabsList className="grid grid-cols-2 h-8">
                      <TabsTrigger value="low-stock" className="text-xs">
                        Закінчуються
                      </TabsTrigger>
                      <TabsTrigger value="popular" className="text-xs">
                        Популярні
                      </TabsTrigger>
                    </TabsList>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <TabsContent value="low-stock" className="m-0">
                    <div className="space-y-4">
                      {lowStockProducts.map((product) => (
                        <div key={product.id} className="flex items-center">
                          <div className="h-10 w-10 rounded bg-gray-100 overflow-hidden mr-3">
                            <Image
                              src={product.image || "/placeholder.svg"}
                              alt={product.name}
                              width={40}
                              height={40}
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{product.name}</p>
                            <p className="text-xs text-gray-500">ID: {product.id}</p>
                          </div>
                          <Badge variant="outline" className="ml-2 bg-red-50 text-red-700 border-red-200">
                            {product.stock} шт.
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  <TabsContent value="popular" className="m-0">
                    <div className="space-y-4">
                      {popularProducts.map((product, index) => (
                        <div key={index} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">{product.name}</p>
                            <span className="text-xs text-gray-500">{product.sales} продажів</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div className="bg-primary h-2 rounded-full" style={{ width: `${product.percent}%` }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </CardContent>
              </Tabs>
            </Card>
          </div>
        </div>
      </div>
  )
}
