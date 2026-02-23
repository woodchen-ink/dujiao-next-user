import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface CartItem {
    productId: number
    skuId?: number
    skuCode?: string
    skuSpecValues?: Record<string, any>
    skuManualStockTotal?: number
    skuManualStockLocked?: number
    skuManualStockSold?: number
    skuStockEnforced?: boolean
    slug: string
    title: any
    priceAmount: string
    image?: string
    quantity: number
    purchaseType?: string
    fulfillmentType?: string
    manualFormSchema?: any
}

const normalizeSkuId = (value: unknown) => {
    const numberValue = Number(value)
    if (!Number.isFinite(numberValue)) return 0
    const integerValue = Math.trunc(numberValue)
    return integerValue > 0 ? integerValue : 0
}

const cartIdentity = (item: Pick<CartItem, 'productId' | 'skuId'>) => `${item.productId}:${normalizeSkuId(item.skuId)}`

const normalizeStockNumber = (value: unknown) => {
    const numberValue = Number(value)
    if (!Number.isFinite(numberValue)) return 0
    return Math.max(Math.floor(numberValue), 0)
}

const loadCartItems = (): CartItem[] => {
    const raw = localStorage.getItem('cart_items')
    if (!raw) return []
    try {
        const parsed = JSON.parse(raw)
        if (!Array.isArray(parsed)) return []
        return parsed
            .map((item) => {
                if (!item || typeof item !== 'object') return null
                const productId = Number((item as any).productId)
                if (!Number.isFinite(productId) || productId <= 0) return null
                return {
                    ...(item as CartItem),
                    productId: Math.trunc(productId),
                    skuId: normalizeSkuId((item as any).skuId),
                    skuManualStockTotal: normalizeStockNumber((item as any).skuManualStockTotal),
                    skuManualStockLocked: normalizeStockNumber((item as any).skuManualStockLocked),
                    skuManualStockSold: normalizeStockNumber((item as any).skuManualStockSold),
                    skuStockEnforced: Boolean((item as any).skuStockEnforced),
                } as CartItem
            })
            .filter(Boolean) as CartItem[]
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
        const normalizedItem: CartItem = {
            ...item,
            productId: Math.trunc(Number(item.productId)),
            skuId: normalizeSkuId(item.skuId),
        }
        const identity = cartIdentity(normalizedItem)
        const existing = items.value.find((entry) => cartIdentity(entry) === identity)
        if (existing) {
            existing.quantity = Math.min(existing.quantity + qty, 99)
            existing.slug = normalizedItem.slug
            existing.title = normalizedItem.title
            existing.priceAmount = normalizedItem.priceAmount
            existing.image = normalizedItem.image
            existing.purchaseType = normalizedItem.purchaseType
            existing.fulfillmentType = normalizedItem.fulfillmentType
            existing.manualFormSchema = normalizedItem.manualFormSchema
            existing.skuId = normalizedItem.skuId
            existing.skuCode = normalizedItem.skuCode
            existing.skuSpecValues = normalizedItem.skuSpecValues
            existing.skuManualStockTotal = normalizeStockNumber(normalizedItem.skuManualStockTotal)
            existing.skuManualStockLocked = normalizeStockNumber(normalizedItem.skuManualStockLocked)
            existing.skuManualStockSold = normalizeStockNumber(normalizedItem.skuManualStockSold)
            existing.skuStockEnforced = Boolean(normalizedItem.skuStockEnforced)
        } else {
            items.value.push({
                ...normalizedItem,
                skuManualStockTotal: normalizeStockNumber(normalizedItem.skuManualStockTotal),
                skuManualStockLocked: normalizeStockNumber(normalizedItem.skuManualStockLocked),
                skuManualStockSold: normalizeStockNumber(normalizedItem.skuManualStockSold),
                skuStockEnforced: Boolean(normalizedItem.skuStockEnforced),
                quantity: qty,
            })
        }
        persist()
    }

    const updateQuantity = (productId: number, quantity: number, skuId?: number) => {
        const identity = `${Math.trunc(Number(productId))}:${normalizeSkuId(skuId)}`
        const target = items.value.find((entry) => cartIdentity(entry) === identity)
        if (!target) return
        const qty = Math.max(1, Math.min(quantity, 99))
        target.quantity = qty
        persist()
    }

    const removeItem = (productId: number, skuId?: number) => {
        const identity = `${Math.trunc(Number(productId))}:${normalizeSkuId(skuId)}`
        items.value = items.value.filter((entry) => cartIdentity(entry) !== identity)
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
