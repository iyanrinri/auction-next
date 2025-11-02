'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { auctionsApi } from '@/services/auctions.service'
import { LiveAuctionCard } from '@/components/auction/live-auction-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Search, Filter } from 'lucide-react'
import { useAuctionListSocket } from '@/hooks/use-auction-list-socket'
import { useGlobalSocket } from '@/hooks/use-auction-socket'

export default function AuctionsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<string>('')
  const [searchInput, setSearchInput] = useState('')

  // Connect to global WebSocket
  useGlobalSocket()

  // Get real-time updates for auctions
  const { getAuctionUpdate } = useAuctionListSocket()

  const { data, isLoading } = useQuery({
    queryKey: ['auctions', { page, search, status, limit: 12 }],
    queryFn: () => auctionsApi.getAll({ page, limit: 12, search, status: status || undefined }),
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Browse Auctions</h1>
        <p className="text-muted-foreground">
          Discover unique items and place your bids
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="search">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="search"
                placeholder="Search by item title..."
                className="pl-10"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value)
                setPage(1)
              }}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="running">Running</option>
              <option value="ended">Ended</option>
            </select>
          </div>
        </form>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="h-96 bg-slate-200 animate-pulse rounded-lg" />
          ))}
        </div>
      ) : data?.auctions && data.auctions.length > 0 ? (
        <>
          <div className="mb-4 text-sm text-muted-foreground">
            Showing {data.auctions.length} of {data.total} auctions
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.auctions.map((auction) => {
              const update = getAuctionUpdate(auction.id)
              return (
                <LiveAuctionCard 
                  key={auction.id} 
                  auction={auction}
                  realTimePrice={update?.currentPrice}
                  realTimeBidCount={update?.bidCount}
                  isLive={!!update}
                />
              )
            })}
          </div>

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <div className="flex items-center px-4">
                Page {page} of {data.totalPages}
              </div>
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                disabled={page === data.totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <Filter className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No auctions found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filters
          </p>
        </div>
      )}
    </div>
  )
}

