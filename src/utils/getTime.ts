export const getTime =
  typeof performance !== 'undefined' && 'now' in performance
    ? () => performance.now()
    : () => Date.now()
