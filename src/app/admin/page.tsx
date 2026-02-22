import { createClient } from '@/lib/supabase/server'
import { ShoppingBag, Package, Users, TrendingUp, ArrowUp, Clock } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Admin Dashboard' }

function formatCurrency(n: number) {
    return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 0 }).format(n)
}

export default async function AdminDashboard() {
    const supabase = await createClient()

    const [
        { count: totalOrders },
        { data: revenueOrders },
        { count: totalProducts },
        { count: totalUsers },
        { data: recentOrders },
        { count: pendingOrders },
    ] = await Promise.all([
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('total_amount').in('status', ['confirmed', 'shipped', 'delivered']),
        supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'user'),
        supabase.from('orders').select('*, profiles(full_name), order_items(count)').order('created_at', { ascending: false }).limit(5),
        supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    ])

    const totalRevenue = revenueOrders?.reduce((sum, o) => sum + o.total_amount, 0) || 0

    const stats = [
        { label: 'ยอดขายทั้งหมด', value: formatCurrency(totalRevenue), icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50', badge: 'เฉพาะยืนยันแล้ว' },
        { label: 'คำสั่งซื้อทั้งหมด', value: totalOrders || 0, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50', badge: `${pendingOrders || 0} รอดำเนินการ` },
        { label: 'สินค้าที่ขาย', value: totalProducts || 0, icon: Package, color: 'text-amber-700', bg: 'bg-amber-100', badge: 'สินค้าที่เปิดใช้งาน' },
        { label: 'ผู้ใช้งาน', value: totalUsers || 0, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50', badge: 'สมาชิกทั้งหมด' },
    ]

    const STATUS_MAP: Record<string, { label: string; className: string }> = {
        pending: { label: 'รอดำเนินการ', className: 'badge-pending' },
        confirmed: { label: 'ยืนยันแล้ว', className: 'badge-confirmed' },
        shipped: { label: 'กำลังจัดส่ง', className: 'badge-shipped' },
        delivered: { label: 'ส่งสำเร็จ', className: 'badge-delivered' },
        cancelled: { label: 'ยกเลิก', className: 'badge-cancelled' },
    }

    return (
        <div className="p-6 lg:p-8">
            <div className="mb-8">
                <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">แดชบอร์ด</h1>
                <p className="text-slate-500 mt-1">ภาพรวมของร้านค้า Pet Story Club</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
                {stats.map(s => (
                    <div key={s.label} className="stat-card">
                        <div className="flex items-start justify-between mb-4">
                            <div className={`w-12 h-12 ${s.bg} rounded-xl flex items-center justify-center`}>
                                <s.icon className={`w-6 h-6 ${s.color}`} />
                            </div>
                            <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">{s.badge}</span>
                        </div>
                        <p className="text-2xl font-bold text-slate-800 mb-1">{s.value}</p>
                        <p className="text-sm text-slate-500">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Pending Alert */}
            {(pendingOrders || 0) > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-amber-600" />
                        <p className="font-semibold text-amber-800">มีคำสั่งซื้อ {pendingOrders} รายการ รอการยืนยัน</p>
                    </div>
                    <Link href="/admin/orders?status=pending" className="btn-primary text-sm px-4 py-2">ดูทั้งหมด</Link>
                </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Recent Orders */}
                <div className="card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-bold text-slate-800">คำสั่งซื้อล่าสุด</h2>
                        <Link href="/admin/orders" className="text-amber-600 text-sm font-medium hover:underline flex items-center gap-1">
                            ดูทั้งหมด <ArrowUp className="w-3 h-3 rotate-45" />
                        </Link>
                    </div>
                    {!recentOrders?.length ? (
                        <p className="text-slate-400 text-center py-8">ยังไม่มีคำสั่งซื้อ</p>
                    ) : (
                        <div className="space-y-3">
                            {recentOrders.map(order => {
                                const status = STATUS_MAP[order.status] || { label: order.status, className: 'badge-pending' }
                                return (
                                    <Link key={order.id} href={`/admin/orders`} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors">
                                        <div>
                                            <p className="font-mono text-xs text-slate-400">#{order.id.slice(0, 8).toUpperCase()}</p>
                                            <p className="font-medium text-slate-800 text-sm">{(order.profiles as any)?.full_name || 'ไม่ระบุ'}</p>
                                            <p className="text-xs text-slate-400">{new Date(order.created_at).toLocaleDateString('th-TH')}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-slate-800 text-sm">฿{order.total_amount.toLocaleString('th-TH')}</p>
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${status.className}`}>{status.label}</span>
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="card p-6">
                    <h2 className="font-bold text-slate-800 mb-4">การดำเนินการด่วน</h2>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { href: '/admin/products/new', label: 'เพิ่มสินค้าใหม่', icon: '➕', color: 'bg-amber-100 hover:bg-amber-200 border-amber-200' },
                            { href: '/admin/orders?status=pending', label: 'คำสั่งซื้อรอยืนยัน', icon: '⏳', color: 'bg-amber-50 hover:bg-amber-100 border-amber-100' },
                            { href: '/admin/categories', label: 'จัดการหมวดหมู่', icon: '🏷️', color: 'bg-blue-50 hover:bg-blue-100 border-blue-100' },
                            { href: '/admin/users', label: 'รายชื่อผู้ใช้', icon: '👥', color: 'bg-purple-50 hover:bg-purple-100 border-purple-100' },
                        ].map(a => (
                            <Link key={a.href} href={a.href} className={`p-4 rounded-xl border ${a.color} transition-colors`}>
                                <div className="text-2xl mb-2">{a.icon}</div>
                                <p className="font-medium text-slate-700 text-sm">{a.label}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
