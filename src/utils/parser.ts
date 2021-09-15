export type ParserCombinator<T> = () => ParseResult<T>
export type ParseResult<T> = T | null

export class Parser {
  #input: string
  #failed = false

  constructor(str: string) {
    this.#input = str
  }

  pFail() {
    this.#failed = true
    return null
  }

  string(str: string): ParseResult<string> {
    if (this.#failed) return null
    if (this.#input.startsWith(str)) {
      this.#input = this.#input.slice(str.length)
      return str
    }
    return this.pFail()
  }

  // don't support non-decimal or leading 0
  // maybe it would rather named as decimal()
  integer(): ParseResult<number> {
    if (this.#failed) return null
    const i = parseInt(this.#input, 10)
    if (i || i === 0) {
      this.#input = this.#input.slice((""+i).length)
      return i
    }
    return this.pFail()
  }

  takeWhile(pred: (c: string) => boolean): ParseResult<string> {
    if (this.#failed) return null
    let i = 0
    for (i=0; i<this.#input.length; ++i) {
      if (!pred(this.#input[i]))
        break;
    }
    const ret = this.#input.slice(0,i)
    this.#input = this.#input.slice(i)
    return ret
  }

  sepBy<T>(p: ParserCombinator<T>, delim: string): ParseResult<T[]> {
    if (this.#failed) return null
    return this.tryP(() => this.sepBy1(p, delim)) ?? []
  }

  sepBy1<T>(p: ParserCombinator<T>, delim: string): ParseResult<T[]> {
    if (this.#failed) return null
    const head = p()
    if (head === null)
      return null
    const tail = this.many(() => { this.string(delim); return this.runP(p) })
    return [head].concat(tail!)
  }

  many<T>(p: ParserCombinator<T>): ParseResult<T[]> {
    if (this.#failed) return null
    let accu = []
    while (1) {
      const x = this.tryP(p)
      if (x === null)
        break
      else
        accu.push(x)
    }
    return accu
  }

  many1<T>(p: ParserCombinator<T>): ParseResult<T[]> {
    if (this.#failed) return null
    const head = p()
    if (head === null)
      return null
    return [head].concat(this.many(p)!)
  }

  tryP<T>(p: ParserCombinator<T>): ParseResult<T> {
    if (this.#failed) return null
    const inputBak = this.#input
    const result = p()
    if (this.#failed) {
      this.#input = inputBak
      this.#failed = false
      return null
    }
    return result
  }

  choice<T>(ps: (ParserCombinator<T>)[]): ParseResult<T> {
    if (this.#failed) return null
    let i=0, ret
    for (i=0; i<ps.length-1; ++i) {
      ret = this.tryP(ps[i])
      if (ret !== null)
        return ret
    }
    return ps[i]()
  }

  surround<T>(left: string, right: string, mid: ParserCombinator<T>): ParseResult<T> {
    if (this.#failed) return null
    this.string(left)
    const ret = this.runP(mid)
    this.string(right)
    return this.#failed ? null : ret
  }

  bracket<T>(p: ParserCombinator<T>): ParseResult<T> {
    if (this.#failed) return null
    return this.surround('[', ']', p)
  }

  paren<T>(p: ParserCombinator<T>): ParseResult<T> {
    if (this.#failed) return null
    return this.surround('(', ')', p)
  }

  runP<T>(p: ParserCombinator<T>): ParseResult<T> {
    if (this.#failed) return null
    return p()
  }

  eof(): ParseResult<boolean> {
    if (this.#failed) return null
    return this.#input === "" ? true : null
  }

  get input() {
    return this.#input
  }

  get failed() {
    return this.#failed
  }
}

