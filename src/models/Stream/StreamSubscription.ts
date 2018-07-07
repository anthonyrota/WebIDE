import { IConsciousDisposable } from 'src/models/Disposable/IConsciousDisposable'
import { StreamDistributor } from 'src/models/Stream/StreamDistributor'

export class StreamSubscription implements IConsciousDisposable {
  private __distributor: StreamDistributor<any, any>

  constructor(distributor: StreamDistributor<any, any>) {
    this.__distributor = distributor
  }

  public isActive(): boolean {
    return this.__distributor.isActive()
  }

  public dispose(): void {
    this.__distributor.dispose()
  }
}
