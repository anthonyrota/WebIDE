import { Operation } from 'src/models/Stream/Operation'
import { map } from 'src/models/Stream/StreamOperators/map'

export function pluck<T, K extends keyof T>(key: K): Operation<T, T[K]> {
  return map(item => item[key])
}
