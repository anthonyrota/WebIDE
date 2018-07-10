import { IConsciousDisposable } from 'src/models/Disposable/IConsciousDisposable'
import { ValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export class Subscription implements IConsciousDisposable {
  private __transmitter: ValueTransmitter<any, any>

  constructor(transmitter: ValueTransmitter<any, any>) {
    this.__transmitter = transmitter
  }

  public isActive(): boolean {
    return this.__transmitter.isActive()
  }

  public dispose(): void {
    this.__transmitter.dispose()
  }
}
