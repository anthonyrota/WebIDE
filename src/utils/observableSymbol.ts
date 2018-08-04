// @ts-ignore
export const $$observable: unique symbol =
  typeof Symbol === 'function'
    ? (Symbol as any).observable ||
      (Symbol.for ? Symbol.for('observable') : Symbol('observable'))
    : ('@@observable' as any)
