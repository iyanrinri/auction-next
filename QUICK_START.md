# 🚀 Quick Start Guide - Auction System Frontend

Panduan cepat untuk menjalankan aplikasi frontend Auction System.

## Prerequisites

Pastikan sudah terinstall:
- ✅ Node.js 18+ ([Download](https://nodejs.org/))
- ✅ NestJS Backend sudah berjalan di `http://localhost:3000`

## Installation

### 1. Clone & Install Dependencies

```bash
# Masuk ke folder project
cd auction-nextjs

# Install dependencies
npm install
```

### 2. Setup Environment Variables

```bash
# Copy file .env.example
cp .env.example .env.local

# Edit .env.local sesuai kebutuhan
nano .env.local  # atau gunakan editor favorit
```

**Isi `.env.local`:**
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=ws://localhost:3000
```

### 3. Run Development Server

```bash
npm run dev
```

✅ Aplikasi akan berjalan di: **http://localhost:3001**

## 📖 Testing the Application

### 1. Register as Seller
```bash
curl -X POST http://localhost:3001/register
# Atau buka browser: http://localhost:3001/register

# Form:
- Email: seller@test.com
- Password: 123456
- Name: Test Seller
- Role: Seller
```

### 2. Login
```bash
# Buka: http://localhost:3001/login
# Gunakan credentials dari registrasi
```

### 3. Create Item (Sellers Only)
```bash
# Setelah login sebagai seller:
# Navigate to: http://localhost:3001/items/create

# Form:
- Title: "Vintage Watch"
- Description: "Beautiful vintage watch from 1950s"
- Category: "accessories"
```

### 4. Browse Auctions
```bash
# Buka: http://localhost:3001/auctions
# Lihat daftar auction yang tersedia
```

### 5. Place Bid
```bash
# Klik auction card
# Jika sudah login sebagai USER, bisa place bid
# Masukkan amount > current price + minimum increment
```

## 🎯 Main Features to Test

### 1. **Authentication Flow**
- ✅ Register (USER/SELLER)
- ✅ Login
- ✅ Logout
- ✅ Protected routes

### 2. **Auction Features**
- ✅ Browse auctions
- ✅ Filter by status (PENDING/RUNNING/ENDED)
- ✅ Search by title
- ✅ Real-time countdown timer
- ✅ Pagination

### 3. **Bidding System**
- ✅ Place manual bids
- ✅ Buy now option
- ✅ Bid validation
- ✅ Real-time bid updates
- ✅ Bid history

### 4. **User Profile**
- ✅ View profile info
- ✅ See bid history
- ✅ Track winning/losing bids

### 5. **Real-time Updates** (if WebSocket enabled)
- ✅ Live bid notifications
- ✅ Price updates
- ✅ Auction end notifications
- ✅ Auto-extend notifications

## 🛠️ Development Commands

```bash
# Development server
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Production build
npm run build

# Start production
npm start
```

## 📂 Project Structure

```
auction-nextjs/
├── src/
│   ├── app/              # Pages (App Router)
│   │   ├── page.tsx      # Homepage
│   │   ├── login/        # Login page
│   │   ├── register/     # Register page
│   │   ├── auctions/     # Auctions pages
│   │   └── profile/      # Profile page
│   ├── components/       # React components
│   │   ├── auction/      # Auction components
│   │   ├── layout/       # Layout components
│   │   └── ui/           # UI components (Shadcn)
│   ├── services/         # API services
│   ├── store/            # Zustand stores
│   ├── lib/              # Utils & configs
│   ├── types/            # TypeScript types
│   └── hooks/            # Custom hooks
├── public/               # Static files
└── package.json
```

## 🔧 Common Issues & Solutions

### 1. Port 3001 already in use
```bash
# Gunakan port lain
PORT=3002 npm run dev
```

### 2. API Connection Error
```bash
# Pastikan backend running
curl http://localhost:3000

# Check .env.local
cat .env.local
```

### 3. CORS Error
Backend harus enable CORS untuk `http://localhost:3001`:
```typescript
// Pada NestJS backend:
app.enableCors({
  origin: 'http://localhost:3001',
  credentials: true,
});
```

### 4. WebSocket Not Connecting
```bash
# Check backend WebSocket support
# Ensure Socket.io installed on backend
# Check WS_URL in .env.local
```

### 5. Styling Issues
```bash
# Rebuild Tailwind
npm run dev
# atau
npx tailwindcss -i ./src/app/globals.css -o ./dist/output.css --watch
```

## 🎨 Customization

### Change Theme Colors
Edit `tailwind.config.ts`:
```typescript
theme: {
  extend: {
    colors: {
      primary: {
        DEFAULT: '#your-color',
        // ...
      }
    }
  }
}
```

### Add New Pages
```bash
# Create new page in src/app/
mkdir src/app/your-page
touch src/app/your-page/page.tsx
```

## 📊 Performance Tips

1. **Enable WebSocket** for true real-time experience
2. **Use production build** for better performance
3. **Enable caching** in API client
4. **Optimize images** using Next.js Image component
5. **Lazy load** heavy components

## 🐛 Debug Mode

```bash
# Run with debug logs
DEBUG=* npm run dev

# Or set in .env.local:
NEXT_PUBLIC_DEBUG=true
```

## 📞 Need Help?

- 📖 Read [README.md](./README.md) for full documentation
- 🐛 Check browser console for errors
- 🔍 Inspect Network tab for API issues
- 📝 Check backend logs

## ✅ Checklist Before Production

- [ ] Update environment variables
- [ ] Build and test production version
- [ ] Enable WebSocket for real-time
- [ ] Setup error tracking (Sentry, etc.)
- [ ] Configure CDN for assets
- [ ] Enable HTTPS
- [ ] Setup authentication refresh
- [ ] Add loading states
- [ ] Test on mobile devices
- [ ] Optimize bundle size

---

**Happy Coding! 🎉**

Need more features? Check the [API Documentation](../API_DOCUMENTATION.md)
