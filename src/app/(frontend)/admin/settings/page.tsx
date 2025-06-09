"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Trash2, Edit, Plus } from "lucide-react";
import { getCookie } from "cookies-next";

interface Slide {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  link: string;
}

interface ApiError {
  message: string;
  error?: string;
}

export default function SlidesAdminPage() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    link: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Отримання токена з localStorage (або іншого джерела)
  const token = getCookie("token")

  // Завантаження слайдів
  useEffect(() => {
    const fetchSlides = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/slides", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Не вдалося завантажити слайди");
        }
        setSlides(data.slides);
      } catch (error: unknown) {
        const apiError = error as ApiError;
        setErrorMessage(`Помилка: ${apiError.message || apiError.error || "Невідома помилка"}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSlides();
  }, [token]);

  // Обробник зміни полів форми
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Обробник вибору файлу
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  // Обробник створення або редагування слайду
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingSlide ? "PUT" : "POST";
      const url = editingSlide ? `/api/slides/${editingSlide.id}` : "/api/slides";

      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("subtitle", formData.subtitle);
      formDataToSend.append("link", formData.link);
      if (imageFile) {
        formDataToSend.append("image", imageFile);
      }

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Не вдалося зберегти слайд");
      }

      // Оновлення списку слайдів
      if (editingSlide) {
        setSlides(slides.map((slide) => (slide.id === editingSlide.id ? data.slide : slide)));
      } else {
        setSlides([...slides, data.slide]);
      }

      // Скидання форми
      setFormData({ title: "", subtitle: "", link: "" });
      setImageFile(null);
      setImagePreview(null);
      setEditingSlide(null);
      setIsFormOpen(false);
    } catch (error: unknown) {
      const apiError = error as ApiError;
      setErrorMessage(`Помилка: ${apiError.message || apiError.error || "Невідома помилка"}`);
    }
  };

  // Обробник редагування слайду
  const handleEdit = (slide: Slide) => {
    setEditingSlide(slide);
    setFormData({
      title: slide.title,
      subtitle: slide.subtitle,
      link: slide.link,
    });
    setImagePreview(slide.image);
    setImageFile(null);
    setIsFormOpen(true);
  };

  // Обробник видалення слайду
  const handleDelete = async (id: string) => {
    if (!confirm("Ви впевнені, що хочете видалити цей слайд?")) return;

    try {
      const response = await fetch(`/api/slides/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Не вдалося видалити слайд");
      }

      setSlides(slides.filter((slide) => slide.id !== id));
    } catch (error: unknown) {
      const apiError = error as ApiError;
      setErrorMessage(`Помилка: ${apiError.message || apiError.error || "Невідома помилка"}`);
    }
  };

  // Очищення форми при скасуванні
  const handleCancel = () => {
    setFormData({ title: "", subtitle: "", link: "" });
    setImageFile(null);
    setImagePreview(null);
    setEditingSlide(null);
    setIsFormOpen(false);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Керування слайдами</h1>

      {/* Повідомлення про помилку */}
      {errorMessage && (
        <div className="mb-6 bg-red-100 text-red-800 p-4 rounded-lg">
          {errorMessage}
        </div>
      )}

      {/* Кнопка для відкриття форми */}
      {!isFormOpen && (
        <Button onClick={() => setIsFormOpen(true)} className="mb-6">
          <Plus className="h-4 w-4 mr-2" />
          Додати слайд
        </Button>
      )}

      {/* Форма для створення/редагування слайду */}
      {isFormOpen && (
        <div className="bg-gray-50 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingSlide ? "Редагувати слайд" : "Додати новий слайд"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Заголовок</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Введіть заголовок"
                required
              />
            </div>
            <div>
              <Label htmlFor="subtitle">Підзаголовок</Label>
              <Input
                id="subtitle"
                name="subtitle"
                value={formData.subtitle}
                onChange={handleInputChange}
                placeholder="Введіть підзаголовок"
                required
              />
            </div>
            <div>
              <Label htmlFor="image">Зображення</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                required={!editingSlide || imageFile !== null}
              />
              {imagePreview && (
                <div className="mt-2">
                  <Image
                    src={imagePreview}
                    alt="Попередній перегляд"
                    className="w-32 h-32 object-cover rounded"
                  />
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="link">Посилання</Label>
              <Input
                id="link"
                name="link"
                value={formData.link}
                onChange={handleInputChange}
                placeholder="Введіть URL посилання"
                required
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit">
                {editingSlide ? "Оновити" : "Додати"}
              </Button>
              <Button type="button" variant="outline" onClick={handleCancel}>
                Скасувати
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Список слайдів */}
      <div className="bg-white rounded-lg shadow">
        {isLoading ? (
          <div className="p-6 text-center text-gray-500">Завантаження...</div>
        ) : slides.length > 0 ? (
          <div className="divide-y">
            {slides.map((slide) => (
              <div
                key={slide.id}
                className="flex items-center justify-between p-4 hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <Image
                    src={slide.image}
                    alt={slide.title}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div>
                    <h3 className="font-medium">{slide.title}</h3>
                    <p className="text-sm text-gray-500">{slide.subtitle}</p>
                    <a
                      href={slide.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-500 hover:underline"
                    >
                      {slide.link}
                    </a>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(slide)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(slide.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">
            Слайди не знайдено. Додайте перший слайд!
          </div>
        )}
      </div>
    </div>
  );
}