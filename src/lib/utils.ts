import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Об'єднує класові імена та розумно вирішує конфлікти Tailwind класів.
 * @param inputs Будь-яка кількість класів (рядки, об'єкти, масиви)
 * @returns Результуючий рядок класів
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
