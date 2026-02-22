'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Heart, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

function LoginForm() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPass, setShowPass] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const searchParams = useSearchParams()
    const supabase = createClient()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) {
            toast.error('อีเมลหรือรหัสผ่านไม่ถูกต้อง')
            setLoading(false)
            return
        }
        toast.success('เข้าสู่ระบบสำเร็จ!')
        const redirectTo = searchParams.get('redirectTo') || '/'
        router.push(redirectTo)
        router.refresh()
    }

    return (
        <div className="card p-8 shadow-xl">
            <form onSubmit={handleLogin} className="space-y-5">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">อีเมล</label>
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="input-field"
                        autoComplete="email"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">รหัสผ่าน</label>
                    <div className="relative">
                        <input
                            type={showPass ? 'text' : 'password'}
                            required
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="รหัสผ่านของคุณ"
                            className="input-field pr-12"
                            autoComplete="current-password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPass(!showPass)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                            {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full">
                    {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
                </button>
            </form>

            <div className="mt-6 text-center">
                <p className="text-slate-500 text-sm">
                    ยังไม่มีบัญชี?{' '}
                    <Link href="/register" className="text-amber-600 font-semibold hover:underline">
                        สมัครสมาชิกฟรี
                    </Link>
                </p>
            </div>
        </div>
    )
}

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-100 via-white to-amber-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <Heart className="w-8 h-8 text-white fill-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800">ยินดีต้อนรับกลับ</h1>
                    <p className="text-slate-500 mt-1">เข้าสู่ระบบเพื่อช้อปสินค้าสัตว์เลี้ยง</p>
                </div>

                <Suspense fallback={<div className="card p-8"><div className="h-40 bg-slate-100 rounded-xl animate-pulse" /></div>}>
                    <LoginForm />
                </Suspense>

                <div className="text-center mt-6">
                    <Link href="/" className="text-sm text-slate-500 hover:text-amber-600 transition-colors">
                        ← กลับหน้าแรก
                    </Link>
                </div>
            </div>
        </div>
    )
}
