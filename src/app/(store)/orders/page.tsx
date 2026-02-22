'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import OrderStatusBadge from '@/components/store/OrderStatusBadge'
import { Package, ChevronRight } from 'lucide-react'
import type { Order } from '@/types/database'

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const fetchOrders = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { router.push('/login'); return }
            const { data } = await supabase
                .from('orders')
                .select('*, order_items(*, products(name, product_images(*)))')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
            setOrders((data as any) || [])
            setLoading(false)
        }
        fetchOrders()
    }, [])

    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" /></div>

    return (
        <div className="min-h-screen bg-slate-50 py-8">
            <div className="container-custom">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-slate-800">ประวัติการสั่งซื้อ</h1>
                    <Link href="/shop" className="btn-primary text-sm px-4 py-2">ช้อปต่อ</Link>
                </div>

                {orders.length === 0 ? (
                    <div className="text-center py-20">
                        <Package className="w-20 h-20 text-slate-200 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-700 mb-2">ยังไม่มีคำสั่งซื้อ</h3>
                        <p className="text-slate-500 mb-6">เริ่มช้อปสินค้าสำหรับน้องขนฟูของคุณ</p>
                        <Link href="/shop" className="btn-primary">เลือกซื้อสินค้า</Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map(order => (
                            <Link key={order.id} href={`/orders/${order.id}`} className="block">
                                <div className="card p-5 hover:shadow-md transition-all hover:-translate-y-0.5">
                                    <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                                        <div>
                                            <p className="text-xs text-slate-500 font-mono mb-1">#{order.id.slice(0, 8).toUpperCase()}</p>
                                            <p className="text-sm text-slate-500">{new Date(order.created_at).toLocaleDateString('th-TH', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <OrderStatusBadge status={order.status} />
                                            <ChevronRight className="w-4 h-4 text-slate-400" />
                                        </div>
                                    </div>

                                    {/* Order Items preview */}
                                    <div className="flex items-center gap-2 mb-3">
                                        {(order.order_items as any[])?.slice(0, 3).map((item: any) => (
                                            <div key={item.id} className="w-10 h-10 bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center text-lg shrink-0">
                                                🐾
                                            </div>
                                        ))}
                                        {(order.order_items as any[])?.length > 3 && (
                                            <div className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center text-xs font-bold text-slate-600">
                                                +{(order.order_items as any[]).length - 3}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <p className="text-sm text-slate-500">{(order.order_items as any[])?.length || 0} รายการ</p>
                                        <p className="font-bold text-amber-600 text-lg">฿{order.total_amount.toLocaleString('th-TH')}</p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
