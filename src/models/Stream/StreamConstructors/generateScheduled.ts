import {
  IScheduler,
  ISchedulerActionWithoutData
} from 'src/models/Scheduler/Scheduler'
import { RawStream, Stream } from 'src/models/Stream/Stream'

export function generate<T>(
  initialState: T,
  isStateValid: (state: T) => boolean,
  updateState: (state: T) => T,
  scheduler: IScheduler
): Stream<T> {
  return new RawStream<T>(target => {
    let state: T = initialState
    let isPassedInitialState: boolean = false

    return scheduler.schedule((action: ISchedulerActionWithoutData) => {
      if (isPassedInitialState) {
        try {
          state = updateState(state)
        } catch (error) {
          target.error(error)
          return
        }
      } else {
        isPassedInitialState = true
      }

      if (!target.isReceivingValues()) {
        return
      }

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
      action.schedule()
    })
  })
}
