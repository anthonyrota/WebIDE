import { assert } from 'chai'
import { fake, SinonSpy } from 'sinon'
import { asyncReportError } from './asyncReportError'
import { setImmediate } from './setImmediate'

jest.mock('./setImmediate', () => ({
  setImmediate: fake()
}))

describe('asyncReportError', () => {
  it('should call the setImmediate function', () => {
    asyncReportError(new Error())
    assert((setImmediate as SinonSpy).calledOnce)
  })

  it('should call the setImmediate function with a callback function', () => {
    asyncReportError(new Error())
    assert((setImmediate as SinonSpy).lastCall != null)
    const args = (setImmediate as SinonSpy).lastCall.args
    const callback = args[0]
    assert.strictEqual(args.length, 1)
    assert.typeOf(callback, 'function')
  })

  it('should call the setImmediate function with a callback function that will throw the given error', () => {
    const message = '[testing] an error occurred'
    asyncReportError(new TypeError(message))
    assert((setImmediate as SinonSpy).lastCall != null)
    const args = (setImmediate as SinonSpy).lastCall.args
    const callback = args[0]
    assert.throws(() => callback(), TypeError, message)
  })
})
