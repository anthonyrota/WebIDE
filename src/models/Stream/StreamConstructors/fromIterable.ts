import { IDisposableLike } from 'src/models/Disposable/IDisposableLike'
import { Stream } from 'src/models/Stream/Stream'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'
import { callIteratorReturn } from 'src/utils/callIteratorReturn'
import { $$iterator } from 'src/utils/iteratorSymbol'

export function fromIterable<T>(iterable: Iterable<T>): Stream<T> {
  return new FromIterableStream<T>(iterable)
}

class FromIterableStream<T> extends Stream<T> {
  constructor(private __iterable: Iterable<T>) {
    super()
  }

  public trySubscribe(target: MonoTypeValueTransmitter<T>): IDisposableLike {
    const iterator: IterableIterator<T> = this.__iterable[$$iterator]()

    while (target.isReceivingValues()) {
      const item = iterator.next()

      if (item.done) {
        target.complete()
        break
      }

      target.next(item.value)
    }

    if (typeof iterator.return === 'function') {
      target.onDispose(callIteratorReturn.bind(null, iterator))
    }
  }
}
