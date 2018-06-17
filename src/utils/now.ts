export const now =
  typeof performance !== 'undefined' && 'now' in performance
    ? () => performance.now()
    : () => Date.now()
