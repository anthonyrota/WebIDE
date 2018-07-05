export function freeze<T>(a: T[]): ReadonlyArray<T>
export function freeze<T extends Function>(f: T): T
export function freeze<T>(o: T): Readonly<T>
export function freeze<T>(o: T): T {
  return typeof Object.freeze !== 'undefined' ? Object.freeze(o) : o
}
