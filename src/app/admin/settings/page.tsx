'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Upload, X, Image as ImageIcon, Save, Palette } from 'lucide-react'
import toast from 'react-hot-toast'
import Image from 'next/image'

interface SiteSettings {
    hero_bg_url: string | null
    logo_url: string | null
    hero_image_url: string | null
}

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState<SiteSettings>({ hero_bg_url: null, logo_url: null, hero_image_url: null })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const supabase = createClient()

    const heroBgRef = useRef<HTMLInputElement>(null)
    const logoRef = useRef<HTMLInputElement>(null)
    const heroImgRef = useRef<HTMLInputElement>(null)

    const [heroBgPreview, setHeroBgPreview] = useState<string | null>(null)
    const [logoPreview, setLogoPreview] = useState<string | null>(null)
    const [heroImgPreview, setHeroImgPreview] = useState<string | null>(null)

    const [heroBgFile, setHeroBgFile] = useState<File | null>(null)
    const [logoFile, setLogoFile] = useState<File | null>(null)
    const [heroImgFile, setHeroImgFile] = useState<File | null>(null)

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
            setHeroImgPreview(data.hero_image_url)
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

    const handleSave = async () => {
        setSaving(true)
        try {
            const updates: Partial<SiteSettings> & { updated_at: string } = {
                updated_at: new Date().toISOString()
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

            if (heroImgFile) {
                const ext = heroImgFile.name.split('.').pop()
                const url = await uploadFile(heroImgFile, `hero-image.${ext}`)
                if (url) updates.hero_image_url = url
            }

            const { error } = await supabase
                .from('site_settings')
                .update(updates)
                .eq('id', 'main')

            if (error) throw error

            toast.success('บันทึกการตั้งค่าแล้ว')
            setHeroBgFile(null)
            setLogoFile(null)
            setHeroImgFile(null)
            loadSettings()
        } catch (err) {
            console.error(err)
            toast.error('เกิดข้อผิดพลาด')
        } finally {
            setSaving(false)
        }
    }

    const clearImage = async (field: 'hero_bg_url' | 'logo_url' | 'hero_image_url') => {
        const { error } = await supabase
            .from('site_settings')
            .update({ [field]: null, updated_at: new Date().toISOString() })
            .eq('id', 'main')

        if (!error) {
            setSettings(s => ({ ...s, [field]: null }))
            if (field === 'hero_bg_url') { setHeroBgPreview(null); setHeroBgFile(null) }
            if (field === 'logo_url') { setLogoPreview(null); setLogoFile(null) }
            if (field === 'hero_image_url') { setHeroImgPreview(null); setHeroImgFile(null) }
            toast.success('ลบรูปแล้ว')
        }
    }

    if (loading) {
        return (
            <div className="p-6 lg:p-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-slate-200 rounded w-48" />
                    <div className="h-4 bg-slate-200 rounded w-64" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => <div key={i} className="h-64 bg-slate-200 rounded-xl" />)}
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
                    disabled={saving || (!heroBgFile && !logoFile && !heroImgFile)}
                    className="btn-primary flex items-center gap-2 disabled:opacity-50"
                >
                    <Save className="w-4 h-4" />
                    {saving ? 'กำลังบันทึก...' : 'บันทึก'}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                                <button
                                    onClick={(e) => { e.stopPropagation(); clearImage('hero_bg_url') }}
                                    className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
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
                </div>

                {/* Logo */}
                <div className="card p-5">
                    <h3 className="font-bold text-slate-800 mb-1">โลโก้</h3>
                    <p className="text-xs text-slate-400 mb-4">แนะนำ 200×200px, PNG</p>
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

                {/* Hero Image (the pet illustration) */}
                <div className="card p-5">
                    <h3 className="font-bold text-slate-800 mb-1">รูปประกอบ Hero</h3>
                    <p className="text-xs text-slate-400 mb-4">รูปสัตว์เลี้ยง, แนะนำ PNG ไม่มีพื้นหลัง</p>
                    <div
                        className="aspect-square relative rounded-xl overflow-hidden border-2 border-dashed border-slate-200 bg-slate-50 cursor-pointer hover:border-amber-400 transition-colors group max-w-[250px] mx-auto"
                        onClick={() => heroImgRef.current?.click()}
                    >
                        {heroImgPreview ? (
                            <>
                                <Image src={heroImgPreview} alt="Hero Image" fill className="object-contain p-2" />
                                <button
                                    onClick={(e) => { e.stopPropagation(); clearImage('hero_image_url') }}
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
                    <input ref={heroImgRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e.target.files?.[0], setHeroImgFile, setHeroImgPreview)} />
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
                    <div className="absolute inset-0 bg-black/20" />
                    <div className="relative flex items-center justify-between h-full px-8">
                        <div className="text-white">
                            <h2 className="text-2xl font-bold">ทุกความสุข</h2>
                            <p className="text-white/80 text-sm">สำหรับน้อง</p>
                        </div>
                        <div className="flex items-center gap-4">
                            {logoPreview && (
                                <div className="w-20 h-20 relative">
                                    <Image src={logoPreview} alt="Logo Preview" fill className="object-contain" />
                                </div>
                            )}
                            {heroImgPreview && (
                                <div className="w-32 h-32 relative">
                                    <Image src={heroImgPreview} alt="Hero Preview" fill className="object-contain" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
