import { assert } from 'chai'
import { AlreadyDisposedError } from 'src/models/Disposable/AlreadyDisposedError'

describe('AlreadyDisposedError', () => {
  it('is defined', () => {
    assert.exists(AlreadyDisposedError)
  })

  it('is an error', () => {
    assert.instanceOf(new AlreadyDisposedError(), Error)
  })

  it('has the correct name', () => {
    assert.strictEqual(new AlreadyDisposedError().name, 'AlreadyDisposedError')
  })

  it('has the correct message', () => {
    assert.strictEqual(
      new AlreadyDisposedError().message,
      'The object is already disposed'
    )
  })
})
