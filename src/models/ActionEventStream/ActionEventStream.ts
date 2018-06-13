import { ActionEventStreamInternalView } from 'src/models/ActionEventStream/ActionEventStreamInternalView'
import { ActionEventStreamPublicView } from 'src/models/ActionEventStream/ActionEventStreamPublicView'
import { IDisposable } from 'src/models/Disposable/IDisposable'
import { IMessage } from 'src/models/MessageStream/IMessage'
import { MessageStream } from 'src/models/MessageStream/MessageStream'

export class ActionEventStream<
  TAction extends IMessage<any, any>,
  TEvent extends IMessage<any, any>
> implements IDisposable {
  private __actionMessageStream: MessageStream<TAction>
  private __eventMessageStream: MessageStream<TEvent>
  private __publicView: ActionEventStreamPublicView<TAction, TEvent>
  private __internalView: ActionEventStreamInternalView<TAction, TEvent>

  constructor() {
    this.__actionMessageStream = new MessageStream<TAction>()
    this.__eventMessageStream = new MessageStream<TEvent>()
    this.__publicView = new ActionEventStreamPublicView<TAction, TEvent>(
      this.__actionMessageStream,
      this.__eventMessageStream
    )
    this.__internalView = new ActionEventStreamInternalView<TAction, TEvent>(
      this.__actionMessageStream,
      this.__eventMessageStream
    )
  }

  public getPublicView(): ActionEventStreamPublicView<TAction, TEvent> {
    return this.__publicView
  }

  public getInternalView(): ActionEventStreamInternalView<TAction, TEvent> {
    return this.__internalView
  }

  public dispose(): void {
    this.__actionMessageStream.dispose()
    this.__eventMessageStream.dispose()
  }
}
