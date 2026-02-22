'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { User, Phone, Save } from 'lucide-react'

export default function ProfilePage() {
    const [form, setForm] = useState({ full_name: '', phone: '' })
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const load = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { router.push('/login'); return }
            setEmail(user.email || '')
            const { data } = await supabase.from('profiles').select('full_name, phone').eq('id', user.id).single()
            if (data) setForm({ full_name: data.full_name || '', phone: data.phone || '' })
            setLoading(false)
        }
        load()
    }, [])

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            await supabase.from('profiles').update({ full_name: form.full_name, phone: form.phone, updated_at: new Date().toISOString() }).eq('id', user!.id)
            toast.success('บันทึกข้อมูลเรียบร้อย')
        } catch {
            toast.error('เกิดข้อผิดพลาด')
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" /></div>

    return (
        <div className="min-h-screen bg-slate-50 py-8">
            <div className="container-custom max-w-xl">
                <h1 className="text-2xl font-bold text-slate-800 mb-6">โปรไฟล์ของฉัน</h1>

                <div className="card p-6">
                    {/* Avatar */}
                    <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                        <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-400 rounded-2xl flex items-center justify-center">
                            <User className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <p className="font-bold text-slate-800 text-lg">{form.full_name || 'ผู้ใช้งาน'}</p>
                            <p className="text-slate-500 text-sm">{email}</p>
                        </div>
                    </div>

                    <form onSubmit={handleSave} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">ชื่อ-นามสกุล</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input type="text" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} className="input-field pl-10" placeholder="ชื่อของคุณ" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">เบอร์โทรศัพท์</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="input-field pl-10" placeholder="08X-XXX-XXXX" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">อีเมล</label>
                            <input type="email" value={email} disabled className="input-field opacity-60 cursor-not-allowed" />
                            <p className="text-xs text-slate-400 mt-1">ไม่สามารถเปลี่ยนอีเมลได้</p>
                        </div>

                        <button type="submit" disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2">
                            <Save className="w-4 h-4" />
                            {saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
