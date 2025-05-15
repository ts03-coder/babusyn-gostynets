"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye, MoreHorizontal, Pencil, Plus, Search, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { getCookie } from "cookies-next"

interface Category {
  id: string
  name: string
  slug: string
  description: string
  productsCount: number
  image: string | null
}

export default function CategoriesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [categoriesData, setCategoriesData] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Завантаження категорій при першому рендері
  useEffect(() => {
    const token = getCookie("token")
    if (!token) {
      toast.error("Будь ласка, увійдіть до системи")
      window.location.href = "/" // Перенаправлення на сторінку входу
      return
    }

    const fetchCategories = async () => {
      setIsLoading(true)
      try {
        console.log("Виконується запит до /api/categories з токеном:", token) // Дебаг
        const response = await fetch("/api/categories", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        console.log("Відповідь від сервера:", response.status, response.statusText) // Дебаг
        if (!response.ok) {
          const data = await response.text() // Використовуємо text(), щоб уникнути помилки json()
          throw new Error(data || "Не вдалося завантажити категорії")
        }
        const data = await response.json()
        console.log("Дані від сервера:", data) // Дебаг
        setCategoriesData(data.categories)
      } catch (error: any) {
        toast.error(`Помилка: ${error.message}`)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
  }, [])

  // Фільтрація категорій за пошуковим запитом
  const filteredCategories = categoriesData.filter(
    (category) =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Обробники подій для діалогових вікон
  const handleViewCategory = (category: Category) => {
    setSelectedCategory(category)
    setIsViewDialogOpen(true)
  }

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category)
    setIsEditDialogOpen(true)
  }

  const handleDeleteCategory = (category: Category) => {
    setSelectedCategory(category)
    setIsDeleteDialogOpen(true)
  }

  const handleAddCategory = () => {
    setIsAddDialogOpen(true)
  }

  // Обробник для додавання категорії
  const addCategory = async () => {
    try {
      const token = getCookie("token")
      if (!token) {
        throw new Error("Не авторизовано")
      }

      const name = (document.getElementById("new-name") as HTMLInputElement).value
      const slug = (document.getElementById("new-slug") as HTMLInputElement).value
      const description = (document.getElementById("new-description") as HTMLTextAreaElement).value
      const imageInput = document.getElementById("new-image") as HTMLInputElement
      const imageFile = imageInput.files?.[0] || null

      if (!name || !slug) {
        throw new Error("Назва та slug є обов'язковими")
      }

      const formData = new FormData()
      formData.append("name", name)
      formData.append("slug", slug)
      formData.append("description", description)
      if (imageFile) {
        formData.append("image", imageFile)
      }

      const response = await fetch("/api/categories", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || "Не вдалося додати категорію")
      }

      const data = await response.json()
      setCategoriesData((prev) => [...prev, data.category])
      setIsAddDialogOpen(false)
      toast.success("Успіх: Категорію успішно додано")
    } catch (error: any) {
      toast.error(`Помилка: ${error.message}`)
    }
  }

  // Обробник для редагування категорії
  const editCategory = async () => {
    if (!selectedCategory) return

    try {
      const token = getCookie("token")
      if (!token) {
        throw new Error("Не авторизовано")
      }

      const name = (document.getElementById("name") as HTMLInputElement).value
      const slug = (document.getElementById("slug") as HTMLInputElement).value
      const description = (document.getElementById("description") as HTMLTextAreaElement).value
      const imageInput = document.getElementById("image") as HTMLInputElement
      const imageFile = imageInput.files?.[0] || null

      if (!name || !slug) {
        throw new Error("Назва та slug є обов'язковими")
      }

      const formData = new FormData()
      formData.append("id", selectedCategory.id)
      formData.append("name", name)
      formData.append("slug", slug)
      formData.append("description", description)
      if (imageFile) {
        formData.append("image", imageFile)
      }

      const response = await fetch(`/api/categories/${selectedCategory.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || "Не вдалося оновити категорію")
      }

      const data = await response.json()
      setCategoriesData((prev) =>
        prev.map((cat) => (cat.id === selectedCategory.id ? data.category : cat)),
      )
      setIsEditDialogOpen(false)
      toast.success("Успіх: Категорію успішно оновлено")
    } catch (error: any) {
      toast.error(`Помилка: ${error.message}`)
    }
  }

  // Обробник для видалення категорії
  const deleteCategory = async () => {
    if (!selectedCategory || !selectedCategory.id) {
      toast.error("Помилка: ID категорії відсутній")
      setIsDeleteDialogOpen(false)
      return
    }

    try {
      const token = getCookie("token")
      if (!token) {
        throw new Error("Не авторизовано")
      }

      const response = await fetch(`/api/categories/${selectedCategory.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || "Не вдалося видалити категорію")
      }

      const data = await response.json()
      setCategoriesData((prev) => prev.filter((cat) => cat.id !== selectedCategory.id))
      setIsDeleteDialogOpen(false)
      setSelectedCategory(null)
      toast.success(data.message || "Успіх: Категорію успішно видалено")
    } catch (error: any) {
      toast.error(`Помилка: ${error.message}`)
      setIsDeleteDialogOpen(false)
    }
  }

  return (
    <div className="flex-1 pt-16 lg:pt-0">
      {/* Основний вміст */}
      <div className="p-6">
        {/* Заголовок сторінки */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Категорії</h1>
            <p className="text-gray-500 mt-1">Управління категоріями товарів</p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Пошук категорій..."
                className="pl-9 pr-4 w-full sm:w-auto"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button onClick={handleAddCategory}>
              <Plus className="h-4 w-4 mr-2" />
              Додати категорію
            </Button>
          </div>
        </div>

        {/* Таблиця категорій */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Всі категорії</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-4">Завантаження...</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Категорія</TableHead>
                      <TableHead>Опис</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>Товарів</TableHead>
                      <TableHead className="text-right"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCategories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded bg-gray-100 overflow-hidden">
                              <Image
                                src={category.image || "/placeholder.svg"}
                                alt={category.name}
                                width={40}
                                height={40}
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <div className="font-medium">{category.name}</div>
                              <div className="text-xs text-gray-500">{category.id}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[200px]">
                          <div className="truncate">{category.description}</div>
                        </TableCell>
                        <TableCell>{category.slug}</TableCell>
                        <TableCell>{category.productsCount}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Дії</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleViewCategory(category)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Переглянути
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditCategory(category)}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Редагувати
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDeleteCategory(category)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Видалити
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Діалогове вікно перегляду категорії */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Інформація про категорію</DialogTitle>
            <DialogDescription>Детальна інформація про категорію та пов'язані товари.</DialogDescription>
          </DialogHeader>
          {selectedCategory && (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="h-20 w-20 rounded bg-gray-100 overflow-hidden">
                  <Image
                    src={selectedCategory.image || "/placeholder.svg"}
                    alt={selectedCategory.name}
                    width={80}
                    height={80}
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{selectedCategory.name}</h3>
                  <p className="text-gray-500">{selectedCategory.id}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-500">Опис</h4>
                <p className="text-sm">{selectedCategory.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-500">Slug</h4>
                  <p className="text-sm">{selectedCategory.slug}</p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-500">Кількість товарів</h4>
                  <p className="text-sm">{selectedCategory.productsCount}</p>
                </div>
              </div>

              {selectedCategory.productsCount > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-500">Популярні товари в категорії</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 p-2 border rounded-md">
                      <div className="h-8 w-8 rounded bg-gray-100 overflow-hidden">
                        <Image
                          src="/placeholder.svg?height=32&width=32"
                          alt="Товар"
                          width={32}
                          height={32}
                          className="object-cover"
                        />
                      </div>
                      <div className="text-sm truncate">Стейк Рібай</div>
                    </div>
                    <div className="flex items-center gap-2 p-2 border rounded-md">
                      <div className="h-8 w-8 rounded bg-gray-100 overflow-hidden">
                        <Image
                          src="/placeholder.svg?height=32&width=32"
                          alt="Товар"
                          width={32}
                          height={32}
                          className="object-cover"
                        />
                      </div>
                      <div className="text-sm truncate">Філе Міньйон</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Закрити
            </Button>
            <Button
              onClick={() => {
                setIsViewDialogOpen(false)
                handleEditCategory(selectedCategory!)
              }}
            >
              Редагувати
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Діалогове вікно редагування категорії */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Редагувати категорію</DialogTitle>
            <DialogDescription>Змініть інформацію про категорію та натисніть Зберегти.</DialogDescription>
          </DialogHeader>
          {selectedCategory && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Назва
                </label>
                <Input id="name" defaultValue={selectedCategory.name} />
              </div>
              <div className="space-y-2">
                <label htmlFor="slug" className="text-sm font-medium">
                  Slug
                </label>
                <Input id="slug" defaultValue={selectedCategory.slug} />
              </div>
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Опис
                </label>
                <textarea
                  id="description"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[100px]"
                  defaultValue={selectedCategory.description}
                ></textarea>
              </div>
              <div className="space-y-2">
                <label htmlFor="image" className="text-sm font-medium">
                  Зображення
                </label>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded bg-gray-100 overflow-hidden">
                    <Image
                      src={selectedCategory.image || "/placeholder.svg"}
                      alt={selectedCategory.name}
                      width={64}
                      height={64}
                      className="object-cover"
                    />
                  </div>
                  <Input id="image" type="file" accept="image/*" />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Скасувати
            </Button>
            <Button onClick={editCategory}>Зберегти</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Діалогове вікно видалення категорії */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Видалити категорію</DialogTitle>
            <DialogDescription>
              Ви впевнені, що хочете видалити цю категорію? Ця дія не може бути скасована.
            </DialogDescription>
          </DialogHeader>
          {selectedCategory && (
            <div className="py-3">
              <p className="text-sm">
                Категорія <span className="font-medium">{selectedCategory.name}</span> буде видалена.
              </p>
              {selectedCategory.productsCount > 0 && (
                <p className="text-sm text-red-600 mt-2">
                  Увага! Ця категорія містить {selectedCategory.productsCount} товарів. Видалення категорії може
                  вплинути на ці товари.
                </p>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Скасувати
            </Button>
            <Button variant="destructive" onClick={deleteCategory}>
              Видалити
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Діалогове вікно додавання категорії */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Додати нову категорію</DialogTitle>
            <DialogDescription>Заповніть інформацію про нову категорію та натисніть Зберегти.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="new-name" className="text-sm font-medium">
                Назва
              </label>
              <Input id="new-name" placeholder="Введіть назву категорії" />
            </div>
            <div className="space-y-2">
              <label htmlFor="new-slug" className="text-sm font-medium">
                Slug
              </label>
              <Input id="new-slug" placeholder="введіть-slug-категорії" />
            </div>
            <div className="space-y-2">
              <label htmlFor="new-description" className="text-sm font-medium">
                Опис
              </label>
              <textarea
                id="new-description"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[100px]"
                placeholder="Введіть опис категорії..."
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="new-image" className="text-sm font-medium">
                Зображення
              </label>
              <Input id="new-image" type="file" accept="image/*" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Скасувати
            </Button>
            <Button onClick={addCategory}>Зберегти</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}