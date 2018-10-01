import { ISubscription } from 'src/models/Disposable/Subscription'
import { ISubscriptionTarget } from 'src/models/Stream/ISubscriptionTarget'
import { IControlledStream } from '../ControlledStream'
import { createReplayedControlledStream } from '../createReplayedControlledStream'
import { operateCurried, Operation } from '../Operation'

export function shareReplayed<T>(
  bufferSize?: number,
  timeLimit?: number
): Operation<T, T> {
  return operateCurried(source => {
    let replayed: IControlledStream<T, T> | null = null
    let subscriptionsCount = 0
    let sourceSubscription: ISubscription
    let hasReceivedError = false
    let isSourceCompleted = false

    return (target: ISubscriptionTarget<T>) => {
      subscriptionsCount += 1

      if (!replayed || hasReceivedError) {
        hasReceivedError = false
        replayed = createReplayedControlledStream(bufferSize, timeLimit)
        sourceSubscription = source.subscribe({
          next: value => replayed!.next(value),
          error: error => {
            hasReceivedError = true
            replayed!.error(error)
          },
          complete: () => {
            isSourceCompleted = true
            replayed!.complete()
          }
        })
      }

      const sharedSubscription = replayed.subscribe(target)

      return () => {
        subscriptionsCount -= 1
        sharedSubscription.dispose()
        if (
          sourceSubscription &&
          subscriptionsCount === 0 &&
          isSourceCompleted
        ) {
          sourceSubscription.dispose()
        }
      }
    }
  })
}
