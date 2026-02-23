export type UserRole = 'user' | 'admin'
export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'

export interface Profile {
    id: string
    full_name: string | null
    phone: string | null
    avatar_url: string | null
    role: UserRole
    created_at: string
}

export interface Category {
    id: string
    name: string
    slug: string
    description: string | null
    image_url: string | null
    created_at: string
}

export interface Product {
    id: string
    name: string
    slug: string
    description: string | null
    price: number
    compare_price: number | null
    stock: number
    size: string | null
    category_id: string | null
    is_featured: boolean
    is_new: boolean
    is_sale: boolean
    is_active: boolean
    sort_order: number
    created_at: string
    updated_at: string
    categories?: Category
    product_images?: ProductImage[]
}

export interface ProductImage {
    id: string
    product_id: string
    url: string
    is_primary: boolean
    sort_order: number
}

export interface CartItem {
    id: string
    user_id: string
    product_id: string
    quantity: number
    selected_size: string | null
    created_at: string
    products?: Product
}

export interface Address {
    id: string
    user_id: string
    name: string
    phone: string
    address_line: string
    district: string
    province: string
    postal_code: string
    is_default: boolean
}

export interface Order {
    id: string
    user_id: string
    status: OrderStatus
    total_amount: number
    shipping_address: ShippingAddress
    payment_method: string
    payment_slip_url: string | null
    notes: string | null
    created_at: string
    updated_at: string
    profiles?: Profile
    order_items?: OrderItem[]
}

export interface OrderItem {
    id: string
    order_id: string
    product_id: string | null
    quantity: number
    unit_price: number
    product_snapshot: ProductSnapshot
    products?: Product
}

export interface ShippingAddress {
    name: string
    phone: string
    address_line: string
    district: string
    province: string
    postal_code: string
}

export interface ProductSnapshot {
    name: string
    price: number
    size: string | null
    image_url: string | null
}
