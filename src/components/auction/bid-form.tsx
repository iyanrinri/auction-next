'use client'

import { useState } from 'react'
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

  const placeBidMutation = useMutation({
    mutationFn: (data: { amount: number }) => 
      bidsApi.create({ auctionId, amount: data.amount, isAuto }),
    onSuccess: () => {
      toast({
        title: 'Bid placed successfully!',
        description: 'Your bid has been recorded.',
      })
      queryClient.invalidateQueries({ queryKey: ['auction', auctionId] })
      queryClient.invalidateQueries({ queryKey: ['auctions'] })
      reset()
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
          disabled={placeBidMutation.isPending}
          onClick={() => setIsAuto(false)}
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          {placeBidMutation.isPending ? 'Placing Bid...' : 'Place Bid'}
        </Button>
        
        {buyNowPrice && (
          <Button
            type="button"
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold"
            disabled={placeBidMutation.isPending}
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
