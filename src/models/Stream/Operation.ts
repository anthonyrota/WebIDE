import { DisposableLike } from 'src/models/Disposable/DisposableLike'
import { Stream } from 'src/models/Stream/Stream'
import { copySource } from 'src/models/Stream/StreamOperators/copySource'
import { ValueTransmitter } from 'src/models/Stream/ValueTransmitter'

export type Operation<
  TInput,
  TOutput,
  TStream extends Stream<TInput> = Stream<TInput>
> = (
  source: TStream
) => (target: ValueTransmitter<TOutput, unknown>) => DisposableLike

export function operate<
  TInput,
  TOutput,
  TStream extends Stream<TInput> = Stream<TInput>
>(
  connect: (
    source: TStream,
    target: ValueTransmitter<TOutput, unknown>
  ) => DisposableLike
): Operation<TInput, TOutput, TStream> {
  return (source: TStream) => (target: ValueTransmitter<TOutput, unknown>) =>
    connect(
      source,
      target
    )
}

export function operateCurried<
  TInput,
  TOutput,
  TStream extends Stream<TInput> = Stream<TInput>
>(
  operation: (
    source: TStream
  ) => (target: ValueTransmitter<TOutput, unknown>) => DisposableLike
): Operation<TInput, TOutput, TStream> {
  return operation
}

export function operateOnTarget<T>(
  connectToTarget: (target: ValueTransmitter<T, unknown>) => DisposableLike
): Operation<unknown, T> {
  return operate((_, target) => connectToTarget(target))
}

export function operateThroughValueTransmitter<
  TInput,
  TOutput,
  TStream extends Stream<TInput> = Stream<TInput>
>(
  createValueTransmitter: (
    target: ValueTransmitter<TOutput, unknown>
  ) => ValueTransmitter<TInput, TOutput>
): Operation<TInput, TOutput, TStream> {
  return operate((source, target) =>
    source.subscribe(createValueTransmitter(target))
  )
}

export function transform<
  TInput,
  TOutput,
  TStream extends Stream<TInput> = Stream<TInput>
>(
  transform: (source: TStream) => Stream<TOutput>
): Operation<TInput, TOutput, TStream> {
  return source => {
    const transformed = transform(source)

    return target => transformed.subscribe(target)
  }
}

export function transformInstanced<
  TInput,
  TOutput,
  TStream extends Stream<TInput> = Stream<TInput>
>(
  transform: (source: TStream) => Stream<TOutput>
): Operation<TInput, TOutput, TStream> {
  return operate((source, target) => transform(source).subscribe(target))
}

export function combineOperators<T>(): Operation<T, T>
export function combineOperators<A, B, S extends Stream<A> = Stream<A>>(
  op1: Operation<A, B, S>
): Operation<A, B, S>
export function combineOperators<A, B, C, S extends Stream<A> = Stream<A>>(
  op1: Operation<A, B, S>,
  op2: Operation<B, C>
): Operation<A, C, S>
export function combineOperators<A, B, C, D, S extends Stream<A> = Stream<A>>(
  op1: Operation<A, B, S>,
  op2: Operation<B, C>,
  op3: Operation<C, D>
): Operation<A, D, S>
export function combineOperators<
  A,
  B,
  C,
  D,
  E,
  S extends Stream<A> = Stream<A>
>(
  op1: Operation<A, B, S>,
  op2: Operation<B, C>,
  op3: Operation<C, D>,
  op4: Operation<D, E>
): Operation<A, E, S>
export function combineOperators<
  A,
  B,
  C,
  D,
  E,
  F,
  S extends Stream<A> = Stream<A>
>(
  op1: Operation<A, B, S>,
  op2: Operation<B, C>,
  op3: Operation<C, D>,
  op4: Operation<D, E>,
  op5: Operation<E, F>
): Operation<A, F, S>
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
  op1: Operation<A, B, S>,
  op2: Operation<B, C>,
  op3: Operation<C, D>,
  op4: Operation<D, E>,
  op5: Operation<E, F>,
  op6: Operation<F, G>
): Operation<A, G, S>
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
  op1: Operation<A, B, S>,
  op2: Operation<B, C>,
  op3: Operation<C, D>,
  op4: Operation<D, E>,
  op5: Operation<E, F>,
  op6: Operation<F, G>,
  op7: Operation<G, H>
): Operation<A, H, S>
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
  op1: Operation<A, B, S>,
  op2: Operation<B, C>,
  op3: Operation<C, D>,
  op4: Operation<D, E>,
  op5: Operation<E, F>,
  op6: Operation<F, G>,
  op7: Operation<G, H>,
  op8: Operation<H, I>
): Operation<A, I, S>
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
  op1: Operation<A, B, S>,
  op2: Operation<B, C>,
  op3: Operation<C, D>,
  op4: Operation<D, E>,
  op5: Operation<E, F>,
  op6: Operation<F, G>,
  op7: Operation<G, H>,
  op8: Operation<H, I>,
  op9: Operation<I, J>
): Operation<A, J, S>
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
  op1: Operation<A, B, S>,
  op2: Operation<B, C>,
  op3: Operation<C, D>,
  op4: Operation<D, E>,
  op5: Operation<E, F>,
  op6: Operation<F, G>,
  op7: Operation<G, H>,
  op8: Operation<H, I>,
  op9: Operation<I, J>,
  ...operators: Array<Operation<any, any>>
): Operation<A, any, S>

export function combineOperators(
  ...operators: Array<Operation<any, any>>
): Operation<any, any> {
  if (operators.length === 0) {
    return copySource()
  }

  if (operators.length === 1) {
    return operators[0]
  }

  return operate((source: Stream<any>, target: ValueTransmitter<any, any>) => {
    for (let i = 0; i < operators.length; i++) {
      source = source.lift(operators[i])
    }

    return source.subscribe(target)
  })
}
