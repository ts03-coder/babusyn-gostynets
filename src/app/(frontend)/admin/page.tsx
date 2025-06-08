"use client"

import { useState, useEffect } from "react"
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
import { getCookie } from "cookies-next"

interface Stat {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative";
}

interface Order {
  id: string;
  customer: string;
  status: string;
  statusColor: string;
  date: string;
  total: string;
}

interface Product {
  id: string;
  name: string;
  stock: number;
  image: string;
}

interface PopularProduct {
  name: string;
  sales: number;
  percent: number;
}

interface SalesData {
  name: string;
  sales: number;
}

interface CategoryData {
  name: string;
  value: number;
}

interface DashboardData {
  stats: Stat[];
  recentOrders: Order[];
  lowStockProducts: Product[];
  popularProducts: PopularProduct[];
  salesData: SalesData[];
  categoryData: CategoryData[];
}

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    stats: [],
    recentOrders: [],
    lowStockProducts: [],
    popularProducts: [],
    salesData: [],
    categoryData: [],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = getCookie("token")
    if (!token) {
      setError("Будь ласка, увійдіть до системи")
      window.location.href = "/login"
      return
    }

    const fetchDashboardData = async () => {
      setIsLoading(true)
      try {
        const response = await fetch("/api/admin-dashboard", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.error || "Не вдалося завантажити дані")
        }
        setDashboardData(data)
      } catch (err: any) {
        setError(`Помилка: ${err.message}`)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const COLORS = ["#ff5722", "#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

  return (
    <div className="flex-1 lg:ml-0 pt-16 lg:pt-0">
      <div className="p-6">
        {/* Ошибка или уведомление */}
        {error && (
          <div className="mb-6 bg-red-100 text-red-800 p-4 rounded-lg">
            {error}
          </div>
        )}

        {/* Заголовок страницы */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Дашборд</h1>
            <p className="text-gray-500 mt-1">Огляд показників вашого магазину</p>
          </div>
        </div>

        {/* Статистика */}
        {isLoading ? (
          <div className="text-center py-4">Завантаження...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {dashboardData.stats.map((stat, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                        <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                      </div>
                      <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center">
                        {stat.title === "Загальний дохід" && <DollarSign className="h-5 w-5 text-muted-foreground" />}
                        {stat.title === "Замовлень" && <ShoppingBag className="h-5 w-5 text-muted-foreground" />}
                        {stat.title === "Середній чек" && <CreditCard className="h-5 w-5 text-muted-foreground" />}
                        {stat.title === "Нових клієнтів" && <Users className="h-5 w-5 text-muted-foreground" />}
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

            {/* Графики */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle>Продажі за останні 30 днів</CardTitle>
                  <CardDescription>
                    Загальна сума продажів: {dashboardData.stats[0]?.value || "₴ 0.00"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={dashboardData.salesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
                          data={dashboardData.categoryData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {dashboardData.categoryData.map((entry, index) => (
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

            {/* Последние заказы и товары на складе */}
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
                        {dashboardData.recentOrders.map((order) => (
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
                        {dashboardData.lowStockProducts.map((product) => (
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
                        {dashboardData.popularProducts.map((product, index) => (
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
          </>
        )}
      </div>
    </div>
  )
}