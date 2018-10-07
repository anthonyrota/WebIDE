import { json, property } from 'jsverify'
import { always } from './always'

describe('always', () => {
  describe('properties', () => {
    property('always returns inital argument', json, value => {
      const func = always(value)
      return func() === value && func() === value && func() === value
    })
  })
})
