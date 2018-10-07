import { IScheduler } from 'src/models/Scheduler/Scheduler'
import { Operation, transform } from '../Operation'
import { concat } from '../StreamConstructors/concat'
import { fromArrayScheduled } from '../StreamConstructors/fromArrayScheduled'

export function startWith<T>(
  values: T[],
  scheduler: IScheduler
): Operation<T, T> {
  return transform(source =>
    concat(fromArrayScheduled(values, scheduler), source)
  )
}
