import { curry2 } from 'src/utils/curry'

export const pluck: {
  <TObject, TKey extends keyof TObject>(key: TKey): (
    object: TObject
  ) => TObject[TKey]
  <TObject, TKey extends keyof TObject>(
    key: TKey,
    object: TObject
  ): TObject[TKey]
} = curry2(
  <TObject, TKey extends keyof TObject>(
    key: TKey,
    object: TObject
  ): TObject[TKey] => {
    return object[key]
  }
)
