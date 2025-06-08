"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";
import { getCookie } from "cookies-next";

interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: { id: string; name: string; price: number; image: string; quantity: number }, onAuthRequired?: () => void) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const token = getCookie("token");

  // Завантаження корзини з API при ініціалізації
  useEffect(() => {
    const fetchCart = async () => {
      if (!token) {
        console.log("Токен відсутній, корзина не завантажується");
        setCart([]);
        return;
      }

      try {
        const response = await fetch("/api/cart", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          console.log("Корзина завантажена:", data.items);
          setCart(data.items || []);
        } else {
          console.error("Помилка завантаження корзини (статус):", response.status, data.error);
          setCart([]);
        }
      } catch (error) {
        console.error("Помилка завантаження корзини:", error);
        setCart([]);
      }
    };

    fetchCart();
  }, [token]);

  const addToCart = async (product: { id: string; name: string; price: number; image: string; quantity: number }, onAuthRequired?: () => void) => {
    if (!token) {
      console.log("Токен відсутній, викликаємо onAuthRequired");
      onAuthRequired?.();
      return;
    }

    try {
      // Надсилаємо лише productId і quantity, як очікує бекенд
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: product.id,
          quantity: product.quantity,
        }),
      });

      const data = await response.json();
      if (response.status === 401) {
        console.log("Статус 401, викликаємо onAuthRequired");
        onAuthRequired?.();
        return;
      }

      if (!response.ok) {
        console.error("Помилка від API при додаванні в корзину:", {
          status: response.status,
          error: data.error,
          message: data.message,
          body: data,
        });
        throw new Error(data.error || "Не вдалося додати товар у корзину");
      }

      console.log("Товар додано до корзини:", data.item);
      setCart((prevCart) => {
        const existingItem = prevCart.find((item) => item.productId === product.id);
        if (existingItem) {
          return prevCart.map((item) =>
            item.productId === product.id
              ? { ...item, quantity: item.quantity + product.quantity }
              : item
          );
        }
        return [
          ...prevCart,
          {
            id: data.item.id,
            productId: product.id,
            name: data.item.product.name,
            price: data.item.product.price,
            image: data.item.product.image,
            quantity: data.item.quantity,
          },
        ];
      });

      // Показуємо сповіщення про успішне додавання
      toast.success(`${product.name} додано до корзини!`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Помилка додавання в корзину:", error.message);
        toast.error(`Помилка: ${error.message}`);
      }
    }
  };

  const removeFromCart = async (productId: string) => {
    if (!token) return;

    try {
      const response = await fetch(`/api/cart?productId=${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Не вдалося видалити товар із корзини");
      }

      setCart((prevCart) => prevCart.filter((item) => item.productId !== productId));
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Помилка видалення з корзини:", error.message);
        toast.error(`Помилка: ${error.message}`);
      }
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (!token) return;

    try {
      const response = await fetch("/api/cart", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, quantity }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Не вдалося оновити кількість товару");
      }

      if (quantity < 1) {
        setCart((prevCart) => prevCart.filter((item) => item.productId !== productId));
      } else {
        setCart((prevCart) =>
          prevCart.map((item) => (item.productId === productId ? { ...item, quantity } : item))
        );
      }
    } catch (error: unknown) {
      if (error instanceof Error)
      {
        console.error("Помилка оновлення кількості:", error.message);
        toast.error(`Помилка: ${error.message}`);
      }
    }
  };

  const clearCart = async () => {
    if (!token) return;

    try {
      const response = await fetch("/api/cart", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Не вдалося очистити корзину");
      }

      setCart([]);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Помилка очищення корзини:", error.message);
        toast.error(`Помилка: ${error.message}`);
      }
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}