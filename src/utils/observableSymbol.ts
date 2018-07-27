// @ts-ignore
export const $$observable: unique symbol =
  typeof Symbol === 'function'
    ? (Symbol as any).observable || Symbol('observable')
    : ('@@observable' as any)
