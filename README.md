# Banavoo.in Frontend

Next.js 16 + TypeScript + Tailwind CSS marketplace frontend.

## Stack
- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- Zustand (state management � auth + cart)
- Axios (API client)
- lucide-react (icons)

## Setup

1. `cp .env.local.example .env.local` � fill in `NEXT_PUBLIC_API_URL`
2. `npm install`
3. `npm run dev`

## Pages

| Route | Description | Auth |
|-------|-------------|------|
| `/` | Home � hero, categories, CTA | Public |
| `/products` | Product listing with search & filters | Public |
| `/products/[id]` | Product detail, reviews, delivery tabs | Public |
| `/login` | User login | Public |
| `/register` | Create account | Public |
| `/become-seller` | Activate seller account | Private |
| `/cart` | Shopping cart | Public (data local) |
| `/checkout` | 3-step checkout: address ? delivery ? payment | Private |
| `/dashboard` | Buyer order history | Private |
| `/seller` | Seller dashboard: overview, products, orders | Seller |
| `/seller/new-product` | Add new product with images | Seller |
| `/wishlist` | Saved products | Private |

## Key Features
- Products page is **fully public** � no login required to browse
- Users must **register/login only to place an order or wishlist**
- Seller onboarding: any buyer can click "Start Selling" and become a seller instantly (no GSTN)
- Cart persisted in localStorage via Zustand persist middleware
- Auth state persisted in localStorage, refreshed from `/api/auth/me` on mount
