# Babusyn Gostynets - Інтернет-магазин

## Опис проекту
Інтернет-магазин з можливістю перегляду товарів, додавання в кошик, оформлення замовлення та управління профілем користувача.

## Технічний стек
- **Frontend**: Next.js 14, React, TypeScript
- **UI**: Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes
- **База даних**: PostgreSQL
- **ORM**: Prisma
- **Аутентифікація**: JWT
- **Зберігання файлів**: Локальне зберігання

## Функціональність

### Користувачі
- Реєстрація та авторизація
- Управління профілем
- Історія замовлень
- Список бажаних товарів
- Управління адресами доставки
- Управління способами оплати

### Товари
- Каталог товарів з фільтрацією та сортуванням
- Пошук товарів
- Детальна інформація про товар
- Акційні товари
- Новинки
- Рекомендовані товари

### Кошик
- Додавання/видалення товарів
- Зміна кількості
- Розрахунок знижок
- Очищення кошика

### Замовлення
- Оформлення замовлення
- Вибір адреси доставки
- Вибір способу оплати
- Вибір способу доставки
- Підтвердження замовлення

## Структура проекту
```
src/
├── app/
│   ├── (frontend)/        # Публічні сторінки
│   │   ├── cart/         # Кошик
│   │   ├── catalog/      # Каталог товарів
│   │   ├── checkout/     # Оформлення замовлення
│   │   ├── product/      # Сторінка товару
│   │   └── profile/      # Профіль користувача
│   ├── (backend)/        # API роути
│   │   └── api/         # API ендпоінти
│   └── page.tsx         # Головна сторінка
├── components/          # React компоненти
├── lib/                # Утиліти та конфігурації
└── types/             # TypeScript типи
```

## Встановлення та запуск

1. Клонуйте репозиторій:
```bash
git clone https://github.com/your-username/babusyn-gostynets.git
cd babusyn-gostynets
```

2. Встановіть залежності:
```bash
npm install
```

3. Створіть файл `.env` та налаштуйте змінні середовища:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
JWT_SECRET="your-secret-key"
```

4. Запустіть міграції бази даних:
```bash
npx prisma migrate dev
```

5. Запустіть сервер розробки:
```bash
npm run dev
```

Відкрийте [http://localhost:3000](http://localhost:3000) у браузері.

## Розгортання

### Локальне розгортання
1. Зберіть проект:
```bash
npm run build
```

2. Запустіть продакшн версію:
```bash
npm start
```

### Розгортання на Vercel
1. Підключіть репозиторій до Vercel
2. Налаштуйте змінні середовища
3. Запустіть розгортання

## Розробка

### Структура бази даних
Проект використовує Prisma ORM. Схема бази даних знаходиться в `prisma/schema.prisma`.

### API Ендпоінти

#### Аутентифікація (`/api/auth/*`)
- `POST /api/auth/register` - Реєстрація нового користувача
  ```json
  {
    "email": "string",
    "password": "string",
    "name": "string"
  }
  ```
- `POST /api/auth/login` - Вхід в систему
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- `GET /api/auth/me` - Отримання інформації про поточного користувача
- `POST /api/auth/logout` - Вихід з системи

#### Товари (`/api/products/*`)
- `GET /api/products` - Отримання списку товарів
  - Query параметри:
    - `page`: номер сторінки
    - `limit`: кількість товарів на сторінці
    - `category`: ID категорії
    - `sort`: поле для сортування
    - `order`: напрямок сортування (asc/desc)
    - `search`: пошуковий запит
    - `onlyOnSale`: фільтр акційних товарів
- `GET /api/products/:id` - Отримання деталей товару
- `GET /api/products/recommended` - Отримання рекомендованих товарів
- `GET /api/products/new` - Отримання нових товарів
- `GET /api/products/sale` - Отримання акційних товарів

#### Кошик (`/api/cart/*`)
- `GET /api/cart` - Отримання вмісту кошика
- `POST /api/cart` - Додавання товару в кошик
  ```json
  {
    "productId": "string",
    "quantity": number
  }
  ```
- `PATCH /api/cart` - Оновлення кількості товару
  ```json
  {
    "productId": "string",
    "quantity": number
  }
  ```
- `DELETE /api/cart` - Очищення кошика
- `DELETE /api/cart?productId=:id` - Видалення товару з кошика

#### Замовлення (`/api/orders/*`)
- `GET /api/orders` - Отримання списку замовлень користувача
- `GET /api/orders/:id` - Отримання деталей замовлення
- `POST /api/orders` - Створення нового замовлення
  ```json
  {
    "items": [
      {
        "productId": "string",
        "quantity": number
      }
    ],
    "addressId": "string",
    "paymentId": "string",
    "deliveryMethod": "string",
    "comment": "string"
  }
  ```
- `PATCH /api/orders/:id` - Оновлення статусу замовлення
- `DELETE /api/orders/:id` - Скасування замовлення

#### Профіль (`/api/profile/*`)
- `GET /api/profile` - Отримання інформації профілю
- `PATCH /api/profile` - Оновлення інформації профілю
  ```json
  {
    "name": "string",
    "email": "string",
    "phone": "string"
  }
  ```
- `POST /api/profile/password` - Зміна паролю
  ```json
  {
    "currentPassword": "string",
    "newPassword": "string",
    "confirmPassword": "string"
  }
  ```

#### Адреси (`/api/profile/addresses/*`)
- `GET /api/profile/addresses` - Отримання списку адрес
- `POST /api/profile/addresses` - Додавання нової адреси
  ```json
  {
    "title": "string",
    "fullName": "string",
    "phone": "string",
    "address": "string",
    "city": "string",
    "postal": "string"
  }
  ```
- `PATCH /api/profile/addresses/:id` - Оновлення адреси
- `DELETE /api/profile/addresses/:id` - Видалення адреси

#### Спосіб оплати (`/api/profile/payment-methods/*`)
- `GET /api/profile/payment-methods` - Отримання списку способів оплати
- `POST /api/profile/payment-methods` - Додавання нового способу оплати
  ```json
  {
    "type": "string",
    "cardNumber": "string",
    "expiryDate": "string",
    "cvv": "string"
  }
  ```
- `DELETE /api/profile/payment-methods/:id` - Видалення способу оплати

#### Категорії (`/api/categories/*`)
- `GET /api/categories` - Отримання списку категорій
- `GET /api/categories/:id` - Отримання деталей категорії
- `GET /api/categories/:id/products` - Отримання товарів категорії

#### Слайди (`/api/slides/*`)
- `GET /api/slides` - Отримання списку слайдів для головної сторінки

### Формати відповідей

#### Успішна відповідь
```json
{
  "success": true,
  "data": {
    // Дані відповіді
  }
}
```

#### Помилка
```json
{
  "success": false,
  "error": "Текст помилки"
}
```

### Аутентифікація
Всі захищені ендпоінти вимагають JWT токен в заголовку:
```
Authorization: Bearer <token>
```

### Пагінація
Ендпоінти, що повертають списки, підтримують пагінацію:
```json
{
  "success": true,
  "data": {
    "items": [],
    "total": number,
    "page": number,
    "limit": number,
    "totalPages": number
  }
}
```

## Ліцензія
MIT
