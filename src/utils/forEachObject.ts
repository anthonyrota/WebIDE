import { curry2 } from 'src/utils/curry'

export const forEachObject: {
  <TObject>(
    touch: <TKey extends keyof TObject>(value: TObject[TKey], key: TKey) => void
  ): (object: TObject) => void
  <TObject>(
    touch: <TKey extends keyof TObject>(value: TObject[TKey], key: TKey) => void,
    object: TObject
  ): void
} = curry2(
  <TObject>(
    touch: <TKey extends keyof TObject>(
      value: TObject[TKey],
      key: TKey
    ) => void,
    object: TObject
  ): void => {
    for (const key in object) {
      if (Object.prototype.hasOwnProperty.call(object, key)) {
        touch(object[key], key)
      }
    }
  }
}
