export function warn(...messages: any[]): () => void {
  return () => {
    if (typeof console !== 'undefined' && 'warn' in console) {
      console.warn(...messages)
    }
    try {
      throw new Error('A warning occured: ' + messages.join(' '))
    } catch (error) {
      // This hack is so that the warning and stack trace shows up in the console
    }
  }
}
