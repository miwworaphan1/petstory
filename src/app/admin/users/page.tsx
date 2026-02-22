'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Users, ShoppingBag } from 'lucide-react'

export default function AdminUsersPage() {
    const [users, setUsers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        const load = async () => {
            setLoading(true)
            const { data } = await supabase
                .from('profiles')
                .select('*, orders(count)')
                .eq('role', 'user')
                .order('created_at', { ascending: false })
            setUsers(data || [])
            setLoading(false)
        }
        load()
    }, [])

    return (
        <div className="p-6 lg:p-8">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800">ผู้ใช้งาน</h1>
                <p className="text-slate-500 text-sm">สมาชิกทั้งหมดในระบบ</p>
            </div>

            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="table-header">ผู้ใช้งาน</th>
                                <th className="table-header">เบอร์โทร</th>
                                <th className="table-header">คำสั่งซื้อ</th>
                                <th className="table-header">สมัครเมื่อ</th>
                                <th className="table-header">สิทธิ์</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                [...Array(5)].map((_, i) => <tr key={i}><td colSpan={5} className="p-4"><div className="h-4 bg-slate-200 rounded animate-pulse" /></td></tr>)
                            ) : users.length === 0 ? (
                                <tr><td colSpan={5} className="text-center py-16 text-slate-400">ยังไม่มีผู้ใช้งาน</td></tr>
                            ) : (
                                users.map(u => (
                                    <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="table-cell">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 bg-gradient-to-br from-amber-500 to-amber-400 rounded-full flex items-center justify-center">
                                                    <span className="text-white font-bold text-sm">{u.full_name?.charAt(0)?.toUpperCase() || 'U'}</span>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-800 text-sm">{u.full_name || 'ไม่ระบุ'}</p>
                                                    <p className="text-xs text-slate-400 font-mono">{u.id.slice(0, 12)}...</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="table-cell text-slate-600">{u.phone || '—'}</td>
                                        <td className="table-cell">
                                            <div className="flex items-center gap-1 text-slate-600">
                                                <ShoppingBag className="w-3.5 h-3.5 text-amber-500" />
                                                <span className="text-sm font-medium">{u.orders?.[0]?.count || 0} รายการ</span>
                                            </div>
                                        </td>
                                        <td className="table-cell text-sm text-slate-500 whitespace-nowrap">{new Date(u.created_at).toLocaleDateString('th-TH')}</td>
                                        <td className="table-cell">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${u.role === 'admin' ? 'bg-amber-200 text-amber-800 border-amber-300' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                                                {u.role === 'admin' ? '👑 แอดมิน' : '👤 สมาชิก'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
