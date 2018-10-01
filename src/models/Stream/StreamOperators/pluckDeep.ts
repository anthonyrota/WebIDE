import { map } from 'src/models/Stream/StreamOperators/map'
import { Head, Tail } from 'src/types/utils'
import { Operation } from '../Operation'

type IndexDeep<
  T,
  TPath extends Array<string | number>,
  TFirstProperty = Head<TPath>
> = {
  0: T
  1: TFirstProperty extends keyof T
    ? IndexDeep<T[TFirstProperty], Tail<TPath>>
    : never
}[TPath extends [] ? 0 : 1]

export function pluckDeep<T, TPath extends Array<string | number>>(
  ...path: TPath
): Operation<T, IndexDeep<T, TPath>> {
  return map((item: any) => {
    for (let i = 0; i < path.length; i++) {
      item = item[path[i]]
    }
    return item
  })
}
