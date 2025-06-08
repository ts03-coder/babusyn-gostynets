import { Metadata } from 'next'
import prisma from '@/lib/prisma'
import { Category } from '@prisma/client'

interface CategoryWithProducts extends Category {
  products: {
    id: string
    name: string
    price: number
    image: string | null
  }[]
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const category = await prisma.category.findUnique({
    where: { id: params.id },
    include: {
      products: {
        select: {
          id: true,
          name: true,
          price: true,
          image: true,
        },
      },
    },
  }) as CategoryWithProducts | null

  if (!category) {
    return {
      title: 'Категорія не знайдена',
    }
  }

  return {
    title: category.name,
    description: category.description || '',
    openGraph: {
      title: category.name,
      description: category.description || '',
    },
  }
}

export default async function CategoryPage({ params }: { params: { id: string } }) {
  const category = await prisma.category.findUnique({
    where: { id: params.id },
    include: {
      products: {
        select: {
          id: true,
          name: true,
          price: true,
          image: true,
        },
      },
    },
  }) as CategoryWithProducts | null

  if (!category) {
    return <div>Категорія не знайдена</div>
  }

  // Структуровані дані для категорії
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: category.name,
    description: category.description || '',
    url: `https://babusyn-gostynets.vercel.app/catalog/${category.id}`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: category.products.map((product, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Product',
          name: product.name,
          image: product.image || undefined,
          sku: product.id,
          offers: {
            '@type': 'Offer',
            price: product.price,
            priceCurrency: 'UAH',
            url: `https://babusyn-gostynets.vercel.app/product/${product.id}`,
          },
        },
      })),
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Rest of the component */}
    </>
  )
} 