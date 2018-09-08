import { RawStream, Stream } from 'src/models/Stream/Stream'

export function throwError(error: unknown): Stream<never> {
  return new RawStream(target => {
    target.error(error)
  })
}
