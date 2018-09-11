import { isObject } from 'src/utils/isObject'
import { root } from 'src/utils/root'
import { uuid } from 'src/utils/uuid'

class WeakMapPolyfill<K extends object, T> {
  private __accessKey: string

  constructor(entries?: ReadonlyArray<[K, T]> | Iterable<[K, T]>) {
    this.__accessKey = '_WeakMap' + uuid()

    if (entries != null) {
      for (const [key, value] of entries) {
        this.set(key, value)
      }
    }
  }

  public delete(key: K): boolean {
    if (!isObject(key)) {
      return false
    }

    const entry = key[this.__accessKey]

    if (entry && entry[0] === key) {
      delete key[this.__accessKey]
      return true
    }

    return false
  }

  public has(key: K): boolean {
    if (!isObject(key)) {
      return false
    }

    const entry = key[this.__accessKey]

    return entry && entry[0] === key
  }

  public set(key: K, value: T): this {
    if (!isObject(key)) {
      throw new TypeError('Invalid value used as weak map key')
    }

    const entry = key[this.__accessKey]

    if (entry && entry[0] === key) {
      entry[1] = value
      return this
    }

    Object.defineProperty(key, this.__accessKey, [key, value])
    return this
  }

  public get(key: K): T | void {
    if (!isObject(key)) {
      return
    }

    const entry = key[this.__accessKey]

    if (entry && entry[0] === key) {
      return entry[1]
    }
  }
}

export const WeakMap: WeakMapConstructor = root.WeakMap || WeakMapPolyfill
