import { setImmediate } from 'src/utils/setImmediate'

export function asyncReportError(error: any): void {
  setImmediate(() => {
    throw error
  })
}
