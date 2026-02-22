'use client'

import { Suspense, useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import ProductCard from '@/components/store/ProductCard'
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import type { Product, Category } from '@/types/database'

const SORT_OPTIONS = [
    { value: 'newest', label: 'ล่าสุด' },
    { value: 'price_asc', label: 'ราคา: ต่ำ→สูง' },
    { value: 'price_desc', label: 'ราคา: สูง→ต่ำ' },
    { value: 'name', label: 'ชื่อสินค้า' },
]

function ShopPageInner() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const supabase = createClient()

    const [products, setProducts] = useState<Product[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState(searchParams.get('q') || '')
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('c') || '')
    const [sortBy, setSortBy] = useState('newest')
    const [showFilters, setShowFilters] = useState(false)
    const [priceMax, setPriceMax] = useState<number | ''>('')

    useEffect(() => {
        supabase.from('categories').select('*').order('name').then(({ data }) => {
            if (data) setCategories(data)
        })
    }, [])

    const fetchProducts = useCallback(async () => {
        setLoading(true)
        let query = supabase
            .from('products')
            .select('*, categories(*), product_images(*)')
            .eq('is_active', true)

        if (search) query = query.ilike('name', `%${search}%`)
        if (selectedCategory) query = query.eq('categories.slug', selectedCategory)
        if (priceMax) query = query.lte('price', priceMax)
        if (searchParams.get('featured') === 'true') query = query.eq('is_featured', true)

        switch (sortBy) {
            case 'price_asc': query = query.order('price', { ascending: true }); break
            case 'price_desc': query = query.order('price', { ascending: false }); break
            case 'name': query = query.order('name'); break
            default: query = query.order('created_at', { ascending: false })
        }

        const { data } = await query.limit(48)
        setProducts((data as any) || [])
        setLoading(false)
    }, [search, selectedCategory, sortBy, priceMax, searchParams])

    useEffect(() => {
        const timer = setTimeout(fetchProducts, 300)
        return () => clearTimeout(timer)
    }, [fetchProducts])

    const clearFilters = () => {
        setSearch('')
        setSelectedCategory('')
        setSortBy('newest')
        setPriceMax('')
        router.push('/shop')
    }

    const hasFilters = search || selectedCategory || priceMax || searchParams.get('featured')

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="bg-white border-b border-slate-100">
                <div className="container-custom py-6">
                    <h1 className="text-2xl font-bold text-slate-800 mb-4">สินค้าทั้งหมด</h1>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1 max-w-lg">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input type="text" placeholder="ค้นหาสินค้า..." value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-10" />
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="input-field pr-10 appearance-none cursor-pointer">
                                    {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>
                            <button onClick={() => setShowFilters(!showFilters)} className={`btn-secondary flex items-center gap-2 whitespace-nowrap ${showFilters ? 'bg-amber-100 text-amber-700' : ''}`}>
                                <SlidersHorizontal className="w-4 h-4" /><span className="hidden sm:block">ตัวกรอง</span>
                            </button>
                            {hasFilters && (
                                <button onClick={clearFilters} className="btn-ghost flex items-center gap-1 text-red-500 hover:bg-red-50">
                                    <X className="w-4 h-4" /><span className="hidden sm:block">ล้าง</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {showFilters && (
                        <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200 animate-fade-in-up">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">หมวดหมู่</label>
                                    <div className="relative">
                                        <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="input-field appearance-none cursor-pointer">
                                            <option value="">ทุกหมวดหมู่</option>
                                            {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">ราคาสูงสุด (บาท)</label>
                                    <input type="number" placeholder="ไม่จำกัด" value={priceMax} onChange={e => setPriceMax(e.target.value ? Number(e.target.value) : '')} className="input-field" min={0} />
                                </div>
                            </div>
                        </div>
                    )}

                    {categories.length > 0 && (
                        <div className="mt-4 flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                            <button onClick={() => setSelectedCategory('')} className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-all ${!selectedCategory ? 'bg-amber-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-amber-400'}`}>ทั้งหมด</button>
                            {categories.map(c => (
                                <button key={c.id} onClick={() => setSelectedCategory(selectedCategory === c.slug ? '' : c.slug)} className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-all ${selectedCategory === c.slug ? 'bg-amber-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-amber-400'}`}>{c.name}</button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="container-custom py-8">
                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="card animate-pulse">
                                <div className="aspect-square bg-slate-200" />
                                <div className="p-4 space-y-2">
                                    <div className="h-3 bg-slate-200 rounded w-1/3" />
                                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                                    <div className="h-4 bg-slate-200 rounded w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-xl font-bold text-slate-700 mb-2">ไม่พบสินค้า</h3>
                        <p className="text-slate-500 mb-4">ลองเปลี่ยนคำค้นหาหรือตัวกรอง</p>
                        <button onClick={clearFilters} className="btn-primary">ดูสินค้าทั้งหมด</button>
                    </div>
                ) : (
                    <>
                        <p className="text-sm text-slate-500 mb-4">พบ {products.length} รายการ</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
                            {products.map(p => <ProductCard key={p.id} product={p} />)}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default function ShopPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" /></div>}>
            <ShopPageInner />
        </Suspense>
    )
}
