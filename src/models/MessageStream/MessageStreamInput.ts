import { IMessage } from 'src/models/MessageStream/IMessage'
import { Stream } from 'src/models/Stream/Stream/Stream'
import { StreamSource } from 'src/models/Stream/StreamSource/StreamSource'

export class MessageStreamInput<T extends IMessage<any, any>> {
  private __stream: Stream<T>
  private __source: StreamSource<T>

  constructor(stream: Stream<T>, source: StreamSource<T>) {
    this.__stream = stream
    this.__source = source
  }

  public next(value: T): void {
    this.__source.next(value)
  }

  public error(error: any): void {
    this.__source.error(error)
  }

  public isActive(): boolean {
    return this.__stream.isActive()
  }
}
