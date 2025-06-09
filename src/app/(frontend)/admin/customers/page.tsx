"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Eye,
  MoreHorizontal,
  Pencil,
  Search,
  Trash2,
  X,
  Loader2,
} from "lucide-react"
import { getCookie } from "cookies-next"

interface User {
  id: number;
  name: string | null;
  email: string | null;
  phone: string | null;
  birthDate: string | null;
  role: string;
  createdAt: string;
  orders: {
    id: string;
    createdAt: string;
    total: number;
    status: string;
  }[];
}

interface ApiError {
  message: string;
  error?: string;
}

interface EditFormState {
  name: string;
  email: string;
  phone: string;
}

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [editFormState, setEditFormState] = useState<EditFormState>({
    name: "",
    email: "",
    phone: "",
  })
  const [formErrors, setFormErrors] = useState<{ name?: string; email?: string; phone?: string }>({})

  // Функция для показа сообщения (исчезает через 5 секунд)
  const showMessage = (type: "success" | "error", message: string) => {
    if (type === "success") {
      setSuccessMessage(message)
      setErrorMessage(null)
    } else {
      setErrorMessage(message)
      setSuccessMessage(null)
    }
    setTimeout(() => {
      setSuccessMessage(null)
      setErrorMessage(null)
    }, 5000)
  }

  // Валидация формы
  const validateForm = () => {
    const errors: { name?: string; email?: string; phone?: string } = {}
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/ // Простая проверка email
    const phoneRegex = /^\+?[1-9]\d{1,14}$/ // Простая проверка телефона (международный формат)

    if (!editFormState.name) {
      errors.name = "Ім'я є обов'язковим"
    }
    if (!editFormState.email) {
      errors.email = "Email є обов'язковим"
    } else if (!emailRegex.test(editFormState.email)) {
      errors.email = "Невірний формат email"
    }
    if (!editFormState.phone) {
      errors.phone = "Телефон є обов'язковим"
    } else if (!phoneRegex.test(editFormState.phone)) {
      errors.phone = "Невірний формат телефону"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Загрузка пользователей при первом рендере
  useEffect(() => {
    const token = getCookie("token")
    if (!token) {
      showMessage("error", "Будь ласка, увійдіть до системи")
      window.location.href = "/login"
      return
    }

    const fetchUsers = async () => {
      setIsLoading(true)
      try {
        const response = await fetch("/api/users", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.error || "Не вдалося завантажити користувачів")
        }
        // Фильтруем пользователей с ролью USER
        const customers = data.users.filter((user: User) => user.role === "USER")
        setUsers(customers)
      } catch (error: unknown) {
        const apiError = error as ApiError;
        showMessage("error", `Помилка: ${apiError.message || apiError.error || "Невідома помилка"}`)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsers()
  }, [])

  // Фильтрация пользователей по поисковому запросу
  const filteredUsers = users.filter(
    (user) =>
      (user.name && user.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.phone && user.phone.includes(searchQuery)),
  )

  // Обработчики событий для диалоговых окон
  const handleViewUser = (user: User) => {
    setSelectedUser(user)
    setIsViewDialogOpen(true)
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setEditFormState({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
    })
    setFormErrors({}) // Очищаем ошибки при открытии формы
    setIsEditDialogOpen(true)
  }

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user)
    setIsDeleteDialogOpen(true)
  }

  // Обработчик для редактирования пользователя
  const editUser = async () => {
    if (!selectedUser) return

    // Проверяем валидацию формы
    if (!validateForm()) {
      return
    }

    try {
      const token = getCookie("token")
      if (!token) {
        throw new Error("Не авторизовано")
      }

      const { name, email, phone } = editFormState

      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: selectedUser.id,
          name,
          email,
          phone,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Не вдалося оновити користувача")
      }

      setUsers((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id ? { ...u, name, email, phone } : u,
        ),
      )
      setIsEditDialogOpen(false)
      showMessage("success", "Успіх: Клієнта успішно оновлено")
    } catch (error: unknown) {
      const apiError = error as ApiError;
      showMessage("error", `Помилка: ${apiError.message || apiError.error || "Невідома помилка"}`)
    }
  }

  // Обработчик для удаления пользователя
  const deleteUser = async () => {
    if (!selectedUser) return

    try {
      const token = getCookie("token")
      if (!token) {
        throw new Error("Не авторизовано")
      }

      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Не вдалося видалити користувача")
      }

      setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id))
      setIsDeleteDialogOpen(false)
      showMessage("success", "Успіх: Клієнта успішно видалено")
    } catch (error: unknown) {
      const apiError = error as ApiError;
      showMessage("error", `Помилка: ${apiError.message || apiError.error || "Невідома помилка"}`)
    }
  }

  // Обчисление статистики пользователя
  const getUserStats = (user: User) => {
    const ordersCount = user.orders.length
    const totalSpent = user.orders.reduce((sum, order) => sum + order.total, 0)
    const lastOrder = user.orders.length > 0
      ? user.orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0].createdAt
      : null
    return { ordersCount, totalSpent: `₴ ${totalSpent.toLocaleString("uk-UA")}`, lastOrder }
  }

  return (
    <div className="flex-1 lg:ml-0 pt-16 lg:pt-0">
      <div className="p-6">
        {/* Уведомления */}
        {(successMessage || errorMessage) && (
          <div className="mb-6">
            {successMessage && (
              <div className="bg-green-100 text-green-800 p-4 rounded-lg">
                {successMessage}
              </div>
            )}
            {errorMessage && (
              <div className="bg-red-100 text-red-800 p-4 rounded-lg">
                {errorMessage}
              </div>
            )}
          </div>
        )}

        {/* Заголовок страницы */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Клієнти</h1>
            <p className="text-gray-500 mt-1">Управління клієнтами вашого магазину</p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Пошук клієнтів..."
                className="pl-9 pr-9 w-full sm:w-auto"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Таблица клиентов */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Всі клієнти</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                Клієнтів не знайдено
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Клієнт</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Телефон</TableHead>
                      <TableHead>Замовлень</TableHead>
                      <TableHead className="text-right">Дії</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => {
                      const { ordersCount } = getUserStats(user)
                      return (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div>
                                <div className="font-medium">{user.name || "Без імені"}</div>
                                <div className="text-xs text-gray-500">{`CUS-${user.id.toString().padStart(3, "0")}`}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{user.email || "Немає"}</TableCell>
                          <TableCell>{user.phone || "Немає"}</TableCell>
                          <TableCell>{ordersCount}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Дії</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleViewUser(user)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Переглянути
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditUser(user)}>
                                  <Pencil className="h-4 w-4 mr-2" />
                                  Редагувати
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleDeleteUser(user)} className="text-red-600">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Видалити
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Диалоговое окно просмотра клиента */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Інформація про клієнта</DialogTitle>
            <DialogDescription>Детальна інформація про клієнта та історія замовлень.</DialogDescription>
          </DialogHeader>
          {selectedUser && (() => {
            const { ordersCount, totalSpent, lastOrder } = getUserStats(selectedUser)
            return (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div>
                    <h3 className="text-xl font-semibold">{selectedUser.name || "Без імені"}</h3>
                    <p className="text-gray-500">{`CUS-${selectedUser.id.toString().padStart(3, "0")}`}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Контактна інформація</h4>
                    <div className="space-y-2">
                      <p className="text-sm">
                        <span className="font-medium">Email:</span> {selectedUser.email || "Немає"}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Телефон:</span> {selectedUser.phone || "Немає"}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Дата народження:</span>{" "}
                        {selectedUser.birthDate ? new Date(selectedUser.birthDate).toLocaleDateString("uk-UA") : "Немає"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Статистика</h4>
                    <div className="space-y-2">
                      <p className="text-sm">
                        <span className="font-medium">Кількість замовлень:</span> {ordersCount}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Загальна сума витрат:</span> {totalSpent}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Останнє замовлення:</span>{" "}
                        {lastOrder ? new Date(lastOrder).toLocaleDateString("uk-UA") : "Немає"}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-3">Останні замовлення</h4>
                  <div className="border rounded-md overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Дата</TableHead>
                          <TableHead>Статус</TableHead>
                          <TableHead className="text-right">Сума</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedUser.orders.length > 0 ? (
                          selectedUser.orders
                            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                            .slice(0, 3)
                            .map((order) => (
                              <TableRow key={order.id}>
                                <TableCell className="font-medium">{order.id}</TableCell>
                                <TableCell>{new Date(order.createdAt).toLocaleDateString("uk-UA")}</TableCell>
                                <TableCell>
                                  <Badge
                                    variant="outline"
                                    className={
                                      order.status === "DELIVERED"
                                        ? "bg-green-50 text-green-700 border-green-200"
                                        : "bg-yellow-50 text-yellow-700 border-yellow-200"
                                    }
                                  >
                                    {order.status === "DELIVERED" ? "Доставлено" : order.status}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">₴ {order.total.toLocaleString("uk-UA")}</TableCell>
                              </TableRow>
                            ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center">
                              Немає замовлень
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            )
          })()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Закрити
            </Button>
            <Button
              onClick={() => {
                setIsViewDialogOpen(false)
                handleEditUser(selectedUser!)
              }}
            >
              Редагувати
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалоговое окно редактирования клиента */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Редагувати клієнта</DialogTitle>
            <DialogDescription>Змініть інформацію про клієнта та натисніть Зберегти.</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Ім&apos;я
                </label>
                <Input
                  id="name"
                  value={editFormState.name}
                  onChange={(e) => setEditFormState({ ...editFormState, name: e.target.value })}
                  className={formErrors.name ? "border-red-500" : ""}
                />
                {formErrors.name && <p className="text-sm text-red-500">{formErrors.name}</p>}
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={editFormState.email}
                  onChange={(e) => setEditFormState({ ...editFormState, email: e.target.value })}
                  className={formErrors.email ? "border-red-500" : ""}
                />
                {formErrors.email && <p className="text-sm text-red-500">{formErrors.email}</p>}
              </div>
              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium">
                  Телефон
                </label>
                <Input
                  id="phone"
                  value={editFormState.phone}
                  onChange={(e) => setEditFormState({ ...editFormState, phone: e.target.value })}
                  className={formErrors.phone ? "border-red-500" : ""}
                />
                {formErrors.phone && <p className="text-sm text-red-500">{formErrors.phone}</p>}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Скасувати
            </Button>
            <Button onClick={editUser}>Зберегти</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалоговое окно удаления клиента */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Видалити клієнта</DialogTitle>
            <DialogDescription>
              Ви впевнені, що хочете видалити цього клієнта? Ця дія не може бути скасована.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="flex items-center gap-3 py-3">
              <div>
                <div className="font-medium">{selectedUser.name || "Без імені"}</div>
                <div className="text-sm text-gray-500">{selectedUser.email || "Немає"}</div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Скасувати
            </Button>
            <Button variant="destructive" onClick={deleteUser}>
              Видалити
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}