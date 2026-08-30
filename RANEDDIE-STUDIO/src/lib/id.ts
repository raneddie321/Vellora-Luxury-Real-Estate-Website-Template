import { customAlphabet } from 'nanoid'

const alphabet = '0123456789abcdefghijklmnopqrstuvwxyz'
const rand = customAlphabet(alphabet, 10)

/** Prefixed, URL-safe, sortable-enough ids: `clip_k3f9a1x0zq`. */
export const createId = (prefix: string) => `${prefix}_${rand()}`
