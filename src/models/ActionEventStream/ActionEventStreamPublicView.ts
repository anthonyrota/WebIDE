import { IMessage } from 'src/models/MessageStream/IMessage'
import { MessageStream } from 'src/models/MessageStream/MessageStream'
import { MessageStreamInput } from 'src/models/MessageStream/MessageStreamInput'
import { MessageStreamOutput } from 'src/models/MessageStream/MessageStreamOutput'

export class ActionEventStreamPublicView<
  TAction extends IMessage<any, any>,
  TEvent extends IMessage<any, any>
> {
  private __inputActions: MessageStreamInput<TAction>
  private __outputEvents: MessageStreamOutput<TEvent>

  constructor(
    actionMessageStream: MessageStream<TAction>,
    eventMessageStream: MessageStream<TEvent>
  ) {
    this.__inputActions = actionMessageStream.getInput()
    this.__outputEvents = eventMessageStream.getOutput()
  }

  public getInputActions(): MessageStreamInput<TAction> {
    return this.__inputActions
  }

  public getOutputEvents(): MessageStreamOutput<TEvent> {
    return this.__outputEvents
  }
}
