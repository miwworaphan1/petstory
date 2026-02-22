import type { Metadata } from 'next'
import Link from 'next/link'
import { Heart, Shield, Truck, Star, Users, Package } from 'lucide-react'

export const metadata: Metadata = { title: 'เกี่ยวกับเรา' }

export default function AboutPage() {
    return (
        <div className="min-h-screen">
            {/* Hero */}
            <section className="bg-gradient-to-br from-amber-600 to-amber-400 text-white py-16 lg:py-24">
                <div className="container-custom text-center">
                    <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Heart className="w-10 h-10 text-white fill-white" />
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-bold mb-4">เกี่ยวกับ Pet Story Club</h1>
                    <p className="text-xl text-white/80 max-w-2xl mx-auto">
                        เราคือผู้เชี่ยวชาญด้านสินค้าสัตว์เลี้ยงที่คัดสรรสินค้าคุณภาพดีเพื่อน้องขนฟูของคุณ
                    </p>
                </div>
            </section>

            {/* Stats */}
            <section className="py-12 bg-white">
                <div className="container-custom">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
                        {[
                            { icon: '🐾', value: '1,000+', label: 'ลูกค้าที่ไว้ใจเรา' },
                            { icon: '📦', value: '500+', label: 'สินค้าคุณภาพดี' },
                            { icon: '⭐', value: '4.9', label: 'คะแนนความพึงพอใจ' },
                            { icon: '🚚', value: '2 วัน', label: 'เวลาจัดส่งเฉลี่ย' },
                        ].map(stat => (
                            <div key={stat.label} className="p-4">
                                <div className="text-4xl mb-2">{stat.icon}</div>
                                <p className="text-3xl font-bold text-amber-600 mb-1">{stat.value}</p>
                                <p className="text-slate-500 text-sm">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Mission */}
            <section className="py-12 lg:py-16 bg-slate-50">
                <div className="container-custom">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                        <div>
                            <h2 className="text-3xl font-bold text-slate-800 mb-4">พันธกิจของเรา</h2>
                            <p className="text-slate-600 text-lg leading-relaxed mb-4">
                                Pet Story Club ก่อตั้งขึ้นจากความรักที่มีต่อสัตว์เลี้ยง เราเชื่อว่าทุกน้องขนฟูสมควรได้รับสิ่งที่ดีที่สุด
                            </p>
                            <p className="text-slate-600 leading-relaxed mb-6">
                                เราคัดสรรสินค้าที่ผ่านการตรวจสอบคุณภาพ ปลอดภัย และเหมาะสมสำหรับสัตว์เลี้ยงทุกชนิด ตั้งแต่อาหาร ของเล่น ไปจนถึงเครื่องประดับ
                            </p>
                            <Link href="/shop" className="btn-primary inline-flex">เลือกซื้อสินค้าเลย</Link>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { icon: Shield, title: 'ปลอดภัย 100%', desc: 'ทุกสินค้าผ่านการทดสอบความปลอดภัย' },
                                { icon: Truck, title: 'จัดส่งด่วน', desc: 'ส่งทั่วไทยภายใน 1-3 วันทำการ' },
                                { icon: Star, title: 'คุณภาพดีเยี่ยม', desc: 'คัดแต่สินค้าเกรดพรีเมียม' },
                                { icon: Users, title: 'ทีมผู้เชี่ยวชาญ', desc: 'ให้คำปรึกษาโดยผู้รักสัตว์เลี้ยง' },
                            ].map(item => (
                                <div key={item.title} className="card p-4">
                                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center mb-3">
                                        <item.icon className="w-5 h-5 text-amber-600" />
                                    </div>
                                    <h3 className="font-bold text-slate-800 text-sm mb-1">{item.title}</h3>
                                    <p className="text-slate-500 text-xs">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Team */}
            <section className="py-12 lg:py-16 bg-white">
                <div className="container-custom text-center">
                    <h2 className="text-3xl font-bold text-slate-800 mb-2">ทีมงานของเรา</h2>
                    <p className="text-slate-500 mb-10">ผู้คนที่อยู่เบื้องหลัง Pet Story Club</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
                        {[
                            { emoji: '👩‍💼', name: 'คุณแนน', role: 'ผู้ก่อตั้ง & CEO' },
                            { emoji: '👨‍⚕️', name: 'คุณบอล', role: 'สัตวแพทย์ที่ปรึกษา' },
                            { emoji: '👩‍🎨', name: 'คุณมิน', role: 'ผู้จัดการฝ่ายสินค้า' },
                        ].map(t => (
                            <div key={t.name} className="card p-6 text-center">
                                <div className="text-5xl mb-3">{t.emoji}</div>
                                <h3 className="font-bold text-slate-800">{t.name}</h3>
                                <p className="text-slate-500 text-sm">{t.role}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-12 bg-slate-50">
                <div className="container-custom text-center">
                    <div className="bg-gradient-to-r from-amber-600 to-amber-400 rounded-3xl p-10 text-white">
                        <Package className="w-12 h-12 mx-auto mb-4 opacity-80" />
                        <h2 className="text-3xl font-bold mb-3">พร้อมช้อปสินค้าแล้วหรือยัง?</h2>
                        <p className="text-white/80 mb-6">เลือกสินค้าคุณภาพดีสำหรับน้องขนฟูของคุณ</p>
                        <Link href="/shop" className="bg-white text-amber-700 font-bold px-8 py-3 rounded-xl hover:bg-amber-50 transition-all inline-block">เลือกซื้อเลย</Link>
                    </div>
                </div>
            </section>
        </div>
    )
}
