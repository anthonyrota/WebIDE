interface ICurriedFunction1<T1, TR> {
  (value: T1): TR
}

interface ICurriedFunction2<T1, T2, TR> {
  (first: T1): ICurriedFunction1<T2, TR>
  (first: T1, second: T2): TR
}

interface ICurriedFunction3<T1, T2, T3, TR> {
  (first: T1): ICurriedFunction2<T2, T3, TR>
  (first: T1, second: T2): ICurriedFunction1<T3, TR>
  (first: T1, second: T2, third: T3): TR
}

export function curry2<T1, T2, TR>(
  func: (first: T1, second: T2) => TR
): ICurriedFunction2<T1, T2, TR> {
  function curried(first: T1): ICurriedFunction1<T2, TR>
  function curried(first: T1, second: T2): TR
  function curried(first: T1, second?: T2): ICurriedFunction1<T2, TR> | TR {
    if (typeof second === 'undefined') {
      return (value: T2): TR => func(first, value)
    }
    return func(first, second)
  }

  return curried
}

export function curry3WithFirstArgument<T1, T2, T3, TR>(
  func: (first: T1, second: T2, third: T3) => TR,
  first: T1
): ICurriedFunction2<T2, T3, TR> {
  function curried(second: T2): ICurriedFunction1<T3, TR>
  function curried(second: T2, third: T3): TR
  function curried(second: T2, third?: T3): ICurriedFunction1<T3, TR> | TR {
    if (typeof third === 'undefined') {
      return (value: T3): TR => func(first, second, value)
    }
    return func(first, second, third)
  }

  return curried
}

export function curry3<T1, T2, T3, TR>(
  func: (first: T1, second: T2, third: T3) => TR
): ICurriedFunction3<T1, T2, T3, TR> {
  function curried(first: T1): ICurriedFunction2<T2, T3, TR>
  function curried(first: T1, second: T2): ICurriedFunction1<T3, TR>
  function curried(first: T1, second: T2, third: T3): TR
  function curried(
    first: T1,
    second?: T2,
    third?: T3
  ): ICurriedFunction2<T2, T3, TR> | ICurriedFunction1<T3, TR> | TR {
    if (typeof second === 'undefined') {
      return curry3WithFirstArgument(func, first)
    }
    if (typeof third === 'undefined') {
      return (value: T3): TR => func(first, second, value)
    }
    return func(first, second, third)
  }

  return curried
}
