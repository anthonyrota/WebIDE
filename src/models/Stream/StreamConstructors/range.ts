import { RawStream, Stream } from 'src/models/Stream/Stream'

export function range(count: number): Stream<number>
export function range(
  start: number,
  stop: number,
  step?: number
): Stream<number>
export function range(
  start: number,
  stop?: number,
  step: number = 1
): Stream<number> {
  const first = stop == null ? 0 : start
  const last = stop == null ? start : stop

  return new RawStream<number>(target => {
    if (step > 0) {
      for (let i = first; i < last && target.isReceivingValues(); i += step) {
        target.next(i)
      }
    } else {
      for (let i = first; i > last && target.isReceivingValues(); i += step) {
        target.next(i)
      }
    }
  })
}
