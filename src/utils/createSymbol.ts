function createSymbol<T extends string>(name: T): symbol | string {
  if (typeof Symbol !== 'undefined') {
    return Symbol(name)
  }
  return name
}
