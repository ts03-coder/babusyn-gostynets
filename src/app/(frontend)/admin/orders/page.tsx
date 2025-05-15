"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Bell,
  Download,
  Eye,
  Filter,
  Home,
  LogOut,
  Menu,
  MoreHorizontal,
  Package,
  Pencil,
  Percent,
  Search,
  Settings,
  ShoppingBag,
  Tag,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { getCookie } from "cookies-next"

// Типи для даних замовлення
interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

interface Customer {
  name: string;
  email: string;
}

interface Address {
  address: string;
  city: string;
  postal: string;
  fullName: string;
  phone: string;
}

interface Order {
  id: number;
  user: Customer;
  address: Address | null; // Змінили тип, щоб врахувати можливість null
  items: OrderItem[];
  status: string;
  total: number;
  createdAt: string;
  deliveryMethod?: string;
  paymentId?: string;
  comment?: string;
}

// Статуси замовлень
const orderStatuses = [
  { value: "all", label: "Всі статуси" },
  { value: "PENDING", label: "В очікуванні" },
  { value: "PROCESSING", label: "В обробці" },
  { value: "PAID", label: "Оплачено" },
  { value: "SHIPPED", label: "Відправлено" },
  { value: "DELIVERED", label: "Доставлено" },
  { value: "CANCELLED", label: "Скасовано" },
];

// Функція для отримання кольору статусу
const getStatusColor = (status: string) => {
  switch (status) {
    case "DELIVERED":
      return "bg-green-50 text-green-700 border-green-200";
    case "PROCESSING":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "SHIPPED":
      return "bg-orange-50 text-orange-700 border-orange-200";
    case "PAID":
      return "bg-purple-50 text-purple-700 border-purple-200";
    case "CANCELLED":
      return "bg-red-50 text-red-700 border-red-200";
    case "PENDING":
      return "bg-gray-50 text-gray-700 border-gray-200";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
};

// Функція для форматування статусу у зрозумілій формі
const formatStatus = (status: string) => {
  const statusMap: { [key: string]: string } = {
    PENDING: "В очікуванні",
    PROCESSING: "В обробці",
    PAID: "Оплачено",
    SHIPPED: "Відправлено",
    DELIVERED: "Доставлено",
    CANCELLED: "Скасовано",
  };
  return statusMap[status] || status;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditStatusDialogOpen, setIsEditStatusDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [comment, setComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const token = getCookie("token")

  // Функція для отримання всіх замовлень
  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.orders) {
        setOrders(data.orders);
      } else {
        console.error("Помилка отримання замовлень:", data.error);
      }
    } catch (error) {
      console.error("Помилка при отриманні замовлень:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Виклик при завантаженні сторінки
  useEffect(() => {
    if (token) {
      fetchOrders();
    }
  }, [token]);

  // Фільтрація замовлень за пошуковим запитом та статусом
  const filteredOrders = orders.filter(
    (order) =>
      (order.id.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.user.email.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (selectedStatus === "all" || order.status.toLowerCase() === selectedStatus.toLowerCase())
  );

  // Обробник перегляду замовлення
  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsViewDialogOpen(true);
  };

  // Обробник редагування статусу
  const handleEditStatus = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setComment(order.comment || "");
    setIsEditStatusDialogOpen(true);
  };

  // Обробник збереження нового статусу
  const handleSaveStatus = async () => {
    if (!selectedOrder) return;

    try {
      const response = await fetch(`/api/orders/${selectedOrder.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
          comment,
        }),
      });

      if (response.ok) {
        const updatedOrder = await response.json();
        setOrders((prev) =>
          prev.map((o) => (o.id === selectedOrder.id ? updatedOrder.order : o))
        );
        setIsEditStatusDialogOpen(false);
      } else {
        console.error("Помилка оновлення статусу:", await response.json());
      }
    } catch (error) {
      console.error("Помилка при оновленні статусу:", error);
    }
  };

  // Обробник видалення замовлення
  const handleDeleteOrder = async (order: Order) => {
    setSelectedOrder(order);
    setIsDeleteDialogOpen(true);
  };

  // Обробник підтвердження видалення
  const handleConfirmDelete = async () => {
    if (!selectedOrder) return;

    try {
      const response = await fetch(`/api/orders/${selectedOrder.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setOrders((prev) => prev.filter((o) => o.id !== selectedOrder.id));
        setIsDeleteDialogOpen(false);
      } else {
        console.error("Помилка видалення:", await response.json());
      }
    } catch (error) {
      console.error("Помилка при видаленні замовлення:", error);
    }
  };

  return (
    <div className="flex-1">
      <div className="p-6">
        {/* Заголовок сторінки */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Замовлення</h1>
            <p className="text-gray-500 mt-1">Управління замовленнями вашого магазину</p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Пошук замовлень..."
                className="pl-9 pr-4 w-full sm:w-auto"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              {orderStatuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Таблиця замовлень */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Всі замовлення</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div>Завантаження...</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Клієнт</TableHead>
                      <TableHead>Дата</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Коментар</TableHead>
                      <TableHead>Товарів</TableHead>
                      <TableHead>Сума</TableHead>
                      <TableHead className="text-right">Дії</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div>
                              <div className="font-medium">{order.user.name}</div>
                              <div className="text-xs text-gray-500">{order.user.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(order.createdAt).toLocaleDateString("uk-UA", {
                            day: "numeric",
                            month: "long",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusColor(order.status)}>
                            {formatStatus(order.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>{order.comment}</TableCell>
                        <TableCell>{order.items.length}</TableCell>
                        <TableCell>₴ {order.total}</TableCell>
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
                              <DropdownMenuItem onClick={() => handleViewOrder(order)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Переглянути
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditStatus(order)}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Змінити статус
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDeleteOrder(order)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Видалити
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Діалогове вікно перегляду замовлення */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Інформація про замовлення</DialogTitle>
            <DialogDescription>Детальна інформація про замовлення та товари.</DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold">Замовлення #{selectedOrder.id}</h3>
                  <p className="text-gray-500">
                    {new Date(selectedOrder.createdAt).toLocaleDateString("uk-UA", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <Badge variant="outline" className={getStatusColor(selectedOrder.status)}>
                  {formatStatus(selectedOrder.status)}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Інформація про клієнта</h4>
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="/placeholder.svg" alt={selectedOrder.user.name} />
                      <AvatarFallback>
                        {selectedOrder.user.name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{selectedOrder.user.name}</div>
                      <div className="text-sm text-gray-500">{selectedOrder.user.email}</div>
                    </div>
                  </div>

                  <h4 className="text-sm font-medium text-gray-500 mb-2">Адреса доставки</h4>
                  <p className="text-sm mb-4">
                    {selectedOrder.address ? (
                      <>
                        {selectedOrder.address.fullName}, {selectedOrder.address.address},{" "}
                        {selectedOrder.address.city}, {selectedOrder.address.postal}
                      </>
                    ) : (
                      "Адреса не вказана"
                    )}
                  </p>

                  <h4 className="text-sm font-medium text-gray-500 mb-2">Спосіб оплати</h4>
                  <p className="text-sm mb-4">{selectedOrder.paymentId || "Не вказано"}</p>

                  <h4 className="text-sm font-medium text-gray-500 mb-2">Спосіб доставки</h4>
                  <p className="text-sm">{selectedOrder.deliveryMethod || "Не вказано"}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Товари</h4>
                  <div className="space-y-3 mb-4">
                    {selectedOrder.items.map((product) => (
                      <div key={product.productId} className="flex items-center gap-3 border-b pb-3">
                        <div className="h-12 w-12 rounded bg-gray-100 overflow-hidden">
                          <Image
                            src="/placeholder.svg"
                            alt={product.name}
                            width={48}
                            height={48}
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{product.name}</div>
                          <div className="text-xs text-gray-500">
                            {product.quantity} x ₴{product.price}
                          </div>
                        </div>
                        <div className="font-medium">₴{product.quantity * product.price}</div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-3">
                    <div className="flex justify-between py-1">
                      <span className="text-sm">Сума товарів:</span>
                      <span className="text-sm font-medium">
                        ₴
                        {selectedOrder.items.reduce(
                          (sum, product) => sum + product.price * product.quantity,
                          0
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-sm">Доставка:</span>
                      <span className="text-sm font-medium">₴50</span>
                    </div>
                    <div className="flex justify-between py-2 border-t mt-2">
                      <span className="font-medium">Загальна сума:</span>
                      <span className="font-bold">₴{selectedOrder.total}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Закрити
            </Button>
            <Button
              onClick={() => {
                setIsViewDialogOpen(false);
                if (selectedOrder) handleEditStatus(selectedOrder);
              }}
            >
              Змінити статус
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Діалогове вікно зміни статусу замовлення */}
      <Dialog open={isEditStatusDialogOpen} onOpenChange={setIsEditStatusDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Змінити статус замовлення</DialogTitle>
            <DialogDescription>
              Оберіть новий статус для замовлення #{selectedOrder?.id}.
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="status" className="text-sm font-medium">
                  Статус
                </label>
                <select
                  id="status"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  <option value="PENDING">В очікуванні</option>
                  <option value="PROCESSING">В обробці</option>
                  <option value="PAID">Оплачено</option>
                  <option value="SHIPPED">Відправлено</option>
                  <option value="DELIVERED">Доставлено</option>
                  <option value="CANCELLED">Скасовано</option>
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="comment" className="text-sm font-medium">
                  Коментар (необов’язково)
                </label>
                <textarea
                  id="comment"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[100px]"
                  placeholder="Додайте коментар щодо зміни статусу..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditStatusDialogOpen(false)}>
              Скасувати
            </Button>
            <Button onClick={handleSaveStatus}>Зберегти</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Діалогове вікно видалення замовлення */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Видалити замовлення</DialogTitle>
            <DialogDescription>
              Ви впевнені, що хочете видалити це замовлення? Ця дія не може бути скасована.
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="py-3">
              <p className="text-sm">
                Замовлення <span className="font-medium">#{selectedOrder.id}</span> від{" "}
                <span className="font-medium">{selectedOrder.user.name}</span> на суму{" "}
                <span className="font-medium">₴{selectedOrder.total}</span> буде видалено.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Скасувати
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Видалити
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}