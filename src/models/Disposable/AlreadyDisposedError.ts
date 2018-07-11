export class AlreadyDisposedError extends Error {
  public name = 'AlreadyDisposedError'

  constructor() {
    super('The object is already unsubscribed')
  }
}
