import { RawStream, Stream } from 'src/models/Stream/Stream'

export function generateForever<T>(
  initialState: T,
  updateState: (state: T) => T
): Stream<T> {
  return new RawStream<T>(target => {
    let state: T = initialState

    while (target.isReceivingValues()) {
      target.next(state)

      if (!target.isReceivingValues()) {
        return
      }

      try {
        state = updateState(state)
      } catch (error) {
        target.error(error)
        return
      }
    }
  })
}
