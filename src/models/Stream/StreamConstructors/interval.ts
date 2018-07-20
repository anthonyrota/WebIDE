import { IDisposableLike } from 'src/models/Disposable/IDisposableLike'
import { Stream } from 'src/models/Stream/Stream'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'
import { setInterval } from 'src/utils/setInterval'

export function interval(delay: number): Stream<number> {
  return new IntervalStream(delay)
}

class IntervalStream extends Stream<number> {
  constructor(private __delay: number) {
    super()
  }

  protected trySubscribe(
    target: MonoTypeValueTransmitter<number>
  ): IDisposableLike {
    return setInterval(
      intervalCallback.bind(null, { target, counter: 0 }),
      this.__delay
    )
  }
}

function intervalCallback(state: {
  target: MonoTypeValueTransmitter<number>
  counter: number
}): void {
  state.target.next(state.counter)
  state.counter++
}
