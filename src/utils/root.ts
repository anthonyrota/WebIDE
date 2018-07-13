declare var WorkerGlobalScope: any

const windowGlobal = typeof window !== 'undefined' ? window : null
const globalGlobal = typeof global !== 'undefined' ? global : null
const selfGlobal =
  typeof self !== 'undefined' &&
  typeof WorkerGlobalScope !== 'undefined' &&
  self instanceof WorkerGlobalScope
    ? self
    : null

export const root: any = windowGlobal || globalGlobal || selfGlobal
