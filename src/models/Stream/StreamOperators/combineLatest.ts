import { DisposableLike } from 'src/models/Disposable/DisposableLike'
import { IOperator } from 'src/models/Stream/IOperator'
import { ISubscriber } from 'src/models/Stream/ISubscriber'
import { Stream } from 'src/models/Stream/Stream'
import { combineLatest } from 'src/models/Stream/StreamConstructors/combineLatest'

export function combineLatestWith<T>(): IOperator<T, [T]>
export function combineLatestWith<T, T2>(
  stream2: Stream<T2>
): IOperator<T, [T, T2]>
export function combineLatestWith<T, T2, T3>(
  stream2: Stream<T2>,
  stream3: Stream<T3>
): IOperator<T, [T, T2, T3]>
export function combineLatestWith<T, T2, T3, T4>(
  stream2: Stream<T2>,
  stream3: Stream<T3>,
  stream4: Stream<T4>
): IOperator<T, [T, T2, T3, T4]>
export function combineLatestWith<T, T2, T3, T4, T5>(
  stream2: Stream<T2>,
  stream3: Stream<T3>,
  stream4: Stream<T4>,
  stream5: Stream<T5>
): IOperator<T, [T, T2, T3, T4, T5]>
export function combineLatestWith<T, T2, T3, T4, T5, T6>(
  stream2: Stream<T2>,
  stream3: Stream<T3>,
  stream4: Stream<T4>,
  stream5: Stream<T5>,
  stream6: Stream<T6>
): IOperator<T, [T, T2, T3, T4, T5, T6]>
export function combineLatestWith<T>(
  ...streams: Array<Stream<T>>
): IOperator<T, T[]>
export function combineLatestWith<T>(
  ...streams: Array<Stream<T>>
): IOperator<T, T[]> {
  return new CombineLatestWithOperator<T>(streams)
}

class CombineLatestWithOperator<T> implements IOperator<T, T[]> {
  constructor(private streams: Array<Stream<T>>) {}

  public connect(target: ISubscriber<T[]>, source: Stream<T>): DisposableLike {
    return combineLatest(source, ...this.streams).subscribe(target)
  }
}
