import { IDisposable } from 'src/models/Disposable/IDisposable'
import { Stream } from 'src/models/Stream/Stream/Stream'

export interface IToken {
  readonly startIndex: number
  readonly endIndex: number
  readonly scopes: ReadonlyArray<string>
}

export interface ILineRange {
  readonly startIndex: number
  readonly endIndex: number
}

export interface ITokenizationResult {
  readonly tokens: ReadonlyArray<IToken>
}

export const enum ContentChangeEventType {
  Insert = 'ContentChangeEventType/Insert',
  Delete = 'ContentChangeEventType/Delete',
  LinesChanged = 'ContentChangeEventType/LinesChanged'
}

export interface IInsertEvent {
  readonly type: ContentChangeEventType.Insert
  readonly lineIndex: number
  readonly numberOfLinesInserted: number
}

export interface IDeleteEvent {
  readonly type: ContentChangeEventType.Delete
  readonly lineRange: ILineRange
}

export interface ILinesChangedEvent {
  readonly type: ContentChangeEventType.LinesChanged
  readonly lineRange: ILineRange
}

export type ContentChangeEvent =
  | IInsertEvent
  | IDeleteEvent
  | ILinesChangedEvent

export interface ITokenizationLineModel {
  getLineContent(lineIndex: number): string
  getLineCount(): number
  getContentChangeStream(): Stream<ContentChangeEvent>
}

export const enum TokenizationEventType {
  TokenizationResult = 'TokenizationEventType/TokenizationResult'
}

export interface ITokenizationEvent {
  type: TokenizationEventType.TokenizationResult
  lineTokens: ITokenizationResult[]
}

export interface ITokenizationProvider extends IDisposable {
  initialize(): void
  getTokenizerStream(): Stream<ITokenizationEvent>
}

export interface IConstructableTokenizationProvider {
  new (lineModel: ITokenizationLineModel): ITokenizationProvider
}
