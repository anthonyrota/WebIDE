export const observableSymbolType: unique symbol = getObservableSymbol()

export function getObservableSymbol(): typeof observableSymbolType {
  // @ts-ignore
  return typeof Symbol === 'function'
    ? (Symbol as any).observable ||
        (Symbol.for ? Symbol.for('observable') : Symbol('observable'))
    : ('@@observable' as any)
}
