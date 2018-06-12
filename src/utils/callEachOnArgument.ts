export function callEachOnArgument<TArgument>(
  ...funcs: Array<(argument: TArgument) => any>
): (argument: TArgument) => void {
  return (argument: TArgument): void => {
    for (let i = 0; i < funcs.length; i++) {
      funcs[i](argument)
    }
  }
}
