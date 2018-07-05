// import { Stream } from "src/models/Stream/Stream/Stream";
// import { curry2 } from "src/utils/curry";

// export const map: {
//   <T, U>(transform: (value: T) => U): (stream: Stream<T>) => Stream<U>
//   <T, U>(transform: (value: T) => U, stream: Stream<T>): Stream<U>
// } = curry2(
//   <T, U>(transform: (value: T) => U, stream: Stream<T>): Stream<U> => {
//     return new Stream<U>(source => {
//       stream.subscribeToSourceWithOnNextValueListener(source, (value: T) => {
//         source.next(transform(value))
//       })
//     })
//   }
// )
