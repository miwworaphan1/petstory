'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart, Heart, Star } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useCartStore } from '@/store/cartStore'
import toast from 'react-hot-toast'
import type { Product } from '@/types/database'

interface ProductCardProps {
    product: Product
}

function formatPrice(price: number) {
    return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 0 }).format(price)
}

export default function ProductCard({ product }: ProductCardProps) {
    const [adding, setAdding] = useState(false)
    const [wishlisted, setWishlisted] = useState(false)
    const { incrementCount } = useCartStore()
    const supabase = createClient()
    const router = useRouter()

    const hasSizes = !!product.size

    const primaryImage = product.product_images?.find(img => img.is_primary)?.url
        || product.product_images?.[0]?.url

    const discount = product.compare_price
        ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
        : 0

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.preventDefault()
        // If product has sizes, redirect to detail page for size selection
        if (hasSizes) {
            router.push(`/shop/${product.slug}`)
            return
        }
        setAdding(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                toast.error('กรุณาเข้าสู่ระบบก่อนเพิ่มสินค้า')
                return
            }

            const { data: existing } = await supabase
                .from('cart_items')
                .select('*')
                .eq('user_id', user.id)
                .eq('product_id', product.id)
                .is('selected_size', null)
                .single()

            if (existing) {
                await supabase
                    .from('cart_items')
                    .update({ quantity: existing.quantity + 1 })
                    .eq('id', existing.id)
            } else {
                await supabase
                    .from('cart_items')
                    .insert({ user_id: user.id, product_id: product.id, quantity: 1 })
                incrementCount()
            }
            toast.success(`เพิ่ม "${product.name}" ลงตะกร้าแล้ว`)
        } catch {
            toast.error('เกิดข้อผิดพลาด กรุณาลองใหม่')
        } finally {
            setAdding(false)
        }
    }

    return (
        <Link href={`/shop/${product.slug}`} className="product-card group block">
            <div className="card h-full hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                {/* Image */}
                <div className="relative overflow-hidden aspect-square bg-slate-50">
                    {primaryImage ? (
                        <Image
                            src={primaryImage}
                            alt={product.name}
                            fill
                            className="product-img object-cover"
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-100 to-amber-50">
                            <Heart className="w-16 h-16 text-amber-300 fill-amber-200" />
                        </div>
                    )}

                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                        {discount > 0 && (
                            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                -{discount}%
                            </span>
                        )}
                        {product.is_featured && (
                            <span className="bg-amber-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                แนะนำ
                            </span>
                        )}
                        {product.stock === 0 && (
                            <span className="bg-slate-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                หมดสต็อก
                            </span>
                        )}
                    </div>

                    {/* Wishlist */}
                    <button
                        onClick={(e) => { e.preventDefault(); setWishlisted(!wishlisted) }}
                        className="absolute top-2 right-2 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-white shadow-sm"
                    >
                        <Heart className={`w-4 h-4 transition-colors ${wishlisted ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} />
                    </button>
                </div>

                {/* Info */}
                <div className="p-4">
                    {product.categories && (
                        <p className="text-xs text-amber-600 font-medium mb-1">{product.categories.name}</p>
                    )}
                    <h3 className="font-semibold text-slate-800 text-sm leading-tight mb-1 line-clamp-2 group-hover:text-amber-700 transition-colors">
                        {product.name}
                    </h3>
                    {product.size && (
                        <p className="text-xs text-blue-600 font-medium mb-1">ขนาด: {product.size}</p>
                    )}

                    {/* Stars (placeholder) */}
                    <div className="flex items-center gap-1 mb-3">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3 h-3 ${i < 4 ? 'fill-amber-400 text-amber-400' : 'text-slate-200 fill-slate-200'}`} />
                        ))}
                        <span className="text-xs text-slate-400 ml-1">(4.0)</span>
                    </div>

                    {/* Price */}
                    <div className="flex items-end justify-between">
                        <div>
                            <p className="text-amber-600 font-bold text-lg leading-tight">
                                {formatPrice(product.price)}
                            </p>
                            {product.compare_price && (
                                <p className="text-slate-400 text-xs line-through">{formatPrice(product.compare_price)}</p>
                            )}
                        </div>

                        {product.stock > 0 && (
                            <button
                                onClick={handleAddToCart}
                                disabled={adding}
                                className="w-9 h-9 bg-amber-600 hover:bg-amber-700 text-white rounded-xl flex items-center justify-center transition-all active:scale-90 shadow-sm hover:shadow-amber-300 hover:shadow-md disabled:opacity-60"
                            >
                                <ShoppingCart className={`w-4 h-4 ${adding ? 'animate-spin' : ''}`} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    )
}
