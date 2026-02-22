import Link from 'next/link'
import { Heart, MapPin, Phone, Mail, Facebook, Instagram } from 'lucide-react'

export default function Footer() {
    return (
        <footer className="bg-slate-900 text-slate-300">
            <div className="container-custom py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="lg:col-span-1">
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <div className="w-9 h-9 bg-gradient-primary rounded-xl flex items-center justify-center">
                                <Heart className="w-5 h-5 text-white fill-white" />
                            </div>
                            <span className="font-bold text-xl text-white">Pet Story <span className="text-amber-500">Club</span></span>
                        </Link>
                        <p className="text-sm text-slate-400 leading-relaxed mb-4">
                            ร้านค้าออนไลน์สำหรับน้องหมาน้องแมว และสัตว์เลี้ยงทุกชนิด คัดสรรสินค้าคุณภาพดีในราคาที่คุ้มค่า
                        </p>
                        <div className="flex items-center gap-3">
                            <a href="https://www.facebook.com/profile.php?id=61578264786161" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-amber-600 transition-colors">
                                <Facebook className="w-4 h-4" />
                            </a>
                            <a href="#" className="w-9 h-9 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-amber-600 transition-colors">
                                <Instagram className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-4">เมนู</h3>
                        <ul className="space-y-2">
                            {[
                                { href: '/', label: 'หน้าแรก' },
                                { href: '/shop', label: 'สินค้าทั้งหมด' },
                                { href: '/orders', label: 'ประวัติการสั่งซื้อ' },
                            ].map(link => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-slate-400 hover:text-amber-500 transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Categories */}
                    <div>
                        <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-4">หมวดหมู่</h3>
                        <ul className="space-y-2">
                            {['อาหารสัตว์เลี้ยง', 'ของเล่น', 'ที่นอน & ที่พัก', 'สุขภาพ & ความงาม', 'เสื้อผ้า & เครื่องประดับ', 'อุปกรณ์ทั่วไป'].map(cat => (
                                <li key={cat}>
                                    <Link
                                        href={`/shop?category=${encodeURIComponent(cat)}`}
                                        className="text-sm text-slate-400 hover:text-amber-500 transition-colors"
                                    >
                                        {cat}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-4">ติดต่อเรา</h3>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3 text-sm text-slate-400">
                                <MapPin className="w-4 h-4 mt-0.5 text-amber-500 shrink-0" />
                                <span>กรุงเทพมหานคร, ประเทศไทย</span>
                            </li>
                            <li className="flex items-center gap-3 text-sm text-slate-400">
                                <Phone className="w-4 h-4 text-amber-500 shrink-0" />
                                <a href="tel:+66000000000" className="hover:text-amber-500 transition-colors">+66 000 000 000</a>
                            </li>
                            <li className="flex items-center gap-3 text-sm text-slate-400">
                                <Mail className="w-4 h-4 text-amber-500 shrink-0" />
                                <a href="mailto:hello@petstoryclub.com" className="hover:text-amber-500 transition-colors">hello@petstoryclub.com</a>
                            </li>
                        </ul>
                        <div className="mt-4 p-3 bg-slate-800 rounded-xl">
                            <p className="text-xs text-slate-400 font-medium">เวลาทำการ</p>
                            <p className="text-sm text-white">จันทร์ - อาทิตย์: 9:00 - 21:00</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="border-t border-slate-800">
                <div className="container-custom py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
                    <p className="text-xs text-slate-500">© 2025 Pet Story Club. All rights reserved.</p>
                    <p className="text-xs text-slate-500">Made with <Heart className="w-3 h-3 inline text-amber-500 fill-amber-500" /> for pets</p>
                </div>
            </div>
        </footer>
    )
}
