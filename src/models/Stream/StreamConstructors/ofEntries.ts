import { RawStream, Stream } from 'src/models/Stream/Stream'
import { keys } from 'src/utils/keys'

export function ofEntries<T>(
  object: T
): Stream<{ [K in keyof T]: [K, T[K]] }[keyof T]> {
  return new RawStream(target => {
    const objectKeys = keys(object)

    for (let i = 0; i < keys.length && target.isReceivingValues(); i++) {
      const key = objectKeys[i] as keyof T

      if (object.hasOwnProperty(key)) {
        target.next([key, object[key]])
      }
    }

    target.complete()
  })
}
