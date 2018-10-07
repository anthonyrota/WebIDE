import { setImmediate } from 'src/utils/setImmediate'

export function asyncReportError(error: unknown): void {
  setImmediate(() => {
    throw error
  })
}
