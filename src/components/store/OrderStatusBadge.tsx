import { type OrderStatus } from '@/types/database'

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
    pending: { label: 'รอดำเนินการ', className: 'badge-pending' },
    confirmed: { label: 'ยืนยันแล้ว', className: 'badge-confirmed' },
    shipped: { label: 'กำลังจัดส่ง', className: 'badge-shipped' },
    delivered: { label: 'ส่งสำเร็จ', className: 'badge-delivered' },
    cancelled: { label: 'ยกเลิก', className: 'badge-cancelled' },
}

export default function OrderStatusBadge({ status }: { status: OrderStatus }) {
    const config = statusConfig[status] || { label: status, className: 'badge-pending' }
    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${config.className}`}>
            {config.label}
        </span>
    )
}
