import { assert } from 'chai'
import { isDisposable } from 'src/models/Disposable/isDisposable'
import { assign } from 'src/utils/assign'

describe('isDisposable', () => {
  it('is defined', () => {
    assert.exists(isDisposable)
  })

  it('is a function', () => {
    assert.isFunction(isDisposable)
  })

  it('returns false for nullish values', () => {
    assert.isFalse(isDisposable(null))
    assert.isFalse(isDisposable(undefined))
  })

  describe('object values', () => {
    it('returns false if the value does not have a `dispose` property', () => {
      assert.isFalse(isDisposable({}))
      assert.isFalse(isDisposable({ method() {} }))
      assert.isFalse(isDisposable({ property: false }))
    })

    it('returns false if the `dispose` property is not a callable function', () => {
      assert.isFalse(isDisposable({ dispose: false }))
      assert.isFalse(isDisposable({ dispose: 2 }))
      assert.isFalse(isDisposable({ dispose: new Date() }))
      assert.isFalse(isDisposable({ dispose: {} }))
    })

    it('returns true if the value has a `dispose` method', () => {
      assert.isTrue(isDisposable({ dispose() {} }))
      assert.isTrue(
        isDisposable({
          *dispose() {
            yield 2
          }
        })
      )
      assert.isTrue(
        isDisposable({
          async *dispose() {
            yield 'foo'
          }
        })
      )
      assert.isTrue(isDisposable({ async dispose() {} }))
    })
  })

  describe('function values', () => {
    it('returns false if the value does not have a `dispose` property', () => {
      assert.isFalse(isDisposable(assign(() => {}, {})))
      assert.isFalse(isDisposable(assign(() => {}, { method() {} })))
      assert.isFalse(isDisposable(assign(() => {}, { property: false })))
    })

    it('returns false if the `dispose` property is not a function', () => {
      assert.isFalse(isDisposable(assign(() => {}, { dispose: false })))
      assert.isFalse(isDisposable(assign(() => {}, { dispose: 2 })))
      assert.isFalse(isDisposable(assign(() => {}, { dispose: new Date() })))
      assert.isFalse(isDisposable(assign(() => {}, { dispose: {} })))
    })

    it('returns true if the value has a `dispose` method', () => {
      assert.isTrue(isDisposable(assign(() => {}, { dispose() {} })))
      assert.isTrue(
        isDisposable(
          assign(() => {}, {
            *dispose() {
              yield 2
            }
          })
        )
      )
      assert.isTrue(
        isDisposable(
          assign(() => {}, {
            async *dispose() {
              yield 'foo'
            }
          })
        )
      )
      assert.isTrue(isDisposable(assign(() => {}, { async dispose() {} })))
    })
  })

  describe('other values', () => {
    it('returns false if the value does not have a `dispose` property', () => {
      assert.isFalse(isDisposable(assign(false, {})))
      assert.isFalse(isDisposable(assign(NaN, { method() {} })))
      assert.isFalse(isDisposable(assign(true, { property: false })))
      assert.isFalse(isDisposable(assign([2, 4], {})))
      assert.isFalse(isDisposable(assign([], { method() {} })))
      assert.isFalse(isDisposable(assign(Infinity, { property: false })))
      assert.isFalse(isDisposable(assign(0, {})))
      assert.isFalse(isDisposable(assign(-24, { method() {} })))
      assert.isFalse(isDisposable(assign(Symbol(), { property: false })))
      assert.isFalse(isDisposable(assign(Symbol.for('a string'), {})))
      assert.isFalse(
        isDisposable(assign(Symbol('another string'), { method() {} }))
      )
    })

    it('returns false if the `dispose` property is not a callable function', () => {
      assert.isFalse(isDisposable({ dispose: false }))
      assert.isFalse(isDisposable({ dispose: 2 }))
      assert.isFalse(isDisposable({ dispose: new Date() }))
      assert.isFalse(isDisposable({ dispose: {} }))
    })

    it('returns true if the value has a `dispose` method', () => {
      assert.isTrue(isDisposable({ dispose() {} }))
      assert.isTrue(
        isDisposable({
          *dispose() {
            yield 2
          }
        })
      )
      assert.isTrue(
        isDisposable({
          async *dispose() {
            yield 'foo'
          }
        })
      )
      assert.isTrue(isDisposable({ async dispose() {} }))
    })
  })
})
