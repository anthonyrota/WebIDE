export function always<T>(value: T): () => T {
  return () => value
}
