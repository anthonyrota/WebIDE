import { IScheduler } from 'src/models/Scheduler/Scheduler'
import { RawStream, Stream } from 'src/models/Stream/Stream'

export function rangeScheduled(
  count: number,
  scheduler: IScheduler
): Stream<number>
export function rangeScheduled(
  start: number,
  stop: number,
  scheduler: IScheduler
): Stream<number>
export function rangeScheduled(
  start: number,
  stop: number,
  step: number,
  scheduler: IScheduler
): Stream<number>
export function rangeScheduled(
  countOrStart: number,
  schedulerOrStop: IScheduler | number,
  nothingOrSchedulerOrStep?: IScheduler | number,
  nothingOrScheduler?: IScheduler
): Stream<number> {
  let first: number
  let last: number
  let step: number
  let scheduler: IScheduler

  if (nothingOrSchedulerOrStep == null) {
    first = 0
    last = countOrStart
  } else if (nothingOrScheduler == null) {
    first = countOrStart
    last = schedulerOrStop as number
    step = 1
    scheduler = nothingOrSchedulerOrStep as IScheduler
  } else {
    first = countOrStart
    last = schedulerOrStop as number
    step = nothingOrSchedulerOrStep as number
    scheduler = nothingOrScheduler
  }

  return new RawStream<number>(target => {
    return scheduler.scheduleWithData<number>((current, action) => {
      if (step > 0) {
        if (current >= last) {
          target.complete()
          return
        }
      } else {
        if (current <= last) {
          target.complete()
          return
        }
      }

      target.next(current)
      action.scheduleWithData(current + step)
    }, first)
  })
}
