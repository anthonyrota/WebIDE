// import {
//   IContentChangeEvent,
//   IToken,
//   ITokenizationLineModel,
//   ITokenizationProvider
// } from 'src/languages/interfaces/tokenizer'
// import {
//   IScheduler,
//   ISchedulerReturnMessage,
//   ISchedulerTask,
//   SchedulerReturnMessageCommand
// } from 'src/models/Scheduler/IScheduler'
// import { IdleCallbackScheduler } from 'src/models/Scheduler/Scheduler/IdleCallbackScheduler'
// import { Stream } from 'src/models/Stream/Stream/Stream'
// import { ISubscription } from 'src/models/Stream/StreamSubscription/ISubscription'

// interface ILineTokens<TState> {
//   tokens: IToken[]
//   endState: TState
//   isValid: boolean
// }

// export interface ITokenizeLineResult<TState> {
//   tokens: IToken[]
//   endState: TState
// }

// export interface ITokenizationProviderInput<TState> {
//   tokenize(line: string, state: TState): ITokenizeLineResult<TState>
//   areStatesEqual(firstState: TState, secondState: TState): boolean
// }

// export abstract class TokenizationProvider<TState>
//   implements ITokenizationProvider {
//   private __lineModel: ITokenizationLineModel
//   private __lineTokens: Array<ILineTokens<TState> | null>
//   private __firstInvalidIndex: number
//   private __scheduler: IScheduler
//   private __tokenizeLineTask: ISchedulerTask<TState> | null
//   private __contentChangeStream: Stream<IContentChangeEvent>
//   private __contentChangeStreamSubscription: ISubscription
//   private __input: ITokenizationProviderInput<TState>

//   constructor(input: ITokenizationProviderInput<TState>) {
//     this.__input = input
//     this.__lineTokens = []
//     this.__firstInvalidIndex = -1
//     this.__scheduler = new IdleCallbackScheduler()
//   }

//   public initialize(lineModel: ITokenizationLineModel): void {
//     this.__lineModel = lineModel
//     this.__contentChangeStream = this.__lineModel.getContentChangeStream()
//     this.__contentChangeStreamSubscription = this.__contentChangeStream.subscribeWithOnNextValueListener(
//       this.__onContentChangeCallback
//     )
//     this.__tokenizeLineTask = this.__scheduler.addTask(
//       this.__tokenizeNextLineSchedulerCallback
//     )
//   }

//   public dispose(): void {
//     this.__scheduler.dispose()
//     this.__contentChangeStreamSubscription.dispose()
//   }

//   public getTokensAtLine(lineIndex: number): ReadonlyArray<IToken> | null {
//     const tokenizationResult = this.__lineTokens[lineIndex]

//     return tokenizationResult && tokenizationResult.tokens
//   }

//   protected abstract __tokenizeLine(
//     lineText: string,
//     previousState: TState | null
//   ): ITokenizeLineResult<TState>

//   private __tokenizeNextLineSchedulerCallback(): ISchedulerReturnMessage<void> {
//     const lineCount = this.__lineModel.getLineCount()
//     const lineIndex = this.__firstInvalidIndex
//     const lineTokens = this.__lineTokens
//     const input = this.__input

//     if (lineIndex === -1) {
//       return {
//         next: SchedulerReturnMessageCommand.PauseTask
//       }
//     }

//     const lineText = this.__lineModel.getLineContent(lineIndex)
//     const tokenizationResultBeforeCurrentIndex =
//       lineIndex === 0 ? null : lineTokens[lineIndex - 1]

//     const newTokenizationResult = this.__tokenizeLine(
//       lineText,
//       tokenizationResultBeforeCurrentIndex &&
//         tokenizationResultBeforeCurrentIndex.endState
//     )

//     const previousTokenizationResult = lineTokens[lineIndex]

//     lineTokens[lineIndex] = {
//       endState: newTokenizationResult.endState,
//       isValid: true,
//       tokens: newTokenizationResult.tokens
//     }

//     if (lineIndex + 1 < lineCount) {
//       const nextTokenizationResult = lineTokens[lineIndex]

//       /** @todo */
//     }
//   }
// }
