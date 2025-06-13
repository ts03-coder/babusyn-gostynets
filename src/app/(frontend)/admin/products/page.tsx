"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
import {
  Eye,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react"
import { getCookie } from "cookies-next"

interface Product {
  id: string;
  name: string;
  category: { id: string; name: string } | null; // Разрешаем null
  price: number;
  stock: number;
  sku: string;
  status: string;
  image: string | null;
  isOnSale: boolean;
  discount: number | null; // Разрешаем null
  salePrice: number | null; // Разрешаем null
  saleStartDate: string | null;
  saleEndDate: string | null;
  description: string | null;
  ingredients: string | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  productsCount: number;
}

interface FormState {
  name: string;
  categoryId: string;
  price: string;
  stock: string;
  sku: string;
  status: string;
  description: string;
  ingredients: string;
  imageFile: File | null;
  isOnSale: boolean;
  discount: string;
  salePrice: string;
  saleStartDate: string;
  saleEndDate: string;
}

interface ApiError {
  message: string;
  error?: string;
}

interface ApiResponse {
  product?: Product;
  error?: string;
  message?: string;
}

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [showOnlySaleItems, setShowOnlySaleItems] = useState(false)
  const [productsData, setProductsData] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [addFormState, setAddFormState] = useState<FormState>({
    name: "",
    categoryId: "",
    price: "",
    stock: "",
    sku: "",
    status: "В наявності",
    description: "",
    ingredients: "",
    imageFile: null,
    isOnSale: false,
    discount: "0",
    salePrice: "",
    saleStartDate: "",
    saleEndDate: "",
  })
  const [editFormState, setEditFormState] = useState<FormState>({
    name: "",
    categoryId: "",
    price: "",
    stock: "",
    sku: "",
    status: "В наявності",
    description: "",
    ingredients: "",
    imageFile: null,
    isOnSale: false,
    discount: "0",
    salePrice: "",
    saleStartDate: "",
    saleEndDate: "",
  })

  const [currentPage, setCurrentPage] = useState(1)
  const productsPerPage = 10
  const [totalProducts, setTotalProducts] = useState(0)
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const showMessage = (type: "success" | "error", message: string) => {
    if (type === "success") {
      setSuccessMessage(message)
      setErrorMessage(null)
    } else {
      setErrorMessage(message)
      setSuccessMessage(null)
    }
    setTimeout(() => {
      setSuccessMessage(null)
      setErrorMessage(null)
    }, 5000)
  }

  useEffect(() => {
    const token = getCookie("token")
    if (!token) {
      showMessage("error", "Будь ласка, увійдіть до системи")
      window.location.href = "/login"
      return
    }

    const fetchCategories = async () => {
      setIsLoadingCategories(true)
      try {
        const response = await fetch("/api/categories", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.error || "Не вдалося завантажити категорії")
        }
        setCategories([{ id: "all", name: "Всі категорії", slug: "all", description: null, image: null, productsCount: 0 }, ...data.categories])
      } catch (error: unknown) {
        const apiError = error as ApiError;
        showMessage("error", `Помилка: ${apiError.message || apiError.error || "Невідома помилка"}`)
      } finally {
        setIsLoadingCategories(false)
      }
    }

    fetchCategories()
  }, [])

  useEffect(() => {
    const token = getCookie("token")
    if (!token) {
      showMessage("error", "Будь ласка, увійдіть до системи")
      window.location.href = "/login"
      return
    }

    const fetchProducts = async () => {
      setIsLoadingProducts(true)
      try {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: productsPerPage.toString(),
          search: searchQuery,
          category: selectedCategory !== "all" ? selectedCategory : "",
          onlyOnSale: showOnlySaleItems.toString(),
        })
        const response = await fetch(`/api/products?${params}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.error || "Не вдалося завантажити продукти")
        }
        setProductsData(data.products)
        setTotalProducts(data.total)
      } catch (error: unknown) {
        const apiError = error as ApiError;
        showMessage("error", `Помилка: ${apiError.message || apiError.error || "Невідома помилка"}`)
      } finally {
        setIsLoadingProducts(false)
      }
    }

    fetchProducts()
  }, [currentPage, searchQuery, selectedCategory, showOnlySaleItems])

  const filteredProducts = productsData

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product)
    setIsViewDialogOpen(true)
  }

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product)
    setEditFormState({
      name: product.name || "",
      categoryId: product.category?.id || "", // Проверяем, что category существует
      price: product.price?.toString() || "0",
      stock: product.stock?.toString() || "0",
      sku: product.sku || "",
      status: product.status || "В наявності",
      description: product.description || "",
      ingredients: product.ingredients || "",
      imageFile: null,
      isOnSale: product.isOnSale || false,
      discount: product.discount != null ? product.discount.toString() : "0", // Проверяем, что discount не null
      salePrice: product.salePrice != null ? product.salePrice.toString() : "0", // Проверяем, что salePrice не null
      saleStartDate: product.saleStartDate || "",
      saleEndDate: product.saleEndDate || "",
    })
    setIsEditDialogOpen(true)
  }

  const handleDeleteProduct = (product: Product) => {
    setSelectedProduct(product)
    setIsDeleteDialogOpen(true)
  }

  const handleAddProduct = () => {
    setAddFormState({
      name: "",
      categoryId: "",
      price: "",
      stock: "",
      sku: "",
      status: "В наявності",
      description: "",
      ingredients: "",
      imageFile: null,
      isOnSale: false,
      discount: "0",
      salePrice: "",
      saleStartDate: "",
      saleEndDate: "",
    })
    setIsAddDialogOpen(true)
  }

  const addProduct = async () => {
    try {
      const token = getCookie("token")
      if (!token) {
        throw new Error("Не авторизовано")
      }

      const { name, categoryId, price, stock, sku, status, description, ingredients, imageFile, isOnSale, discount, saleStartDate, saleEndDate } = addFormState

      if (imageFile && imageFile.size > 5 * 1024 * 1024) {
        throw new Error("Розмір файлу перевищує 5MB")
      }

      const priceNum = parseFloat(price)
      const stockNum = parseInt(stock)
      const discountNum = parseInt(discount) || 0
      const salePrice = isOnSale ? priceNum * (1 - discountNum / 100) : priceNum

      if (!name || !categoryId || !price || !sku || !status) {
        throw new Error("Обов'язкові поля (назва, категорія, ціна, SKU, статус) є обов'язковими")
      }

      setIsUploading(true);
      setUploadProgress(0);

      const formData = new FormData()
      formData.append("name", name)
      formData.append("categoryId", categoryId)
      formData.append("price", priceNum.toString())
      formData.append("stock", stockNum.toString())
      formData.append("sku", sku)
      formData.append("status", status)
      formData.append("description", description)
      formData.append("ingredients", ingredients)
      formData.append("isOnSale", isOnSale.toString())
      formData.append("discount", discountNum.toString())
      formData.append("salePrice", salePrice.toString())
      if (saleStartDate) formData.append("saleStartDate", saleStartDate)
      if (saleEndDate) formData.append("saleEndDate", saleEndDate)
      if (imageFile) formData.append("image", imageFile)

      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/products", true);
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded * 100) / event.total);
          setUploadProgress(progress);
        }
      };

      const response = await new Promise<ApiResponse>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error(xhr.responseText));
          }
        };
        xhr.onerror = () => reject(new Error("Помилка мережі"));
        xhr.send(formData);
      });

      if (!response.product) {
        throw new Error(response.error || "Не вдалося додати продукт")
      }

      if (imageFile && response.product.image) {
        try {
          const imageResponse = await fetch(response.product.image);
          if (!imageResponse.ok) {
            throw new Error("Файл не був успішно завантажений");
          }
        } catch (error) {
          console.error('Error verifying uploaded file:', error);
          throw new Error("Помилка при перевірці завантаженого файлу");
        }
      }

      const newProduct: Product = {
        ...response.product,
        category: { 
          id: categoryId, 
          name: categories.find(cat => cat.id === categoryId)?.name || categoryId 
        }
      };

      setProductsData((prev) => [...prev, newProduct]);
      setIsAddDialogOpen(false)
      showMessage("success", "Успіх: Продукт успішно додано")
      setCurrentPage(1)
    } catch (error: unknown) {
      const apiError = error as ApiError;
      showMessage("error", `Помилка: ${apiError.message || apiError.error || "Невідома помилка"}`)
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }

  const editProduct = async () => {
    if (!selectedProduct) return

    try {
      const token = getCookie("token")
      if (!token) {
        throw new Error("Не авторизовано")
      }

      const { name, categoryId, price, stock, sku, status, description, ingredients, imageFile, isOnSale, discount, saleStartDate, saleEndDate } = editFormState

      const priceNum = parseFloat(price)
      const stockNum = parseInt(stock)
      const discountNum = parseInt(discount) || 0
      const salePrice = isOnSale ? priceNum * (1 - discountNum / 100) : priceNum

      if (!name || !categoryId || !price || !sku || !status) {
        throw new Error("Обов'язкові поля (назва, категорія, ціна, SKU, статус) є обов'язковими")
      }

      const formData = new FormData()
      formData.append("id", selectedProduct.id)
      formData.append("name", name)
      formData.append("categoryId", categoryId)
      formData.append("price", priceNum.toString())
      formData.append("stock", stockNum.toString())
      formData.append("sku", sku)
      formData.append("status", status)
      formData.append("description", description)
      formData.append("ingredients", ingredients)
      formData.append("isOnSale", isOnSale.toString())
      formData.append("discount", discountNum.toString())
      formData.append("salePrice", salePrice.toString())
      if (saleStartDate) formData.append("saleStartDate", saleStartDate)
      if (saleEndDate) formData.append("saleEndDate", saleEndDate)
      if (imageFile) formData.append("image", imageFile)

      const response = await fetch(`/api/products/${selectedProduct.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Не вдалося оновити продукт")
      }

      setProductsData((prev) =>
        prev.map((prod) => (prod.id === selectedProduct.id ? { ...data.product, category: { id: categoryId, name: categories.find(cat => cat.id === categoryId)?.name || categoryId } } : prod)),
      )
      setIsEditDialogOpen(false)
      showMessage("success", "Успіх: Продукт успішно оновлено")
    } catch (error: unknown) {
      const apiError = error as ApiError;
      showMessage("error", `Помилка: ${apiError.message || apiError.error || "Невідома помилка"}`)
    }
  }

  const deleteProduct = async () => {
    if (!selectedProduct) return

    try {
      const token = getCookie("token")
      if (!token) {
        throw new Error("Не авторизовано")
      }

      const response = await fetch(`/api/products/${selectedProduct.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Не вдалося видалити продукт")
      }

      setProductsData((prev) => prev.filter((prod) => prod.id !== selectedProduct.id))
      setIsDeleteDialogOpen(false)
      showMessage("success", data.message || "Успіх: Продукт успішно видалено")
      setCurrentPage(1) // Повернення на першу сторінку після видалення
    } catch (error: unknown) {
      const apiError = error as ApiError;
      showMessage("error", `Помилка: ${apiError.message || apiError.error || "Невідома помилка"}`)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-"
    const date = new Date(dateString)
    return date.toLocaleDateString("uk-UA")
  }

  const totalPages = Math.ceil(totalProducts / productsPerPage)

  return (
    <div className="flex-1 lg:ml-0 pt-16 lg:pt-0">
      <div className="p-6">
        {(successMessage || errorMessage) && (
          <div className="mb-6">
            {successMessage && (
              <div className="bg-green-100 text-green-800 p-4 rounded-lg">
                {successMessage}
              </div>
            )}
            {errorMessage && (
              <div className="bg-red-100 text-red-800 p-4 rounded-lg">
                {errorMessage}
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Товари</h1>
            <p className="text-gray-500 mt-1">Управління товарами та акціями вашого магазину</p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Пошук товарів..."
                className="pl-9 pr-4 w-full sm:w-auto"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
              />
            </div>
            <select
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value)
                setCurrentPage(1)
              }}
              disabled={isLoadingCategories}
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name} {category.id !== "all" && `(${category.productsCount})`}
                </option>
              ))}
            </select>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="sale-filter"
                checked={showOnlySaleItems}
                onChange={(e) => {
                  setShowOnlySaleItems(e.target.checked)
                  setCurrentPage(1)
                }}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="sale-filter" className="text-sm">
                Тільки акційні
              </label>
            </div>
            <Button onClick={handleAddProduct} disabled={isLoadingCategories}>
              <Plus className="h-4 w-4 mr-2" />
              Додати товар
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Всі товари</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingProducts || isLoadingCategories ? (
              <div className="text-center py-4">Завантаження...</div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-4 text-gray-500">Товарів не знайдено</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Товар</TableHead>
                      <TableHead>Категорія</TableHead>
                      <TableHead>Ціна</TableHead>
                      <TableHead>Акція</TableHead>
                      <TableHead>Залишок</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead className="text-right">Дії</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded bg-gray-100 overflow-hidden">
                              <Image
                                src={product.image || "/placeholder.svg"}
                                alt={product.name}
                                width={40}
                                height={40}
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <div className="font-medium">{product.name}</div>
                              <div className="text-xs text-gray-500">{product.id}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{product.category?.name || "-"}</TableCell>
                        <TableCell>
                          {product.isOnSale && product.salePrice != null ? (
                            <div>
                              <span className="line-through text-gray-500">{product.price} ₴</span>
                              <span className="font-medium ml-2 text-red-600">{product.salePrice} ₴</span>
                            </div>
                          ) : (
                            <span>{product.price} ₴</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {product.isOnSale && product.discount != null ? (
                            <div>
                              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                -{product.discount}%
                              </Badge>
                              <div className="text-xs text-gray-500 mt-1">до {formatDate(product.saleEndDate)}</div>
                            </div>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </TableCell>
                        <TableCell>{product.stock || 0}</TableCell>
                        <TableCell>{product.sku || "-"}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              product.status === "В наявності" ? "bg-green-50 text-green-700 border-green-200" : product.status === "Закінчується" ? "bg-orange-50 text-orange-700 border-orange-200" : "bg-red-50 text-red-700 border-red-200"
                            }
                          >
                            {product.status || "Невідомо"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Дії</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleViewProduct(product)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Переглянути
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditProduct(product)}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Редагувати
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleDeleteProduct(product)} className="text-red-600">
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
                {totalPages > 1 && (
                  <div className="mt-4 flex justify-center">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                      >
                        Попередня
                      </Button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                      >
                        Наступна
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Інформація про товар</DialogTitle>
            <DialogDescription>Детальна інформація про товар.</DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="h-32 w-32 rounded bg-gray-100 overflow-hidden">
                  <Image
                    src={selectedProduct.image || "/placeholder.svg"}
                    alt={selectedProduct.name}
                    width={128}
                    height={128}
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{selectedProduct.name}</h3>
                  <p className="text-gray-500">{selectedProduct.id}</p>
                  <div className="mt-2 flex items-center gap-2">
                    {selectedProduct.category && (
                      <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                        {selectedProduct.category.name}
                      </Badge>
                    )}
                    <Badge
                      variant="outline"
                      className={
                        selectedProduct.status === "В наявності"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : selectedProduct.status === "Закінчується"
                            ? "bg-orange-50 text-orange-700 border-orange-200"
                            : "bg-red-50 text-red-700 border-red-200"
                      }
                    >
                      {selectedProduct.status}
                    </Badge>
                    {selectedProduct.isOnSale && selectedProduct.discount != null && (
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                        Акція -{selectedProduct.discount}%
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Основна інформація</h4>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="font-medium">Ціна:</span>{" "}
                      {selectedProduct.isOnSale && selectedProduct.salePrice != null ? (
                        <>
                          <span className="line-through text-gray-500">{selectedProduct.price} ₴</span>
                          <span className="font-medium ml-2 text-red-600">{selectedProduct.salePrice} ₴</span>
                        </>
                      ) : (
                        <span>{selectedProduct.price} ₴</span>
                      )}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Залишок:</span> {selectedProduct.stock || 0} шт.
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">SKU:</span> {selectedProduct.sku || "-"}
                    </p>
                  </div>
                </div>
                {selectedProduct.isOnSale && selectedProduct.discount != null && selectedProduct.salePrice != null && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Інформація про акцію</h4>
                    <div className="space-y-2">
                      <p className="text-sm">
                        <span className="font-medium">Знижка:</span> {selectedProduct.discount}%
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Акційна ціна:</span> {selectedProduct.salePrice} ₴
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Період акції:</span> {formatDate(selectedProduct.saleStartDate)} -{" "}
                        {formatDate(selectedProduct.saleEndDate)}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Опис</h4>
                <p className="text-sm text-gray-700">{selectedProduct.description || "Опис відсутній"}</p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Склад</h4>
                <p className="text-sm text-gray-700">{selectedProduct.ingredients || "Склад відсутній"}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Закрити
            </Button>
            <Button
              onClick={() => {
                setIsViewDialogOpen(false)
                handleEditProduct(selectedProduct!)
              }}
            >
              Редагувати
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Редагувати товар</DialogTitle>
            <DialogDescription>Змініть інформацію про товар та натисніть Зберегти.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Назва
                </label>
                <Input
                  id="name"
                  value={editFormState.name}
                  onChange={(e) => setEditFormState({ ...editFormState, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="category" className="text-sm font-medium">
                  Категорія
                </label>
                <select
                  id="category"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={editFormState.categoryId}
                  onChange={(e) => setEditFormState({ ...editFormState, categoryId: e.target.value })}
                >
                  <option disabled value="">
                    Виберіть категорію
                  </option>
                  {categories.filter(cat => cat.id !== "all").map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="price" className="text-sm font-medium">
                  Ціна (₴)
                </label>
                <Input
                  id="price"
                  type="number"
                  value={editFormState.price}
                  onChange={(e) => setEditFormState({ ...editFormState, price: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="stock" className="text-sm font-medium">
                  Залишок (шт.)
                </label>
                <Input
                  id="stock"
                  type="number"
                  value={editFormState.stock}
                  onChange={(e) => setEditFormState({ ...editFormState, stock: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="sku" className="text-sm font-medium">
                  SKU
                </label>
                <Input
                  id="sku"
                  value={editFormState.sku}
                  onChange={(e) => setEditFormState({ ...editFormState, sku: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="status" className="text-sm font-medium">
                  Статус
                </label>
                <select
                  id="status"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={editFormState.status}
                  onChange={(e) => setEditFormState({ ...editFormState, status: e.target.value })}
                >
                  <option value="В наявності">В наявності</option>
                  <option value="Закінчується">Закінчується</option>
                  <option value="Немає в наявності">Немає в наявності</option>
                </select>
              </div>
            </div>

            <div className="border-t pt-4 mt-4">
              <h3 className="text-base font-medium mb-3">Акційна пропозиція</h3>
              <div className="flex items-center space-x-2 mb-4">
                <input
                  type="checkbox"
                  id="is-on-sale"
                  checked={editFormState.isOnSale}
                  onChange={(e) => setEditFormState({ ...editFormState, isOnSale: e.target.checked })}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="is-on-sale" className="text-sm">
                  Акційний товар
                </label>
              </div>

              {editFormState.isOnSale && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="discount" className="text-sm font-medium">
                        Знижка (%)
                      </label>
                      <Input
                        id="discount"
                        type="number"
                        min="0"
                        max="99"
                        value={editFormState.discount}
                        onChange={(e) => setEditFormState({ ...editFormState, discount: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="sale-price" className="text-sm font-medium">
                        Акційна ціна (₴)
                      </label>
                      <Input
                        id="sale-price"
                        type="number"
                        value={editFormState.price ? (parseFloat(editFormState.price) * (1 - (parseInt(editFormState.discount) || 0) / 100)).toFixed(2) : ""}
                        disabled
                      />
                      <p className="text-xs text-gray-500">Розраховується автоматично</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="sale-start-date" className="text-sm font-medium">
                        Дата початку
                      </label>
                      <Input
                        id="sale-start-date"
                        type="date"
                        value={editFormState.saleStartDate}
                        onChange={(e) => setEditFormState({ ...editFormState, saleStartDate: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="sale-end-date" className="text-sm font-medium">
                        Дата закінчення
                      </label>
                      <Input
                        id="sale-end-date"
                        type="date"
                        value={editFormState.saleEndDate}
                        onChange={(e) => setEditFormState({ ...editFormState, saleEndDate: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Опис
              </label>
              <textarea
                id="description"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[100px]"
                value={editFormState.description}
                onChange={(e) => setEditFormState({ ...editFormState, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="ingredients" className="text-sm font-medium">
                Склад
              </label>
              <Input
                id="ingredients"
                value={editFormState.ingredients}
                onChange={(e) => setEditFormState({ ...editFormState, ingredients: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="image" className="text-sm font-medium">
                Зображення
              </label>
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded bg-gray-100 overflow-hidden">
                  <Image
                    src={selectedProduct?.image || "/placeholder.svg"}
                    alt={selectedProduct?.name || "Product"}
                    width={64}
                    height={64}
                    className="object-cover"
                  />
                </div>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEditFormState({ ...editFormState, imageFile: e.target.files?.[0] || null })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Скасувати
            </Button>
            <Button onClick={editProduct}>Зберегти</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Видалити товар</DialogTitle>
            <DialogDescription>
              Ви впевнені, що хочете видалити цей товар? Ця дія не може бути скасована.
            </DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="flex items-center gap-3 py-3">
              <div className="h-10 w-10 rounded bg-gray-100 overflow-hidden">
                <Image
                  src={selectedProduct.image || "/placeholder.svg"}
                  alt={selectedProduct.name}
                  width={40}
                  height={40}
                  className="object-cover"
                />
              </div>
              <div>
                <div className="font-medium">{selectedProduct.name}</div>
                <div className="text-sm text-gray-500">{selectedProduct.sku || "-"}</div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Скасувати
            </Button>
            <Button variant="destructive" onClick={deleteProduct}>
              Видалити
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Додати новий товар</DialogTitle>
            <DialogDescription>Заповніть інформацію про новий товар та натисніть Зберегти.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="new-name" className="text-sm font-medium">
                  Назва
                </label>
                <Input
                  id="new-name"
                  placeholder="Введіть назву товару"
                  value={addFormState.name}
                  onChange={(e) => setAddFormState({ ...addFormState, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="new-category" className="text-sm font-medium">
                  Категорія
                </label>
                <select
                  id="new-category"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={addFormState.categoryId}
                  onChange={(e) => setAddFormState({ ...addFormState, categoryId: e.target.value })}
                >
                  <option value="" disabled>
                    Виберіть категорію
                  </option>
                  {categories.filter(cat => cat.id !== "all").map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="new-price" className="text-sm font-medium">
                  Ціна (₴)
                </label>
                <Input
                  id="new-price"
                  type="number"
                  placeholder="0"
                  value={addFormState.price}
                  onChange={(e) => setAddFormState({ ...addFormState, price: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="new-stock" className="text-sm font-medium">
                  Залишок (шт.)
                </label>
                <Input
                  id="new-stock"
                  type="number"
                  placeholder="0"
                  value={addFormState.stock}
                  onChange={(e) => setAddFormState({ ...addFormState, stock: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="new-sku" className="text-sm font-medium">
                  SKU
                </label>
                <Input
                  id="new-sku"
                  placeholder="Введіть SKU товару"
                  value={addFormState.sku}
                  onChange={(e) => setAddFormState({ ...addFormState, sku: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="new-status" className="text-sm font-medium">
                  Статус
                </label>
                <select
                  id="new-status"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={addFormState.status}
                  onChange={(e) => setAddFormState({ ...addFormState, status: e.target.value })}
                >
                  <option value="В наявності">В наявності</option>
                  <option value="Закінчується">Закінчується</option>
                  <option value="Немає в наявності">Немає в наявності</option>
                </select>
              </div>
            </div>

            <div className="border-t pt-4 mt-4">
              <h3 className="text-base font-medium mb-3">Акційна пропозиція</h3>
              <div className="flex items-center space-x-2 mb-4">
                <input
                  type="checkbox"
                  id="new-is-on-sale"
                  checked={addFormState.isOnSale}
                  onChange={(e) => setAddFormState({ ...addFormState, isOnSale: e.target.checked })}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="new-is-on-sale" className="text-sm">
                  Акційний товар
                </label>
              </div>

              {addFormState.isOnSale && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="new-discount" className="text-sm font-medium">
                        Знижка (%)
                      </label>
                      <Input
                        id="new-discount"
                        type="number"
                        min="0"
                        max="99"
                        placeholder="0"
                        value={addFormState.discount}
                        onChange={(e) => setAddFormState({ ...addFormState, discount: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="new-sale-price" className="text-sm font-medium">
                        Акційна ціна (₴)
                      </label>
                      <Input
                        id="new-sale-price"
                        type="number"
                        value={addFormState.price ? (parseFloat(addFormState.price) * (1 - (parseInt(addFormState.discount) || 0) / 100)).toFixed(2) : ""}
                        disabled
                      />
                      <p className="text-xs text-gray-500">Розраховується автоматично</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="new-sale-start-date" className="text-sm font-medium">
                        Дата початку
                      </label>
                      <Input
                        id="new-sale-start-date"
                        type="date"
                        value={addFormState.saleStartDate}
                        onChange={(e) => setAddFormState({ ...addFormState, saleStartDate: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="new-sale-end-date" className="text-sm font-medium">
                        Дата закінчення
                      </label>
                      <Input
                        id="new-sale-end-date"
                        type="date"
                        value={addFormState.saleEndDate}
                        onChange={(e) => setAddFormState({ ...addFormState, saleEndDate: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="new-description" className="text-sm font-medium">
                Опис
              </label>
              <textarea
                id="new-description"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[100px]"
                placeholder="Введіть опис товару..."
                value={addFormState.description}
                onChange={(e) => setAddFormState({ ...addFormState, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="new-ingredients" className="text-sm font-medium">
                Склад
              </label>
              <Input
                id="new-ingredients"
                placeholder="Введіть склад товару"
                value={addFormState.ingredients}
                onChange={(e) => setAddFormState({ ...addFormState, ingredients: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="new-image" className="text-sm font-medium">
                Зображення
              </label>
              <Input
                id="new-image"
                type="file"
                accept="image/*"
                onChange={(e) => setAddFormState({ ...addFormState, imageFile: e.target.files?.[0] || null })}
              />
              {isUploading && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Завантаження: {uploadProgress}%
                  </p>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={isUploading}>
              Скасувати
            </Button>
            <Button onClick={addProduct} disabled={isUploading}>
              {isUploading ? "Завантаження..." : "Зберегти"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}