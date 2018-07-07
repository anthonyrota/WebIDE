import { IDisposable } from 'src/models/Disposable/IDisposable'

export type IDisposableLike = IDisposable | (() => void) | void
