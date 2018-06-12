import { curry3 } from 'src/utils/curry'

export const pluck2: {
  <TObject, TKey1 extends keyof TObject, TKey2 extends keyof TObject[TKey1]>(
    key1: TKey1
  ): (key2: TKey2) => (object: TObject) => TObject[TKey1][TKey2]
  <TObject, TKey1 extends keyof TObject, TKey2 extends keyof TObject[TKey1]>(
    key1: TKey1,
    key2: TKey2
  ): (object: TObject) => TObject[TKey1][TKey2]
  <TObject, TKey1 extends keyof TObject, TKey2 extends keyof TObject[TKey1]>(
    key1: TKey1,
    key2: TKey2,
    object: TObject
  ): TObject[TKey1][TKey2]
} = curry3(
  <TObject, TKey1 extends keyof TObject, TKey2 extends keyof TObject[TKey1]>(
    key1: TKey1,
    key2: TKey2,
    object: TObject
  ): TObject[TKey1][TKey2] => {
    return object[key1][key2]
  }
)
