import { DisposableLike } from 'src/models/Disposable/DisposableLike'
import { IScheduler } from 'src/models/Scheduler/Scheduler'
import { IOperator } from 'src/models/Stream/IOperator'
import { ISubscriber } from 'src/models/Stream/ISubscriber'
import { Stream } from 'src/models/Stream/Stream'
import { concatScheduled } from 'src/models/Stream/StreamConstructors/concatScheduled'

export function concatScheduledWith<T>(
  streams: Array<Stream<T>>,
  scheduler: IScheduler
): IOperator<T, T> {
  return new ConcatScheduledWithOperator<T>(streams, scheduler)
}

class ConcatScheduledWithOperator<T> implements IOperator<T, T> {
  constructor(
    private streams: Array<Stream<T>>,
    private scheduler: IScheduler
  ) {}

  public connect(target: ISubscriber<T>, source: Stream<T>): DisposableLike {
    return concatScheduled([source, ...this.streams], this.scheduler).subscribe(
      target
    )
  }
}
