import { Stream } from 'src/models/Stream/Stream'

export type UnwrapFromStreams<T extends any[]> = {
  [K in keyof T]: T[K] extends Stream<infer U> ? U : never
}
