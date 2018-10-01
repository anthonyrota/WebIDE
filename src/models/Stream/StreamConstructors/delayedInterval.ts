import { RawStream, Stream } from 'src/models/Stream/Stream'
import { setInterval } from 'src/utils/setInterval'

export function delayedInterval(
  startAfter: number,
  delayBetweenNumbers: number
): Stream<number> {
  return new RawStream<number>(target => {
    let index = 0

    return setTimeout(() => {
      target.addOnStopReceivingValues(
        setInterval(() => {
          target.next(index)
          index += 1
        }, delayBetweenNumbers)
      )
    }, startAfter)
  })
}
