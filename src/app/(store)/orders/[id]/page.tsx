'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import OrderStatusBadge from '@/components/store/OrderStatusBadge'
import { ChevronLeft, MapPin, CreditCard, Package, CheckCircle2, Truck, Home, Clock, XCircle } from 'lucide-react'
import type { Order } from '@/types/database'

const STATUS_STEPS = [
    { key: 'pending', label: 'รอดำเนินการ', icon: Clock, desc: 'คำสั่งซื้อของคุณกำลังรอการยืนยัน' },
    { key: 'confirmed', label: 'ยืนยันแล้ว', icon: CheckCircle2, desc: 'ร้านค้ายืนยันคำสั่งซื้อของคุณแล้ว' },
    { key: 'shipped', label: 'กำลังจัดส่ง', icon: Truck, desc: 'สินค้าอยู่ระหว่างการจัดส่ง' },
    { key: 'delivered', label: 'ส่งสำเร็จ', icon: Home, desc: 'ได้รับสินค้าเรียบร้อยแล้ว' },
]

const STATUS_ORDER = ['pending', 'confirmed', 'shipped', 'delivered']

export default function OrderDetailPage() {
    const [order, setOrder] = useState<Order | null>(null)
    const [loading, setLoading] = useState(true)
    const params = useParams()
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const fetchOrder = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { router.push('/login'); return }
            const { data } = await supabase
                .from('orders')
                .select('*, order_items(*, products(name, product_images(*)))')
                .eq('id', params.id as string)
                .eq('user_id', user.id)
                .single()
            setOrder(data as any)
            setLoading(false)
        }
        fetchOrder()
    }, [params.id])

    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>
    if (!order) return <div className="min-h-screen flex items-center justify-center"><p className="text-slate-500">ไม่พบคำสั่งซื้อ</p></div>

    const currentStepIdx = STATUS_ORDER.indexOf(order.status)
    const isCancelled = order.status === 'cancelled'

    return (
        <div className="min-h-screen bg-slate-50 py-8">
            <div className="container-custom max-w-4xl">
                {/* Back */}
                <Link href="/orders" className="flex items-center gap-2 text-slate-500 hover:text-orange-500 mb-6 transition-colors text-sm">
                    <ChevronLeft className="w-4 h-4" />
                    กลับประวัติการสั่งซื้อ
                </Link>

                {/* Header */}
                <div className="card p-6 mb-4">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <h1 className="text-xl font-bold text-slate-800">คำสั่งซื้อ #{order.id.slice(0, 8).toUpperCase()}</h1>
                            <p className="text-slate-500 text-sm mt-1">
                                {new Date(order.created_at).toLocaleDateString('th-TH', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                        <OrderStatusBadge status={order.status} />
                    </div>
                </div>

                {/* Status Timeline */}
                {!isCancelled ? (
                    <div className="card p-6 mb-4">
                        <h2 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <Package className="w-5 h-5 text-orange-500" />
                            สถานะการสั่งซื้อ
                        </h2>
                        <div className="relative">
                            <div className="absolute top-5 left-5 right-5 h-0.5 bg-slate-200">
                                <div
                                    className="h-full bg-orange-500 transition-all duration-500"
                                    style={{ width: `${currentStepIdx >= 0 ? (currentStepIdx / (STATUS_STEPS.length - 1)) * 100 : 0}%` }}
                                />
                            </div>
                            <div className="grid grid-cols-4 gap-1 relative">
                                {STATUS_STEPS.map((step, idx) => {
                                    const Icon = step.icon
                                    const passed = idx <= currentStepIdx
                                    return (
                                        <div key={step.key} className="flex flex-col items-center text-center">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 mb-2 transition-all ${passed ? 'bg-orange-500 text-white shadow-md shadow-orange-200' : 'bg-slate-200 text-slate-400'}`}>
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <p className={`text-xs font-semibold ${passed ? 'text-orange-600' : 'text-slate-400'}`}>{step.label}</p>
                                            {idx === currentStepIdx && <p className="text-xs text-slate-500 mt-0.5 hidden sm:block">{step.desc}</p>}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="card p-5 mb-4 border-red-200 bg-red-50">
                        <div className="flex items-center gap-3">
                            <XCircle className="w-8 h-8 text-red-500" />
                            <div>
                                <p className="font-bold text-red-700">คำสั่งซื้อถูกยกเลิก</p>
                                <p className="text-red-600 text-sm">คำสั่งซื้อนี้ถูกยกเลิกแล้ว</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* Shipping Address */}
                    <div className="card p-5">
                        <h2 className="font-bold text-slate-800 mb-3 flex items-center gap-2 text-sm">
                            <MapPin className="w-4 h-4 text-orange-500" />
                            ที่อยู่จัดส่ง
                        </h2>
                        <div className="text-sm text-slate-600 space-y-0.5">
                            <p className="font-semibold text-slate-800">{(order.shipping_address as any).name}</p>
                            <p>โทร: {(order.shipping_address as any).phone}</p>
                            <p>{(order.shipping_address as any).address_line}</p>
                            <p>{(order.shipping_address as any).district} {(order.shipping_address as any).province} {(order.shipping_address as any).postal_code}</p>
                        </div>
                    </div>

                    {/* Payment */}
                    <div className="card p-5">
                        <h2 className="font-bold text-slate-800 mb-3 flex items-center gap-2 text-sm">
                            <CreditCard className="w-4 h-4 text-orange-500" />
                            การชำระเงิน
                        </h2>
                        <p className="text-sm text-slate-600 mb-2">วิธีชำระ: <span className="font-medium text-slate-800">{order.payment_method === 'bank_transfer' ? 'โอนธนาคาร' : 'PromptPay'}</span></p>
                        {order.payment_slip_url && (
                            <a href={order.payment_slip_url} target="_blank" rel="noreferrer">
                                <Image src={order.payment_slip_url} alt="payment slip" width={120} height={80} className="rounded-lg border border-slate-200 hover:opacity-80 transition-opacity object-cover" />
                            </a>
                        )}
                        {order.notes && <p className="text-sm text-slate-500 mt-2">หมายเหตุ: {order.notes}</p>}
                    </div>
                </div>

                {/* Order Items */}
                <div className="card p-5">
                    <h2 className="font-bold text-slate-800 mb-4 text-sm">รายการสินค้า</h2>
                    <div className="divide-y divide-slate-100">
                        {(order.order_items as any[])?.map((item: any) => (
                            <div key={item.id} className="py-3 flex items-center gap-4">
                                <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center text-2xl shrink-0">🐾</div>
                                <div className="flex-1">
                                    <p className="font-medium text-slate-800 text-sm">{item.product_snapshot?.name || item.products?.name}</p>
                                    {item.product_snapshot?.size && <p className="text-xs text-blue-600 font-medium">ขนาด: {item.product_snapshot.size}</p>}
                                    <p className="text-xs text-slate-500">x{item.quantity} × ฿{item.unit_price.toLocaleString('th-TH')}</p>
                                </div>
                                <p className="font-bold text-slate-800">฿{(item.quantity * item.unit_price).toLocaleString('th-TH')}</p>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-slate-100 mt-3 pt-4">
                        <div className="flex justify-between text-sm text-slate-500 mb-1">
                            <span>ค่าจัดส่ง</span><span className="text-green-600 font-medium">ฟรี</span>
                        </div>
                        <div className="flex justify-between font-bold text-slate-800 text-lg">
                            <span>ยอดรวม</span>
                            <span className="text-orange-500">฿{order.total_amount.toLocaleString('th-TH')}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
