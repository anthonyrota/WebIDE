export const $$iterator: symbol =
  typeof Symbol !== 'undefined' && Symbol.iterator
    ? Symbol.iterator
    : ('@@iterator' as any)
