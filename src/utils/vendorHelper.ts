import { parseCond } from './vendor.parser'
import type { AgeInfo, EventInfo } from './vendor.types'

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

export function preprocessEvents(a: any): { [key: string]: EventInfo } {
  for (const k of Object.keys(a)) {
    if (a[k].exclude) {
      a[k].exclude = parseCond(a[k].exclude)
    }

    if (a[k].include) {
      a[k].include = parseCond(a[k].include)
    }

    if (a[k].branch) {
      for (let i = 0; i < a[k].branch.length; i++) {
        let [cond, goal] = a[k].branch[i].split(':')
        cond = parseCond(cond)
        goal = Number(goal)
        a[k].branch[i] = [cond, goal]
      }
    }
  }
  return a
}