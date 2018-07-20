import { setImmediate } from 'src/utils/setImmediate'

export function asyncReportError(error: any): void {
  setImmediate(throwError.bind(null, error))
}

function throwError(error: any): void {
  throw error
}
