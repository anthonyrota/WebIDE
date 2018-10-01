import { IScheduler } from 'src/models/Scheduler/Scheduler'
import { Operation, transform } from 'src/models/Stream/Operation'
import { concat } from '../StreamConstructors/concat'
import { fromArrayScheduled } from '../StreamConstructors/fromArrayScheduled'

export function endWithScheduled<T>(
  values: T[],
  scheduler: IScheduler
): Operation<T, T> {
  return transform(source =>
    concat(source, fromArrayScheduled(values, scheduler))
  )
}
