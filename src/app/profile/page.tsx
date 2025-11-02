'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/auth'
import { bidsApi } from '@/services/bids.service'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'
import { User, Mail, Shield, Calendar, TrendingUp, Package } from 'lucide-react'
import Link from 'next/link'

export default function ProfilePage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  const { data: myBids, isLoading } = useQuery({
    queryKey: ['my-bids'],
    queryFn: () => bidsApi.getMyBids(),
    enabled: isAuthenticated,
  })

  if (!user) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">My Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                <User className="w-12 h-12 p-3 bg-blue-100 text-blue-600 rounded-full" />
                <div>
                  <div className="font-semibold text-lg">{user.name}</div>
                  <div className="text-sm text-muted-foreground capitalize">{user.role.toLowerCase()}</div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                  <span className="capitalize">{user.role} Account</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>Joined {formatDate(user.createdAt)}</span>
                </div>
              </div>

              {(user.role === 'SELLER' || user.role === 'ADMIN') && (
                <div className="pt-4 space-y-2">
                  <Link href="/items/create" className="block">
                    <Button className="w-full" variant="outline">
                      <Package className="w-4 h-4 mr-2" />
                      Create New Item
                    </Button>
                  </Link>
                  <Link href="/items" className="block">
                    <Button className="w-full" variant="outline">
                      View My Items
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Bid History */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                My Bid History
              </CardTitle>
              <CardDescription>
                All bids you have placed on auctions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-24 bg-slate-200 animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : myBids?.bids && myBids.bids.length > 0 ? (
                <div className="space-y-3">
                  {myBids.bids.map((bid) => (
                    <div
                      key={bid.id}
                      className="p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <Link
                            href={`/auctions/${bid.auctionId}`}
                            className="font-semibold hover:text-primary"
                          >
                            {bid.auction?.item?.title || 'Untitled Item'}
                          </Link>
                          <div className="text-sm text-muted-foreground mt-1">
                            {formatDate(bid.createdAt)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg">
                            {formatCurrency(bid.amount)}
                          </div>
                          {bid.isAuto && (
                            <div className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded mt-1">
                              Auto Bid
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`px-2 py-1 rounded text-xs font-medium ${
                          (bid.auction?.status || '').toLowerCase() === 'running'
                            ? 'bg-green-100 text-green-700'
                            : (bid.auction?.status || '').toLowerCase() === 'ended'
                            ? 'bg-gray-100 text-gray-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {bid.auction?.status || 'Unknown'}
                        </div>
                        {bid.id === bid.auction?.currentBid?.id && (
                          <div className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">
                            Winning Bid
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <TrendingUp className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
                  <p className="text-muted-foreground">
                    You haven&apos;t placed any bids yet
                  </p>
                  <Link href="/auctions" className="mt-4 inline-block">
                    <Button>Browse Auctions</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
