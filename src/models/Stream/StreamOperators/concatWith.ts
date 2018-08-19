import { DisposableLike } from 'src/models/Disposable/DisposableLike'
import { IOperator } from 'src/models/Stream/IOperator'
import { ISubscriber } from 'src/models/Stream/ISubscriber'
import { Stream } from 'src/models/Stream/Stream'
import { concat } from 'src/models/Stream/StreamConstructors/concat'

export function concatWith<T>(...streams: Array<Stream<T>>): IOperator<T, T> {
  return new ConcatWithOperator<T>(streams)
}

class ConcatWithOperator<T> implements IOperator<T, T> {
  constructor(private streams: Array<Stream<T>>) {}

  public connect(target: ISubscriber<T>, source: Stream<T>): DisposableLike {
    return concat(source, ...this.streams).subscribe(target)
  }
}
