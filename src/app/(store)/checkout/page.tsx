'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useCartStore } from '@/store/cartStore'
import { Upload, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import Image from 'next/image'
import type { CartItem } from '@/types/database'

const PAYMENT_METHODS = [
    { value: 'bank_transfer', label: 'โอนเงินผ่านธนาคาร', icon: '🏦' },
    { value: 'promptpay', label: 'PromptPay', icon: '📱' },
]

const PROVINCES = ['กรุงเทพมหานคร', 'เชียงใหม่', 'เชียงราย', 'นนทบุรี', 'ปทุมธานี', 'สมุทรปราการ', 'ชลบุรี', 'ระยอง', 'ขอนแก่น', 'อุดรธานี', 'นครราชสีมา', 'ภูเก็ต', 'สงขลา', 'สุราษฎร์ธานี', 'อื่นๆ']

export default function CheckoutPage() {
    const [items, setItems] = useState<CartItem[]>([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [paymentMethod, setPaymentMethod] = useState('bank_transfer')
    const [slipFile, setSlipFile] = useState<File | null>(null)
    const [slipPreview, setSlipPreview] = useState<string | null>(null)
    const [form, setForm] = useState({ name: '', phone: '', address_line: '', district: '', province: 'กรุงเทพมหานคร', postal_code: '', notes: '' })
    const { setItemCount } = useCartStore()
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { router.push('/login'); return }

            const [{ data: cartData }, { data: profile }] = await Promise.all([
                supabase.from('cart_items').select('*, products(*, product_images(*))').eq('user_id', user.id),
                supabase.from('profiles').select('full_name, phone').eq('id', user.id).single(),
            ])
            if (!cartData?.length) { toast.error('ตะกร้าว่างเปล่า'); router.push('/cart'); return }
            setItems((cartData as any) || [])
            if (profile) setForm(f => ({ ...f, name: profile.full_name || '', phone: profile.phone || '' }))
            setLoading(false)
        }
        init()
    }, [])

    const handleSlipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setSlipFile(file)
            setSlipPreview(URL.createObjectURL(file))
        }
    }

    const total = items.reduce((sum, item) => sum + ((item as any).products?.price || 0) * item.quantity, 0)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.name || !form.phone || !form.address_line || !form.postal_code) {
            toast.error('กรุณากรอกที่อยู่ให้ครบถ้วน')
            return
        }
        setSubmitting(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()

            let slipUrl = null
            if (slipFile) {
                const ext = slipFile.name.split('.').pop()
                const path = `${user!.id}/${Date.now()}.${ext}`
                const { data: uploadData } = await supabase.storage.from('payment-slips').upload(path, slipFile)
                if (uploadData) {
                    const { data: urlData } = supabase.storage.from('payment-slips').getPublicUrl(uploadData.path)
                    slipUrl = urlData.publicUrl
                }
            }

            const { data: order, error: orderError } = await supabase.from('orders').insert({
                user_id: user!.id,
                status: 'pending',
                total_amount: total,
                shipping_address: { name: form.name, phone: form.phone, address_line: form.address_line, district: form.district, province: form.province, postal_code: form.postal_code },
                payment_method: paymentMethod,
                payment_slip_url: slipUrl,
                notes: form.notes || null,
            }).select().single()

            if (orderError) throw orderError

            const orderItems = items.map(item => {
                const product = (item as any).products
                const img = product?.product_images?.find((i: any) => i.is_primary)?.url || null
                return {
                    order_id: order.id,
                    product_id: item.product_id,
                    quantity: item.quantity,
                    unit_price: product?.price || 0,
                    product_snapshot: { name: product?.name, price: product?.price, size: (item as any).selected_size || product?.size || null, image_url: img },
                }
            })

            await supabase.from('order_items').insert(orderItems)
            await supabase.from('cart_items').delete().eq('user_id', user!.id)
            setItemCount(0)

            toast.success('สั่งซื้อสำเร็จ! 🎉')
            router.push(`/orders/${order.id}`)
        } catch {
            toast.error('เกิดข้อผิดพลาด กรุณาลองใหม่')
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" /></div>

    return (
        <div className="min-h-screen bg-slate-50 py-8">
            <div className="container-custom">
                <h1 className="text-2xl font-bold text-slate-800 mb-6">ชำระเงิน</h1>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left: Address & Payment */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Shipping Address */}
                            <div className="card p-6">
                                <h2 className="font-bold text-slate-800 text-lg mb-4">📦 ที่อยู่จัดส่ง</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">ชื่อผู้รับ *</label>
                                        <input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input-field" placeholder="ชื่อ-นามสกุล" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">เบอร์โทร *</label>
                                        <input type="tel" required value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="input-field" placeholder="08X-XXX-XXXX" />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-medium text-slate-700 mb-1">ที่อยู่ *</label>
                                        <input type="text" required value={form.address_line} onChange={e => setForm(f => ({ ...f, address_line: e.target.value }))} className="input-field" placeholder="บ้านเลขที่ ซอย ถนน" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">อำเภอ/เขต</label>
                                        <input type="text" value={form.district} onChange={e => setForm(f => ({ ...f, district: e.target.value }))} className="input-field" placeholder="เขต/อำเภอ" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">จังหวัด</label>
                                        <select value={form.province} onChange={e => setForm(f => ({ ...f, province: e.target.value }))} className="input-field">
                                            {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">รหัสไปรษณีย์ *</label>
                                        <input type="text" required value={form.postal_code} onChange={e => setForm(f => ({ ...f, postal_code: e.target.value }))} className="input-field" placeholder="10000" maxLength={5} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">หมายเหตุ</label>
                                        <input type="text" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="input-field" placeholder="ถ้ามี" />
                                    </div>
                                </div>
                            </div>

                            {/* Payment */}
                            <div className="card p-6">
                                <h2 className="font-bold text-slate-800 text-lg mb-4">💳 วิธีชำระเงิน</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                                    {PAYMENT_METHODS.map(pm => (
                                        <button key={pm.value} type="button" onClick={() => setPaymentMethod(pm.value)}
                                            className={`p-4 rounded-xl border-2 flex items-center gap-3 transition-all ${paymentMethod === pm.value ? 'border-amber-600 bg-amber-100' : 'border-slate-200 hover:border-amber-300'}`}>
                                            <span className="text-2xl">{pm.icon}</span>
                                            <span className="font-medium text-slate-700">{pm.label}</span>
                                            {paymentMethod === pm.value && <Check className="w-4 h-4 text-amber-600 ml-auto" />}
                                        </button>
                                    ))}
                                </div>

                                {/* Bank Info */}
                                <div className="p-4 bg-blue-50 rounded-xl mb-4">
                                    <p className="font-semibold text-blue-800 text-sm mb-2">ข้อมูลการโอนเงิน</p>
                                    <div className="space-y-1 text-sm text-blue-700">
                                        <p>ธนาคาร: กสิกรไทย (KBANK)</p>
                                        <p>เลขบัญชี: <strong>XXX-X-XXXXX-X</strong></p>
                                        <p>ชื่อบัญชี: <strong>Pet Story Club</strong></p>
                                        <p className="font-bold text-amber-700 mt-2">ยอดโอน: ฿{total.toLocaleString('th-TH')}</p>
                                    </div>
                                </div>

                                {/* Slip Upload */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">อัปโหลดสลิปการโอนเงิน</label>
                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-amber-500 transition-colors bg-slate-50 hover:bg-amber-100">
                                        {slipPreview ? (
                                            <Image src={slipPreview} alt="slip" width={100} height={100} className="h-full object-contain rounded-xl" />
                                        ) : (
                                            <div className="text-center">
                                                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-1" />
                                                <p className="text-sm text-slate-500">คลิกเพื่ออัปโหลด (JPG, PNG)</p>
                                            </div>
                                        )}
                                        <input type="file" accept="image/*" onChange={handleSlipChange} className="hidden" />
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Right: Order Summary */}
                        <div>
                            <div className="card p-6 sticky top-20">
                                <h2 className="font-bold text-slate-800 text-lg mb-4">สรุปคำสั่งซื้อ</h2>
                                <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                                    {items.map(item => {
                                        const product = (item as any).products
                                        return (
                                            <div key={item.id} className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-slate-100 rounded-lg shrink-0 flex items-center justify-center text-lg">🐾</div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-medium text-slate-700 truncate">{product?.name}</p>
                                                    {(item as any).selected_size && <p className="text-xs text-blue-600">ขนาด: {(item as any).selected_size}</p>}
                                                    <p className="text-xs text-slate-500">x{item.quantity}</p>
                                                </div>
                                                <p className="text-sm font-semibold text-slate-800 shrink-0">฿{((product?.price || 0) * item.quantity).toLocaleString('th-TH')}</p>
                                            </div>
                                        )
                                    })}
                                </div>
                                <div className="border-t border-slate-100 pt-4 space-y-2">
                                    <div className="flex justify-between text-sm text-slate-600">
                                        <span>ค่าจัดส่ง</span><span className="text-green-600 font-medium">ฟรี</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-slate-800 text-lg">
                                        <span>ยอดรวม</span>
                                        <span className="text-amber-600">฿{total.toLocaleString('th-TH')}</span>
                                    </div>
                                </div>
                                <button type="submit" disabled={submitting} className="btn-primary w-full mt-4">
                                    {submitting ? 'กำลังสั่งซื้อ...' : '✅ ยืนยันคำสั่งซื้อ'}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}
