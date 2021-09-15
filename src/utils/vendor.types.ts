type NoS = number | string // number or string'd number
export type CondExpr =
  | {tag: "Cmp", val: [prop: string, op: string, num: number]}
  | {tag: "Ref", val: [prop: string, op: string, ids: number[]]}
  | {tag: "Or",  val: CondExpr[]}
  | {tag: "And", val: CondExpr[]}
// vendor/src/property:Property.TYPES
export enum PropTypes {
  AGE = 'AGE',
  CHR = 'CHR',
  INT = 'INT',
  STR = 'STR',
  MNY = 'MNY',
  SPR = 'SPR',
  LIF = 'LIF',
  TLT = 'TLT',
  EVT = 'EVT',
}

export interface AgeInfo {
  age: number
  event: (number | [number, number])[]
}

export interface TalentInfo {
  id: string
  name: string
  description: string
  grade: number
  status: number
  effect: { [key in PropTypes]: number }
  exclusive: NoS[]
}

export interface EventInfo {
  id: number
  event: string
  postevent?: string
  effect?: { [key in PropTypes]: number }
  include?: CondExpr
  exclude?: CondExpr
  NoRandom?: number
  branch?: [CondExpr, number][]
}

// vendor/view/condition_test.html
export interface State {
  [PropTypes.AGE]?: number // age
  [PropTypes.CHR]?: number // 颜值 charm CHR
  [PropTypes.INT]?: number // 智力 intelligence INT
  [PropTypes.STR]?: number // 体质 strength STR
  [PropTypes.MNY]?: number // 家境 money MNY
  [PropTypes.SPR]?: number // 快乐 spirit SPR
  [PropTypes.LIF]?: number // 生命 life LIF
  [PropTypes.TLT]?: number[] // 天赋 talent TLT
  [PropTypes.EVT]?: number[] // 事件 event EVT
}
