import { IConsciousDisposable } from 'src/models/Disposable/IConsciousDisposable'
import { StreamValueTransmitter } from 'src/models/Stream/StreamValueTransmitter'

export class StreamSubscription implements IConsciousDisposable {
  private __transmitter: StreamValueTransmitter<any, any>

  constructor(transmitter: StreamValueTransmitter<any, any>) {
    this.__transmitter = transmitter
  }

  public isActive(): boolean {
    return this.__transmitter.isActive()
  }

  public dispose(): void {
    this.__transmitter.dispose()
  }
}
