'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ShoppingCart, Menu, X, User, LogOut, LayoutDashboard, Package, Heart } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useCartStore } from '@/store/cartStore'
import type { Profile } from '@/types/database'

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false)
    const [profile, setProfile] = useState<Profile | null>(null)
    const [loading, setLoading] = useState(true)
    const [userMenuOpen, setUserMenuOpen] = useState(false)
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()
    const { itemCount, setItemCount } = useCartStore()

    useEffect(() => {
        const getSession = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
                setProfile(data)

                const { count } = await supabase
                    .from('cart_items')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id)
                setItemCount(count || 0)
            } else {
                setProfile(null)
                setItemCount(0)
            }
            setLoading(false)
        }
        getSession()

        const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
            getSession()
        })
        return () => subscription.unsubscribe()
    }, [])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        setProfile(null)
        setItemCount(0)
        setUserMenuOpen(false)
        router.push('/')
        router.refresh()
    }

    const navLinks = [
        { href: '/', label: 'หน้าแรก' },
        { href: '/shop', label: 'สินค้า' },
    ]

    const isActive = (href: string) => {
        if (href === '/') return pathname === '/'
        return pathname.startsWith(href)
    }

    return (
        <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
            <div className="container-custom">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-9 h-9 bg-gradient-primary rounded-xl flex items-center justify-center shadow-md group-hover:shadow-amber-300 transition-all">
                            <Heart className="w-5 h-5 text-white fill-white" />
                        </div>
                        <div>
                            <span className="font-bold text-lg text-slate-800">Pet Story</span>
                            <span className="text-amber-600 font-bold text-lg"> Club</span>
                        </div>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map(link => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${isActive(link.href)
                                    ? 'bg-amber-100 text-amber-700'
                                    : 'text-slate-600 hover:text-amber-600 hover:bg-amber-100'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Right Side */}
                    <div className="flex items-center gap-2">
                        {/* Cart */}
                        <Link href="/cart" className="relative p-2 rounded-xl hover:bg-amber-100 transition-colors group">
                            <ShoppingCart className="w-5 h-5 text-slate-600 group-hover:text-amber-600 transition-colors" />
                            {itemCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-600 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse-orange">
                                    {itemCount > 99 ? '99+' : itemCount}
                                </span>
                            )}
                        </Link>

                        {/* User Menu */}
                        {!loading && (
                            <>
                                {profile ? (
                                    <div className="relative">
                                        <button
                                            onClick={() => setUserMenuOpen(!userMenuOpen)}
                                            className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-amber-100 transition-colors"
                                        >
                                            <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                                                <span className="text-white text-xs font-bold">
                                                    {profile.full_name?.charAt(0)?.toUpperCase() || 'U'}
                                                </span>
                                            </div>
                                            <span className="hidden md:block text-sm font-medium text-slate-700 max-w-[100px] truncate">
                                                {profile.full_name || 'ผู้ใช้'}
                                            </span>
                                        </button>

                                        {userMenuOpen && (
                                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-lg border border-slate-100 py-2 z-50 animate-fade-in-up">
                                                <div className="px-4 py-2 border-b border-slate-100">
                                                    <p className="font-semibold text-slate-800 truncate">{profile.full_name}</p>
                                                    <p className="text-xs text-slate-500">{profile.role === 'admin' ? 'ผู้ดูแลระบบ' : 'สมาชิก'}</p>
                                                </div>
                                                {profile.role === 'admin' && (
                                                    <Link
                                                        href="/admin"
                                                        onClick={() => setUserMenuOpen(false)}
                                                        className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-amber-100 hover:text-amber-700 transition-colors"
                                                    >
                                                        <LayoutDashboard className="w-4 h-4" />
                                                        แดชบอร์ดแอดมิน
                                                    </Link>
                                                )}
                                                <Link
                                                    href="/orders"
                                                    onClick={() => setUserMenuOpen(false)}
                                                    className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-amber-100 hover:text-amber-700 transition-colors"
                                                >
                                                    <Package className="w-4 h-4" />
                                                    ประวัติการสั่งซื้อ
                                                </Link>
                                                <Link
                                                    href="/profile"
                                                    onClick={() => setUserMenuOpen(false)}
                                                    className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-amber-100 hover:text-amber-700 transition-colors"
                                                >
                                                    <User className="w-4 h-4" />
                                                    โปรไฟล์
                                                </Link>
                                                <hr className="my-1 border-slate-100" />
                                                <button
                                                    onClick={handleLogout}
                                                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                                                >
                                                    <LogOut className="w-4 h-4" />
                                                    ออกจากระบบ
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="hidden md:flex items-center gap-2">
                                        <Link href="/login" className="btn-ghost text-sm">เข้าสู่ระบบ</Link>
                                        <Link href="/register" className="btn-primary text-sm px-4 py-2">สมัครสมาชิก</Link>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Mobile menu */}
                        <button
                            className="md:hidden p-2 rounded-xl hover:bg-slate-100 transition-colors"
                            onClick={() => setIsOpen(!isOpen)}
                        >
                            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden border-t border-slate-100 bg-white animate-fade-in-up">
                    <div className="container-custom py-4 space-y-1">
                        {navLinks.map(link => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setIsOpen(false)}
                                className={`block px-4 py-3 rounded-xl font-medium transition-colors ${isActive(link.href)
                                    ? 'bg-amber-100 text-amber-700'
                                    : 'text-slate-700 hover:bg-slate-50'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                        {!profile && (
                            <div className="pt-2 flex flex-col gap-2">
                                <Link href="/login" onClick={() => setIsOpen(false)} className="btn-secondary text-center">เข้าสู่ระบบ</Link>
                                <Link href="/register" onClick={() => setIsOpen(false)} className="btn-primary text-center">สมัครสมาชิก</Link>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Backdrop */}
            {userMenuOpen && (
                <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
            )}
        </nav>
    )
}
