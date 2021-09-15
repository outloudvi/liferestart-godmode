import { Parser, ParseResult } from './parser.js'
import type { CondExpr } from './vendor.types.js'

export function parseCond(input: string): CondExpr | null {
  // this unbalanced parenthesis just sits in the vendor data
  if (input === "(STR<3)&((MNY<3)&(EVT?[10009])") {
    return parseCond("(STR<3)&(MNY<3)&(EVT?[10009])")
  }

  const p = new Parser(input)

  function cmp(): ParseResult<CondExpr> {
    const props = ['CHR','INT','STR','MNY','SPR','AGE','TMS'].map((x) => {
      return () => p.string(x)
    })
    const ops = ['>','<'].map((x) => {
      return () => p.string(x)
    })

    const prop = p.choice(props)
    const op = p.choice(ops)
    const num = p.integer()
    return p.failed ? null : { tag: 'Cmp', val: [prop!, op!, num!] }
  }

  function ref(): ParseResult<CondExpr> {
    const props = ['EVT','TLT','AEVT'].map((x) => {
      return () => p.string(x)
    })
    const ops = ['?','!'].map((x) => {
      return () => p.string(x)
    })
    const nats = () => p.sepBy1(() => p.integer(), ',')

    const prop = p.choice(props)
    const op = p.choice(ops)
    const nums = p.bracket(nats)
    return p.failed ? null : { tag: 'Ref', val: [prop!, op!, nums!] }
  }

  function cond() {
    return p.choice([cmp, ref])
  }


  function expr(): ParseResult<CondExpr> {
    function oneGroup() {
      return p.choice([cond, () => p.paren(expr)]) // aww, mutual recursion
    }
    function andCell() {
      p.string('&')
      const val = p.runP(oneGroup)
      return val ? ['And', val] : null
    }
    function orCell() {
      p.string('|')
      const val = p.runP(oneGroup)
      return val ? ['Or', val] : null
    }

    const head = p.runP(oneGroup)!
    const tail = p.many(() => p.choice([andCell, orCell]))!
    if (!tail)
      return null
    let cur = head
    for (let i=0; i<tail.length; ++i) {
      const [tag, val]: any = tail[i]
      // if (curkey === 'And' && tag === 'And' || curkey === 'Or' && tag === 'Or')
      if (cur.tag === tag)
        cur = {tag: tag, val: [...cur.val, val]}
      else
        cur = {tag: tag, val: [cur, val]}
    }
    return cur
  }

  const result = expr()
  return p.eof() ? result : null
}