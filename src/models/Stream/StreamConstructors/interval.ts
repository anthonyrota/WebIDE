import { RawStream, Stream } from 'src/models/Stream/Stream'
import { setInterval } from 'src/utils/setInterval'

export function interval(delay: number): Stream<number> {
  return new RawStream<number>(target => {
    let index = 0

    return setInterval(() => {
      target.next(index)
      index += 1
    }, delay)
  })
}
