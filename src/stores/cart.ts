import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface CartItem {
    productId: number
    slug: string
    title: any
    priceAmount: string
    image?: string
    quantity: number
    purchaseType?: string
    fulfillmentType?: string
    manualFormSchema?: any
}

const loadCartItems = (): CartItem[] => {
    const raw = localStorage.getItem('cart_items')
    if (!raw) return []
    try {
        const parsed = JSON.parse(raw)
        if (!Array.isArray(parsed)) return []
        return parsed as CartItem[]
    } catch (error) {
        console.error('Failed to parse cart items', error)
        return []
    }
}

export const useCartStore = defineStore('cart', () => {
    const items = ref<CartItem[]>(loadCartItems())

    const totalItems = computed(() => items.value.reduce((sum, item) => sum + item.quantity, 0))

    const persist = () => {
        localStorage.setItem('cart_items', JSON.stringify(items.value))
    }

    const addItem = (item: CartItem, quantity = 1) => {
        const qty = Math.max(1, Math.min(quantity, 99))
        const existing = items.value.find((entry) => entry.productId === item.productId)
        if (existing) {
            existing.quantity = Math.min(existing.quantity + qty, 99)
            existing.slug = item.slug
            existing.title = item.title
            existing.priceAmount = item.priceAmount
            existing.image = item.image
            existing.purchaseType = item.purchaseType
            existing.fulfillmentType = item.fulfillmentType
            existing.manualFormSchema = item.manualFormSchema
        } else {
            items.value.push({
                ...item,
                quantity: qty,
            })
        }
        persist()
    }

    const updateQuantity = (productId: number, quantity: number) => {
        const target = items.value.find((entry) => entry.productId === productId)
        if (!target) return
        const qty = Math.max(1, Math.min(quantity, 99))
        target.quantity = qty
        persist()
    }

    const removeItem = (productId: number) => {
        items.value = items.value.filter((entry) => entry.productId !== productId)
        persist()
    }

    const clear = () => {
        items.value = []
        persist()
    }

    return {
        items,
        totalItems,
        addItem,
        updateQuantity,
        removeItem,
        clear,
    }
})
