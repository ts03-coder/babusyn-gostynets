// components/ui/BackButton.tsx
"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function BackButton() {
  return (
    <Button variant="ghost" size="lg" className="gap-2" onClick={() => window.history.back()}>
      <ArrowLeft className="h-5 w-5" />
      Повернутися назад
    </Button>
  );
}