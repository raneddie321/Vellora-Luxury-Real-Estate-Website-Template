import { StorageError } from './types'
import type { BlobStore } from './types'

const DB_NAME = 'raneddie-studio'
const DB_VERSION = 1
const BLOB_STORE = 'assets'

let dbPromise: Promise<IDBDatabase> | null = null

function openDatabase(): Promise<IDBDatabase> {
  if (typeof indexedDB === 'undefined') {
    return Promise.reject(new StorageError('IndexedDB is not available in this browser.', undefined, false))
  }
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(BLOB_STORE)) db.createObjectStore(BLOB_STORE)
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(new StorageError('Could not open local media storage.', request.error))
    request.onblocked = () =>
      reject(new StorageError('Local media storage is locked by another tab. Close it and retry.', null))
  })
  return dbPromise
}

function run<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDatabase().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(BLOB_STORE, mode)
        const request = fn(tx.objectStore(BLOB_STORE))
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(new StorageError('Local media storage request failed.', request.error))
        tx.onabort = () =>
          reject(
            new StorageError(
              tx.error?.name === 'QuotaExceededError'
                ? 'Your browser is out of storage space for media. Remove some assets and try again.'
                : 'Local media storage transaction was aborted.',
              tx.error,
            ),
          )
      }),
  )
}

/** IndexedDB-backed blob store. Media never leaves the device in the MVP. */
export const idbBlobStore: BlobStore = {
  async put(key, blob) {
    await run('readwrite', (store) => store.put(blob, key))
  },
  async get(key) {
    const value = await run<Blob | undefined>('readonly', (store) => store.get(key))
    return value ?? null
  },
  async delete(key) {
    await run('readwrite', (store) => store.delete(key))
  },
  async usage() {
    const keys = await run<IDBValidKey[]>('readonly', (store) => store.getAll())
    const blobs = keys as unknown as Blob[]
    return {
      count: blobs.length,
      bytes: blobs.reduce((sum, blob) => sum + (blob?.size ?? 0), 0),
    }
  },
  async clear() {
    await run('readwrite', (store) => store.clear())
  },
}
