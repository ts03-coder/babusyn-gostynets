"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import { getCookie } from "cookies-next";
import { User, Package, MapPin, CreditCard, Bell, LogOut, Edit2, Calendar, Box } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { toast } from "sonner";
import ProfileTabButton from "@/components/ProfileTabButton";

interface UserData {
  name: string;
  email: string;
  phone: string;
  avatar?: string;
}

interface Order {
  id: number;
  createdAt: string;
  status: string;
  total: number;
  comment: string;
  items: OrderItem[];
}

interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
}

interface Address {
  id: number;
  title: string;
  address: string;
  city: string;
  postal: string;
  isDefault: boolean;
}

interface PaymentMethod {
  id: number;
  type: string;
  last4: string;
  expiry: string;
  isDefault: boolean;
}

interface NotificationSettings {
  orderNotifications: boolean;
  promoNotifications: boolean;
  newsNotifications: boolean;
}

export type Tab = "personal" | "orders" | "addresses" | "payment" | "notifications";

export default function ProfilePage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const validTabs: Tab[] = ["personal", "orders", "addresses", "payment", "notifications"];
  const initialTab = validTabs.includes(searchParams.get("tab") as Tab)
    ? (searchParams.get("tab") as Tab)
    : "personal";
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);

  const [user, setUser] = useState<UserData | null>(null);
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    orderNotifications: true,
    promoNotifications: true,
    newsNotifications: false,
  });
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const fetchAllData = useCallback(async () => {
    const token = getCookie("token");
    if (!token) {
      window.location.href = "/";
      return;
    }

    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };
      const [userResponse, ordersResponse, addressesResponse, paymentMethodsResponse, notificationsResponse] =
        await Promise.all([
          axios.get("/api/auth/me", { headers }),
          axios.get("/api/orders", { headers }),
          axios.get("/api/profile/addresses", { headers }),
          axios.get("/api/profile/payment-methods", { headers }),
          axios.get("/api/profile/notifications", { headers }),
        ]);

      const userData = userResponse.data.user;
      setUser(userData);
      setProfileForm({
        name: userData.name || "",
        email: userData.email || "",
        phone: userData.phone || "",
      });
      setOrders(ordersResponse.data.orders || []);
      setAddresses(addressesResponse.data.addresses || []);
      setPaymentMethods(paymentMethodsResponse.data.paymentMethods || []);
      setNotificationSettings(notificationsResponse.data.notificationSettings || {});
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Не вдалося завантажити дані. Спробуйте ще раз.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const handleTabChange = useCallback((tab: Tab) => {
    setActiveTab(tab);
    router.push(`/profile?tab=${tab}`, { scroll: false });
  }, [router]);

  const validateProfileForm = useCallback(() => {
    const errors: { [key: string]: string } = {};
    if (!profileForm.name) errors.name = "Ім'я є обов'язковим";
    if (!profileForm.email) errors.email = "Електронна пошта є обов'язковою";
    if (!profileForm.phone) errors.phone = "Телефон є обов'язковим";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [profileForm]);

  const validatePasswordForm = useCallback(() => {
    const errors: { [key: string]: string } = {};
    if (!passwordForm.currentPassword) errors.currentPassword = "Поточний пароль є обов'язковим";
    if (!passwordForm.newPassword) errors.newPassword = "Новий пароль є обов'язковим";
    if (passwordForm.newPassword.length < 6) errors.newPassword = "Пароль має бути не менше 6 символів";
    if (passwordForm.newPassword !== passwordForm.confirmPassword)
      errors.confirmPassword = "Паролі не співпадають";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [passwordForm]);

  const handleProfileSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!validateProfileForm()) return;

      setLoading(true);
      try {
        const token = getCookie("token");
        const response = await axios.put(
          "/api/profile/edit",
          profileForm,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setUser(response.data.user);
        toast.success("Профіль успішно оновлено!");
      } catch (err: any) {
        toast.error(err.response?.data?.error || "Щось пішло не так. Спробуйте ще раз.");
      } finally {
        setLoading(false);
      }
    },
    [profileForm, validateProfileForm]
  );

  const handlePasswordSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!validatePasswordForm()) return;

      setLoading(true);
      try {
        const token = getCookie("token");
        await axios.put(
          "/api/profile/change-password",
          {
            currentPassword: passwordForm.currentPassword,
            newPassword: passwordForm.newPassword,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        toast.success("Пароль успішно змінено!");
      } catch (err: any) {
        toast.error(err.response?.data?.error || "Щось пішло не так. Спробуйте ще раз.");
      } finally {
        setLoading(false);
      }
    },
    [passwordForm, validatePasswordForm]
  );

  const handleNotificationsSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);

      try {
        const token = getCookie("token");
        await axios.put(
          "/api/profile/notifications",
          notificationSettings,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        toast.success("Налаштування сповіщень успішно оновлено!");
      } catch (err: any) {
        toast.error(err.response?.data?.error || "Щось пішло не так. Спробуйте ще раз.");
      } finally {
        setLoading(false);
      }
    },
    [notificationSettings]
  );

  const handleProfileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  }, []);

  const handlePasswordInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  }, []);

  const handleNotificationChange = useCallback((key: keyof NotificationSettings, checked: boolean) => {
    setNotificationSettings((prev) => ({ ...prev, [key]: checked }));
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    window.location.href = "/";
  }, []);

  if (!user) {
    return <div className="py-8 px-4 text-center">Завантаження...</div>;
  }

  return (
    <div>
      <div className="py-3 px-4">
        <div className="container mx-auto">
          <div className="flex items-center text-sm text-gray-600">
            <Link href="/" className="hover:text-primary">
              Головна
            </Link>
            <span className="mx-2">/</span>
            <span>Особистий кабінет</span>
          </div>
        </div>
      </div>

      <section className="py-8 px-4 bg-white">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold mb-8 flex items-center">
            <User className="mr-3 h-8 w-8" />
            Особистий кабінет
          </h1>

          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-1/4">
              <div className="bg-gray-50 rounded-lg p-6 sticky top-4">
                <div className="flex items-center mb-6">
                  <div className="ml-4">
                    <h2 className="font-semibold text-lg">{user.name}</h2>
                    <p className="text-sm text-gray-500">{user.email ? user.email : user.phone}</p>
                  </div>
                </div>

                <nav className="space-y-1">
                  <ProfileTabButton
                    tab="personal"
                    activeTab={activeTab}
                    icon={<User className="h-5 w-5 mr-3" />}
                    label="Особисті дані"
                    onClick={handleTabChange}
                  />
                  <ProfileTabButton
                    tab="orders"
                    activeTab={activeTab}
                    icon={<Package className="h-5 w-5 mr-3" />}
                    label="Історія замовлень"
                    onClick={handleTabChange}
                  />
                  <ProfileTabButton
                    tab="addresses"
                    activeTab={activeTab}
                    icon={<MapPin className="h-5 w-5 mr-3" />}
                    label="Адреси доставки"
                    onClick={handleTabChange}
                  />
                  <ProfileTabButton
                    tab="payment"
                    activeTab={activeTab}
                    icon={<CreditCard className="h-5 w-5 mr-3" />}
                    label="Способи оплати"
                    onClick={handleTabChange}
                  />
                  <ProfileTabButton
                    tab="notifications"
                    activeTab={activeTab}
                    icon={<Bell className="h-5 w-5 mr-3" />}
                    label="Сповіщення"
                    onClick={handleTabChange}
                  />

                  <Separator className="my-3" />

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center p-3 rounded-lg text-left text-red-500 hover:bg-red-50"
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    <span>Вийти з облікового запису</span>
                  </button>
                </nav>
              </div>
            </div>

            <div className="lg:w-3/4">
              <div className="bg-gray-50 rounded-lg p-6">
                {activeTab === "personal" && (
                  <div>
                    <h2 className="text-xl font-semibold mb-6">Особисті дані</h2>
                    <form onSubmit={handleProfileSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="name">Ім'я та прізвище</Label>
                          <Input
                            id="name"
                            name="name"
                            value={profileForm.name}
                            onChange={handleProfileInputChange}
                            className="bg-white"
                          />
                          {formErrors.name && <p className="text-red-500 text-sm">{formErrors.name}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Електронна пошта</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={profileForm.email}
                            onChange={handleProfileInputChange}
                            className="bg-white"
                          />
                          {formErrors.email && <p className="text-red-500 text-sm">{formErrors.email}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Телефон</Label>
                          <Input
                            id="phone"
                            name="phone"
                            value={profileForm.phone}
                            onChange={handleProfileInputChange}
                            className="bg-white"
                          />
                          {formErrors.phone && <p className="text-red-500 text-sm">{formErrors.phone}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="birthday">Дата народження</Label>
                          <Input
                            id="birthday"
                            type="date"
                            className="bg-white"
                            disabled
                          />
                        </div>
                      </div>

                      <div className="pt-4">
                        <Button type="submit" disabled={loading}>
                          {loading ? "Збереження..." : "Зберегти зміни"}
                        </Button>
                      </div>
                    </form>

                    <Separator className="my-8" />

                    <h3 className="text-lg font-semibold mb-4">Зміна пароля</h3>
                    <form onSubmit={handlePasswordSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="current-password">Поточний пароль</Label>
                          <Input
                            id="current-password"
                            name="currentPassword"
                            type="password"
                            value={passwordForm.currentPassword}
                            onChange={handlePasswordInputChange}
                            className="bg-white"
                          />
                          {formErrors.currentPassword && <p className="text-red-500 text-sm">{formErrors.currentPassword}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="new-password">Новий пароль</Label>
                          <Input
                            id="new-password"
                            name="newPassword"
                            type="password"
                            value={passwordForm.newPassword}
                            onChange={handlePasswordInputChange}
                            className="bg-white"
                          />
                          {formErrors.newPassword && <p className="text-red-500 text-sm">{formErrors.newPassword}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirm-password">Підтвердження пароля</Label>
                          <Input
                            id="confirm-password"
                            name="confirmPassword"
                            type="password"
                            value={passwordForm.confirmPassword}
                            onChange={handlePasswordInputChange}
                            className="bg-white"
                          />
                          {formErrors.confirmPassword && <p className="text-red-500 text-sm">{formErrors.confirmPassword}</p>}
                        </div>
                      </div>

                      <div className="pt-4">
                        <Button type="submit" disabled={loading}>
                          {loading ? "Зміна..." : "Змінити пароль"}
                        </Button>
                      </div>
                    </form>
                  </div>
                )}

                {activeTab === "orders" && (
                  <div>
                    <h2 className="text-xl font-semibold mb-6">Історія замовлень</h2>
                    {orders.length > 0 ? (
                      <div className="space-y-6">
                        {orders.map((order) => (
                          <div key={order.id} className="bg-white rounded-lg shadow-sm p-6">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                              <div>
                                <div className="flex items-center">
                                  <h3 className="font-semibold text-lg">{`ORD-${order.id}`}</h3>
                                  <Badge className="ml-3">{order.status}</Badge>
                                </div>
                                <div className="flex items-center text-sm text-gray-500 mt-1">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  {format(new Date(order.createdAt), "dd MMMM yyyy")}
                                  {order.comment && (
                                    <span className="flex items-center ml-4">
                                      <Box className="h-4 w-4 mr-1" />
                                      {order.comment}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="mt-4 md:mt-0">
                                <span className="font-bold text-lg text-primary">{order.total} ₴</span>
                              </div>
                            </div>

                            <Separator className="my-4" />

                            <div className="space-y-3">
                              {order.items.map((item) => (
                                <div key={item.id} className="flex justify-between">
                                  <div className="flex items-center">
                                    <span className="text-gray-800">
                                      {item.name} × {item.quantity}
                                    </span>
                                  </div>
                                  <span className="font-medium">{item.price * item.quantity} ₴</span>
                                </div>
                              ))}
                            </div>

                            <div className="mt-6 flex justify-end">
                              <Button variant="outline">Деталі замовлення</Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-white rounded-lg">
                        <Package className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium mb-2">У вас ще немає замовлень</h3>
                        <p className="text-gray-500 mb-6">Перейдіть до каталогу, щоб зробити ваше перше замовлення</p>
                        <Link href="/catalog">
                          <Button>Перейти до каталогу</Button>
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "addresses" && (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-semibold">Адреси доставки</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {addresses.map((address) => (
                        <div key={address.id} className="bg-white rounded-lg shadow-sm p-6 relative">
                          {address.isDefault && (
                            <Badge className="absolute top-4 right-4" variant="outline">
                              За замовчуванням
                            </Badge>
                          )}
                          <h3 className="font-semibold text-lg mb-1">{address.title}</h3>
                          <p className="text-gray-700 mb-4">{address.address}</p>
                          <p className="text-gray-500 text-sm">
                            {address.city}, {address.postal}
                          </p>

                          <div className="mt-6 flex space-x-3">
                            <Button variant="outline" size="sm">
                              <Edit2 className="h-4 w-4 mr-2" />
                              Редагувати
                            </Button>
                            {!address.isDefault && (
                              <Button variant="outline" size="sm">
                                Зробити основною
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "payment" && (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-semibold">Способи оплати</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {paymentMethods.map((card) => (
                        <div key={card.id} className="bg-white rounded-lg shadow-sm p-6 relative">
                          {card.isDefault && (
                            <Badge className="absolute top-4 right-4" variant="outline">
                              За замовчуванням
                            </Badge>
                          )}
                          <div className="flex items-center mb-4">
                            <div className="w-12 h-8 bg-gray-200 rounded flex items-center justify-center mr-3">
                              {card.type}
                            </div>
                            <div>
                              <h3 className="font-semibold">•••• {card.last4}</h3>
                              <p className="text-gray-500 text-sm">Термін дії: {card.expiry}</p>
                            </div>
                          </div>

                          <div className="flex space-x-3">
                            {!card.isDefault && (
                              <Button variant="outline" size="sm">
                                Зробити основною
                              </Button>
                            )}
                            <Button variant="outline" size="sm" className="text-red-500 border-red-200">
                              Видалити
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "notifications" && (
                  <div>
                    <h2 className="text-xl font-semibold mb-6">Налаштування сповіщень</h2>
                    <form onSubmit={handleNotificationsSubmit} className="space-y-6 bg-white rounded-lg p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">Сповіщення про замовлення</h3>
                          <p className="text-sm text-gray-500">Отримуйте сповіщення про статус ваших замовлень</p>
                        </div>
                        <div className="flex items-center">
                          <Checkbox
                            id="order-notifications"
                            checked={notificationSettings.orderNotifications}
                            onCheckedChange={(checked) =>
                              handleNotificationChange("orderNotifications", checked as boolean)
                            }
                          />
                        </div>
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">Акції та знижки</h3>
                          <p className="text-sm text-gray-500">
                            Отримуйте інформацію про спеціальні пропозиції та знижки
                          </p>
                        </div>
                        <div className="flex items-center">
                          <Checkbox
                            id="promo-notifications"
                            checked={notificationSettings.promoNotifications}
                            onCheckedChange={(checked) =>
                              handleNotificationChange("promoNotifications", checked as boolean)
                            }
                          />
                        </div>
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">Новини та оновлення</h3>
                          <p className="text-sm text-gray-500">
                            Отримуйте інформацію про новини та оновлення нашого магазину
                          </p>
                        </div>
                        <div className="flex items-center">
                          <Checkbox
                            id="news-notifications"
                            checked={notificationSettings.newsNotifications}
                            onCheckedChange={(checked) =>
                              handleNotificationChange("newsNotifications", checked as boolean)
                            }
                          />
                        </div>
                      </div>

                      <div className="mt-6">
                        <Button type="submit" disabled={loading}>
                          {loading ? "Збереження..." : "Зберегти налаштування"}
                        </Button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}