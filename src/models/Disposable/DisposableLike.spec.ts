import { assert } from 'chai'
import { fake } from 'sinon'
import { disposeDisposableLike } from './DisposableLike'

describe('disposeDisposableLike', () => {
  it('is defined', () => {
    assert.exists(disposeDisposableLike)
  })

  it('is a function', () => {
    assert.isFunction(disposeDisposableLike)
  })

  describe('when given nothing as a parameter', () => {
    it('should not error', () => {
      assert.doesNotThrow(() => disposeDisposableLike(undefined))
    })

    it('returns undefined', () => {
      assert.isUndefined(disposeDisposableLike(undefined))
    })
  })

  describe('when given functions as parameters', () => {
    it('should call them immediately and once', () => {
      const dispose = fake()
      disposeDisposableLike(dispose)
      assert(dispose.calledOnce)
    })

    it('should return undefined', () => {
      const result = disposeDisposableLike(() => 2)
      assert.isUndefined(result)
    })

    it('should pass no arguments to the function', () => {
      const dispose = fake()
      disposeDisposableLike(dispose)
      assert(dispose.calledWith())
    })

    it('should pass through errors', () => {
      const message = 'fake.throws() errored'
      const error = new Error(message)
      const dispose = fake.throws(error)
      assert.throws(() => disposeDisposableLike(dispose), message)
    })
  })

  describe('when given disposables as parameters', () => {
    it('should dispose them immediately and once', () => {
      const dispose = fake()
      const disposable = { dispose }
      disposeDisposableLike(disposable)
      assert(dispose.calledOnce)
    })

    it('should not alter the disposable', () => {
      const dispose = fake()
      const disposable = { dispose }
      const oldKeys = Reflect.ownKeys(disposable)
      disposeDisposableLike(disposable)
      const newKeys = Reflect.ownKeys(disposable)
      assert.deepEqual(oldKeys, newKeys)
      assert.strictEqual(disposable.dispose, dispose)
    })

    it('should return undefined', () => {
      const result = disposeDisposableLike({ dispose: () => 2 })
      assert.isUndefined(result)
    })

    it('should pass no arguments to the function', () => {
      const dispose = fake()
      const disposable = { dispose }
      disposeDisposableLike(disposable)
      assert(dispose.calledWith())
    })

    it('should pass through errors', () => {
      const message = 'fake.throws() errored'
      const error = new Error(message)
      const dispose = fake.throws(error)
      const disposable = { dispose }
      assert.throws(() => disposeDisposableLike(disposable), message)
    })
  })
})
