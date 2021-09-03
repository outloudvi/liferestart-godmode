import type { AgeInfo } from './vendor.types'

export function preprocessAges(a: any): { [key: string]: AgeInfo } {
  for (const k of Object.keys(a)) {
    if (!a[k].event) a[k].event = []
    for (let i = 0; i < a[k].event.length; i++) {
      if (typeof a[k].event[i] === 'string') {
        a[k].event[i] = a[k].event[i].split('*').map(Number)
      }
    }
  }
  return a
}
