export function reportError(error: any): void {
  setTimeout(() => {
    throw error
  })
}
