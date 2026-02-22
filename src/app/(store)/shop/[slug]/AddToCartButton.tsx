'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShoppingCart, Minus, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useCartStore } from '@/store/cartStore'
import toast from 'react-hot-toast'
import type { Product } from '@/types/database'

export default function AddToCartButton({ product }: { product: Product }) {
    const [qty, setQty] = useState(1)
    const [loading, setLoading] = useState(false)
    const { incrementCount } = useCartStore()
    const supabase = createClient()
    const router = useRouter()

    const handleAdd = async () => {
        setLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                toast.error('กรุณาเข้าสู่ระบบก่อน')
                router.push('/login')
                return
            }
            const { data: existing } = await supabase
                .from('cart_items')
                .select('*')
                .eq('user_id', user.id)
                .eq('product_id', product.id)
                .single()

            if (existing) {
                await supabase.from('cart_items').update({ quantity: existing.quantity + qty }).eq('id', existing.id)
            } else {
                await supabase.from('cart_items').insert({ user_id: user.id, product_id: product.id, quantity: qty })
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
        <div className="space-y-3">
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
            <button
                onClick={handleAdd}
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2"
            >
                <ShoppingCart className="w-5 h-5" />
                {loading ? 'กำลังเพิ่ม...' : 'เพิ่มลงตะกร้า'}
            </button>
        </div>
    )
}
