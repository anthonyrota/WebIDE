import { setImmediate } from 'src/utils/setImmediate'

export function asyncReportError(error: unknown): void {
  setImmediate(throwError.bind(null, error))
}

function throwError(error: unknown): void {
  throw error
}
