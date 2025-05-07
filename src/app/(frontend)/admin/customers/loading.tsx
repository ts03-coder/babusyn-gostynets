import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="flex flex-col items-center gap-6 p-6">
        {/* Спінер */}
        <div className="relative flex h-16 w-16 items-center justify-center">
          <div className="absolute h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
        {/* Текст завантаження */}
        <p className="text-lg font-medium text-gray-700">Завантаження...</p>
        {/* Скелетони для імітації таблиці */}
        <div className="w-full max-w-4xl space-y-4">
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      </div>
    </div>
  );
}