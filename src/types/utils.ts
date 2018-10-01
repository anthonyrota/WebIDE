export type Head<Tuple extends any[]> = Tuple extends [infer H, ...any[]]
  ? H
  : Tuple extends Array<infer I> ? I : never

export type Tail<Tuple extends any[]> = ((...t: Tuple) => void) extends ((
  h: any,
  ...rest: infer R
) => void)
  ? R
  : never

export type Unshift<Tuple extends any[], Element> = ((
  h: Element,
  ...t: Tuple
) => void) extends (...t: infer R) => void
  ? R
  : never

export type Last<L extends any[], D = never> = IsTupleLike<L> extends false
  ? L extends Array<infer T> ? T : never
  : {
      0: D
      1: L extends [infer H] ? H : never
      2: ((...l: L) => any) extends ((h: any, ...t: infer T) => any)
        ? Last<T>
        : D
    }[L extends [] ? 0 : L extends [any] ? 1 : 2]

export type IsListInfinitelyLarge<L extends any[]> = IsTupleLike<
  L
> extends false
  ? true
  : {
      0: false
      1: false
      2: ((...l: L) => any) extends ((h: any, ...t: infer T) => any)
        ? IsListInfinitelyLarge<T>
        : true
    }[L extends [] ? 0 : L extends [any] ? 1 : 2]

export type DropLast<T extends any[]> = IsListInfinitelyLarge<T> extends true
  ? T
  : Reverse<Tail<Reverse<T>>>

export type UnshiftAll<
  Ending extends any[],
  Beginning extends any[]
> = IsListInfinitelyLarge<Beginning> extends true
  ? Ending extends []
    ? Beginning
    : Ending extends Array<infer EndingInner>
      ? SplitInfiniteTail<Beginning> extends [
          infer Finite,
          Array<infer BeginningInner>
        ]
        ? UnshiftAll_<Array<EndingInner | BeginningInner>, ToTuple<Finite>>
        : never
      : never
  : UnshiftAll_<Ending, Beginning>

type UnshiftAll_<Ending extends any[], Beginning extends any[]> = {
  0: Ending
  1: UnshiftAll_<Unshift<Ending, Last<Beginning>>, DropLast<Beginning>>
}[Beginning extends [] ? 0 : 1]

export type SplitInfiniteTail<Tuple extends any[]> = _SplitInfiniteTail<
  Tuple
> extends [infer Finite, infer Infinite]
  ? Finite extends any[] ? [Reverse<Finite>, Infinite] : never
  : never

type _SplitInfiniteTail<Tuple extends any[], Holder extends any[] = []> = {
  matched: [Holder, Tuple]
  unmatched: ((..._: Tuple) => any) extends ((
    _: infer First,
    ..._1: infer Rest
  ) => any)
    ? _SplitInfiniteTail<Rest, Unshift<Holder, First>>
    : never
}[Tuple extends Array<infer Element>
  ? Element[] extends Tuple ? 'matched' : 'unmatched'
  : never]

export type Reverse<Tuple extends any[]> = ToTuple<Reverse_<Tuple, []>>
export type Reverse_<Tuple extends any[], Result extends any[]> = {
  1: Result
  0: Reverse_<Tail<Tuple>, Unshift<Result, Head<Tuple>>>
}[Tuple extends [] ? 1 : 0]

export type ToTuple<T> = T extends any[] ? T : any[]

export type IsTupleLike<T extends any[]> = T extends []
  ? true
  : T extends [infer _, ...any[]] ? true : false
