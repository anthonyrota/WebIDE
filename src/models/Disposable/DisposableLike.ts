import { IDisposable } from 'src/models/Disposable/IDisposable'

export type DisposableLike = IDisposable | (() => void) | void
