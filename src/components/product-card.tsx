"use client";

import type React from "react";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/CartContext";
import AuthModal from "@/components/auth-modal";

interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  isOnSale?: boolean;
  className?: string;
}

export default function ProductCard({
  id,
  name,
  description,
  image,
  price,
  isOnSale = false,
  className,
}: ProductCardProps) {
  const { addToCart } = useCart();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    await addToCart(
      { id, name, price, image },
      () => setIsAuthModalOpen(true) // Відкриваємо модальне вікно, якщо користувач не авторизований
    );

    // Якщо додавання успішне, показуємо сповіщення
    if (!isAuthModalOpen) {
      console.log(`Додано товар ${id} в кошик`);
      alert(`${name} додано до корзини!`);
    }
  };

  return (
    <>
      <Link href={`/product/${id}`}>
        <div className={cn("bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow", className)}>
          <div className="relative">
            <Image
              src={image || "/placeholder.svg?height=400&width=400"}
              alt={name}
              width={400}
              height={400}
              className="w-full h-auto object-cover"
            />
            {isOnSale && (
              <div className="absolute top-2 right-2 bg-primary text-white text-xs font-medium px-2 py-1 rounded">
                Акція
              </div>
            )}
          </div>
          <div className="p-4">
            <h3 className="font-medium text-lg mb-1" style={{ maxHeight: "3rem", overflow: "hidden" }}>{name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3" style={{ maxHeight: "4.5rem", overflow: "hidden" }}>{description}</p>

            <div className="flex items-center justify-between mt-auto">
              <div className="font-bold text-lg text-primary">{price.toLocaleString("uk-UA")} ₴</div>
              <Button size="sm" onClick={handleAddToCart} className="rounded-full">
                <ShoppingCart className="h-4 w-4 mr-1" />В кошик
              </Button>
            </div>
          </div>
        </div>
      </Link>

      {/* Модальне вікно авторизації */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
}