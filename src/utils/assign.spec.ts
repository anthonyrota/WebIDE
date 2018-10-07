import { assert } from 'chai'
import { assign } from './assign'

describe('assign', () => {
  it('is defined', () => {
    assert.exists(assign)
  })

  it('is a function', () => {
    assert.isFunction(assign)
  })

  describe('one parameter', () => {
    it('throws when the target is nullish', () => {
      assert.throws(() => assign(null as any), TypeError)
      assert.throws(() => assign(undefined as any), TypeError)
    })

    it('converts a number to a Number', () => {
      const target = 2
      const result = assign(target)
      assert.strictEqual(typeof result, 'object', 'result is an object')
      assert.strictEqual(
        Number.prototype.valueOf.call(result),
        target,
        'result retains the same value'
      )
    })

    it('converts a string to a String', () => {
      const target = 'some string'
      const result = assign(target)
      assert.strictEqual(typeof result, 'object', 'result is an object')
      assert.strictEqual(
        String.prototype.valueOf.call(result),
        target,
        'result retains the same value'
      )
    })

    it('converts a boolean to a Boolean', () => {
      const target = false
      const result = assign(target)
      assert.strictEqual(typeof result, 'object', 'result is an object')
      assert.strictEqual(
        Boolean.prototype.valueOf.call(result),
        target,
        'result retained the same value'
      )
    })

    it('converts a symbol to a Symbol', () => {
      const target = Symbol('some message')
      const result = assign(target)
      assert.strictEqual(typeof result, 'object', 'result is an object')
      assert.strictEqual(
        Symbol.prototype.valueOf.call(result),
        target,
        'result retains the same value'
      )
    })

    it('returns the target if the target is an array', () => {
      const target = [2, 3, 4]
      const result = assign(target)
      assert.strictEqual(result, target)
    })

    it('returns the target if the target is an object', () => {
      const target = { property: 'some string' }
      const result = assign(target)
      assert.strictEqual(result, target)
    })

    it('returns the target if the target is a function', () => {
      function target() {}
      const result = assign(target)
      assert.strictEqual(result, target)
    })
  })

  it('throws if the target is nullish', () => {
    assert.throws(() => assign(null, { prop: 2 }), TypeError)
    assert.throws(() => assign(null, 2), TypeError)
    assert.throws(() => assign(null, [], 2), TypeError)
    assert.throws(() => assign(null, undefined, 'something else'), TypeError)
    assert.throws(() => assign(undefined, { prop: 2 }), TypeError)
    assert.throws(() => assign(undefined, [], 2), TypeError)
    assert.throws(
      () => assign(undefined, null, { someProperty: 6 }, 'something'),
      TypeError
    )
    assert.throws(() => assign(undefined, undefined), TypeError)
  })

  it('ignores undefined sources when the target is a primitive', () => {
    const target = 'some primitive'
    const source = undefined
    const result = assign(target, source)
    assert.strictEqual(typeof result, 'object', 'result is an object')
    assert.strictEqual(
      String.prototype.valueOf.call(result),
      target,
      'result retains the same value'
    )
  })

  it('ignores a null source when the target is a primitive', () => {
    const target = true
    const source = null
    const result = assign(target, source)
    assert.strictEqual(typeof result, 'object', 'result is an object')
    assert.strictEqual(
      Boolean.prototype.valueOf.call(result),
      target,
      'result retains the same value'
    )
  })

  it('ignores null sources', () => {
    const target = { property: 2 }
    const source1 = null
    const source2 = { otherProperty: 4 }
    const result = assign(target, source1, source2)
    assert.deepEqual(result, { property: 2, otherProperty: 4 })
  })

  it('ignores null sources', () => {
    const target = { property: 2 }
    const source1 = { otherProperty: 4 }
    const source2 = undefined
    const result = assign(target, source1, source2)
    assert.deepEqual(result, { property: 2, otherProperty: 4 })
  })

  it('returns the target when it is an object', () => {
    const target = {}
    const source = { property: 4 }
    const result = assign(target, source)
    assert.strictEqual(result, target)
  })

  it('returns the target when it is an object', () => {
    function target() {}
    const source = { property: 4 }
    const result = assign(target, source)
    assert.strictEqual(result, target)
  })

  it('returns the target when it is a array', () => {
    const target: any = []
    const source = { property: 4 }
    const result = assign(target, source)
    assert.strictEqual(result, target)
  })

  it('applies properties of an object source to a number target', () => {
    const target = -439
    const property = Symbol()
    const source = { property }
    const result = assign(target, source)
    assert.strictEqual(typeof result, 'object', 'result is an object')
    assert.strictEqual(
      Number.prototype.valueOf.call(result),
      target,
      'result retains the same value'
    )
    assert.propertyVal(result, 'property', property)
  })

  it('applies properties of an object source to a string target', () => {
    const target = 'some string'
    const property = Symbol()
    const source = { property }
    const result = assign(target, source)
    assert.strictEqual(typeof result, 'object', 'result is an object')
    assert.strictEqual(
      String.prototype.valueOf.call(result),
      target,
      'result retains the same value'
    )
    assert.propertyVal(result, 'property', property)
  })

  it('applies properties of an object source to a boolean target', () => {
    const target = false
    const property = Symbol()
    const source = { property }
    const result = assign(target, source)
    assert.strictEqual(typeof result, 'object', 'result is an object')
    assert.strictEqual(
      Boolean.prototype.valueOf.call(result),
      target,
      'result retains the same value'
    )
    assert.propertyVal(result, 'property', property)
  })

  it('applies properties of an object source to a symbol target', () => {
    const target = Symbol()
    const property = Symbol()
    const source = { property }
    const result = assign(target, source)
    assert.strictEqual(typeof result, 'object', 'result is an object')
    assert.strictEqual(
      Symbol.prototype.valueOf.call(result),
      target,
      'result retains the same value'
    )
    assert.propertyVal(result, 'property', property)
  })

  it('applies the properties of an object source to an object target', () => {
    const target = { property: 1 }
    const source = { otherProperty: 2 }
    const result = assign(target, source)
    assert.deepEqual(result, { property: 1, otherProperty: 2 })
  })

  it('applies the properties of an object source to an array target', () => {
    const target = [2, 3, 4]
    const source = { property: 'some property' }
    const result = assign(target, source)
    const expected: any = [2, 3, 4]
    expected.property = 'some property'
    assert.deepEqual(result, expected)
  })

  it('applies the properties of an object source to a function target', () => {
    function target() {
      return 4
    }
    target.property = 'some property'
    const source = { otherProperty: 'some other property' }
    const result = assign(target, source)
    assert.strictEqual(target(), 4)
    assert.strictEqual(result.property, 'some property')
    assert.strictEqual(result.otherProperty, 'some other property')
  })

  it('correctly merges multiple objects', () => {
    const target = { a: 1 }
    const source1 = { b: 2 }
    const source2 = { c: 3 }
    const result = assign(target, source1, source2)
    assert.deepEqual(result, { a: 1, b: 2, c: 3 })
  })

  it('applies the properties of an array source to an object target', () => {
    const target = {}
    const source = ['first', 'second', 'third']
    const result = assign(target, source)
    assert.deepEqual<any>(result, { 0: 'first', 1: 'second', 2: 'third' })
  })

  it("only iterates over the object's own properties", () => {
    const Class = function Class() {} as any
    Class.prototype.prototypeProperty = 'some prototype property'
    const instance = new Class()
    instance.instanceProperty = 'some instance property'
    const target = { someProperty: 'some property' }
    const result = assign(target, instance)
    assert.strictEqual(result, target)
    assert.deepEqual(result, {
      someProperty: 'some property',
      instanceProperty: 'some instance property'
    })
  })

  it('allows for dictionaries', () => {
    const target = {}
    const source = Object.create(null)
    source.someProperty = true
    assert.deepEqual(assign(target, source), { someProperty: true })
  })

  it('preserves property order', () => {
    const target = {}
    const properties = 'abcdefghijklmnopqrst'.split('')
    const source = {}
    properties.forEach(property => {
      source[property] = property
    })
    const result = assign(target, source)
    assert.deepEqual(Object.keys(result), properties)
  })

  it('correctly merges symbol properties', () => {
    const target = {}
    const source = {}
    const symbol = Symbol('some message')
    source[symbol] = 'some value'
    assign(target, source)
    assert.deepEqual(target[symbol], 'some value')
  })

  it('only copies enumerable symbols', () => {
    const target = {}
    const source = {}
    const symbol = Symbol('some message')
    Object.defineProperty(source, symbol, {
      enumerable: false,
      value: 'some value'
    })
    assign(target, source)
    assert.doesNotHaveAnyKeys(target, [symbol])
  })
})
