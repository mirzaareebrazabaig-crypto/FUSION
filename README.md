# 🍫 ChocoFusion - Mobile-First Artisanal E-Commerce Platform

A production-ready, mobile-first e-commerce web application and backend built for **ChocoFusion** — an artisanal chocolate brand specializing in freshly roasted nut delights, dry fruit bars, viral Dubai Kunafa chocolates, and bespoke festive hampers.

Designed for **360px–430px smartphone screens first** (touch-friendly targets $\ge 44\text{px}$, sticky bottom navigation, bottom-sheet menus, floating cart indicators), and scaling up seamlessly to tablets, laptops, and ultra-wide desktop displays.

---

## 🚀 Live Demo & Local Access
- **Local Store:** [http://localhost:3000](http://localhost:3000)
- **Menu:** [http://localhost:3000/menu](http://localhost:3000/menu)
- **Live Order Tracking:** [http://localhost:3000/track](http://localhost:3000/track)
- **Admin Portal:** [http://localhost:3000/admin](http://localhost:3000/admin) *(Password: `chocofusion2026`)*
- **Local WiFi Mobile Access:** `http://<your-laptop-ip>:3000` (e.g. `http://192.168.31.132:3000`)

---

## 🎨 Brand Identity & Design System
- **Colors:**
  - Deep Velvet Cocoa: `#24120B` & `#3B1F14`
  - Luxurious Warm Cream: `#FFF6EC`
  - Accent Rose Pink: `#FF4F8B`
  - Citrus Orange: `#FF8A3D`
  - Royal Gold: `#F5B83D`
  - Fresh Mint: `#2EC4B6`
- **Typography:** Poppins & Fraunces / Serif display headings with clear modern sans-serif body text.
- **Dietary Standards:** 100% Vegetarian, Eggless, Pure Cocoa Butter, No Preservatives.

---

## 🛠 Tech Stack
- **Frontend:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Lucide React, Canvas Confetti.
- **Backend & Database:** Next.js Route Handlers, Prisma ORM, SQLite (`dev.db`) for immediate local run, switchable to PostgreSQL / Supabase via `DATABASE_URL`.
- **Payments:** Razorpay API (`razorpay` Node SDK) with server-side HMAC-SHA256 signature verification & seamless test-mode sandbox fallback.
- **Notifications:**
  - **Meta WhatsApp Business Cloud API** (Primary channel for Owner alerts & Customer receipts).
  - **SMS Fallback** (Twilio & MSG91 DLT compliant).
  - Built-in notification logger and simulator when live keys are absent.
- **PWA:** Installable Progressive Web App (`manifest.json`, Service Worker `sw.js`, theme color `#3B1F14`).

---

## 📦 Official Seeded Menu (Prices in INR ₹)

| Category | Product Name | Portion / Weight | Price (₹) |
| :--- | :--- | :--- | :--- |
| **Nut Delights** | Roasted Almond Delight | 1 Piece (65g) | ₹120 |
| **Nut Delights** | Creamy Cashew Delight | 1 Piece (65g) | ₹120 |
| **Nut Delights** | Choco Walnut Delight | 1 Piece (65g) | ₹130 |
| **Nut Delights** | Pistachio Royal Delight | 1 Piece (65g) | ₹150 |
| **Nut Delights** | Honey Hazelnut Delight | 1 Piece (60g) | ₹100 |
| **Nut Delights** | All Nuts Festival Delight | 1 Piece (70g) | ₹130 |
| **Nut Delights** | Assorted Chocolate Delight | 1 Piece (70g) | ₹130 |
| **Dry Fruit Bars**| Dry Fruits Bar | 85g Bar | ₹110 |
| **Dry Fruit Bars**| Dry Fruits Mini Bar | 35g Mini Bar | ₹50 |
| **Kunafa Collection**| Kunafa Bites (Pack of 3) | 80g Box | ₹149 |
| **Kunafa Collection**| Kunafa Big Bar (Dubai Viral) | 180g Giant Bar | ₹349 |
| **Gift Hampers** | Customised Gift Hamper | Classic / Royal / Grand | ₹800 – ₹1399 |

---

## ⚡ Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
A ready `.env` file is generated. Review `.env.example` for reference:
```ini
DATABASE_URL="file:./dev.db"
ADMIN_SECRET_KEY="chocofusion2026"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
OWNER_WHATSAPP_NUMBER="+919986120044"
OWNER_SMS_NUMBER="+919986120044"
NEXT_PUBLIC_DEFAULT_DELIVERY_FEE=75
NEXT_PUBLIC_FREE_DELIVERY_THRESHOLD=999
```

### 3. Initialize & Seed Database
```bash
npx prisma db push
npm run db:seed
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) on your browser.

---

## 💳 Razorpay Payment Gateway Setup
1. Sign up at [Razorpay Dashboard](https://dashboard.razorpay.com).
2. Navigate to **Settings → API Keys** and generate **Key ID** and **Key Secret**.
3. Add them to `.env`:
   ```env
   NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_YourKeyId"
   RAZORPAY_KEY_ID="rzp_test_YourKeyId"
   RAZORPAY_KEY_SECRET="YourKeySecret"
   RAZORPAY_WEBHOOK_SECRET="YourWebhookSecret"
   ```
4. The payment verification endpoint (`/api/payment/verify`) validates HMAC-SHA256 signatures server-side before marking orders as `PAID`.
5. In development/demo mode without live keys, the checkout automatically operates in simulated sandbox mode, completing orders and triggering full notification dispatching without failure.

---

## 📲 WhatsApp Business Cloud API (Meta) Setup
1. Go to [developers.facebook.com](https://developers.facebook.com) and create an app with the **WhatsApp** product.
2. In **WhatsApp → API Setup**, note:
   - **System User Access Token**
   - **Phone Number ID**
   - **WhatsApp Business Account ID**
3. Configure `.env`:
   ```env
   WHATSAPP_CLOUD_API_TOKEN="EAAB..."
   WHATSAPP_PHONE_NUMBER_ID="109283746501928"
   WHATSAPP_BUSINESS_ACCOUNT_ID="102938475610293"
   OWNER_WHATSAPP_NUMBER="+919986120044"
   ```
4. When orders are paid, the server dispatches:
   - **To Owner (9986120044):** Comprehensive order summary with customer name, phone, item quantities, total amount, delivery address, scheduled date/slot, box gift message, and admin direct link.
   - **To Customer:** Order confirmation receipt and live tracking link.
5. All notifications are logged in the `NotificationLog` database table and viewable under `/admin` *(WhatsApp/SMS Logs tab)*.

---

## 📩 SMS Fallback Setup (Twilio or MSG91)
### Twilio
```env
SMS_PROVIDER="twilio"
TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
TWILIO_AUTH_TOKEN="your_auth_token"
TWILIO_PHONE_NUMBER="+1234567890"
OWNER_SMS_NUMBER="+919986120044"
```

### MSG91 (DLT India Compliant)
```env
SMS_PROVIDER="msg91"
MSG91_AUTH_KEY="your_msg91_auth_key"
MSG91_SENDER_ID="CHOFUS"
MSG91_TEMPLATE_ID="your_dlt_template_id"
```

---

## 🛡 Admin Panel (`/admin`)
Access the protected admin portal with password: `chocofusion2026`.
- **Order Pipeline:** Filter by Date, Order Status (`CONFIRMED`, `PREPARING`, `OUT_FOR_DELIVERY`, `DELIVERED`, `CANCELLED`), and Payment Status (`PAID`, `PENDING`, `FAILED`).
- **Product Management:** Toggle In-Stock / Out-of-Stock in 1-tap, change prices, and add new chocolates.
- **Serviceable Pincodes:** Manage Mumbai delivery zones with custom surcharges.
- **Delivery Slots:** Configure maximum capacity per 2-hour window and block dates.
- **Promotional Coupons:** Create flat or percentage discount codes (e.g., `CHOCO10`, `FIRSTBITE`, `FUSION20`).
- **Export Orders:** Download complete orders history in CSV format for kitchen dispatch and accounting.
- **Notification Logs:** Inspect real-time audit logs of sent WhatsApp messages and SMS alerts.

---

## 🌐 Production Deployment Guide

### Deploying Frontend & APIs to Vercel
1. Push this repository to GitHub / GitLab.
2. Import project into [Vercel](https://vercel.com).
3. Set Environment Variables in Vercel Project Settings matching `.env.example`.
4. Set Build Command: `npm run build`.

### Connecting PostgreSQL / Supabase
To switch from SQLite to Supabase or Railway PostgreSQL:
1. In `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. Update `.env`:
   ```env
   DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require"
   ```
3. Run:
   ```bash
   npx prisma db push
   npm run db:seed
   ```
