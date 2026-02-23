import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import AddToCartButton from './AddToCartButton'
import { Package, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'
type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params
    const supabase = await createClient()
    const { data: product } = await supabase.from('products').select('name, description').eq('slug', slug).single()
    return { title: product?.name || 'สินค้า', description: product?.description || '' }
}

export default async function ProductDetailPage({ params }: Props) {
    const { slug } = await params
    const supabase = await createClient()

    const { data: product } = await supabase
        .from('products')
        .select('*, categories(*), product_images(*)')
        .eq('slug', slug)
        .single()

    if (!product) notFound()

    const images: string[] = (product.product_images as any[])?.sort((a, b) => {
        if (a.is_primary) return -1
        if (b.is_primary) return 1
        return a.sort_order - b.sort_order
    }).map(i => i.url) || []

    const discount = product.compare_price
        ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
        : 0

    // Parse size options from comma-separated string
    const sizeOptions: string[] = product.size
        ? product.size.split(',').map((s: string) => s.trim()).filter(Boolean)
        : []

    return (
        <div className="min-h-screen bg-slate-50 py-8">
            <div className="container-custom">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
                    <Link href="/" className="hover:text-amber-600">หน้าแรก</Link>
                    <ChevronRight className="w-3 h-3" />
                    <Link href="/shop" className="hover:text-amber-600">สินค้า</Link>
                    {product.categories && (
                        <>
                            <ChevronRight className="w-3 h-3" />
                            <Link href={`/shop?c=${(product.categories as any).slug}`} className="hover:text-amber-600">
                                {(product.categories as any).name}
                            </Link>
                        </>
                    )}
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-slate-800 font-medium truncate">{product.name}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                    {/* Images */}
                    <div>
                        <div className="card overflow-hidden aspect-square relative mb-3">
                            {images[0] ? (
                                <Image
                                    src={images[0]}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-100 to-amber-50">
                                    <span className="text-8xl">🐾</span>
                                </div>
                            )}
                            {discount > 0 && (
                                <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                                    -{discount}%
                                </div>
                            )}
                        </div>
                        {images.length > 1 && (
                            <div className="grid grid-cols-4 gap-2">
                                {images.slice(0, 4).map((img, i) => (
                                    <div key={i} className="card overflow-hidden aspect-square relative">
                                        <Image src={img} alt={`${product.name} ${i + 1}`} fill className="object-cover" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="animate-fade-in-up">
                        {product.categories && (
                            <Link
                                href={`/shop?c=${(product.categories as any).slug}`}
                                className="text-amber-600 font-medium text-sm hover:underline"
                            >
                                {(product.categories as any).name}
                            </Link>
                        )}
                        <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 mt-2 mb-3">{product.name}</h1>



                        {/* Price */}
                        <div className="flex items-center gap-3 mb-6">
                            <span className="text-3xl font-bold text-amber-600">
                                ฿{product.price.toLocaleString('th-TH')}
                            </span>
                            {product.compare_price && (
                                <span className="text-lg text-slate-400 line-through">
                                    ฿{product.compare_price.toLocaleString('th-TH')}
                                </span>
                            )}
                            {discount > 0 && (
                                <span className="bg-red-100 text-red-600 text-sm font-bold px-2 py-0.5 rounded-lg">
                                    ประหยัด {discount}%
                                </span>
                            )}
                        </div>

                        {/* Size + Add to Cart */}
                        <AddToCartButton product={product as any} sizeOptions={sizeOptions} />

                        {/* Description */}
                        {product.description && (
                            <div className="mt-8 p-4 bg-slate-50 rounded-xl">
                                <h3 className="font-semibold text-slate-800 mb-3">รายละเอียดสินค้า</h3>
                                <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">{product.description}</p>
                            </div>
                        )}

                        {/* Shipping Info */}
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {[
                                { icon: '🚚', title: 'จัดส่งรวดเร็ว', desc: '1-3 วันทำการ' },
                                { icon: '🔒', title: 'ปลอดภัย 100%', desc: 'ระบบชำระเงินที่ปลอดภัย' },
                            ].map(item => (
                                <div key={item.title} className="flex items-center gap-3 p-3 bg-amber-100 rounded-xl">
                                    <span className="text-xl">{item.icon}</span>
                                    <div>
                                        <p className="font-semibold text-slate-700 text-sm">{item.title}</p>
                                        <p className="text-xs text-slate-500">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
