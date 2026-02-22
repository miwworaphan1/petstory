import AdminSidebar from '@/components/layout/AdminSidebar'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
    title: { default: 'Admin Dashboard', template: '%s | Pet Story Admin' },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen bg-slate-100">
            <AdminSidebar />
            <div className="flex-1 lg:min-h-screen overflow-x-hidden">
                <div className="pt-14 lg:pt-0">
                    {children}
                </div>
            </div>
        </div>
    )
}
