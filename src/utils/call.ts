export function call<T>(func: () => T): T {
  return func()
}
