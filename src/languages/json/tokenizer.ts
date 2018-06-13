import { ActionEventStream } from 'src/models/ActionEventStream/ActionEventStream'
import { ActionEventStreamPublicView } from 'src/models/ActionEventStream/ActionEventStreamPublicView'
import { IMessage } from 'src/models/MessageStream/IMessage'

interface ILineRange {
  readonly startIndex: number
  readonly endIndex: number
}

interface IToken {
  readonly startIndex: number
  readonly endIndex: number
  readonly scopes: ReadonlyArray<string>
}

interface ITokenizationResult {
  readonly range: ILineRange
  readonly tokens: ReadonlyArray<IToken>
}

type TokenizerActionInitiate = IMessage<'initiate', string>
type TokenizerActionReplaceLineRange = IMessage<'replaceLineRange', ILineRange>
type TokenizerAction = TokenizerActionInitiate | TokenizerActionReplaceLineRange

type TokenizerEventLinesTokenized = IMessage<
  'linesTokenized',
  ITokenizationResult[]
>
type TokenizerEvent = TokenizerEventLinesTokenized

interface ILanguageTokenizer {
  createTokenizerActionEventStream(): ActionEventStreamPublicView<
    TokenizerAction,
    TokenizerEvent
  >
}

export class JSONTokenizer implements ILanguageTokenizer {
  public createTokenizerActionEventStream(): ActionEventStreamPublicView<
    TokenizerAction,
    TokenizerEvent
  > {
    return createJSONTokenizerActionEventStream()
  }
}

function createJSONTokenizerActionEventStream(): ActionEventStreamPublicView<
  TokenizerAction,
  TokenizerEvent
> {
  const stream = new ActionEventStream<TokenizerAction, TokenizerEvent>()
  const actions = stream.getInternalView().getInputActions()
  const events = stream.getInternalView().getOutputEvents()

  actions.getMessageStream().subscribeWithOnNextValueListener(action => {
    // @todo
  })

  actions.getMessageStream().subscribeWithOnFinishListener(() => {
    // @todo
    // cleanup
  })

  return stream.getPublicView()
}
