import { randomString } from 'src/utils/randomString'

export function createUniqueKey(baseName: string = ''): string {
  return `__${baseName}$${randomString()}`
}
