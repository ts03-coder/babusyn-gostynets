import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/admin/',
        '/checkout/',
        '/profile/',
        '/cart/',
      ],
    },
    sitemap: 'https://babusyn-gostynets.vercel.app/sitemap.xml',
  }
} 