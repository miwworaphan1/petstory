'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShoppingCart, Minus, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useCartStore } from '@/store/cartStore'
import toast from 'react-hot-toast'
import type { Product } from '@/types/database'

interface AddToCartButtonProps {
    product: Product
    sizeOptions?: string[]
}

export default function AddToCartButton({ product, sizeOptions = [] }: AddToCartButtonProps) {
    const [qty, setQty] = useState(1)
    const [loading, setLoading] = useState(false)
    const [selectedSize, setSelectedSize] = useState<string | null>(null)
    const { incrementCount } = useCartStore()
    const supabase = createClient()
    const router = useRouter()

    const hasSizes = sizeOptions.length > 0
    const needsSize = hasSizes && !selectedSize

    const handleAdd = async () => {
        if (needsSize) {
            toast.error('กรุณาเลือกขนาดก่อน')
            return
        }
        setLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                toast.error('กรุณาเข้าสู่ระบบก่อน')
                router.push('/login')
                return
            }

            // Query for existing cart item with same product AND size
            let query = supabase
                .from('cart_items')
                .select('*')
                .eq('user_id', user.id)
                .eq('product_id', product.id)

            if (hasSizes && selectedSize) {
                query = query.eq('selected_size', selectedSize)
            }

            const { data: existing } = await query.maybeSingle()

            if (existing) {
                const { error: updateError } = await supabase.from('cart_items').update({ quantity: existing.quantity + qty }).eq('id', existing.id)
                if (updateError) { toast.error('ไม่สามารถอัปเดตตะกร้าได้: ' + updateError.message); return }
            } else {
                const insertData: any = {
                    user_id: user.id,
                    product_id: product.id,
                    quantity: qty,
                }
                if (hasSizes) {
                    insertData.selected_size = selectedSize
                }
                const { error: insertError } = await supabase.from('cart_items').insert(insertData)
                if (insertError) { toast.error('ไม่สามารถเพิ่มสินค้าได้: ' + insertError.message); return }
                incrementCount()
            }
            toast.success('เพิ่มสินค้าลงตะกร้าแล้ว')
        } catch {
            toast.error('เกิดข้อผิดพลาด')
        } finally {
            setLoading(false)
        }
    }

    if (product.stock === 0) {
        return (
            <div className="w-full py-3 bg-slate-200 text-slate-500 font-semibold rounded-xl text-center">
                หมดสต็อก
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* Size Selection */}
            {hasSizes && (
                <div>
                    <p className="text-sm font-medium text-slate-700 mb-2">
                        ขนาด: {selectedSize ? <span className="text-amber-600 font-bold">{selectedSize}</span> : <span className="text-red-500">กรุณาเลือก</span>}
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {sizeOptions.map(size => (
                            <button
                                key={size}
                                type="button"
                                onClick={() => setSelectedSize(selectedSize === size ? null : size)}
                                className={`px-3 py-1.5 rounded-lg border-2 text-sm font-medium transition-all ${selectedSize === size
                                    ? 'border-amber-500 bg-amber-50 text-amber-700 shadow-sm'
                                    : 'border-slate-200 text-slate-600 hover:border-amber-300 hover:bg-amber-50/50'
                                    }`}
                            >
                                {size}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Quantity */}
            <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-slate-700">จำนวน:</span>
                <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1">
                    <button
                        onClick={() => setQty(Math.max(1, qty - 1))}
                        className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center hover:bg-amber-100 transition-colors"
                    >
                        <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center font-bold text-slate-800">{qty}</span>
                    <button
                        onClick={() => setQty(Math.min(product.stock, qty + 1))}
                        className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center hover:bg-amber-100 transition-colors"
                    >
                        <Plus className="w-3 h-3" />
                    </button>
                </div>
            </div>

            {/* Add to Cart Button */}
            <button
                onClick={handleAdd}
                disabled={loading || needsSize}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all ${needsSize
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'btn-primary'
                    }`}
            >
                <ShoppingCart className="w-5 h-5" />
                {loading ? 'กำลังเพิ่ม...' : needsSize ? 'กรุณาเลือกขนาด' : 'เพิ่มลงตะกร้า'}
            </button>
        </div>
    )
}
