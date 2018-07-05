// import { Stream } from 'src/models/Stream/Stream/Stream'
// import { curry2 } from 'src/utils/curry'

// export const filter: {
//   <T>(predicate: (value: T) => boolean): (stream: Stream<T>) => Stream<T>
//   <T>(predicate: (value: T) => boolean, stream: Stream<T>): Stream<T>
// } = curry2(
//   <T>(predicate: (value: T) => boolean, stream: Stream<T>): Stream<T> => {
//     return new Stream<T>(source => {
//       return stream.subscribeToSourceWithOnNextValueListener(
//         source,
//         (value: T) => {
//           if (predicate(value)) {
//             source.next(value)
//           }
//         }
//       )
//     })
//   }
// )
