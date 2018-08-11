import { DisposableLike } from 'src/models/Disposable/DisposableLike'
import { IOperator } from 'src/models/Stream/IOperator'
import { ISubscriber } from 'src/models/Stream/ISubscriber'
import { Stream } from 'src/models/Stream/Stream'

export function copySource<T>(): IOperator<T, T> {
  return new CopySourceOperator<T>()
}

class CopySourceOperator<T> implements IOperator<T, T> {
  public connect(target: ISubscriber<T>, source: Stream<T>): DisposableLike {
    return source.subscribe(target)
  }
}
