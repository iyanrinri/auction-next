'use client'

import { useQuery } from '@tanstack/react-query'
import { auctionsApi } from '@/services/auctions.service'
import { AuctionCard } from '@/components/auction/auction-card'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles, Shield, Zap } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  const { data, isLoading } = useQuery({
    queryKey: ['auctions', { status: 'RUNNING', limit: 6 }],
    queryFn: () => auctionsApi.getAll({ status: 'RUNNING', limit: 6 }),
  })

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
              Welcome to Auction System
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-50">
              Buy and sell unique items through secure online auctions
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/auctions">
                <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 font-semibold shadow-lg">
                  Browse Auctions
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/register">
                <Button size="lg" className="bg-transparent text-white border-2 border-white hover:bg-white hover:text-blue-700 font-semibold">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Why Choose Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center border border-gray-200">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Real-time Bidding</h3>
              <p className="text-gray-600">
                Experience live auctions with instant updates and notifications
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center border border-gray-200">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Secure Transactions</h3>
              <p className="text-gray-600">
                Your safety is our priority with encrypted and secure payments
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center border border-gray-200">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Easy to Use</h3>
              <p className="text-gray-600">
                Simple and intuitive interface for buyers and sellers
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Auctions Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Live Auctions</h2>
            <Link href="/auctions">
              <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                View All
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-96 bg-gray-200 animate-pulse rounded-lg" />
              ))}
            </div>
          ) : data?.auctions && data.auctions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.auctions.map((auction) => (
                <AuctionCard key={auction.id} auction={auction} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-600">
              <p>No live auctions at the moment. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            Ready to Start Bidding?
          </h2>
          <p className="text-xl mb-8 text-blue-50">
            Join thousands of users buying and selling on our platform
          </p>
          <Link href="/register">
            <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 font-semibold shadow-lg">
              Create Free Account
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
