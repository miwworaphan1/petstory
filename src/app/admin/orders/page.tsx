'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import OrderStatusBadge from '@/components/store/OrderStatusBadge'
import { Eye, ChevronDown, Image as ImageIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import Image from 'next/image'
import type { Order, OrderStatus } from '@/types/database'

const STATUS_OPTIONS: { value: string; label: string }[] = [
    { value: '', label: 'ทุกสถานะ' },
    { value: 'pending', label: 'รอดำเนินการ' },
    { value: 'confirmed', label: 'ยืนยันแล้ว' },
    { value: 'shipped', label: 'กำลังจัดส่ง' },
    { value: 'delivered', label: 'ส่งสำเร็จ' },
    { value: 'cancelled', label: 'ยกเลิก' },
]

const NEXT_STATUS: Partial<Record<OrderStatus, { value: OrderStatus; label: string; color: string }>> = {
    pending: { value: 'confirmed', label: 'ยืนยันคำสั่งซื้อ', color: 'bg-blue-500 hover:bg-blue-600' },
    confirmed: { value: 'shipped', label: 'จัดส่งสินค้า', color: 'bg-purple-500 hover:bg-purple-600' },
    shipped: { value: 'delivered', label: 'ส่งสำเร็จ', color: 'bg-green-500 hover:bg-green-600' },
}

function AdminOrdersPageInner() {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [filterStatus, setFilterStatus] = useState('')
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
    const [updatingId, setUpdatingId] = useState<string | null>(null)
    const searchParams = useSearchParams()
    const supabase = createClient()

    useEffect(() => {
        const statusParam = searchParams.get('status') || ''
        setFilterStatus(statusParam)
    }, [searchParams])

    const loadOrders = async () => {
        setLoading(true)
        let query = supabase
            .from('orders')
            .select('*, profiles(full_name, phone), order_items(*, products(name))')
            .order('created_at', { ascending: false })

        if (filterStatus) query = query.eq('status', filterStatus)

        const { data } = await query.limit(100)
        setOrders((data as any) || [])
        setLoading(false)
    }

    useEffect(() => { loadOrders() }, [filterStatus])

    const updateStatus = async (orderId: string, newStatus: OrderStatus) => {
        setUpdatingId(orderId)
        try {
            const { error } = await supabase.from('orders').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', orderId)
            if (error) throw error
            toast.success(`อัปเดตสถานะเป็น "${STATUS_OPTIONS.find(s => s.value === newStatus)?.label}" แล้ว`)
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
            if (selectedOrder?.id === orderId) setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null)
        } catch {
            toast.error('เกิดข้อผิดพลาด')
        } finally {
            setUpdatingId(null)
        }
    }

    const cancelOrder = async (orderId: string) => {
        if (!confirm('ยืนยันการยกเลิกคำสั่งซื้อ?')) return
        await updateStatus(orderId, 'cancelled')
    }

    return (
        <div className="p-6 lg:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">จัดการคำสั่งซื้อ</h1>
                    <p className="text-slate-500 text-sm">ดูและอัปเดตสถานะคำสั่งซื้อทั้งหมด</p>
                </div>
                <div className="relative">
                    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="input-field appearance-none pr-10 cursor-pointer min-w-[160px]">
                        {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
            </div>

            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="table-header">คำสั่งซื้อ</th>
                                <th className="table-header">ลูกค้า</th>
                                <th className="table-header">วันที่</th>
                                <th className="table-header">ยอดรวม</th>
                                <th className="table-header">สถานะ</th>
                                <th className="table-header">สลิป</th>
                                <th className="table-header">การดำเนินการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                [...Array(5)].map((_, i) => <tr key={i}><td colSpan={7} className="p-4"><div className="h-4 bg-slate-200 rounded animate-pulse" /></td></tr>)
                            ) : orders.length === 0 ? (
                                <tr><td colSpan={7} className="text-center py-16 text-slate-400">ไม่พบคำสั่งซื้อ</td></tr>
                            ) : (
                                orders.map(order => {
                                    const nextStatus = NEXT_STATUS[order.status as OrderStatus]
                                    const profile = (order as any).profiles
                                    return (
                                        <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="table-cell font-mono text-xs text-slate-500">#{order.id.slice(0, 8).toUpperCase()}</td>
                                            <td className="table-cell">
                                                <p className="font-medium text-slate-800 text-sm">{profile?.full_name || '—'}</p>
                                                <p className="text-xs text-slate-400">{profile?.phone || ''}</p>
                                            </td>
                                            <td className="table-cell text-xs text-slate-500 whitespace-nowrap">{new Date(order.created_at).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' })}</td>
                                            <td className="table-cell font-bold text-slate-800">฿{order.total_amount.toLocaleString('th-TH')}</td>
                                            <td className="table-cell"><OrderStatusBadge status={order.status} /></td>
                                            <td className="table-cell">
                                                {order.payment_slip_url ? (
                                                    <a href={order.payment_slip_url} target="_blank" rel="noreferrer">
                                                        <Image src={order.payment_slip_url} alt="slip" width={36} height={36} className="rounded-lg object-cover border border-slate-200 hover:opacity-80 transition-opacity" />
                                                    </a>
                                                ) : (
                                                    <span className="text-slate-300"><ImageIcon className="w-5 h-5" /></span>
                                                )}
                                            </td>
                                            <td className="table-cell">
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    <button onClick={() => setSelectedOrder(order)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors" title="ดูรายละเอียด">
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    {nextStatus && (
                                                        <button
                                                            onClick={() => updateStatus(order.id, nextStatus.value)}
                                                            disabled={updatingId === order.id}
                                                            className={`text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors ${nextStatus.color} disabled:opacity-60`}
                                                        >
                                                            {updatingId === order.id ? '...' : nextStatus.label}
                                                        </button>
                                                    )}
                                                    {order.status !== 'cancelled' && order.status !== 'delivered' && (
                                                        <button onClick={() => cancelOrder(order.id)} className="text-red-500 hover:bg-red-50 text-xs font-medium px-2 py-1 rounded-lg transition-colors">
                                                            ยกเลิก
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Order Detail Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedOrder(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[85vh] overflow-y-auto animate-fade-in-up" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <div>
                                <h2 className="font-bold text-slate-800 text-lg">#{selectedOrder.id.slice(0, 8).toUpperCase()}</h2>
                                <OrderStatusBadge status={selectedOrder.status} />
                            </div>
                            <button onClick={() => setSelectedOrder(null)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500">✕</button>
                        </div>
                        <div className="p-6 space-y-4">
                            {/* Shipping */}
                            <div>
                                <h3 className="font-semibold text-slate-700 text-sm mb-2">ที่อยู่จัดส่ง</h3>
                                <div className="p-3 bg-slate-50 rounded-xl text-sm text-slate-600 space-y-0.5">
                                    <p className="font-semibold text-slate-800">{(selectedOrder.shipping_address as any).name}</p>
                                    <p>โทร: {(selectedOrder.shipping_address as any).phone}</p>
                                    <p>{(selectedOrder.shipping_address as any).address_line}, {(selectedOrder.shipping_address as any).district}</p>
                                    <p>{(selectedOrder.shipping_address as any).province} {(selectedOrder.shipping_address as any).postal_code}</p>
                                </div>
                            </div>

                            {/* Items */}
                            <div>
                                <h3 className="font-semibold text-slate-700 text-sm mb-2">รายการสินค้า</h3>
                                <div className="space-y-2">
                                    {(selectedOrder.order_items as any[])?.map((item: any) => (
                                        <div key={item.id} className="flex justify-between text-sm p-2 bg-slate-50 rounded-lg">
                                            <div>
                                                <span className="text-slate-700">{item.product_snapshot?.name || item.products?.name} × {item.quantity}</span>
                                                {item.product_snapshot?.size && <p className="text-xs text-blue-600">ขนาด: {item.product_snapshot.size}</p>}
                                            </div>
                                            <span className="font-semibold text-slate-800">฿{(item.unit_price * item.quantity).toLocaleString('th-TH')}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between font-bold text-slate-800 mt-3 pt-3 border-t border-slate-100">
                                    <span>ยอดรวม</span>
                                    <span className="text-amber-600">฿{selectedOrder.total_amount.toLocaleString('th-TH')}</span>
                                </div>
                            </div>

                            {/* Slip */}
                            {selectedOrder.payment_slip_url && (
                                <div>
                                    <h3 className="font-semibold text-slate-700 text-sm mb-2">สลิปการโอนเงิน</h3>
                                    <a href={selectedOrder.payment_slip_url} target="_blank" rel="noreferrer">
                                        <Image src={selectedOrder.payment_slip_url} alt="slip" width={200} height={150} className="rounded-xl border border-slate-200 hover:opacity-80 transition-opacity object-cover" />
                                    </a>
                                </div>
                            )}

                            {/* Actions */}
                            {NEXT_STATUS[selectedOrder.status] && (
                                <button
                                    onClick={() => updateStatus(selectedOrder.id, NEXT_STATUS[selectedOrder.status]!.value)}
                                    disabled={updatingId === selectedOrder.id}
                                    className={`w-full text-white font-bold py-3 rounded-xl transition-colors ${NEXT_STATUS[selectedOrder.status]?.color}`}
                                >
                                    {NEXT_STATUS[selectedOrder.status]?.label}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )
            }
        </div >
    )
}

export default function AdminOrdersPage() {
    return (
        <Suspense fallback={<div className="p-8"><div className="h-8 bg-slate-200 rounded animate-pulse" /></div>}>
            <AdminOrdersPageInner />
        </Suspense>
    )
}
