import { assert } from 'chai'
import { fake } from 'sinon'
import { Disposable } from './IDisposable'

describe('Disposable', () => {
  it('is defined', () => {
    assert.exists(Disposable)
  })

  it('is a function', () => {
    assert.isFunction(Disposable)
  })

  it('should provide a constructor', () => {
    assert(new Disposable(() => {}) instanceof Disposable)
  })

  it('should wrap a dispose function', () => {
    const dispose = fake()
    const disposable = new Disposable(dispose)
    assert(dispose.notCalled)
    disposable.dispose()
    assert(dispose.calledOnce)
  })

  it('should make sure that the dispose function can only be called once', () => {
    const dispose = fake()
    const disposable = new Disposable(dispose)
    disposable.dispose()
    disposable.dispose()
    assert(dispose.calledOnce)
  })

  it('should pass no arguments to the dispose function', () => {
    const dispose = fake()
    const disposable = new Disposable(dispose)
    disposable.dispose()
    assert(dispose.calledWith())
  })

  it('should pass through errors once', () => {
    const message = 'fake.throws() threw an error'
    const dispose = fake.throws(message)
    const disposable = new Disposable(dispose)
    assert.throws(() => disposable.dispose(), message)
    assert.doesNotThrow(() => disposable.dispose())
  })
})
