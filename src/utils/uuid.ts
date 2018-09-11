import { buildString } from 'src/utils/buildString'
import { chooseRandom } from 'src/utils/chooseRandom'

const chars = [
  '0',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  'a',
  'b',
  'c',
  'd',
  'e',
  'f'
]
const timeHighBits = ['8', '9', 'a', 'b']

export function uuid(): string {
  return buildString([
    chooseRandom(chars),
    chooseRandom(chars),
    chooseRandom(chars),
    chooseRandom(chars),
    chooseRandom(chars),
    chooseRandom(chars),
    chooseRandom(chars),
    chooseRandom(chars),
    '-',
    chooseRandom(chars),
    chooseRandom(chars),
    chooseRandom(chars),
    chooseRandom(chars),
    '-',
    '4',
    chooseRandom(chars),
    chooseRandom(chars),
    chooseRandom(chars),
    '-',
    chooseRandom(timeHighBits),
    chooseRandom(chars),
    chooseRandom(chars),
    chooseRandom(chars),
    '-',
    chooseRandom(chars),
    chooseRandom(chars),
    chooseRandom(chars),
    chooseRandom(chars),
    chooseRandom(chars),
    chooseRandom(chars),
    chooseRandom(chars),
    chooseRandom(chars),
    chooseRandom(chars),
    chooseRandom(chars),
    chooseRandom(chars),
    chooseRandom(chars)
  ])
}
