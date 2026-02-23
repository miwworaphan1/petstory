'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Upload, X, Image as ImageIcon, Save, Palette, Info, CreditCard, Type } from 'lucide-react'
import toast from 'react-hot-toast'
import Image from 'next/image'

interface SiteSettings {
    hero_bg_url: string | null
    hero_bg_opacity: number
    logo_url: string | null
    payment_bank_name: string | null
    payment_account_number: string | null
    payment_account_name: string | null
    promptpay_id: string | null
    hero_badge_text: string | null
    hero_title_line1: string | null
    hero_title_line2: string | null
    hero_description: string | null
    hero_cta_text: string | null
}

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState<SiteSettings>({ hero_bg_url: null, hero_bg_opacity: 0.3, logo_url: null, payment_bank_name: null, payment_account_number: null, payment_account_name: null, promptpay_id: null, hero_badge_text: null, hero_title_line1: null, hero_title_line2: null, hero_description: null, hero_cta_text: null })
    const [paymentForm, setPaymentForm] = useState({ bank_name: '', account_number: '', account_name: '', promptpay_id: '' })
    const [initialPayment, setInitialPayment] = useState({ bank_name: '', account_number: '', account_name: '', promptpay_id: '' })
    const [heroText, setHeroText] = useState({ badge: '', title1: '', title2: '', desc: '', cta: '' })
    const [initialHeroText, setInitialHeroText] = useState({ badge: '', title1: '', title2: '', desc: '', cta: '' })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const supabase = createClient()

    const heroBgRef = useRef<HTMLInputElement>(null)
    const logoRef = useRef<HTMLInputElement>(null)


    const [heroBgPreview, setHeroBgPreview] = useState<string | null>(null)
    const [logoPreview, setLogoPreview] = useState<string | null>(null)


    const [heroBgFile, setHeroBgFile] = useState<File | null>(null)
    const [logoFile, setLogoFile] = useState<File | null>(null)


    const [opacity, setOpacity] = useState(0.3)
    const [initialOpacity, setInitialOpacity] = useState(0.3)

    useEffect(() => {
        loadSettings()
    }, [])

    const loadSettings = async () => {
        setLoading(true)
        const { data } = await supabase.from('site_settings').select('*').eq('id', 'main').single()
        if (data) {
            setSettings(data)
            setHeroBgPreview(data.hero_bg_url)
            setLogoPreview(data.logo_url)

            const op = data.hero_bg_opacity ?? 0.3
            setOpacity(op)
            setInitialOpacity(op)

            const pf = {
                bank_name: data.payment_bank_name || '',
                account_number: data.payment_account_number || '',
                account_name: data.payment_account_name || '',
                promptpay_id: data.promptpay_id || '',
            }
            setPaymentForm(pf)
            setInitialPayment(pf)

            const ht = {
                badge: data.hero_badge_text || '',
                title1: data.hero_title_line1 || '',
                title2: data.hero_title_line2 || '',
                desc: data.hero_description || '',
                cta: data.hero_cta_text || '',
            }
            setHeroText(ht)
            setInitialHeroText(ht)
        }
        setLoading(false)
    }

    const handleFileChange = (
        file: File | undefined,
        setFile: (f: File | null) => void,
        setPreview: (s: string | null) => void
    ) => {
        if (!file) return
        if (file.size > 5 * 1024 * 1024) {
            toast.error('ไฟล์ต้องไม่เกิน 5MB')
            return
        }
        setFile(file)
        setPreview(URL.createObjectURL(file))
    }

    const uploadFile = async (file: File, path: string): Promise<string | null> => {
        // Remove old file first
        await supabase.storage.from('site-assets').remove([path])

        const { error } = await supabase.storage
            .from('site-assets')
            .upload(path, file, { upsert: true })

        if (error) {
            console.error('Upload error:', error)
            return null
        }

        const { data: urlData } = supabase.storage.from('site-assets').getPublicUrl(path)
        return urlData.publicUrl
    }

    const paymentChanged = paymentForm.bank_name !== initialPayment.bank_name || paymentForm.account_number !== initialPayment.account_number || paymentForm.account_name !== initialPayment.account_name || paymentForm.promptpay_id !== initialPayment.promptpay_id
    const heroTextChanged = heroText.badge !== initialHeroText.badge || heroText.title1 !== initialHeroText.title1 || heroText.title2 !== initialHeroText.title2 || heroText.desc !== initialHeroText.desc || heroText.cta !== initialHeroText.cta
    const hasChanges = heroBgFile || logoFile || opacity !== initialOpacity || paymentChanged || heroTextChanged

    const handleSave = async () => {
        setSaving(true)
        try {
            const updates: Record<string, unknown> = {
                updated_at: new Date().toISOString(),
                hero_bg_opacity: opacity,
            }

            if (heroBgFile) {
                const ext = heroBgFile.name.split('.').pop()
                const url = await uploadFile(heroBgFile, `hero-bg.${ext}`)
                if (url) updates.hero_bg_url = url
            }

            if (logoFile) {
                const ext = logoFile.name.split('.').pop()
                const url = await uploadFile(logoFile, `logo.${ext}`)
                if (url) updates.logo_url = url
            }
            if (paymentChanged) {
                updates.payment_bank_name = paymentForm.bank_name || null
                updates.payment_account_number = paymentForm.account_number || null
                updates.payment_account_name = paymentForm.account_name || null
                updates.promptpay_id = paymentForm.promptpay_id || null
            }
            if (heroTextChanged) {
                updates.hero_badge_text = heroText.badge || null
                updates.hero_title_line1 = heroText.title1 || null
                updates.hero_title_line2 = heroText.title2 || null
                updates.hero_description = heroText.desc || null
                updates.hero_cta_text = heroText.cta || null
            }

            const { error } = await supabase
                .from('site_settings')
                .update(updates)
                .eq('id', 'main')

            if (error) throw error

            toast.success('บันทึกการตั้งค่าแล้ว')
            setHeroBgFile(null)
            setLogoFile(null)

            loadSettings()
        } catch (err) {
            console.error(err)
            toast.error('เกิดข้อผิดพลาด')
        } finally {
            setSaving(false)
        }
    }

    const clearImage = async (field: 'hero_bg_url' | 'logo_url') => {
        const { error } = await supabase
            .from('site_settings')
            .update({ [field]: null, updated_at: new Date().toISOString() })
            .eq('id', 'main')

        if (!error) {
            setSettings(s => ({ ...s, [field]: null }))
            if (field === 'hero_bg_url') { setHeroBgPreview(null); setHeroBgFile(null) }
            if (field === 'logo_url') { setLogoPreview(null); setLogoFile(null) }

            toast.success('ลบรูปแล้ว')
        }
    }

    if (loading) {
        return (
            <div className="p-6 lg:p-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-slate-200 rounded w-48" />
                    <div className="h-4 bg-slate-200 rounded w-64" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[1, 2].map(i => <div key={i} className="h-64 bg-slate-200 rounded-xl" />)}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 lg:p-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Palette className="w-6 h-6 text-amber-600" />
                        ตั้งค่าหน้าแรก
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">จัดการรูปภาพบน Hero Section ของหน้าแรก</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving || !hasChanges}
                    className="btn-primary flex items-center gap-2 disabled:opacity-50"
                >
                    <Save className="w-4 h-4" />
                    {saving ? 'กำลังบันทึก...' : 'บันทึก'}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Hero Background */}
                <div className="card p-5">
                    <h3 className="font-bold text-slate-800 mb-1">รูปพื้นหลัง Hero</h3>
                    <p className="text-xs text-slate-400 mb-4">แนะนำ 1920×600px</p>
                    <div
                        className="aspect-video relative rounded-xl overflow-hidden border-2 border-dashed border-slate-200 bg-slate-50 cursor-pointer hover:border-amber-400 transition-colors group"
                        onClick={() => heroBgRef.current?.click()}
                    >
                        {heroBgPreview ? (
                            <>
                                <Image src={heroBgPreview} alt="Hero BG" fill className="object-cover" />
                                <div className="absolute inset-0 bg-black" style={{ opacity }} />
                                <button
                                    onClick={(e) => { e.stopPropagation(); clearImage('hero_bg_url') }}
                                    className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                <Upload className="w-8 h-8 mb-2" />
                                <p className="text-sm">คลิกเพื่ออัปโหลด</p>
                            </div>
                        )}
                    </div>
                    <input ref={heroBgRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e.target.files?.[0], setHeroBgFile, setHeroBgPreview)} />

                    {/* Opacity Slider */}
                    <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium text-slate-700">ความทึบ (Overlay)</label>
                            <span className="text-sm font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg">
                                {Math.round(opacity * 100)}%
                            </span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={Math.round(opacity * 100)}
                            onChange={(e) => setOpacity(Number(e.target.value) / 100)}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                        />
                        <div className="flex justify-between text-xs text-slate-400 mt-1">
                            <span>สว่าง (0%)</span>
                            <span>มืด (100%)</span>
                        </div>
                    </div>
                </div>

                {/* Logo */}
                <div className="card p-5">
                    <h3 className="font-bold text-slate-800 mb-1">โลโก้</h3>
                    <p className="text-xs text-slate-400 mb-3">แนะนำ 200×200px, PNG</p>
                    <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
                        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-700">
                            โลโก้นี้จะถูกใช้เป็น <strong>Logo บน Navbar</strong> และ <strong>Favicon</strong> ของเว็บไซต์โดยอัตโนมัติ
                        </p>
                    </div>
                    <div
                        className="aspect-square relative rounded-xl overflow-hidden border-2 border-dashed border-slate-200 bg-slate-50 cursor-pointer hover:border-amber-400 transition-colors group max-w-[200px] mx-auto"
                        onClick={() => logoRef.current?.click()}
                    >
                        {logoPreview ? (
                            <>
                                <Image src={logoPreview} alt="Logo" fill className="object-contain p-4" />
                                <button
                                    onClick={(e) => { e.stopPropagation(); clearImage('logo_url') }}
                                    className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                <ImageIcon className="w-8 h-8 mb-2" />
                                <p className="text-sm">คลิกเพื่ออัปโหลด</p>
                            </div>
                        )}
                    </div>
                    <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e.target.files?.[0], setLogoFile, setLogoPreview)} />
                </div>


            </div>

            {/* Payment Settings */}
            <div className="card p-5 mt-6">
                <h3 className="font-bold text-slate-800 mb-1 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-amber-600" />
                    ตั้งค่าการชำระเงิน
                </h3>
                <p className="text-xs text-slate-400 mb-4">ข้อมูลจะแสดงในหน้าชำระเงินของลูกค้า</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">ชื่อธนาคาร</label>
                        <input type="text" value={paymentForm.bank_name} onChange={e => setPaymentForm(f => ({ ...f, bank_name: e.target.value }))} className="input-field" placeholder="เช่น กสิกรไทย (KBANK)" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">เลขบัญชี</label>
                        <input type="text" value={paymentForm.account_number} onChange={e => setPaymentForm(f => ({ ...f, account_number: e.target.value }))} className="input-field" placeholder="XXX-X-XXXXX-X" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">ชื่อบัญชี</label>
                        <input type="text" value={paymentForm.account_name} onChange={e => setPaymentForm(f => ({ ...f, account_name: e.target.value }))} className="input-field" placeholder="เช่น Pet Story Club" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">เลข PromptPay (เบอร์โทร/บัตรปชช.)</label>
                        <input type="text" value={paymentForm.promptpay_id} onChange={e => setPaymentForm(f => ({ ...f, promptpay_id: e.target.value }))} className="input-field" placeholder="08XXXXXXXX หรือ เลขบัตร 13 หลัก" />
                    </div>
                </div>
            </div>

            {/* Hero Text Settings */}
            <div className="card p-5 mt-6">
                <h3 className="font-bold text-slate-800 mb-1 flex items-center gap-2">
                    <Type className="w-5 h-5 text-amber-600" />
                    ข้อความ Hero Section
                </h3>
                <p className="text-xs text-slate-400 mb-4">ข้อความที่แสดงบนหน้าแรก</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">ข้อความ Badge (แถบเล็กด้านบน)</label>
                        <input type="text" value={heroText.badge} onChange={e => setHeroText(f => ({ ...f, badge: e.target.value }))} className="input-field" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">หัวข้อหลัก บรรทัดที่ 1</label>
                        <input type="text" value={heroText.title1} onChange={e => setHeroText(f => ({ ...f, title1: e.target.value }))} className="input-field" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">หัวข้อหลัก บรรทัดที่ 2</label>
                        <input type="text" value={heroText.title2} onChange={e => setHeroText(f => ({ ...f, title2: e.target.value }))} className="input-field" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">คำอธิบาย</label>
                        <input type="text" value={heroText.desc} onChange={e => setHeroText(f => ({ ...f, desc: e.target.value }))} className="input-field" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">ข้อความปุ่ม CTA</label>
                        <input type="text" value={heroText.cta} onChange={e => setHeroText(f => ({ ...f, cta: e.target.value }))} className="input-field" />
                    </div>
                </div>
            </div>

            {/* Preview */}
            <div className="card p-5 mt-6">
                <h3 className="font-bold text-slate-800 mb-4">ตัวอย่างหน้าแรก</h3>
                <div
                    className="relative rounded-xl overflow-hidden h-48"
                    style={{
                        background: heroBgPreview
                            ? `url(${heroBgPreview}) center/cover no-repeat`
                            : 'linear-gradient(to bottom right, #D97706, #F59E0B, #FBBF24)'
                    }}
                >
                    <div className="absolute inset-0 bg-black" style={{ opacity: heroBgPreview ? opacity : 0 }} />
                    <div className="relative flex items-center justify-between h-full px-8">
                        <div className="text-white">
                            <h2 className="text-2xl font-bold">{heroText.title1 || 'ทุกความสุข'}</h2>
                            <p className="text-white/80 text-sm">{heroText.title2 || 'สำหรับน้อง'}</p>
                        </div>
                        <div className="flex items-center gap-4">
                            {logoPreview && (
                                <div className="w-20 h-20 relative">
                                    <Image src={logoPreview} alt="Logo Preview" fill className="object-contain" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
