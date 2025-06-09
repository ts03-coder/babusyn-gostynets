// app/admin/categories/page.tsx
import CategoriesManager from "@/components/admin/CategoriesManager";

export default function CategoriesPage() {
  return (
    <div className="flex-1 pt-16 lg:pt-0">
      <CategoriesManager />
    </div>
  );
}

export const dynamic = "force-dynamic"; // Отключает статическую генерацию