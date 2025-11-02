'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { Button } from '@/components/ui/button'
import { Hammer, Home, Package, User, LogOut, Plus } from 'lucide-react'

export function Navbar() {
  const pathname = usePathname()
  const { user, isAuthenticated, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    window.location.href = '/login'
  }

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/auctions', label: 'Auctions', icon: Hammer },
    ...(user?.role === 'SELLER' || user?.role === 'ADMIN'
      ? [{ href: '/items', label: 'My Items', icon: Package }]
      : []),
  ]

  return (
    <nav className="border-b bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-gray-900">
            <Hammer className="w-6 h-6 text-blue-600" />
            <span>Auction System</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-6">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                    isActive 
                      ? 'text-blue-600 font-semibold' 
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              )
            })}
          </div>

          {/* Auth Section */}
          <div className="flex items-center gap-3">
            {isAuthenticated && user ? (
              <>
                {(user.role === 'SELLER' || user.role === 'ADMIN') && (
                  <Link href="/items/create">
                    <Button size="sm" variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Item
                    </Button>
                  </Link>
                )}
                <Link href="/profile">
                  <Button size="sm" variant="ghost" className="text-gray-700 hover:bg-gray-100">
                    <User className="w-4 h-4 mr-2" />
                    {user.name}
                  </Button>
                </Link>
                <Button size="sm" variant="ghost" onClick={handleLogout} className="text-gray-700 hover:bg-gray-100">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button size="sm" variant="ghost" className="text-gray-700 hover:bg-gray-100">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="bg-blue-600 text-white hover:bg-blue-700">Register</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
