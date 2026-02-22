'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Edit2, Trash2, Search, Upload, X, Tag, Image as ImageIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import Image from 'next/image'
import type { Product, Category } from '@/types/database'

function slugify(text: string) {
    return text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-')
}

interface ProductFormState {
    id?: string
    name: string
    slug: string
    description: string
    price: number | ''
    compare_price: number | ''
    stock: number | ''
    category_id: string
    is_featured: boolean
    is_active: boolean
}

const defaultForm: ProductFormState = { name: '', slug: '', description: '', price: '', compare_price: '', stock: '', category_id: '', is_featured: false, is_active: true }

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState<ProductFormState>(defaultForm)
    const [imageFiles, setImageFiles] = useState<File[]>([])
    const [imagePreviews, setImagePreviews] = useState<string[]>([])
    const [submitting, setSubmitting] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const supabase = createClient()

    const loadData = async () => {
        setLoading(true)
        const [{ data: p }, { data: c }] = await Promise.all([
            supabase.from('products').select('*, categories(*), product_images(*)').order('created_at', { ascending: false }).limit(50),
            supabase.from('categories').select('*').order('name'),
        ])
        setProducts((p as any) || [])
        setCategories(c || [])
        setLoading(false)
    }

    useEffect(() => { loadData() }, [])

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
    )

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []).slice(0, 5)
        setImageFiles(files)
        setImagePreviews(files.map(f => URL.createObjectURL(f)))
    }

    const openNew = () => { setForm(defaultForm); setImageFiles([]); setImagePreviews([]); setShowForm(true) }
    const openEdit = (p: Product) => {
        setForm({ id: p.id, name: p.name, slug: p.slug, description: p.description || '', price: p.price, compare_price: p.compare_price || '', stock: p.stock, category_id: p.category_id || '', is_featured: p.is_featured, is_active: p.is_active })
        setImageFiles([])
        setImagePreviews(p.product_images?.map(img => img.url) || [])
        setShowForm(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.name || !form.price || form.stock === '') { toast.error('กรอกข้อมูลให้ครบถ้วน'); return }
        setSubmitting(true)
        try {
            const productData = {
                name: form.name,
                slug: form.slug || slugify(form.name),
                description: form.description || null,
                price: Number(form.price),
                compare_price: form.compare_price ? Number(form.compare_price) : null,
                stock: Number(form.stock),
                category_id: form.category_id || null,
                is_featured: form.is_featured,
                is_active: form.is_active,
            }

            let productId = form.id
            if (form.id) {
                await supabase.from('products').update({ ...productData, updated_at: new Date().toISOString() }).eq('id', form.id)
            } else {
                const { data } = await supabase.from('products').insert(productData).select().single()
                productId = data?.id
            }

            // Upload images
            if (imageFiles.length > 0 && productId) {
                if (form.id) await supabase.from('product_images').delete().eq('product_id', productId)
                const uploads = imageFiles.map(async (file, i) => {
                    const ext = file.name.split('.').pop()
                    const path = `${productId}/${Date.now()}-${i}.${ext}`
                    const { data: up } = await supabase.storage.from('product-images').upload(path, file, { upsert: true })
                    if (up) {
                        const { data: url } = supabase.storage.from('product-images').getPublicUrl(up.path)
                        return { product_id: productId, url: url.publicUrl, is_primary: i === 0, sort_order: i }
                    }
                })
                const imgData = (await Promise.all(uploads)).filter(Boolean)
                if (imgData.length) await supabase.from('product_images').insert(imgData as any)
            }

            toast.success(form.id ? 'อัปเดตสินค้าแล้ว' : 'เพิ่มสินค้าแล้ว')
            setShowForm(false)
            loadData()
        } catch {
            toast.error('เกิดข้อผิดพลาด')
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`ลบ "${name}" ออก?`)) return
        await supabase.from('product_images').delete().eq('product_id', id)
        await supabase.from('products').delete().eq('id', id)
        toast.success('ลบสินค้าแล้ว')
        loadData()
    }

    return (
        <div className="p-6 lg:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">จัดการสินค้า</h1>
                    <p className="text-slate-500 text-sm">จัดการสินค้าทั้งหมดในร้าน</p>
                </div>
                <button onClick={openNew} className="btn-primary flex items-center gap-2">
                    <Plus className="w-4 h-4" /> เพิ่มสินค้า
                </button>
            </div>

            {/* Search */}
            <div className="relative mb-6 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" placeholder="ค้นหาสินค้า..." value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-10" />
            </div>

            {/* Table */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="table-header">สินค้า</th>
                                <th className="table-header">หมวดหมู่</th>
                                <th className="table-header">ราคา</th>
                                <th className="table-header">สต็อก</th>
                                <th className="table-header">สถานะ</th>
                                <th className="table-header">การดำเนินการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i}><td colSpan={6} className="p-4"><div className="h-4 bg-slate-200 rounded animate-pulse" /></td></tr>
                                ))
                            ) : filteredProducts.length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-12 text-slate-400">ไม่พบสินค้า</td></tr>
                            ) : (
                                filteredProducts.map(p => {
                                    const img = p.product_images?.find(i => i.is_primary)?.url || p.product_images?.[0]?.url
                                    return (
                                        <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="table-cell">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0 relative">
                                                        {img ? <Image src={img} alt={p.name} fill className="object-cover" /> : <div className="w-full h-full flex items-center justify-center text-lg">🐾</div>}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-800 text-sm line-clamp-1">{p.name}</p>
                                                        {p.is_featured && <span className="text-xs text-amber-600 font-medium">⭐ แนะนำ</span>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="table-cell"><span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">{(p.categories as any)?.name || '—'}</span></td>
                                            <td className="table-cell font-semibold text-slate-800">฿{p.price.toLocaleString('th-TH')}</td>
                                            <td className="table-cell">
                                                <span className={`text-sm font-medium ${p.stock === 0 ? 'text-red-500' : p.stock < 10 ? 'text-amber-500' : 'text-green-600'}`}>{p.stock}</span>
                                            </td>
                                            <td className="table-cell">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${p.is_active ? 'bg-green-100 text-green-700 border-green-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                                    {p.is_active ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                                                </span>
                                            </td>
                                            <td className="table-cell">
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-amber-100 transition-colors text-amber-700"><Edit2 className="w-4 h-4" /></button>
                                                    <button onClick={() => handleDelete(p.id, p.name)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-red-500"><Trash2 className="w-4 h-4" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in-up">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100">
                            <h2 className="text-lg font-bold text-slate-800">{form.id ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'}</h2>
                            <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-slate-100 transition-colors"><X className="w-5 h-5 text-slate-500" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">ชื่อสินค้า *</label>
                                    <input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: slugify(e.target.value) }))} className="input-field" placeholder="ชื่อสินค้า" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">ราคา (บาท) *</label>
                                    <input type="number" required min={0} value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value ? Number(e.target.value) : '' }))} className="input-field" placeholder="0" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">ราคาก่อนลด (บาท)</label>
                                    <input type="number" min={0} value={form.compare_price} onChange={e => setForm(f => ({ ...f, compare_price: e.target.value ? Number(e.target.value) : '' }))} className="input-field" placeholder="0" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">สต็อก *</label>
                                    <input type="number" required min={0} value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value ? Number(e.target.value) : '' }))} className="input-field" placeholder="0" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">หมวดหมู่</label>
                                    <select value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))} className="input-field">
                                        <option value="">ไม่ระบุหมวดหมู่</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">รายละเอียด</label>
                                    <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="input-field" rows={3} placeholder="รายละเอียดสินค้า" />
                                </div>
                            </div>

                            {/* Toggles */}
                            <div className="flex flex-wrap gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={form.is_featured} onChange={e => setForm(f => ({ ...f, is_featured: e.target.checked }))} className="w-4 h-4 accent-amber-600" />
                                    <span className="text-sm font-medium text-slate-700">สินค้าแนะนำ</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="w-4 h-4 accent-amber-600" />
                                    <span className="text-sm font-medium text-slate-700">เปิดใช้งาน</span>
                                </label>
                            </div>

                            {/* Image Upload */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">รูปสินค้า (สูงสุด 5 รูป)</label>
                                <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-amber-500 hover:bg-amber-100 transition-colors">
                                    <ImageIcon className="w-8 h-8 text-slate-400 mb-1" />
                                    <p className="text-sm text-slate-500">คลิกเพื่ออัปโหลดรูป</p>
                                    <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
                                </label>
                                {imagePreviews.length > 0 && (
                                    <div className="grid grid-cols-5 gap-2 mt-2">
                                        {imagePreviews.map((src, i) => (
                                            <div key={i} className="aspect-square rounded-lg overflow-hidden relative">
                                                <Image src={src} alt="" fill className="object-cover" />
                                                {i === 0 && <div className="absolute bottom-0 left-0 right-0 bg-amber-600 text-white text-xs text-center py-0.5">หลัก</div>}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">ยกเลิก</button>
                                <button type="submit" disabled={submitting} className="btn-primary flex-1">
                                    {submitting ? 'กำลังบันทึก...' : form.id ? 'บันทึกการแก้ไข' : 'เพิ่มสินค้า'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
