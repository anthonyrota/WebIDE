import { IOperator } from 'src/models/Stream/IOperator'
import { takeLast } from 'src/models/Stream/StreamOperators/takeLast'

export function last<T>(): IOperator<T, T> {
  return takeLast(1)
}
