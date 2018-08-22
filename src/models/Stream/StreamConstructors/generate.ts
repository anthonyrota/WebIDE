import { RawStream, Stream } from 'src/models/Stream/Stream'

export function generate<T>(
  initialState: T,
  isStateValid: (state: T) => boolean,
  updateState: (state: T) => T
): Stream<T> {
  return new RawStream<T>(target => {
    let state: T = initialState

    while (target.isReceivingValues()) {
      let shouldContinueGeneratingStates: boolean

      try {
        shouldContinueGeneratingStates = isStateValid(state)
      } catch (error) {
        target.error(error)
        return
      }

      if (!shouldContinueGeneratingStates) {
        target.complete()
        return
      }

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
