'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Edit2, Trash2, X, Upload, ImageIcon } from 'lucide-react'
import Image from 'next/image'
import toast from 'react-hot-toast'
import type { Category } from '@/types/database'

function slugify(text: string) {
    return text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-')
}

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState({ id: '', name: '', slug: '', description: '', image_url: '' })
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [submitting, setSubmitting] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const supabase = createClient()

    const load = async () => {
        setLoading(true)
        const { data } = await supabase.from('categories').select('*').order('name')
        setCategories(data || [])
        setLoading(false)
    }

    useEffect(() => { load() }, [])

    const openNew = () => {
        setForm({ id: '', name: '', slug: '', description: '', image_url: '' })
        setImageFile(null)
        setImagePreview(null)
        setShowForm(true)
    }

    const openEdit = (c: Category) => {
        setForm({ id: c.id, name: c.name, slug: c.slug, description: c.description || '', image_url: c.image_url || '' })
        setImageFile(null)
        setImagePreview(c.image_url || null)
        setShowForm(true)
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        if (file.size > 5 * 1024 * 1024) {
            toast.error('ไฟล์ต้องไม่เกิน 5MB')
            return
        }
        setImageFile(file)
        setImagePreview(URL.createObjectURL(file))
    }

    const removeImage = () => {
        setImageFile(null)
        setImagePreview(null)
        setForm(f => ({ ...f, image_url: '' }))
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const uploadImage = async (categoryId: string): Promise<string | null> => {
        if (!imageFile) return form.image_url || null

        const ext = imageFile.name.split('.').pop()
        const path = `categories/${categoryId}.${ext}`

        // ลบรูปเก่า (ถ้ามี)
        await supabase.storage.from('product-images').remove([`categories/${categoryId}`])

        const { error } = await supabase.storage
            .from('product-images')
            .upload(path, imageFile, { upsert: true })

        if (error) {
            console.error('Upload error:', error)
            toast.error('อัปโหลดรูปไม่สำเร็จ')
            return null
        }

        const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(path)
        return urlData.publicUrl
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.name) return
        setSubmitting(true)
        try {
            const slug = form.slug || slugify(form.name)
            if (form.id) {
                // อัปโหลดรูป
                const imageUrl = await uploadImage(form.id)
                const payload = {
                    name: form.name,
                    slug,
                    description: form.description || null,
                    image_url: imageUrl,
                }
                await supabase.from('categories').update(payload).eq('id', form.id)
                toast.success('อัปเดตหมวดหมู่แล้ว')
            } else {
                // สร้างหมวดหมู่ก่อนเพื่อรับ id
                const { data: newCat, error } = await supabase
                    .from('categories')
                    .insert({ name: form.name, slug, description: form.description || null })
                    .select()
                    .single()
                if (error || !newCat) { toast.error('เกิดข้อผิดพลาด'); return }

                // อัปโหลดรูป
                if (imageFile) {
                    const imageUrl = await uploadImage(newCat.id)
                    if (imageUrl) {
                        await supabase.from('categories').update({ image_url: imageUrl }).eq('id', newCat.id)
                    }
                }
                toast.success('เพิ่มหมวดหมู่แล้ว')
            }
            setShowForm(false)
            load()
        } catch {
            toast.error('เกิดข้อผิดพลาด')
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`ลบหมวดหมู่ "${name}"? สินค้าในหมวดนี้จะไม่มีหมวดหมู่`)) return
        await supabase.from('products').update({ category_id: null }).eq('category_id', id)
        await supabase.storage.from('product-images').remove([`categories/${id}`])
        await supabase.from('categories').delete().eq('id', id)
        toast.success('ลบหมวดหมู่แล้ว')
        load()
    }

    return (
        <div className="p-6 lg:p-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">จัดการหมวดหมู่</h1>
                    <p className="text-slate-500 text-sm">จัดการหมวดหมู่สินค้าทั้งหมด</p>
                </div>
                <button onClick={openNew} className="btn-primary flex items-center gap-2">
                    <Plus className="w-4 h-4" /> เพิ่มหมวดหมู่
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? (
                    [...Array(6)].map((_, i) => <div key={i} className="card p-5 animate-pulse"><div className="h-32 bg-slate-200 rounded-xl mb-3" /><div className="h-4 bg-slate-200 rounded w-3/4 mb-2" /><div className="h-3 bg-slate-100 rounded w-1/2" /></div>)
                ) : categories.length === 0 ? (
                    <div className="col-span-3 text-center py-16">
                        <div className="text-5xl mb-3">🏷️</div>
                        <p className="text-slate-500 mb-4">ยังไม่มีหมวดหมู่</p>
                        <button onClick={openNew} className="btn-primary">เพิ่มหมวดหมู่แรก</button>
                    </div>
                ) : (
                    categories.map(cat => (
                        <div key={cat.id} className="card overflow-hidden group hover:shadow-md transition-all">
                            {/* Category Image */}
                            <div className="relative h-36 bg-gradient-to-br from-amber-100 to-amber-50">
                                {cat.image_url ? (
                                    <Image
                                        src={cat.image_url}
                                        alt={cat.name}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <div className="text-5xl">🐾</div>
                                    </div>
                                )}
                                {/* Actions overlay */}
                                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => openEdit(cat)} className="p-1.5 rounded-lg bg-white/90 hover:bg-white shadow-sm text-amber-700 transition-colors"><Edit2 className="w-4 h-4" /></button>
                                    <button onClick={() => handleDelete(cat.id, cat.name)} className="p-1.5 rounded-lg bg-white/90 hover:bg-white shadow-sm text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </div>
                            <div className="p-4">
                                <h3 className="font-bold text-slate-800 mb-1">{cat.name}</h3>
                                <p className="text-xs text-slate-500 font-mono bg-slate-50 px-2 py-0.5 rounded inline-block mb-2">/{cat.slug}</p>
                                {cat.description && <p className="text-sm text-slate-500 line-clamp-2">{cat.description}</p>}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-in-up max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100">
                            <h2 className="font-bold text-slate-800 text-lg">{form.id ? 'แก้ไขหมวดหมู่' : 'เพิ่มหมวดหมู่ใหม่'}</h2>
                            <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-slate-100 transition-colors"><X className="w-4 h-4 text-slate-500" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {/* Image Upload */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">รูปภาพหมวดหมู่</label>
                                {imagePreview ? (
                                    <div className="relative rounded-xl overflow-hidden h-40 bg-slate-50">
                                        <Image
                                            src={imagePreview}
                                            alt="Preview"
                                            fill
                                            className="object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={removeImage}
                                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-md"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full h-32 border-2 border-dashed border-slate-200 rounded-xl hover:border-amber-400 hover:bg-amber-100/50 transition-all flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-amber-600"
                                    >
                                        <Upload className="w-6 h-6" />
                                        <span className="text-sm font-medium">คลิกเพื่ออัปโหลดรูปภาพ</span>
                                        <span className="text-xs text-slate-400">JPG, PNG, WEBP (สูงสุด 5MB)</span>
                                    </button>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">ชื่อหมวดหมู่ *</label>
                                <input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: slugify(e.target.value) }))} className="input-field" placeholder="เช่น อาหารสัตว์เลี้ยง" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Slug (URL)</label>
                                <input type="text" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} className="input-field font-mono text-sm" placeholder="อัตโนมัติจากชื่อ" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">คำอธิบาย</label>
                                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="input-field" rows={3} placeholder="คำอธิบายหมวดหมู่" />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">ยกเลิก</button>
                                <button type="submit" disabled={submitting} className="btn-primary flex-1">
                                    {submitting ? 'กำลังบันทึก...' : form.id ? 'บันทึก' : 'เพิ่ม'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
