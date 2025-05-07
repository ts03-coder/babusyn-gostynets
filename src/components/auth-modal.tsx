"use client"

import { useState } from "react"
import { X, Mail, Lock, UserIcon, ArrowRight } from "lucide-react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import axios from "axios"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState("login")
  const [registerForm, setRegisterForm] = useState({
    name: "",
    emailOrPhone: "",
    password: "",
    terms: false,
  })
  const [loginForm, setLoginForm] = useState({
    emailOrPhone: "",
    password: "",
    remember: false,
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Валідація форми реєстрації
  const validateRegisterForm = () => {
    if (!registerForm.name) {
      return "Ім'я є обов'язковим";
    }
    if (registerForm.name.length < 2) {
      return "Ім'я має містити принаймні 2 символи";
    }
    if (!registerForm.emailOrPhone) {
      return "Вкажіть телефон або електронну пошту";
    }
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerForm.emailOrPhone);
    const isPhone = /^\+?\d{10,15}$/.test(registerForm.emailOrPhone);
    if (!isEmail && !isPhone) {
      return "Введіть коректний email або номер телефону";
    }
    if (!registerForm.password) {
      return "Пароль є обов'язковим";
    }
    if (registerForm.password.length < 6) {
      return "Пароль має містити принаймні 6 символів";
    }
    return null;
  }

  // Валідація форми логіну
  const validateLoginForm = () => {
    if (!loginForm.emailOrPhone) {
      return "Вкажіть телефон або електронну пошту";
    }
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginForm.emailOrPhone);
    const isPhone = /^\+?\d{10,15}$/.test(loginForm.emailOrPhone);
    if (!isEmail && !isPhone) {
      return "Введіть коректний email або номер телефону";
    }
    if (!loginForm.password) {
      return "Пароль є обов'язковим";
    }
    if (loginForm.password.length < 6) {
      return "Пароль має містити принаймні 6 символів";
    }
    return null;
  }

  // Обробка реєстрації
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    const validationError = validateRegisterForm();
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    try {
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerForm.emailOrPhone)
      const data = {
        [isEmail ? "email" : "phone"]: registerForm.emailOrPhone,
        password: registerForm.password,
        name: registerForm.name,
      }

      const response = await axios.post("/api/auth", data)

      if (response.data.token) {
        localStorage.setItem("token", response.data.token)
        setSuccess("Реєстрація успішна! Ви будете перенаправлені через 2 секунди.")
        setTimeout(() => {
          onClose()
        }, 2000)
      }
    } catch (err: any) {
      if (err.response?.data?.error) {
        setError(err.response.data.error)
      } else {
        setError("Щось пішло не так. Спробуйте ще раз.")
      }
    } finally {
      setLoading(false)
    }
  }

  // Обробка логіну
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    const validationError = validateLoginForm();
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    try {
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginForm.emailOrPhone)
      const data = {
        [isEmail ? "email" : "phone"]: loginForm.emailOrPhone,
        password: loginForm.password,
      }

      const response = await axios.post("/api/auth/login", data)

      if (response.data.token) {
        localStorage.setItem("token", response.data.token)
        setSuccess("Вхід успішний! Ви будете перенаправлені через 2 секунди.")
        setTimeout(() => {
          onClose()
        }, 2000)
      }
    } catch (err: any) {
      if (err.response?.data?.error) {
        setError(err.response.data.error)
      } else {
        setError("Щось пішло не так. Спробуйте ще раз.")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleRegisterInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setRegisterForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleLoginInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setLoginForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] p-0 gap-0 bg-white rounded-xl border-none shadow-2xl overflow-hidden">
        <div className="absolute right-4 top-4 z-10">
          <button onClick={onClose} className="rounded-full p-1.5 bg-gray-100 hover:bg-gray-200 transition-colors">
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-50 p-1 rounded-none h-auto">
            <TabsTrigger
              value="login"
              className={`py-3 rounded-lg text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm ${
                activeTab === "login" ? "text-primary" : "text-gray-500"
              }`}
            >
              Вхід
            </TabsTrigger>
            <TabsTrigger
              value="register"
              className={`py-3 rounded-lg text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm ${
                activeTab === "register" ? "text-primary" : "text-gray-500"
              }`}
            >
              Реєстрація
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="p-6 pt-8 focus-visible:outline-none focus-visible:ring-0">
            <DialogTitle className="sr-only">Авторизація</DialogTitle>
            <form onSubmit={handleLoginSubmit} className="space-y-6">
              {error && (
                <div className="text-red-500 text-sm text-center">{error}</div>
              )}
              {success && (
                <div className="text-green-500 text-sm text-center">{success}</div>
              )}
              <div className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    name="emailOrPhone"
                    placeholder="Телефон або електронну пошту"
                    value={loginForm.emailOrPhone}
                    onChange={handleLoginInputChange}
                    className="pl-10 py-6 bg-gray-50 border-gray-100 rounded-lg focus-visible:ring-primary"
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="password"
                    name="password"
                    placeholder="Пароль"
                    value={loginForm.password}
                    onChange={handleLoginInputChange}
                    className="pl-10 py-6 bg-gray-50 border-gray-100 rounded-lg focus-visible:ring-primary"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    name="remember"
                    checked={loginForm.remember}
                    onCheckedChange={(checked: boolean) =>
                      setLoginForm((prev) => ({ ...prev, remember: checked }))
                    }
                  />
                  <Label htmlFor="remember" className="text-sm text-gray-600">
                    Запам'ятати мене
                  </Label>
                </div>
                <button className="text-sm text-primary hover:underline">Забули пароль?</button>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 py-6 rounded-lg text-base font-medium disabled:opacity-50"
              >
                {loading ? "Вхід..." : "Увійти"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-4 text-sm text-gray-500">або</span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full py-6 flex items-center justify-center gap-3 border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700 font-medium"
              >
                <Image src="/google-logo.svg" alt="Google" width={20} height={20} />
                Увійти через Google
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register" className="p-6 pt-8 focus-visible:outline-none focus-visible:ring-0">
            <DialogTitle className="sr-only">Реєстрація</DialogTitle>
            <form onSubmit={handleRegisterSubmit} className="space-y-6">
              {error && (
                <div className="text-red-500 text-sm text-center">{error}</div>
              )}
              {success && (
                <div className="text-green-500 text-sm text-center">{success}</div>
              )}
              <div className="space-y-4">
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    name="name"
                    placeholder="Ім'я"
                    value={registerForm.name}
                    onChange={handleRegisterInputChange}
                    className="pl-10 py-6 bg-gray-50 border-gray-100 rounded-lg focus-visible:ring-primary"
                  />
                </div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    name="emailOrPhone"
                    placeholder="Телефон або електронну пошту"
                    value={registerForm.emailOrPhone}
                    onChange={handleRegisterInputChange}
                    className="pl-10 py-6 bg-gray-50 border-gray-100 rounded-lg focus-visible:ring-primary"
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="password"
                    name="password"
                    placeholder="Пароль"
                    value={registerForm.password}
                    onChange={handleRegisterInputChange}
                    className="pl-10 py-6 bg-gray-50 border-gray-100 rounded-lg focus-visible:ring-primary"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  name="terms"
                  checked={registerForm.terms}
                  onCheckedChange={(checked: boolean) =>
                    setRegisterForm((prev) => ({ ...prev, terms: checked }))
                  }
                />
                <Label htmlFor="terms" className="text-sm text-gray-600">
                  Я погоджуюсь з{" "}
                  <a href="#" className="text-primary hover:underline">
                    умовами використання
                  </a>
                </Label>
              </div>

              <Button
                type="submit"
                disabled={loading || !registerForm.terms}
                className="w-full bg-primary hover:bg-primary/90 py-6 rounded-lg text-base font-medium disabled:opacity-50"
              >
                {loading ? "Реєстрація..." : "Зареєструватися"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-4 text-sm text-gray-500">або</span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full py-6 flex items-center justify-center gap-3 border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700 font-medium"
              >
                <Image src="/images/google-logo.svg" alt="Google" width={25} height={25} />
                Увійти через Google
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}