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

export interface IContentChangeEvent {
  deletedLineRange: ILineRange
  numberOfLinesInserted: number
}

export interface ITokenizationLineModel {
  getLineContent(lineIndex: number): string
  getLineCount(): number
  getContentChangeStream(): Stream<IContentChangeEvent>
}

export interface ITokenizationProvider extends IDisposable {
  initialize(): void
  getTokensAtLine(index: number): ReadonlyArray<IToken> | null
}

export interface IConstructableTokenizationProvider {
  new (lineModel: ITokenizationLineModel): ITokenizationProvider
}
