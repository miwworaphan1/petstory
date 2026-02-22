'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
    LayoutDashboard, Package, Tag, ShoppingBag, Users,
    LogOut, Menu, X, Heart, ChevronRight
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

const sidebarLinks = [
    { href: '/admin', label: 'แดชบอร์ด', icon: LayoutDashboard, exact: true },
    { href: '/admin/products', label: 'จัดการสินค้า', icon: Package },
    { href: '/admin/categories', label: 'หมวดหมู่สินค้า', icon: Tag },
    { href: '/admin/orders', label: 'จัดการคำสั่งซื้อ', icon: ShoppingBag },
    { href: '/admin/users', label: 'ผู้ใช้งาน', icon: Users },
]

export default function AdminSidebar() {
    const [collapsed, setCollapsed] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()

    const isActive = (href: string, exact?: boolean) =>
        exact ? pathname === href : pathname.startsWith(href)

    const handleLogout = async () => {
        await supabase.auth.signOut()
        toast.success('ออกจากระบบสำเร็จ')
        router.push('/login')
    }

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="p-4 border-b border-slate-700">
                <Link href="/" className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gradient-primary rounded-xl flex items-center justify-center shrink-0">
                        <Heart className="w-5 h-5 text-white fill-white" />
                    </div>
                    {!collapsed && (
                        <div>
                            <p className="font-bold text-white text-sm leading-tight">Pet Story Club</p>
                            <p className="text-xs text-slate-400">Admin Dashboard</p>
                        </div>
                    )}
                </Link>
            </div>

            {/* Nav */}
            <nav className="flex-1 p-3 space-y-1">
                {sidebarLinks.map(link => {
                    const Icon = link.icon
                    const active = isActive(link.href, link.exact)
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setMobileOpen(false)}
                            className={`admin-sidebar-link ${active ? 'active' : ''} ${collapsed ? 'justify-center px-3' : ''}`}
                            title={collapsed ? link.label : undefined}
                        >
                            <Icon className="w-5 h-5 shrink-0" />
                            {!collapsed && <span className="text-sm">{link.label}</span>}
                            {!collapsed && active && <ChevronRight className="w-4 h-4 ml-auto" />}
                        </Link>
                    )
                })}
            </nav>

            {/* Bottom */}
            <div className="p-3 border-t border-slate-700 space-y-2">
                <Link
                    href="/"
                    className="admin-sidebar-link text-slate-400"
                    title={collapsed ? 'ดูหน้าเว็บ' : undefined}
                >
                    <Heart className="w-5 h-5 shrink-0" />
                    {!collapsed && <span className="text-sm">ดูหน้าเว็บ</span>}
                </Link>
                <button
                    onClick={handleLogout}
                    className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors font-medium ${collapsed ? 'justify-center px-3' : ''}`}
                    title={collapsed ? 'ออกจากระบบ' : undefined}
                >
                    <LogOut className="w-5 h-5 shrink-0" />
                    {!collapsed && <span className="text-sm">ออกจากระบบ</span>}
                </button>
            </div>
        </div>
    )

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className={`hidden lg:flex flex-col bg-slate-900 transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'} min-h-screen relative`}>
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="absolute -right-3 top-6 w-6 h-6 bg-amber-600 rounded-full flex items-center justify-center shadow-md hover:bg-amber-700 transition-colors z-10"
                >
                    <ChevronRight className={`w-3 h-3 text-white transition-transform ${collapsed ? '' : 'rotate-180'}`} />
                </button>
                <SidebarContent />
            </aside>

            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-slate-900 border-b border-slate-700">
                <div className="flex items-center justify-between px-4 h-14">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                            <Heart className="w-4 h-4 text-white fill-white" />
                        </div>
                        <span className="font-bold text-white text-sm">Pet Story Admin</span>
                    </Link>
                    <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-white">
                        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Sidebar */}
            {mobileOpen && (
                <>
                    <div className="lg:hidden fixed inset-0 z-30 bg-black/50" onClick={() => setMobileOpen(false)} />
                    <div className="lg:hidden fixed top-14 left-0 bottom-0 w-64 bg-slate-900 z-40 animate-slide-in-right">
                        <SidebarContent />
                    </div>
                </>
            )}
        </>
    )
}
