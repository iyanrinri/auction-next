'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { auctionsApi } from '@/services/auctions.service'
import { bidsApi } from '@/services/bids.service'
import { AuctionTimer } from '@/components/auction/auction-timer'
import { BidForm } from '@/components/auction/bid-form'
import { BidHistory } from '@/components/auction/bid-history'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/store/auth'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ArrowLeft, User, Package, Calendar, TrendingUp, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'
import { useAuctionSocket } from '@/hooks/use-auction-socket'

export default function AuctionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { isAuthenticated, user } = useAuthStore()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const auctionId = params.id as string

  // Use WebSocket for real-time updates
  const { 
    isConnected, 
    currentBid: wsCurrentBid, 
    bidCount: wsBidCount, 
    viewers,
    status: wsStatus,
    timeRemaining 
  } = useAuctionSocket(auctionId)

  const { data: auction, isLoading, error } = useQuery({
    queryKey: ['auction', auctionId],
    queryFn: () => auctionsApi.getById(auctionId),
    refetchInterval: 30000, // 30 seconds as fallback
    refetchOnWindowFocus: false, // Prevent refetch on window focus
    staleTime: 10000, // Consider data fresh for 10 seconds
  })

  // Fetch bids for this auction with pagination
  const { data: bidsData } = useQuery({
    queryKey: ['bids', auctionId, 1, 20], // page 1, limit 20
    queryFn: () => bidsApi.getByAuctionId(auctionId, { page: 1, limit: 20 }),
    enabled: !!auctionId,
    refetchInterval: 30000,
    refetchOnWindowFocus: false, // Prevent refetch on window focus
    staleTime: 10000, // Consider data fresh for 10 seconds
  })

  useEffect(() => {
    if (error) {
      toast({
        title: 'Error loading auction',
        description: 'Failed to load auction details',
        variant: 'destructive',
      })
    }
  }, [error, toast])

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (!auction) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Auction Not Found</h1>
          <Link href="/auctions">
            <Button>Back to Auctions</Button>
          </Link>
        </div>
      </div>
    )
  }

  const currentPrice = wsCurrentBid || auction.currentHighestBid?.amount || auction.currentBid?.amount || auction.startingPrice
  const totalBids = wsBidCount || auction.bidCount || auction.bidsCount || 0
  const auctionStatus = (wsStatus || auction.status || '').toLowerCase()
  const isRunning = auctionStatus === 'running'
  const isEnded = auctionStatus === 'ended'
  const canBid = isAuthenticated && isRunning && user?.id !== auction.item?.sellerId

  // Get bids array from fetched data
  const bids = bidsData?.bids || []
  const totalBidsInDB = bidsData?.total || 0

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Link href="/auctions">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Auctions
        </Button>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Item Info */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-3xl">{auction.item?.title}</CardTitle>
                <div className="flex items-center gap-2">
                  {/* WebSocket Connection Indicator */}
                  {isConnected && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      Live
                    </div>
                  )}
                  
                  {/* Auction Status */}
                  <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    isRunning ? 'bg-green-100 text-green-700' :
                    isEnded ? 'bg-gray-100 text-gray-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {auctionStatus}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground">{auction.item?.description}</p>
              </div>

              {/* Metadata */}
              {auction.item?.metadata && Object.keys(auction.item.metadata).length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Item Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(auction.item.metadata).map(([key, value]) => (
                      <div key={key} className="bg-slate-50 p-3 rounded break-words">
                        <div className="text-xs text-muted-foreground capitalize mb-1">{key}</div>
                        <div className="font-medium text-sm break-all overflow-hidden">
                          {typeof value === 'string' && (value.startsWith('http://') || value.startsWith('https://')) ? (
                            <a 
                              href={value} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 underline"
                            >
                              {value.length > 50 ? `${value.substring(0, 50)}...` : value}
                            </a>
                          ) : typeof value === 'object' ? (
                            <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(value, null, 2)}</pre>
                          ) : (
                            String(value)
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Seller Info */}
              {auction.item?.seller && (
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                  <User className="w-10 h-10 p-2 bg-slate-200 rounded-full" />
                  <div>
                    <div className="text-xs text-muted-foreground">Seller</div>
                    <div className="font-semibold">{auction.item.seller.name}</div>
                  </div>
                </div>
              )}

              {/* Auction Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Calendar className="w-4 h-4" />
                    Start Time
                  </div>
                  <div className="font-medium">{formatDate(auction.startAt)}</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Calendar className="w-4 h-4" />
                    End Time
                  </div>
                  <div className="font-medium">{formatDate(auction.endAt)}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bid History */}
          <Card>
            <CardContent className="pt-6">
              <BidHistory 
                bids={bids}
                currentHighestBidId={auction.currentHighestBid?.id || auction.currentBid?.id}
                auctionId={auctionId}
                totalBids={totalBidsInDB}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Current Price */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Current Price</div>
                  <div className="text-4xl font-bold text-slate-900">
                    {formatCurrency(currentPrice)}
                  </div>
                  <div className="flex items-center justify-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span>
                      {totalBids} {totalBids === 1 ? 'bid' : 'bids'}
                    </span>
                    {viewers > 0 && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {viewers} watching
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Ending Soon Warning */}
                {timeRemaining !== null && timeRemaining <= 300 && isRunning && (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg animate-pulse">
                    <div className="font-semibold text-sm">⏰ Ending Soon!</div>
                    <div className="text-xs mt-1">
                      {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')} remaining
                    </div>
                  </div>
                )}

                {isRunning && (
                  <AuctionTimer 
                    endTime={auction.endAt} 
                    className="justify-center"
                    onExpire={() => {
                      queryClient.invalidateQueries({ queryKey: ['auction', auctionId] })
                    }}
                  />
                )}

                {isEnded && (
                  <div className="bg-slate-100 p-4 rounded-lg">
                    <div className="text-sm font-medium text-slate-700">
                      Auction Ended
                    </div>
                    {auction.winnerId && (
                      <div className="text-sm text-muted-foreground mt-1">
                        Winner: {auction.currentHighestBid?.bidder?.name || auction.currentBid?.bidder?.name || 'Unknown'}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Bid Form */}
          {canBid ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Place Your Bid</CardTitle>
              </CardHeader>
              <CardContent>
                <BidForm
                  auctionId={auctionId}
                  currentPrice={currentPrice}
                  minIncrement={auction.minIncrement}
                  buyNowPrice={auction.buyNowPrice}
                  onSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: ['auction', auctionId] })
                    queryClient.invalidateQueries({ queryKey: ['bids', auctionId] })
                  }}
                />
              </CardContent>
            </Card>
          ) : !isAuthenticated ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground mb-4">
                  Please login to place a bid
                </p>
                <Link href="/login">
                  <Button className="w-full">Login to Bid</Button>
                </Link>
              </CardContent>
            </Card>
          ) : user?.id === auction.item?.sellerId ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <Package className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">
                  This is your auction
                </p>
              </CardContent>
            </Card>
          ) : null}

          {/* Auction Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Auction Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Starting Price:</span>
                <span className="font-semibold">{formatCurrency(auction.startingPrice)}</span>
              </div>
              {auction.reservePrice && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reserve Price:</span>
                  <span className="font-semibold">{formatCurrency(auction.reservePrice)}</span>
                </div>
              )}
              {auction.buyNowPrice && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Buy Now Price:</span>
                  <span className="font-semibold text-blue-600">{formatCurrency(auction.buyNowPrice)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Min. Increment:</span>
                <span className="font-semibold">{formatCurrency(auction.minIncrement)}</span>
              </div>
              {auction.autoExtendSeconds && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Auto Extend:</span>
                  <span className="font-semibold">{auction.autoExtendSeconds}s</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
