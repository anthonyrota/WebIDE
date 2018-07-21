declare global {
  // tslint:disable-next-line:interface-name
  export interface SymbolConstructor {
    readonly observable: symbol
  }
}

export const $$observable: SymbolConstructor['observable'] =
  typeof Symbol === 'function'
    ? Symbol.observable || Symbol('observable')
    : ('@@observable' as any)
