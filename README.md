# Auction System - Next.js Frontend

Modern and responsive Next.js 14+ frontend application for the NestJS Auction System with real-time bidding capabilities.

## 🚀 Features

- **Modern Tech Stack**
  - Next.js 14+ with App Router
  - TypeScript for type safety
  - Tailwind CSS for styling
  - Shadcn/ui for beautiful UI components

- **State Management**
  - Zustand for global state
  - TanStack Query (React Query) for server state
  - Local storage persistence

- **Authentication**
  - JWT-based authentication
  - Role-based access control (USER, SELLER, ADMIN)
  - Protected routes and components

- **Real-time Features** ⚡ NEW!
  - WebSocket integration with Socket.io
  - Live auction countdown timers
  - Instant bid updates across all clients
  - Real-time price changes
  - Live viewer count
  - Ending soon notifications
  - Status change alerts
  - See [WEBSOCKET.md](./WEBSOCKET.md) for details

- **Form Management**
  - React Hook Form for form handling
  - Zod for schema validation
  - Type-safe form submissions

- **Auction Features**
  - Browse and search auctions
  - Filter by status and category
  - Real-time bidding
  - Bid history tracking
  - Buy now options
  - Auto-extend functionality

## 📋 Prerequisites

- Node.js 18+ installed
- NestJS backend running on `http://localhost:3000`

## 🛠️ Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Configure environment variables:**
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=http://localhost:3000
```

3. **Run development server:**
```bash
npm run dev
```

The application will be available at `http://localhost:3001`

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── auctions/          # Auction list and detail pages
│   ├── login/             # Login page
│   ├── register/          # Registration page
│   ├── profile/           # User profile page
│   ├── layout.tsx         # Root layout with providers
│   └── page.tsx           # Homepage
├── components/            # React components
│   ├── auction/           # Auction-specific components
│   │   ├── auction-card.tsx
│   │   ├── auction-timer.tsx
│   │   ├── bid-form.tsx
│   │   └── bid-history.tsx
│   ├── layout/            # Layout components
│   │   ├── navbar.tsx
│   │   └── footer.tsx
│   ├── ui/                # Shadcn/ui components
│   └── providers.tsx      # React Query provider
├── services/              # API service layer
│   ├── auth.service.ts
│   ├── auctions.service.ts
│   ├── items.service.ts
│   └── bids.service.ts
├── store/                 # Zustand stores
│   └── auth.ts
├── hooks/                 # Custom React hooks
│   ├── use-toast.ts
│   ├── use-auction-socket.ts      # WebSocket hook for single auction
│   └── use-auction-list-socket.ts # WebSocket hook for auction list
├── lib/                   # Utilities and configurations
│   ├── api-client.ts      # Axios instance
│   ├── socket.ts          # Socket.io WebSocket client
│   └── utils.ts           # Helper functions
```

## 🎨 Key Components

### AuctionTimer
Real-time countdown timer for auctions with auto-refresh.

### AuctionCard
Reusable card component displaying auction information.

### BidForm
Form for placing bids with validation and error handling.

### BidHistory
List of all bids with winner highlighting.

### Navbar
Responsive navigation with authentication state.

## 🔐 Authentication Flow

1. User registers/logs in
2. JWT token stored in localStorage
3. Token automatically attached to API requests
4. Protected routes check authentication status
5. Automatic logout on 401 responses

## 📡 API Integration

The frontend integrates with these NestJS backend endpoints:

- **Auth:** `/auth/register`, `/auth/login`
- **Users:** `/users/profile`
- **Items:** `/items`, `/items/:id`
- **Auctions:** `/auctions`, `/auctions/:id`
- **Bids:** `/bids`, `/bids/my-bids`

## 🎯 User Roles

### USER (Buyer)
- Browse auctions
- Place bids
- View bid history
- View profile

### SELLER
- All USER permissions
- Create items
- Create auctions
- Manage own items

### ADMIN
- All SELLER permissions
- System administration

## 🌐 Real-time WebSocket Features ⚡

The application now includes **full WebSocket integration** for real-time updates!

### Features
- ✅ **Instant bid updates** - See new bids immediately without refresh
- ✅ **Live viewer count** - Know how many people are watching
- ✅ **Price animations** - Visual feedback on price changes
- ✅ **Ending soon alerts** - Countdown warnings when auction is about to end
- ✅ **Status changes** - Real-time auction status updates (PENDING → RUNNING → ENDED)
- ✅ **Toast notifications** - Friendly alerts for all events

### Quick Start
```bash
# 1. Set WebSocket URL in .env.local
echo "NEXT_PUBLIC_WS_URL=http://localhost:3000" >> .env.local

# 2. Start the app
npm run dev

# 3. Open auction in 2 browsers and test real-time updates!
```

### Documentation
- **Quick Start Guide**: [QUICKSTART_WEBSOCKET.md](./QUICKSTART_WEBSOCKET.md)
- **Complete Documentation**: [WEBSOCKET.md](./WEBSOCKET.md)
- **Implementation Summary**: [WEBSOCKET_SUMMARY.md](./WEBSOCKET_SUMMARY.md)

### Key Events
- `newBid` - New bid placed
- `priceUpdate` - Current price updated
- `statusChange` - Auction status changed
- `endingSoon` - Auction ending warning
- `viewerCount` - Active viewers count

## 🎨 Customization

### Colors & Theme
Edit `tailwind.config.ts` to customize the design system.

### Components
All UI components are in `src/components/ui/` and can be customized.

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px)
- Touch-friendly interfaces
- Optimized for all screen sizes

## 🚀 Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 🐛 Error Handling

- Global error boundaries
- Toast notifications for user feedback
- API error interceptors
- Form validation errors
- Network error handling

## 📊 Performance Optimizations

- React Query caching
- Automatic request deduplication
- Optimistic UI updates
- Code splitting
- Image optimization
- Lazy loading

## 🧪 Testing Commands

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Build check
npm run build
```

## 🔧 Troubleshooting

### CORS Errors
Ensure backend has CORS enabled for your frontend URL.

### Authentication Issues
Check if JWT token is being sent in Authorization header.

### API Connection
Verify `NEXT_PUBLIC_API_URL` matches your backend URL.

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [TanStack Query](https://tanstack.com/query/latest)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Shadcn/ui](https://ui.shadcn.com)
- [Zustand](https://docs.pmnd.rs/zustand)

---

**Happy Coding! 🎉**
