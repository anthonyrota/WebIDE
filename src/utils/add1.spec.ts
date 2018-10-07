import { assert } from 'chai'
import { add1 } from './add1'

describe('add1', () => {
  it('is defined', () => {
    assert.exists(add1)
  })

  it('is a function', () => {
    assert.isFunction(add1)
  })

  it('correctly increments zero', () => {
    assert.strictEqual(add1(0), 1)
  })

  it('correctly increments 1', () => {
    assert.strictEqual(add1(1), 2)
  })

  it('correctly increments 504', () => {
    assert.strictEqual(add1(504), 505)
  })

  it('correctly increments -1', () => {
    assert.strictEqual(add1(-1), 0)
  })

  it('correctly increments -239', () => {
    assert.strictEqual(add1(-239), -238)
  })

  it('correctly increments 2.47', () => {
    assert.strictEqual(add1(2.47), 3.47)
  })

  it('correctly increments -4.54', () => {
    assert.strictEqual(add1(-4.54), -3.54)
  })

  it('returns NaN when given NaN', () => {
    assert.isNaN(add1(NaN))
  })

  it('returns Infinity when given Infinity', () => {
    assert.strictEqual(add1(Infinity), Infinity)
  })

  it('returns -Infinity when given -Infinity', () => {
    assert.strictEqual(add1(-Infinity), -Infinity)
  })
})
