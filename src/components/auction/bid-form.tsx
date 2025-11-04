'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatCurrency } from '@/lib/utils'
import { TrendingUp, AlertCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { bidsApi } from '@/services/bids.service'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const bidSchema = z.object({
  amount: z.number().min(0, 'Bid amount must be positive'),
})

interface BidFormProps {
  auctionId: string
  currentPrice: number
  minIncrement: number
  buyNowPrice?: number
  onSuccess?: () => void
}

export function BidForm({ 
  auctionId, 
  currentPrice, 
  minIncrement, 
  buyNowPrice,
  onSuccess 
}: BidFormProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [isAuto, setIsAuto] = useState(false)
  const [isUpdatingForm, setIsUpdatingForm] = useState(false)
  const [lastBidPrice, setLastBidPrice] = useState(0)
  
  const minBidAmount = currentPrice + minIncrement

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    resolver: zodResolver(bidSchema),
    defaultValues: {
      amount: minBidAmount,
    },
  })

  // Update form value when currentPrice changes (after new bid)
  useEffect(() => {
    // Always update form when currentPrice changes
    setValue('amount', minBidAmount)
    
    // If we're in updating state and price changed, enable button
    if (isUpdatingForm && currentPrice !== lastBidPrice && lastBidPrice > 0) {
      console.log('Price updated, enabling button', { currentPrice, lastBidPrice })
      setIsUpdatingForm(false)
    }
    
    setLastBidPrice(currentPrice)
  }, [currentPrice, minBidAmount, setValue, isUpdatingForm, lastBidPrice])

  const placeBidMutation = useMutation({
    mutationFn: (data: { amount: number }) => 
      bidsApi.create({ auctionId, amount: data.amount, isAuto }),
    onSuccess: (newBid, variables) => {
      toast({
        title: 'Bid placed successfully!',
        description: 'Your bid has been recorded.',
      })
      // Set updating state to disable button until price updates
      setIsUpdatingForm(true)
      
      // Optimistic update - update bid list manually with pagination structure
      queryClient.setQueryData(['bids', auctionId, 1, 20], (oldData: any) => {
        if (!oldData) {
          return {
            bids: [newBid],
            total: 1,
            page: 1,
            limit: 20,
            totalPages: 1
          }
        }
        
        // Check if bid already exists (prevent duplicate from WebSocket)
        const bidExists = oldData.bids?.some((bid: any) => bid.id === newBid.id)
        if (bidExists) {
          console.log('Bid already exists in cache (from WebSocket), skipping')
          return oldData
        }
        
        // Add new bid to the top of the list and increment total
        return {
          ...oldData,
          bids: [newBid, ...(oldData.bids || [])],
          total: oldData.total + 1
        }
      })
      
      // Safety timeout: Enable button after 2 seconds if WebSocket doesn't update
      setTimeout(() => {
        console.log('Timeout: Forcing button enable')
        setIsUpdatingForm(false)
      }, 2000)
      
      // WebSocket will update the currentPrice automatically
      // No need to refetch auction data
      onSuccess?.()
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to place bid',
        description: error.response?.data?.message || 'Something went wrong',
        variant: 'destructive',
      })
    },
  })

  const onSubmit = (data: { amount: number }) => {
    if (data.amount < minBidAmount) {
      toast({
        title: 'Invalid bid amount',
        description: `Minimum bid is ${formatCurrency(minBidAmount)}`,
        variant: 'destructive',
      })
      return
    }

    placeBidMutation.mutate(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="bg-blue-50 p-4 rounded-lg space-y-2 border border-blue-100">
        <div className="flex justify-between text-sm">
          <span className="text-gray-700 font-medium">Current Price:</span>
          <span className="font-semibold text-gray-900">{formatCurrency(currentPrice)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-700 font-medium">Minimum Bid:</span>
          <span className="font-semibold text-green-700">{formatCurrency(minBidAmount)}</span>
        </div>
        {buyNowPrice && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-700 font-medium">Buy Now Price:</span>
            <span className="font-semibold text-blue-700">{formatCurrency(buyNowPrice)}</span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount" className="text-gray-900 font-medium">Your Bid Amount</Label>
        <div className="relative">
          <Input
            id="amount"
            type="number"
            step="1"
            {...register('amount', { valueAsNumber: true })}
            placeholder={`Min: ${formatCurrency(minBidAmount)}`}
            className="pr-24 border-gray-300 text-gray-900"
          />
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="absolute right-1 top-1 h-8 text-gray-700 hover:bg-gray-100"
            onClick={() => setValue('amount', minBidAmount)}
          >
            Min Bid
          </Button>
        </div>
        {errors.amount && (
          <div className="flex items-center gap-2 text-sm text-red-600 font-medium">
            <AlertCircle className="w-4 h-4" />
            <span>{errors.amount.message}</span>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          type="submit"
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
          disabled={placeBidMutation.isPending || isUpdatingForm}
          onClick={() => setIsAuto(false)}
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          {placeBidMutation.isPending 
            ? 'Placing Bid...' 
            : isUpdatingForm 
            ? 'Updating...' 
            : 'Place Bid'}
        </Button>
        
        {buyNowPrice && (
          <Button
            type="button"
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold"
            disabled={placeBidMutation.isPending || isUpdatingForm}
            onClick={() => {
              setValue('amount', buyNowPrice)
              handleSubmit(onSubmit)()
            }}
          >
            Buy Now
          </Button>
        )}
      </div>

      <p className="text-xs text-gray-600 text-center">
        By placing a bid, you agree to purchase this item if you win.
      </p>
    </form>
  )
}
