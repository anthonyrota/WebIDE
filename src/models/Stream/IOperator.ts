import { IDisposableLike } from 'src/models/Disposable/IDisposableLike'
import { Stream } from 'src/models/Stream/Stream'
import { MonoTypeValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export interface IConnectOperator<TInput, TOutput> {
  connect(
    target: MonoTypeValueTransmitter<TOutput>,
    source: Stream<TInput>
  ): IDisposableLike
}

export interface ITransformOperator<
  TInput,
  TOutput,
  TStreamOutput extends Stream<TOutput>
> {
  transform(source: Stream<TInput>): TStreamOutput
}

export function isConnectOperator(
  operator: IConnectOperator<any, any> | ITransformOperator<any, any, any>
): operator is IConnectOperator<any, any> {
  return (
    typeof (operator as IConnectOperator<any, any>).connect === 'function' &&
    typeof (operator as ITransformOperator<any, any, any>).transform !==
      'function'
  )
}

export function isTransformOperator(
  operator: IConnectOperator<any, any> | ITransformOperator<any, any, any>
): operator is ITransformOperator<any, any, any> {
  return (
    typeof (operator as ITransformOperator<any, any, any>).transform ===
      'function' &&
    typeof (operator as IConnectOperator<any, any>).connect !== 'function'
  )
}
