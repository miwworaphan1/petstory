import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import ProductCard from '@/components/store/ProductCard'
import { ArrowRight, Truck, Shield, Clock, Star, ShoppingBag } from 'lucide-react'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
    title: 'Pet Story Club — ร้านสินค้าสัตว์เลี้ยงออนไลน์',
    description: 'ช้อปสินค้าสัตว์เลี้ยงคุณภาพดี ส่งตรงถึงบ้าน',
}

export default async function HomePage() {
    const supabase = await createClient()

    const [{ data: categories }, { data: featuredProducts }, { data: newProducts }, { data: siteSettings }] = await Promise.all([
        supabase.from('categories').select('*').order('name').limit(6),
        supabase.from('products')
            .select('*, categories(*), product_images(*)')
            .eq('is_featured', true)
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(8),
        supabase.from('products')
            .select('*, categories(*), product_images(*)')
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(4),
        supabase.from('site_settings').select('*').eq('id', 'main').single(),
    ])

    const heroBg = siteSettings?.hero_bg_url
    const heroBgOpacity = siteSettings?.hero_bg_opacity ?? 0.3
    const badgeText = siteSettings?.hero_badge_text || ''
    const titleLine1 = siteSettings?.hero_title_line1 || ''
    const titleLine2 = siteSettings?.hero_title_line2 || ''
    const heroDesc = siteSettings?.hero_description || ''
    const ctaText = siteSettings?.hero_cta_text || ''

    return (
        <div className="overflow-x-hidden">
            {/* Hero */}
            <section className="relative overflow-hidden" style={heroBg ? { backgroundImage: `url(${heroBg})`, backgroundSize: 'cover', backgroundPosition: 'center top' } : undefined}>
                {!heroBg && <div className="absolute inset-0 bg-gradient-to-br from-amber-600 via-amber-500 to-amber-400" />}
                {heroBg && <div className="absolute inset-0 bg-black" style={{ opacity: heroBgOpacity }} />}

                <div className="container-custom py-10 sm:py-16 lg:py-24 relative">
                    <div className="text-white animate-fade-in-up max-w-2xl">
                        <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
                            <Star className="w-4 h-4 fill-white" />
                            {badgeText}
                        </div>
                        <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold leading-tight mb-4">
                            {titleLine1}<br />
                            <span className="text-amber-200">{titleLine2}</span>
                        </h1>
                        <p className="text-white/80 text-base sm:text-lg mb-6 sm:mb-8 max-w-md">
                            {heroDesc}
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <Link href="/shop" className="bg-white text-amber-700 font-bold px-8 py-3 rounded-xl hover:bg-amber-50 transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center gap-2">
                                <ShoppingBag className="w-5 h-5" />
                                {ctaText}
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Bar */}
            <section className="bg-white border-b border-slate-100">
                <div className="container-custom py-5">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                            { icon: Truck, title: 'จัดส่งรวดเร็ว', desc: 'ส่งทั่วไทยภายใน 1-3 วัน' },
                            { icon: Shield, title: 'สินค้าคุณภาพ', desc: 'คัดสรรสินค้าปลอดภัยสำหรับสัตว์เลี้ยง' },
                            { icon: Clock, title: 'บริการ 24/7', desc: 'ทีมงานพร้อมช่วยเหลือตลอดเวลา' },
                        ].map(f => (
                            <div key={f.title} className="flex items-center gap-3 py-1">
                                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                                    <f.icon className="w-5 h-5 text-amber-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-800 text-sm">{f.title}</p>
                                    <p className="text-slate-500 text-xs">{f.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Categories */}
            {categories && categories.length > 0 && (
                <section className="py-8 sm:py-12 lg:py-16 bg-slate-50">
                    <div className="container-custom">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="section-title">หมวดหมู่สินค้า</h2>
                                <p className="text-slate-500">เลือกสินค้าตามประเภทที่ต้องการ</p>
                            </div>
                            <Link href="/shop" className="flex items-center gap-1 text-amber-600 hover:text-amber-700 font-semibold text-sm">
                                ดูทั้งหมด <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                            {categories.map(cat => (
                                <Link
                                    key={cat.id}
                                    href={`/shop?c=${cat.slug}`}
                                    className="card group hover:shadow-md transition-all hover:-translate-y-1 duration-200"
                                >
                                    <div className="p-4 text-center">
                                        <div className="w-12 h-12 bg-gradient-to-br from-amber-200 to-amber-100 rounded-xl mx-auto mb-3 flex items-center justify-center">
                                            {cat.image_url ? (
                                                <Image src={cat.image_url} alt={cat.name} width={32} height={32} className="object-contain" />
                                            ) : (
                                                <span className="text-2xl">🐾</span>
                                            )}
                                        </div>
                                        <p className="text-sm font-semibold text-slate-700 group-hover:text-amber-700 transition-colors leading-tight">
                                            {cat.name}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Featured Products */}
            {featuredProducts && featuredProducts.length > 0 && (
                <section className="py-8 sm:py-12 lg:py-16 bg-white">
                    <div className="container-custom">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="section-title">สินค้าแนะนำ</h2>
                                <p className="text-slate-500">สินค้าคุณภาพที่เราคัดสรรมาเพื่อคุณ</p>
                            </div>
                            <Link href="/shop?featured=true" className="flex items-center gap-1 text-amber-600 hover:text-amber-700 font-semibold text-sm">
                                ดูทั้งหมด <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
                            {featuredProducts.map(p => (
                                <ProductCard key={p.id} product={p as any} />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* New Products */}
            {newProducts && newProducts.length > 0 && (
                <section className="py-8 sm:py-12 lg:py-16 bg-slate-50">
                    <div className="container-custom">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="section-title">สินค้ามาใหม่</h2>
                                <p className="text-slate-500">อัปเดตสินค้าล่าสุดสำหรับสัตว์เลี้ยงของคุณ</p>
                            </div>
                            <Link href="/shop" className="flex items-center gap-1 text-amber-600 hover:text-amber-700 font-semibold text-sm">
                                ดูทั้งหมด <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 lg:gap-6">
                            {newProducts.map(p => (
                                <ProductCard key={p.id} product={p as any} />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* CTA Banner */}
            <section className="py-12 lg:py-16 bg-white">
                <div className="container-custom">
                    <div className="bg-gradient-to-r from-amber-600 to-amber-400 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 text-center text-white relative overflow-hidden">
                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-300 rounded-full translate-y-1/2 -translate-x-1/2" />
                        </div>
                        <div className="relative">
                            <span className="text-5xl mb-4 block">🐾🐕🐈</span>
                            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3">พร้อมเริ่มช้อปแล้วหรือยัง?</h2>
                            <p className="text-white/80 text-lg mb-6">เลือกสินค้าคุณภาพดีสำหรับน้องขนฟูของคุณ</p>
                            <Link href="/shop" className="inline-flex items-center gap-2 bg-white text-amber-700 font-bold px-8 py-3 rounded-xl hover:bg-amber-50 transition-all shadow-lg">
                                <ShoppingBag className="w-5 h-5" />
                                เลือกซื้อเลย
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
