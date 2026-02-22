'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Heart, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

export default function RegisterPage() {
    const [fullName, setFullName] = useState('')
    const [phone, setPhone] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPass, setShowPass] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        if (password.length < 6) {
            toast.error('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร')
            return
        }
        setLoading(true)
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: fullName, phone } },
        })

        if (error) {
            toast.error(error.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก')
            setLoading(false)
            return
        }

        if (data.user) {
            await supabase.from('profiles').upsert({
                id: data.user.id,
                full_name: fullName,
                phone,
                role: 'user',
            })
        }

        toast.success('สมัครสมาชิกสำเร็จ! ยินดีต้อนรับ 🎉')
        router.push('/')
        router.refresh()
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-100 via-white to-amber-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <Heart className="w-8 h-8 text-white fill-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800">สมัครสมาชิก</h1>
                    <p className="text-slate-500 mt-1">เข้าร่วม Pet Story Club วันนี้!</p>
                </div>

                <div className="card p-8 shadow-xl">
                    <form onSubmit={handleRegister} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">ชื่อ-นามสกุล</label>
                            <input
                                type="text"
                                required
                                value={fullName}
                                onChange={e => setFullName(e.target.value)}
                                placeholder="กรอกชื่อของคุณ"
                                className="input-field"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">เบอร์โทรศัพท์</label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                                placeholder="08X-XXX-XXXX"
                                className="input-field"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">อีเมล</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="your@email.com"
                                className="input-field"
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
                                    placeholder="อย่างน้อย 6 ตัวอักษร"
                                    className="input-field pr-12"
                                    minLength={6}
                                />
                                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                    {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="pt-1">
                            <p className="text-xs text-slate-500">
                                การสมัครสมาชิกถือว่าคุณยอมรับ{' '}
                                <Link href="#" className="text-amber-600 hover:underline">เงื่อนไขการใช้งาน</Link>
                            </p>
                        </div>

                        <button type="submit" disabled={loading} className="btn-primary w-full">
                            {loading ? 'กำลังสมัคร...' : 'สมัครสมาชิกฟรี'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-slate-500 text-sm">
                            มีบัญชีอยู่แล้ว?{' '}
                            <Link href="/login" className="text-amber-600 font-semibold hover:underline">
                                เข้าสู่ระบบ
                            </Link>
                        </p>
                    </div>
                </div>

                <div className="text-center mt-6">
                    <Link href="/" className="text-sm text-slate-500 hover:text-amber-600 transition-colors">← กลับหน้าแรก</Link>
                </div>
            </div>
        </div>
    )
}
