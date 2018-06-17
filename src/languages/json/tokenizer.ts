import { bind } from 'src/decorators/bind'
import {
  ContentChangeEvent,
  ContentChangeEventType,
  ILineRange,
  ITokenizationEvent,
  ITokenizationLineModel,
  ITokenizationProvider,
  ITokenizationResult,
  TokenizationEventType
} from 'src/languages/interfaces/tokenizer'
import { IdleCallbackScheduler } from 'src/models/Scheduler/IdleCallbackScheduler'
import {
  IScheduler,
  ISchedulerReturnMessage,
  ISchedulerTask,
  SchedulerReturnMessageCommand
} from 'src/models/Scheduler/IScheduler'
import { Stream } from 'src/models/Stream/Stream/Stream'
import { ISubscription } from 'src/models/Stream/StreamSubscription/ISubscription'

export class ImmutableStack<T> {
  private __depth: number
  private __value: T
  private __parent: ImmutableStack<T> | null

  private constructor(
    depth: number,
    value: T,
    parent: ImmutableStack<T> | null
  ) {
    this.__depth = depth
    this.__value = value
    this.__parent = parent
  }

  public getSize(): number {
    return this.__depth
  }

  public getLastValue(): T {
    return this.__value
  }

  public push(value: T): ImmutableStack<T> {
    return new ImmutableStack(this.__depth + 1, value, this)
  }

  public pop(): ImmutableStack<T> {
    return this.__parent === null ? this : this.__parent
  }

  public toString(): string {
    return this.__parent === null
      ? `Stack.Head(${this.__value})`
      : `Stack.Tail(${this.__parent}, ${this.__value})`
  }
}

export abstract class LanguageTokenizationProvider<TState>
  implements ITokenizationProvider {
  private __lineModel: ITokenizationLineModel
  private __lineTokens: ITokenizationResult[]
  private __linesToTokenize: ILineRange[]
  private __endOfLineStates: Array<ImmutableStack<TState>>
  private __scheduler: IScheduler
  private __tokenizeLineTask: ISchedulerTask<ITokenizationEvent>
  private __contentChangeStream: Stream<ContentChangeEvent>
  private __contentChangeStreamSubscription: ISubscription

  constructor(lineModel: ITokenizationLineModel) {
    this.__lineModel = lineModel
    this.__lineTokens = []
    this.__endOfLineStates = []
    this.__linesToTokenize = []
    this.__scheduler = new IdleCallbackScheduler()
  }

  public initialize(): void {
    this.__contentChangeStream = this.__lineModel.getContentChangeStream()
    this.__contentChangeStreamSubscription = this.__contentChangeStream.subscribeWithOnNextValueListener(
      this.__onContentChangeCallback
    )
    this.__tokenizeLineTask = this.__scheduler.addTask<ITokenizationEvent>(
      this.__tokenizeNextLineSchedulerCallback
    )
  }

  public getTokenizerStream(): Stream<ITokenizationEvent> {
    return this.__tokenizeLineTask.getOutputStream()
  }

  public dispose(): void {
    this.__scheduler.dispose()
    this.__contentChangeStreamSubscription.dispose()
  }

  public abstract tokenizeLine(
    line: string,
    previousState: ImmutableStack<TState>
  ): ITokenizationEvent

  private __tokenizeNextLine(): void {}

  private __onTextInserted(
    lineIndex: number,
    numberOfLinesInserted: number
  ): void {
    /**
     * @todo
     */
  }

  private __onTextDeleted(lineRange: ILineRange): void {
    /**
     * @todo
     */
  }

  private __onLinesChanged(lineRange: ILineRange): void {
    /**
     * @todo
     */
  }

  @bind
  private __tokenizeNextLineSchedulerCallback(): ISchedulerReturnMessage<
    ITokenizationEvent
  > {
    if (this.__linesToTokenize.length === 0) {
      return { next: SchedulerReturnMessageCommand.PauseTask }
    }

    this.__tokenizeNextLine()

    return {
      next:
        this.__linesToTokenize.length === 0
          ? SchedulerReturnMessageCommand.PauseTask
          : SchedulerReturnMessageCommand.RepeatTask,
      value: {
        lineTokens: this.__lineTokens,
        type: TokenizationEventType.TokenizationResult
      }
    }
  }

  @bind
  private __onContentChangeCallback(event: ContentChangeEvent): void {
    switch (event.type) {
      case ContentChangeEventType.Insert:
        this.__onTextInserted(event.lineIndex, event.numberOfLinesInserted)
        break
      case ContentChangeEventType.Delete:
        this.__onTextDeleted(event.lineRange)
        break
      case ContentChangeEventType.LinesChanged:
        this.__onLinesChanged(event.lineRange)
        break
    }
  }
}
