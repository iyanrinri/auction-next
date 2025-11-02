# WebSocket Integration Guide

This document explains the WebSocket integration in the auction frontend application.

## Overview

The application uses Socket.IO to provide real-time updates for auction events including:
- New bids placed
- Price updates
- Auction status changes
- Ending soon notifications
- Live viewer counts

## Configuration

### Environment Variables

Add the following to your `.env.local` file:

```env
NEXT_PUBLIC_WS_URL=http://localhost:3000
```

For production:
```env
NEXT_PUBLIC_WS_URL=https://your-api-domain.com
```

## Architecture

### 1. Socket Client (`src/lib/socket.ts`)

The core WebSocket client that manages the connection to the server.

**Key Features:**
- Singleton pattern for single connection instance
- Auto-reconnection support
- JWT authentication
- TypeScript type definitions for all events

**Example Usage:**
```typescript
import { connectSocket, joinAuction, onNewBid } from '@/lib/socket'

// Connect with authentication
const socket = connectSocket(token)

// Join a specific auction room
joinAuction('auction-id')

// Listen for events
const unsubscribe = onNewBid((data) => {
  console.log('New bid:', data)
})

// Cleanup
unsubscribe()
```

### 2. WebSocket Hooks

#### `useAuctionSocket` (Single Auction)

Hook for managing real-time updates on a single auction detail page.

```typescript
import { useAuctionSocket } from '@/hooks/use-auction-socket'

function AuctionDetailPage() {
  const { 
    isConnected,    // Connection status
    currentBid,     // Latest bid amount
    bidCount,       // Total number of bids
    viewers,        // Active viewers count
    status,         // Auction status
    timeRemaining   // Time remaining (when ending soon)
  } = useAuctionSocket(auctionId)
  
  return (
    <div>
      {isConnected && <span>🟢 Live</span>}
      <h2>Current Price: ${currentBid}</h2>
      <p>{viewers} people watching</p>
    </div>
  )
}
```

#### `useAuctionListSocket` (Multiple Auctions)

Hook for tracking real-time updates across multiple auctions in a list.

```typescript
import { useAuctionListSocket } from '@/hooks/use-auction-list-socket'

function AuctionsListPage() {
  const { getAuctionUpdate } = useAuctionListSocket()
  
  return (
    <div>
      {auctions.map(auction => {
        const update = getAuctionUpdate(auction.id)
        return (
          <AuctionCard
            key={auction.id}
            auction={auction}
            realTimePrice={update?.currentPrice}
            realTimeBidCount={update?.bidCount}
          />
        )
      })}
    </div>
  )
}
```

#### `useGlobalSocket`

Hook for maintaining a persistent WebSocket connection throughout the app.

```typescript
import { useGlobalSocket } from '@/hooks/use-auction-socket'

function Layout() {
  // Automatically connects when user is authenticated
  useGlobalSocket()
  
  return <div>{children}</div>
}
```

### 3. Real-time Components

#### `LiveAuctionCard`

Enhanced auction card with real-time price updates and animations.

**Features:**
- Pulsing "LIVE" indicator for active auctions
- Animated price changes with green highlight
- Real-time bid count updates
- Smooth transitions and visual feedback

```typescript
<LiveAuctionCard 
  auction={auction}
  realTimePrice={150}
  realTimeBidCount={5}
  isLive={true}
/>
```

## WebSocket Events

### Server Events (Listening)

#### 1. `newBid`
Triggered when a new bid is placed on an auction.

```typescript
{
  auctionId: string
  bid: {
    id: string
    amount: number
    bidderId: string
    bidderName: string
    isAuto: boolean
    createdAt: string
  }
  timestamp: string
}
```

#### 2. `priceUpdate`
Triggered when auction price changes.

```typescript
{
  auctionId: string
  currentPrice: number
  bidCount: number
  timestamp: string
}
```

#### 3. `statusChange`
Triggered when auction status changes.

```typescript
{
  auctionId: string
  status: 'PENDING' | 'RUNNING' | 'ENDED' | 'CANCELLED'
  data?: {
    startedAt?: string
    endedAt?: string
  }
  timestamp: string
}
```

#### 4. `endingSoon`
Triggered at intervals before auction ends (5min, 2min, 1min).

```typescript
{
  auctionId: string
  timeRemainingSeconds: number
  timestamp: string
}
```

#### 5. `viewerCount`
Triggered when someone joins/leaves an auction room.

```typescript
{
  auctionId: string
  count: number
}
```

### Client Events (Emitting)

#### 1. `joinAuction`
Join a specific auction room to receive updates.

```typescript
socket.emit('joinAuction', 'auction-id')
```

#### 2. `leaveAuction`
Leave an auction room.

```typescript
socket.emit('leaveAuction', 'auction-id')
```

## Visual Feedback

### Real-time Indicators

1. **Live Badge**: Green pulsing dot with "Live" text
2. **Price Update Animation**: Green highlight with scale effect
3. **Ending Soon Alert**: Red pulsing alert box with countdown
4. **Viewer Count**: Eye icon with live count
5. **Connection Status**: Green dot indicator

### Toast Notifications

The app shows toast notifications for:
- 💰 New bids placed
- 🚀 Auction started
- 🏁 Auction ended
- ⏰ Ending soon warnings
- 🔄 Status changes

## Best Practices

### 1. Connection Management

```typescript
// ✅ Good: Connect once at app level
function App() {
  useGlobalSocket()
  return <YourApp />
}

// ❌ Bad: Connecting in multiple components
function Component() {
  connectSocket(token) // Don't do this
}
```

### 2. Cleanup

```typescript
// ✅ Good: Hooks handle cleanup automatically
useEffect(() => {
  const unsubscribe = onNewBid(handler)
  return () => unsubscribe() // Cleanup on unmount
}, [])

// ❌ Bad: Not cleaning up listeners
useEffect(() => {
  onNewBid(handler) // Memory leak!
}, [])
```

### 3. Error Handling

```typescript
// The socket client automatically handles:
// - Connection errors
// - Reconnection attempts
// - Authentication failures

// Monitor connection status:
const { isConnected } = useAuctionSocket(auctionId)
if (!isConnected) {
  // Show offline indicator
}
```

## Troubleshooting

### Connection Issues

1. **Check WebSocket URL**
   ```bash
   # Verify .env.local
   NEXT_PUBLIC_WS_URL=http://localhost:3000
   ```

2. **Check Backend Server**
   ```bash
   # Backend should be running on port 3000
   curl http://localhost:3000/health
   ```

3. **Check Browser Console**
   - Look for connection logs: "✅ WebSocket connected"
   - Check for errors: "WebSocket connection error"

### Events Not Received

1. **Verify Room Join**
   ```typescript
   // Make sure you join the auction room
   joinAuction(auctionId)
   ```

2. **Check Authentication**
   ```typescript
   // Token must be valid
   const { token } = useAuthStore()
   connectSocket(token)
   ```

3. **Monitor Network Tab**
   - Open DevTools → Network → WS
   - Check WebSocket messages

### Performance Issues

1. **Limit Active Connections**
   - Join specific auction rooms only
   - Leave rooms when navigating away

2. **Use Debouncing**
   ```typescript
   // Debounce rapid updates
   const debouncedUpdate = useMemo(
     () => debounce((data) => updateUI(data), 100),
     []
   )
   ```

3. **Optimize Re-renders**
   ```typescript
   // Use React Query's background updates
   queryClient.invalidateQueries({ 
     queryKey: ['auction', auctionId],
     refetchType: 'none' // Don't refetch immediately
   })
   ```

## Testing

### Manual Testing

1. **Start Backend**
   ```bash
   cd backend
   npm run start:dev
   ```

2. **Start Frontend**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Open Multiple Browsers**
   - Place a bid in Browser A
   - See real-time update in Browser B

### Console Debugging

Enable verbose logging:
```typescript
// In socket.ts
socket.on('newBid', (data) => {
  console.log('💰 New bid:', data) // Already included
})
```

## Security

### Authentication

WebSocket connections require valid JWT tokens:

```typescript
// Token is sent on connection
const socket = io('http://localhost:3000/auctions', {
  auth: { token: 'your-jwt-token' }
})
```

### Room Authorization

- Users can only join auction rooms for active auctions
- Backend validates auction access before emitting events
- Sensitive data (like bidder details) is filtered server-side

## Future Enhancements

Potential improvements:
- [ ] Private bidding rooms
- [ ] Audio notifications for new bids
- [ ] Desktop notifications
- [ ] WebSocket reconnection UI
- [ ] Optimistic UI updates
- [ ] Bid history live streaming
- [ ] Chat functionality for auctions
- [ ] Multi-language notification support

## Resources

- [Socket.IO Client Documentation](https://socket.io/docs/v4/client-api/)
- [React Query Invalidation](https://tanstack.com/query/latest/docs/framework/react/guides/query-invalidation)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
