'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useCartStore } from '@/store/cartStore'
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'
import type { CartItem } from '@/types/database'

export default function CartPage() {
    const [items, setItems] = useState<CartItem[]>([])
    const [loading, setLoading] = useState(true)
    const { setItemCount } = useCartStore()
    const router = useRouter()
    const supabase = createClient()

    const fetchCart = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.push('/login'); return }
        const { data } = await supabase
            .from('cart_items')
            .select('*, products(*, categories(*), product_images(*))')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
        setItems((data as any) || [])
        setItemCount(data?.length || 0)
        setLoading(false)
    }

    useEffect(() => { fetchCart() }, [])

    const updateQty = async (itemId: string, qty: number, stock: number) => {
        if (qty < 1 || qty > stock) return
        await supabase.from('cart_items').update({ quantity: qty }).eq('id', itemId)
        setItems(prev => prev.map(i => i.id === itemId ? { ...i, quantity: qty } : i))
    }

    const removeItem = async (itemId: string) => {
        await supabase.from('cart_items').delete().eq('id', itemId)
        setItems(prev => prev.filter(i => i.id !== itemId))
        setItemCount(items.length - 1)
        toast.success('ลบสินค้าออกแล้ว')
    }

    const total = items.reduce((sum, item) => {
        const price = (item as any).products?.price || 0
        return sum + price * item.quantity
    }, 0)

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center"><div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" /><p className="text-slate-500">กำลังโหลด...</p></div>
        </div>
    )

    return (
        <div className="min-h-screen bg-slate-50 py-8">
            <div className="container-custom">
                <h1 className="text-2xl font-bold text-slate-800 mb-6">ตะกร้าสินค้า</h1>

                {items.length === 0 ? (
                    <div className="text-center py-20">
                        <ShoppingBag className="w-20 h-20 text-slate-200 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-700 mb-2">ตะกร้าว่างเปล่า</h3>
                        <p className="text-slate-500 mb-6">เลือกสินค้าที่คุณต้องการแล้วเพิ่มลงตะกร้า</p>
                        <Link href="/shop" className="btn-primary">เลือกซื้อสินค้า</Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Items */}
                        <div className="lg:col-span-2 space-y-3">
                            {items.map(item => {
                                const product = (item as any).products
                                const img = product?.product_images?.find((i: any) => i.is_primary)?.url || product?.product_images?.[0]?.url
                                return (
                                    <div key={item.id} className="card p-4">
                                        <div className="flex gap-4">
                                            <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0 relative">
                                                {img ? (
                                                    <Image src={img} alt={product?.name} fill className="object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-2xl">🐾</div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs text-amber-600 font-medium">{product?.categories?.name}</p>
                                                <h3 className="font-semibold text-slate-800 text-sm leading-tight mb-1 truncate">{product?.name}</h3>
                                                <p className="text-amber-600 font-bold">฿{product?.price?.toLocaleString('th-TH')}</p>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <div className="flex items-center gap-1.5 bg-slate-100 rounded-lg p-0.5">
                                                    <button onClick={() => updateQty(item.id, item.quantity - 1, product?.stock)} className="w-7 h-7 rounded-md bg-white flex items-center justify-center hover:bg-amber-100 transition-colors shadow-sm"><Minus className="w-3 h-3" /></button>
                                                    <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                                                    <button onClick={() => updateQty(item.id, item.quantity + 1, product?.stock)} className="w-7 h-7 rounded-md bg-white flex items-center justify-center hover:bg-amber-100 transition-colors shadow-sm"><Plus className="w-3 h-3" /></button>
                                                </div>
                                                <p className="font-bold text-slate-800 text-sm">฿{((product?.price || 0) * item.quantity).toLocaleString('th-TH')}</p>
                                                <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Order Summary */}
                        <div>
                            <div className="card p-6 sticky top-20">
                                <h2 className="font-bold text-slate-800 text-lg mb-4">สรุปคำสั่งซื้อ</h2>
                                <div className="space-y-2 mb-4">
                                    <div className="flex justify-between text-sm text-slate-600">
                                        <span>รวมสินค้า ({items.length} รายการ)</span>
                                        <span>฿{total.toLocaleString('th-TH')}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-slate-600">
                                        <span>ค่าจัดส่ง</span>
                                        <span className="text-green-600 font-medium">ฟรี</span>
                                    </div>
                                </div>
                                <div className="border-t border-slate-100 pt-4 mb-4">
                                    <div className="flex justify-between font-bold text-slate-800">
                                        <span>ยอดรวมทั้งหมด</span>
                                        <span className="text-amber-600 text-lg">฿{total.toLocaleString('th-TH')}</span>
                                    </div>
                                </div>
                                <Link href="/checkout" className="btn-primary w-full flex items-center justify-center gap-2">
                                    ดำเนินการชำระเงิน <ArrowRight className="w-4 h-4" />
                                </Link>
                                <Link href="/shop" className="btn-ghost w-full text-center mt-2 text-sm">← เลือกสินค้าต่อ</Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
