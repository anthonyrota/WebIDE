import { IScheduler } from 'src/models/Scheduler/Scheduler'
import { IESInteropObservable } from 'src/models/Stream/ESObservable'
import { ESObservableSubscriptionDisposable } from 'src/models/Stream/ESObservableSubscriptionDisposable'
import { ScheduledSubscriber } from 'src/models/Stream/ScheduledSubscriber'
import { RawStream, Stream } from 'src/models/Stream/Stream'
import { toESObservable } from 'src/utils/toESObservable'

export function fromObservableScheduled<T>(
  input: IESInteropObservable<T>,
  scheduler: IScheduler
): Stream<T> {
  return new RawStream(target => {
    return scheduler.schedule(() => {
      target.terminateDisposableWhenStopsReceivingValues(
        new ESObservableSubscriptionDisposable(
          toESObservable(input).subscribe(
            new ScheduledSubscriber(target, scheduler)
          )
        )
      )
    })
  })
}
