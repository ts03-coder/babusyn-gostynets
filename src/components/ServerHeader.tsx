import Link from "next/link";
import Image from "next/image";

export function ServerHeader() {
  return (
    <Link href="/" className="flex items-center" aria-label="Перейти на головну сторінку">
      <Image src="/images/logo.svg" alt="Бабусин Гостинець" width={40} height={40} className="mr-2" />
    </Link>
  );
}