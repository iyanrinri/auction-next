import Link from 'next/link'
import { Hammer } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t bg-gray-50 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg mb-4 text-gray-900">
              <Hammer className="w-5 h-5 text-blue-600" />
              <span>Auction System</span>
            </Link>
            <p className="text-sm text-gray-600">
              Your trusted platform for online auctions. Buy and sell with confidence.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4 text-gray-900">Quick Links</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href="/auctions" className="hover:text-blue-600 transition-colors">
                  Browse Auctions
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-blue-600 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-blue-600 transition-colors">
                  How It Works
                </Link>
              </li>
            </ul>
          </div>

          {/* For Sellers */}
          <div>
            <h3 className="font-semibold mb-4 text-gray-900">For Sellers</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href="/register" className="hover:text-blue-600 transition-colors">
                  Become a Seller
                </Link>
              </li>
              <li>
                <Link href="/items/create" className="hover:text-blue-600 transition-colors">
                  List an Item
                </Link>
              </li>
              <li>
                <Link href="/seller-guide" className="hover:text-blue-600 transition-colors">
                  Seller Guide
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4 text-gray-900">Support</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href="/help" className="hover:text-blue-600 transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-blue-600 transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-blue-600 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-blue-600 transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-6 text-center text-sm text-gray-600">
          <p>&copy; {currentYear} Auction System. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
