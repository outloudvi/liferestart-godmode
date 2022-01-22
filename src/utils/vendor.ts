import type {
  AgeInfo,
  CondExpr,
  EventInfo,
  TalentInfo,
} from './vendor.types.js'
import { preprocessAges, preprocessEvents } from './vendorHelper.js'

import _TALENTS from '../vendor/public/data/zh-cn/talents.json'
import _EVENTS from '../vendor/public/data/zh-cn/events.json'
import _AGES from '../vendor/public/data/zh-cn/age.json'

export const AGES = preprocessAges(
  _AGES as unknown as { [key: string]: AgeInfo }
)
export const TALENTS = _TALENTS as unknown as { [key: string]: TalentInfo }
export const EVENTS = preprocessEvents(_EVENTS)

export function getEventById(id: number): EventInfo | null {
  return EVENTS[id] ?? null
}

type EventFactorEvent = { event: number; condition: CondExpr }
type EventFactorAge = { age: number }
export type EventFactor = EventFactorEvent | EventFactorAge

export function checkEventFactor(evt: EventInfo): EventFactor[] {
  // check vendor/src/event.js:Event::check

  const ret: EventFactor[] = []
  // If it has a branch source
  for (const item of Object.values(EVENTS)) {
    if (!item.branch) continue
    const canComeFrom = item.branch.filter((x) => x[1] == evt.id)
    for (const i of canComeFrom) {
      if (item.id !== evt.id)
        ret.push({
          event: item.id,
          condition: i[0],
        })
    }
  }

  // If it has an age source
  for (const item of Object.values(AGES)) {
    for (const ievt of item.event) {
      if (Array.isArray(ievt)) {
        if (ievt[0] === evt.id) {
          ret.push({
            age: Number(item.age),
          })
        }
      } else {
        if (ievt === evt.id) {
          ret.push({
            age: Number(item.age),
          })
        }
      }
    }
  }
  return ret
}

export interface EventHierarchyReply {
  level: number
  event: EventFactorEvent
}

export function checkEventHierarchy(evt: EventInfo): {
  events: EventHierarchyReply[]
  parents: number[]
} {
  let evtList: EventHierarchyReply[] = checkEventFactor(evt)
    .filter((x) => (x as EventFactorEvent).event)
    .map((x) => ({
      level: 1,
      event: x as EventFactorEvent,
    }))

  // Events
  let pendingParentEvtList: EventFactorEvent[] = []
  for (let i = 0; i < evtList.length; i++) {
    const { level, event } = evtList[i]
    const eventList = checkEventFactor(EVENTS[event.event])
      .filter((x) => (x as EventFactorEvent).event)
      .map((x) => ({
        level: level + 1,
        event: x as EventFactorEvent,
      }))
    if (eventList.length === 0) {
      pendingParentEvtList.push(event)
    } else {
      evtList = evtList.concat(eventList)
    }
  }

  // Earliest event ages
  let parentsEvtList: number[] = []
  for (const i of pendingParentEvtList) {
    const ages = checkEventFactor(EVENTS[i.event])
      .filter((x) => (x as EventFactorAge).age != undefined)
      .map((x) => (x as EventFactorAge).age)
    parentsEvtList = parentsEvtList.concat(ages)
  }

  return { events: evtList, parents: parentsEvtList }
}
