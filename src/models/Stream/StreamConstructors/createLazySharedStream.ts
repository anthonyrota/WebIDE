import { ISubscription } from 'src/models/Disposable/Subscription'
import { IControlledStream } from 'src/models/Stream/ControlledStream'
import { RawStream, Stream } from 'src/models/Stream/Stream'

export function createLazySharedStream<T>(
  source: Stream<T>,
  createControlledStream: () => IControlledStream<T, T>
): Stream<T> {
  let subscriptionsCount: number = 0
  let sharedControlledStream: IControlledStream<T, T> | null = null
  let sourceSubscription: ISubscription | null = null

  return new RawStream<T>(target => {
    subscriptionsCount += 1

    if (subscriptionsCount === 1) {
      if (!sharedControlledStream) {
        sharedControlledStream = createControlledStream()
      }

      sharedControlledStream.subscribe(target)
      sourceSubscription = source.subscribe(sharedControlledStream)
    } else {
      sharedControlledStream!.subscribe(target)
    }

    return () => {
      subscriptionsCount -= 1

      if (subscriptionsCount === 0 && sourceSubscription) {
        sourceSubscription.dispose()
        sourceSubscription = null
      }
    }
  })
}
