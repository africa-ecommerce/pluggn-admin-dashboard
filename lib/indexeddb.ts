// IndexedDB utility functions for order collection
interface CheckedItem {
  key: string
  productId: string
  supplierId: string
  productName: string
  quantity: number
  supplierPrice: number
  productSize?: string | null
  productColor?: string | null
  variantSize?: string | null
  variantColor?: string | null
  variantId?: string | null
}

const DB_NAME = "OrderCollection"
const DB_VERSION = 1
const STORE_NAME = "checkedItems"

// Initialize IndexedDB
export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "key" })
        store.createIndex("productId", "productId", { unique: false })
        store.createIndex("supplierId", "supplierId", { unique: false })
      }
    }
  })
}

// Add item to IndexedDB
export const addCheckedItem = async (item: Omit<CheckedItem, "key">): Promise<void> => {
  const db = await initDB()
  const transaction = db.transaction([STORE_NAME], "readwrite")
  const store = transaction.objectStore(STORE_NAME)

  const key = `${item.productId}-${item.supplierId}`
  const checkedItem: CheckedItem = { ...item, key }

  return new Promise((resolve, reject) => {
    const request = store.put(checkedItem)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

// Remove item from IndexedDB
export const removeCheckedItem = async (productId: string, supplierId: string): Promise<void> => {
  const db = await initDB()
  const transaction = db.transaction([STORE_NAME], "readwrite")
  const store = transaction.objectStore(STORE_NAME)

  const key = `${productId}-${supplierId}`

  return new Promise((resolve, reject) => {
    const request = store.delete(key)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

// Get all checked items
export const getAllCheckedItems = async (): Promise<CheckedItem[]> => {
  const db = await initDB()
  const transaction = db.transaction([STORE_NAME], "readonly")
  const store = transaction.objectStore(STORE_NAME)

  return new Promise((resolve, reject) => {
    const request = store.getAll()
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })
}

// Check if item is checked
export const isItemChecked = async (productId: string, supplierId: string): Promise<boolean> => {
  const db = await initDB()
  const transaction = db.transaction([STORE_NAME], "readonly")
  const store = transaction.objectStore(STORE_NAME)

  const key = `${productId}-${supplierId}`

  return new Promise((resolve, reject) => {
    const request = store.get(key)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(!!request.result)
  })
}

// Clear all checked items
export const clearAllCheckedItems = async (): Promise<void> => {
  const db = await initDB()
  const transaction = db.transaction([STORE_NAME], "readwrite")
  const store = transaction.objectStore(STORE_NAME)

  return new Promise((resolve, reject) => {
    const request = store.clear()
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}
