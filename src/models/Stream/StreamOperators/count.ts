import { add1 } from 'src/utils/add1'
import { always } from 'src/utils/always'
import { reduceWithInitialValue } from './reduceWithInitialValue'

export const count = always(reduceWithInitialValue<unknown, number>(add1, 0))
