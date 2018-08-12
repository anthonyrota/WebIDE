import { IScheduler } from 'src/models/Scheduler/Scheduler'
import { sync } from 'src/models/Scheduler/sync'
import { RawStream, Stream } from 'src/models/Stream/Stream'

export function delayedComplete(
  delayTime: number,
  scheduler: IScheduler = sync
): Stream<never> {
  return new RawStream(target => {
    return scheduler.scheduleDelayed(() => {
      target.complete()
    }, delayTime)
  })
}
