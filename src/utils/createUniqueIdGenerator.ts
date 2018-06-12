export function createUniqueIdGenerator(): () => number {
  let id = 0
  return (): number => ++id
}
