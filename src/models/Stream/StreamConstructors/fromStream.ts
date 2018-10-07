import { IInteropStream, Stream, streamLabel } from '../Stream'

export function fromStream<T>(input: IInteropStream<T>): Stream<T> {
  return input[streamLabel]()
}
