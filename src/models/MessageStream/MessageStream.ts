import { IDisposable } from 'src/models/Disposable/IDisposable'
import { IMessage } from 'src/models/MessageStream/IMessage'
import { Stream } from 'src/models/Stream/Stream/Stream'
import { StreamDistributor } from 'src/models/Stream/StreamDistributor/StreamDistributor'
import { StreamSource } from 'src/models/Stream/StreamSource/StreamSource'
import { MessageStreamInput } from './MessageStreamInput'
import { MessageStreamOutput } from './MessageStreamOutput'

export class MessageStream<TMessage extends IMessage<any, any>>
  implements IDisposable {
  private __distributor: StreamDistributor<TMessage>
  private __source: StreamSource<TMessage>
  private __stream: Stream<TMessage>
  private __input: MessageStreamInput<TMessage>
  private __output: MessageStreamOutput<TMessage>

  constructor() {
    this.__distributor = new StreamDistributor<TMessage>()
    this.__source = new StreamSource<TMessage>(this.__distributor)
    this.__stream = new Stream<TMessage>(this.__source, this.__distributor)
    this.__input = new MessageStreamInput<TMessage>(
      this.__stream,
      this.__source
    )
    this.__output = new MessageStreamOutput(this.__stream)
  }

  public getInput(): MessageStreamInput<TMessage> {
    return this.__input
  }

  public getOutput(): MessageStreamOutput<TMessage> {
    return this.__output
  }

  public dispose(): void {
    this.__stream.dispose()
  }
}
