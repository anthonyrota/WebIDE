import { assert } from 'chai'
import * as sinon from 'sinon'
import {
  emptySubscription,
  isSubscription,
  isSubscriptionPropertyKey,
  Subscription
} from 'src/models/Disposable/Subscription'
import { assign } from 'src/utils/assign'

describe('isSubscriptionPropertyKey', () => {
  it('is defined', () => {
    assert.exists(isSubscriptionPropertyKey)
  })

  it('is a string', () => {
    assert.isString(isSubscriptionPropertyKey)
  })
})

describe('isSubscription', () => {
  it('is defined', () => {
    assert.exists(isSubscription)
  })

  it('is a function', () => {
    assert.isFunction(isSubscription)
  })

  it('returns false for nullish values', () => {
    assert.isFalse(isSubscription(null))
    assert.isFalse(isSubscription(undefined))
  })

  describe('object values', () => {
    it('returns true if the value has the `isSubscriptionPropertyKey` property equal to true', () => {
      assert.isTrue(isSubscription({ [isSubscriptionPropertyKey]: true }))
      assert.isTrue(
        isSubscription({
          [isSubscriptionPropertyKey]: true,
          property: 'another property'
        })
      )
    })

    it('returns false if the value is empty', () => {
      assert.isFalse(isSubscription({}))
    })

    it('returns false if the value does not have the `isSubscriptionPropertyKey` property', () => {
      assert.isFalse(isSubscription({ isSubscriptionPropertyKey: true }))
      assert.isFalse(isSubscription({ property: 'another property' }))
    })

    it('returns false if the value has the `isSubscriptionPropertyKey` property not equal to true', () => {
      assert.isFalse(isSubscription({ [isSubscriptionPropertyKey]: false }))
      assert.isFalse(isSubscription({ [isSubscriptionPropertyKey]: 2 }))
      assert.isFalse(isSubscription({ [isSubscriptionPropertyKey]: {} }))
    })
  })

  describe('numeric values', () => {
    it('returns true if the value has the `isSubscriptionPropertyKey` property equal to true', () => {
      assert.isTrue(
        isSubscription(assign(0, { [isSubscriptionPropertyKey]: true }))
      )
      assert.isTrue(
        isSubscription(
          assign(Infinity, {
            [isSubscriptionPropertyKey]: true,
            property: 'another property'
          })
        )
      )
    })

    it('returns false if the value has no additional properties', () => {
      assert.isFalse(isSubscription(-40))
      assert.isFalse(isSubscription(0))
      assert.isFalse(isSubscription(-Infinity))
      assert.isFalse(isSubscription(NaN))
    })

    it('returns false if the value does not have the `isSubscriptionPropertyKey` property', () => {
      assert.isFalse(
        isSubscription(assign(Infinity, { isSubscriptionPropertyKey: true }))
      )
      assert.isFalse(
        isSubscription(assign(NaN, { property: 'another property' }))
      )
      assert.isFalse(
        isSubscription(assign(-8, { property: 'another property' }))
      )
    })

    it('returns false if the value has the `isSubscriptionPropertyKey` property not equal to true', () => {
      assert.isFalse(
        isSubscription(assign(0, { [isSubscriptionPropertyKey]: false }))
      )
      assert.isFalse(
        isSubscription(assign(87, { [isSubscriptionPropertyKey]: 2 }))
      )
      assert.isFalse(
        isSubscription(assign(NaN, { [isSubscriptionPropertyKey]: {} }))
      )
    })
  })

  describe('string values', () => {
    it('returns true if the value has the `isSubscriptionPropertyKey` property equal to true', () => {
      assert.isTrue(
        isSubscription(assign('', { [isSubscriptionPropertyKey]: true }))
      )
      assert.isTrue(
        isSubscription(
          assign('some string', {
            [isSubscriptionPropertyKey]: true,
            property: 'another property'
          })
        )
      )
    })

    it('returns false if the value has no additional properties', () => {
      assert.isFalse(isSubscription('Iñtërnâtiônàlizætiøn☃💩'))
      assert.isFalse(isSubscription(''))
    })

    it('returns false if the value does not have the `isSubscriptionPropertyKey` property', () => {
      assert.isFalse(
        isSubscription(
          assign('Iñtërnâtiônàlizætiøn☃💩', { property: 'another property' })
        )
      )
      assert.isFalse(
        isSubscription(assign('', { isSubscriptionPropertyKey: true }))
      )
    })

    it('returns false if the value has the `isSubscriptionPropertyKey` property not equal to true', () => {
      assert.isFalse(
        isSubscription(assign('Z͑ͫ̓ͪ̂ͫ̽͏̴̙̤̞͉͚̯̞̠͍A̴̵̜̰͔ͫ͗͢L̠ͨͧͩ͘G̴̻͈͍͔̹̑͗̎̅͛́Ǫ̵̹̻̝̳͂̌̌͘!͖̬̰̙̗̿̋ͥͥ̂ͣ̐́́͜͞', { [isSubscriptionPropertyKey]: false }))
      )
      assert.isFalse(
        isSubscription(assign('', { [isSubscriptionPropertyKey]: {} }))
      )
      assert.isFalse(
        isSubscription(
          assign('Iñtërnâtiônàlizætiøn☃💩', { [isSubscriptionPropertyKey]: 2 })
        )
      )
    })
  })

  describe('boolean values', () => {
    it('returns true if the value has the `isSubscriptionPropertyKey` property equal to true', () => {
      assert.isTrue(
        isSubscription(assign(false, { [isSubscriptionPropertyKey]: true }))
      )
      assert.isTrue(
        isSubscription(
          assign(true, {
            [isSubscriptionPropertyKey]: true,
            property: 'another property'
          })
        )
      )
    })

    it('returns false if the value has no additional properties', () => {
      assert.isFalse(isSubscription(false))
      assert.isFalse(isSubscription(true))
    })

    it('returns false if the value does not have the `isSubscriptionPropertyKey` property', () => {
      assert.isFalse(
        isSubscription(assign(true, { isSubscriptionPropertyKey: true }))
      )
      assert.isFalse(
        isSubscription(assign(false, { property: 'another property' }))
      )
    })

    it('returns false if the value has the `isSubscriptionPropertyKey` property not equal to true', () => {
      assert.isFalse(
        isSubscription(assign(false, { [isSubscriptionPropertyKey]: false }))
      )
      assert.isFalse(
        isSubscription(assign(true, { [isSubscriptionPropertyKey]: 2 }))
      )
      assert.isFalse(
        isSubscription(assign(false, { [isSubscriptionPropertyKey]: {} }))
      )
    })
  })

  describe('array values', () => {
    it('returns true if the value has the `isSubscriptionPropertyKey` property equal to true', () => {
      assert.isTrue(
        isSubscription(assign([], { [isSubscriptionPropertyKey]: true }))
      )
      assert.isTrue(
        isSubscription(
          assign([2, '', {}, false], {
            [isSubscriptionPropertyKey]: true,
            property: 'another property'
          })
        )
      )
    })

    it('returns false if the value has no additional properties', () => {
      assert.isFalse(isSubscription([]))
      assert.isFalse(isSubscription([2, false, NaN, {}]))
    })

    it('returns false if the value does not have the `isSubscriptionPropertyKey` property', () => {
      assert.isFalse(
        isSubscription(assign([4], { isSubscriptionPropertyKey: true }))
      )
      assert.isFalse(
        isSubscription(assign([], { property: 'another property' }))
      )
    })

    it('returns false if the value has the `isSubscriptionPropertyKey` property not equal to true', () => {
      assert.isFalse(
        isSubscription(
          assign([Infinity, [{}, [{}], ['']], [2, 5]], {
            [isSubscriptionPropertyKey]: false
          })
        )
      )
      assert.isFalse(
        isSubscription(assign([], { [isSubscriptionPropertyKey]: {} }))
      )
      assert.isFalse(
        isSubscription(
          assign([{}, Symbol()], { [isSubscriptionPropertyKey]: 2 })
        )
      )
    })
  })

  describe('function values', () => {
    it('returns true if the value has the `isSubscriptionPropertyKey` property equal to true', () => {
      assert.isTrue(
        isSubscription(assign(() => {}, { [isSubscriptionPropertyKey]: true }))
      )
      assert.isTrue(
        isSubscription(
          assign((x: number) => x * 2, {
            [isSubscriptionPropertyKey]: true,
            property: 'another property'
          })
        )
      )
    })

    it('returns false if the value has no additional properties', () => {
      assert.isFalse(isSubscription(() => {}))
    })

    it('returns false if the value does not have the `isSubscriptionPropertyKey` property', () => {
      assert.isFalse(
        isSubscription(assign(() => {}, { isSubscriptionPropertyKey: true }))
      )
      assert.isFalse(
        isSubscription(assign(() => {}, { property: 'another property' }))
      )
    })

    it('returns false if the value has the `isSubscriptionPropertyKey` property not equal to true', () => {
      assert.isFalse(
        isSubscription(assign(() => {}, { [isSubscriptionPropertyKey]: false }))
      )
      assert.isFalse(
        isSubscription(assign(() => {}, { [isSubscriptionPropertyKey]: 2 }))
      )
      assert.isFalse(
        isSubscription(assign(() => {}, { [isSubscriptionPropertyKey]: {} }))
      )
    })
  })

  describe('class values', () => {
    it('returns true if the value has the `isSubscriptionPropertyKey` property equal to true', () => {
      assert.isTrue(
        isSubscription(
          assign(class Foo {}, { [isSubscriptionPropertyKey]: true })
        )
      )
      assert.isTrue(
        isSubscription(
          assign(
            class Bar {
              constructor(x: number) {}
            },
            {
              [isSubscriptionPropertyKey]: true,
              property: 'another property'
            }
          )
        )
      )
    })

    it('returns false if the value has no additional properties', () => {
      assert.isFalse(isSubscription(class {}))
    })

    it('returns false if the value does not have the `isSubscriptionPropertyKey` property', () => {
      assert.isFalse(
        isSubscription(
          assign(class Foo extends class {} {}, {
            isSubscriptionPropertyKey: true
          })
        )
      )
      assert.isFalse(
        isSubscription(assign(class {}, { property: 'another property' }))
      )
    })

    it('returns false if the value has the `isSubscriptionPropertyKey` property not equal to true', () => {
      assert.isFalse(
        isSubscription(
          assign(class Foo extends class {} {}, {
            [isSubscriptionPropertyKey]: false
          })
        )
      )
      assert.isFalse(
        isSubscription(assign(class {}, { [isSubscriptionPropertyKey]: {} }))
      )
      assert.isFalse(
        isSubscription(
          assign(
            class Bar {
              constructor(x: number, y: string) {}
            },
            { [isSubscriptionPropertyKey]: 2 }
          )
        )
      )
    })
  })

  describe('symbol values', () => {
    it('returns true if the value has the `isSubscriptionPropertyKey` property equal to true', () => {
      assert.isTrue(
        isSubscription(assign(Symbol(), { [isSubscriptionPropertyKey]: true }))
      )
      assert.isTrue(
        isSubscription(
          assign(Symbol('foo'), { [isSubscriptionPropertyKey]: true })
        )
      )
      assert.isTrue(
        isSubscription(
          assign(Symbol.for('a string'), {
            [isSubscriptionPropertyKey]: true,
            property: 'another property'
          })
        )
      )
    })

    it('returns false if the value has no additional properties', () => {
      assert.isFalse(isSubscription(Symbol()))
      assert.isFalse(isSubscription(Symbol.for('foo')))
      assert.isFalse(isSubscription(Symbol('a string')))
    })

    it('returns false if the value does not have the `isSubscriptionPropertyKey` property', () => {
      assert.isFalse(
        isSubscription(
          assign(Symbol('another string'), { isSubscriptionPropertyKey: true })
        )
      )
      assert.isFalse(
        isSubscription(
          assign(Symbol.for('some string'), { property: 'another property' })
        )
      )
    })

    it('returns false if the value has the `isSubscriptionPropertyKey` property not equal to true', () => {
      assert.isFalse(
        isSubscription(
          assign(Symbol.for('foo'), { [isSubscriptionPropertyKey]: false })
        )
      )
      assert.isFalse(
        isSubscription(assign(Symbol(), { [isSubscriptionPropertyKey]: 2 }))
      )
      assert.isFalse(
        isSubscription(
          assign(Symbol('another string'), { [isSubscriptionPropertyKey]: {} })
        )
      )
    })
  })
})

describe('emptySubscription', () => {
  it('is defined', () => {
    assert.exists(emptySubscription)
  })

  it('is a subscription', () => {
    assert(isSubscription(emptySubscription))
  })

  describe('#terminateDisposableWhenDisposed', () => {
    it('is defined', () => {
      assert.property(emptySubscription, 'terminateDisposableWhenDisposed')
    })

    it('is a function', () => {
      assert.isFunction(emptySubscription.terminateDisposableWhenDisposed)
    })

    it('immediately disposes the disposable', () => {
      const disposable = { dispose: sinon.fake() }
      emptySubscription.terminateDisposableWhenDisposed(disposable)
      assert.isTrue(disposable.dispose.calledOnce)
    })

    it('returns the value if it is a subscription', () => {
      const subscription = new Subscription()
      assert.strictEqual(
        emptySubscription.terminateDisposableWhenDisposed(subscription),
        subscription
      )
    })

    it('returns the emptySubscription object if the value is not a subscription', () => {
      assert.strictEqual(
        emptySubscription.terminateDisposableWhenDisposed({ dispose() {} }),
        emptySubscription
      )
    })
  })

  describe('#onDispose', () => {
    it('is defined', () => {
      assert.property(emptySubscription, 'onDispose')
    })

    it('is a function', () => {
      assert.isFunction(emptySubscription.onDispose)
    })

    it('immediately calls the given function', () => {
      const dispose = sinon.fake()
      emptySubscription.onDispose(dispose)
      assert.isTrue(dispose.calledOnce)
    })

    it('returns emptySubscription', () => {
      assert.strictEqual(
        emptySubscription.onDispose(() => {}),
        emptySubscription
      )
    })
  })

  describe('#removeSubscription', () => {
    it('is defined', () => {
      assert.property(emptySubscription, 'removeSubscription')
    })

    it('does nothing', () => {
      assert.isUndefined(
        emptySubscription.removeSubscription(new Subscription())
      )
    })
  })

  describe('#dispose', () => {
    it('is defined', () => {
      assert.property(emptySubscription, 'dispose')
    })

    it('is a function', () => {
      assert.isFunction(emptySubscription.dispose)
    })

    it('does nothing', () => {
      assert.isUndefined(
        emptySubscription.removeSubscription(new Subscription())
      )
    })
  })

  describe('#isActive', () => {
    it('is defined', () => {
      assert.property(emptySubscription, 'isActive')
    })

    it('is a function', () => {
      assert.isFunction(emptySubscription.isActive)
    })

    it('returns false', () => {
      assert.isFalse(emptySubscription.isActive())
    })
  })

  describe('#isDisposed', () => {
    it('is defined', () => {
      assert.property(emptySubscription, 'isDisposed')
    })

    it('is a function', () => {
      assert.isFunction(emptySubscription.isDisposed)
    })

    it('returns false', () => {
      assert.isTrue(emptySubscription.isDisposed())
    })
  })
})

describe('Subscription', () => {
  it('is defined', () => {
    assert.exists(Subscription)
  })

  it('is a Subscription', () => {
    assert(isSubscription(new Subscription()))
  })
})
