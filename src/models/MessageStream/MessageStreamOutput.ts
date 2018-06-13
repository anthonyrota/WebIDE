import { IMessage } from 'src/models/MessageStream/IMessage'
import { ConsciousStream } from 'src/models/Stream/Stream/ConsciousStream'
import { Stream } from 'src/models/Stream/Stream/Stream'
import { filter } from 'src/models/Stream/StreamOperators/filter'
import { map } from 'src/models/Stream/StreamOperators/map'
import { compose2 } from 'src/utils/compose'
import { eq } from 'src/utils/eq'
import { pluck } from 'src/utils/pluck'

type MessageStreamMap<TMessage extends IMessage<any, any>> = {
  [TMessageType in TMessage['type']]: ConsciousStream<
    Extract<TMessage, { type: TMessageType }>['payload']
  >
}

export class MessageStreamOutput<TMessage extends IMessage<any, any>> {
  private __messageStream: Stream<TMessage>
  private __messageStreamMap: MessageStreamMap<TMessage>

  constructor(messageStream: Stream<TMessage>) {
    this.__messageStream = messageStream
    this.__messageStreamMap = {} as MessageStreamMap<TMessage>
    this.__messageStream.subscribe({
      onNextValue: this.__onMessage.bind(this)
    })
  }

  public isActive(): boolean {
    return this.__messageStream.isActive()
  }

  public getMessageStream(): Stream<TMessage> {
    return this.__messageStream
  }

  public ofType<TMessageType extends TMessage['type']>(
    messageType: TMessageType
  ): ConsciousStream<Extract<TMessage, { type: TMessageType }>['payload']> {
    this.__ensureMessageStreamOfType(messageType)
    return this.__messageStreamMap[messageType]
  }

  private __onMessage(message: TMessage): void {
    this.__ensureMessageStreamOfType(message.type)
  }

  private __ensureMessageStreamOfType<TMessageType extends TMessage['type']>(
    messageType: TMessageType,
    startingValue?: Extract<TMessage, { type: TMessageType }>['payload']
  ): void {
    if (!this.__messageStreamMap[messageType]) {
      this.__messageStreamMap[messageType] = new ConsciousStream(
        map(
          pluck('payload'),
          filter(compose2(eq(messageType), pluck('type')), this.__messageStream)
        ),
        startingValue
      )
    }
  }
}
