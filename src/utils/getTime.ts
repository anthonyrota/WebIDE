export const getTime =
  typeof performance !== 'undefined' && 'now' in performance
    ? () => performance.now()
    : typeof Date.now !== 'undefined'
      ? () => Date.now()
      : () => new Date().getTime()
