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

                    {/* Contact Channels */}
                    <div>
                        <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-4">ช่องทางการติดต่อ</h3>
                        <ul className="space-y-3">
                            <li>
                                <a href="https://www.facebook.com/profile.php?id=61578264786161" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-slate-400 hover:text-amber-500 transition-colors">
                                    <Facebook className="w-5 h-5 shrink-0" />
                                    Facebook
                                </a>
                            </li>
                            <li>
                                <a href="#" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-slate-400 hover:text-amber-500 transition-colors">
                                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" /></svg>
                                    Line
                                </a>
                            </li>
                            <li>
                                <a href="#" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-slate-400 hover:text-amber-500 transition-colors">
                                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" /></svg>
                                    TikTok
                                </a>
                            </li>
                            <li>
                                <a href="#" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-slate-400 hover:text-amber-500 transition-colors">
                                    <Instagram className="w-5 h-5 shrink-0" />
                                    Instagram
                                </a>
                            </li>
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
