import { IMessage } from 'src/models/MessageStream/IMessage'
import { MessageStream } from 'src/models/MessageStream/MessageStream'
import { MessageStreamInput } from 'src/models/MessageStream/MessageStreamInput'
import { MessageStreamOutput } from 'src/models/MessageStream/MessageStreamOutput'

export class ActionEventStreamInternalView<
  TAction extends IMessage<any, any>,
  TEvent extends IMessage<any, any>
> {
  private __inputActions: MessageStreamOutput<TAction>
  private __outputEvents: MessageStreamInput<TEvent>

  constructor(
    actionMessageStream: MessageStream<TAction>,
    eventMessageStream: MessageStream<TEvent>
  ) {
    this.__inputActions = actionMessageStream.getOutput()
    this.__outputEvents = eventMessageStream.getInput()
  }

  public getInputActions(): MessageStreamOutput<TAction> {
    return this.__inputActions
  }

  public getOutputEvents(): MessageStreamInput<TEvent> {
    return this.__outputEvents
  }
}
