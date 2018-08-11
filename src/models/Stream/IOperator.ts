import { DisposableLike } from 'src/models/Disposable/DisposableLike'
import { Stream } from 'src/models/Stream/Stream'
import { copySource } from 'src/models/Stream/StreamOperators/copySource'
import { ValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export interface IOperator<
  TInput,
  TOutput,
  TStream extends Stream<TInput> = Stream<TInput>
> {
  connect(
    target: ValueTransmitter<TOutput, unknown>,
    source: TStream
  ): DisposableLike
}

export function combineOperators<T>(): IOperator<T, T>
export function combineOperators<A, B, S extends Stream<A> = Stream<A>>(
  op1: IOperator<A, B, S>
): IOperator<A, B, S>
export function combineOperators<A, B, C, S extends Stream<A> = Stream<A>>(
  op1: IOperator<A, B, S>,
  op2: IOperator<B, C>
): IOperator<A, C, S>
export function combineOperators<A, B, C, D, S extends Stream<A> = Stream<A>>(
  op1: IOperator<A, B, S>,
  op2: IOperator<B, C>,
  op3: IOperator<C, D>
): IOperator<A, D, S>
export function combineOperators<
  A,
  B,
  C,
  D,
  E,
  S extends Stream<A> = Stream<A>
>(
  op1: IOperator<A, B, S>,
  op2: IOperator<B, C>,
  op3: IOperator<C, D>,
  op4: IOperator<D, E>
): IOperator<A, E, S>
export function combineOperators<
  A,
  B,
  C,
  D,
  E,
  F,
  S extends Stream<A> = Stream<A>
>(
  op1: IOperator<A, B, S>,
  op2: IOperator<B, C>,
  op3: IOperator<C, D>,
  op4: IOperator<D, E>,
  op5: IOperator<E, F>
): IOperator<A, F, S>
export function combineOperators<
  A,
  B,
  C,
  D,
  E,
  F,
  G,
  S extends Stream<A> = Stream<A>
>(
  op1: IOperator<A, B, S>,
  op2: IOperator<B, C>,
  op3: IOperator<C, D>,
  op4: IOperator<D, E>,
  op5: IOperator<E, F>,
  op6: IOperator<F, G>
): IOperator<A, G, S>
export function combineOperators<
  A,
  B,
  C,
  D,
  E,
  F,
  G,
  H,
  S extends Stream<A> = Stream<A>
>(
  op1: IOperator<A, B, S>,
  op2: IOperator<B, C>,
  op3: IOperator<C, D>,
  op4: IOperator<D, E>,
  op5: IOperator<E, F>,
  op6: IOperator<F, G>,
  op7: IOperator<G, H>
): IOperator<A, H, S>
export function combineOperators<
  A,
  B,
  C,
  D,
  E,
  F,
  G,
  H,
  I,
  S extends Stream<A> = Stream<A>
>(
  op1: IOperator<A, B, S>,
  op2: IOperator<B, C>,
  op3: IOperator<C, D>,
  op4: IOperator<D, E>,
  op5: IOperator<E, F>,
  op6: IOperator<F, G>,
  op7: IOperator<G, H>,
  op8: IOperator<H, I>
): IOperator<A, I, S>
export function combineOperators<
  A,
  B,
  C,
  D,
  E,
  F,
  G,
  H,
  I,
  J,
  S extends Stream<A> = Stream<A>
>(
  op1: IOperator<A, B, S>,
  op2: IOperator<B, C>,
  op3: IOperator<C, D>,
  op4: IOperator<D, E>,
  op5: IOperator<E, F>,
  op6: IOperator<F, G>,
  op7: IOperator<G, H>,
  op8: IOperator<H, I>,
  op9: IOperator<I, J>
): IOperator<A, J, S>
export function combineOperators<
  A,
  B,
  C,
  D,
  E,
  F,
  G,
  H,
  I,
  J,
  S extends Stream<A> = Stream<A>
>(
  op1: IOperator<A, B, S>,
  op2: IOperator<B, C>,
  op3: IOperator<C, D>,
  op4: IOperator<D, E>,
  op5: IOperator<E, F>,
  op6: IOperator<F, G>,
  op7: IOperator<G, H>,
  op8: IOperator<H, I>,
  op9: IOperator<I, J>,
  ...operators: Array<IOperator<any, any>>
): IOperator<A, any, S>
export function combineOperators(
  ...operators: Array<IOperator<any, any>>
): IOperator<any, any> {
  if (operators.length === 0) {
    return copySource()
  }
  if (operators.length === 1) {
    return operators[0]
  }
  return new CombineOperatorsOperator(operators)
}

class CombineOperatorsOperator implements IOperator<any, any> {
  constructor(private operators: Array<IOperator<any, any>>) {}

  public connect(
    target: ValueTransmitter<any, any>,
    source: Stream<any>
  ): DisposableLike {
    for (let i = 0; i < this.operators.length; i++) {
      source = source.lift(this.operators[i])
    }
    return source.subscribe(target)
  }
}
