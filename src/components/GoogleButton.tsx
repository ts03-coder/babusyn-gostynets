import Image from "next/image";
import { Button } from "@/components/ui/button";

interface GoogleButtonProps {
  onClick: () => void;
}

export default function GoogleButton({ onClick }: GoogleButtonProps) {
  return (
    <Button
      variant="outline"
      className="w-full py-6 flex items-center justify-center gap-3 border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700 font-medium"
      onClick={onClick}
    >
      <Image src="/images/google-logo.svg" alt="Google" width={25} height={25} />
      Увійти через Google
    </Button>
  );
}