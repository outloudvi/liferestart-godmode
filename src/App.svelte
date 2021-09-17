<script lang="ts">
  import { afterUpdate, onMount } from 'svelte'
  import { link, location } from 'svelte-spa-router'

  import * as vendor from './utils/vendor'
  import type { CondExpr } from './utils/vendor.types'

  import Cond from './CondExpr.svelte'

  const EVENTS = Object.values(vendor.EVENTS)

  let _selected: number
  let _search: string = ''

  let prerequisite: CondExpr | null
  let conflict: CondExpr | null
  let factors: vendor.EventFactor[] = []
  let hierarchy: vendor.EventHierarchyReply[] = []
  let hierarchyRoot: number[] = []
  let filteredEvents = EVENTS
  let laterEvents: [CondExpr,number][] = []
  let lastEvent = -1
  let hierarchyCache: { id: number; item: any }[] = []

  export let params = {}

  // @ts-ignore
  window.vendor = vendor

  function numRangeToStr(x: number[]): string {
    x.sort((a, b) => a - b)

    const ret: string[] = []
    let left = x[0]
    let right = x[0]
    for (let i = 1; i < x.length; i++) {
      if (x[i] - right === 1) {
        right = x[i]
      } else {
        ret.push(left === right ? String(left) : `${left}-${right}`)
        left = right = x[i]
      }
    }
    ret.push(left === right ? String(left) : `${left}-${right}`)
    return ret.join(', ')
  }

  function dedup(x: any[]): any[] {
    return [...new Set(x)]
  }

  function filterList(q: string) {
    if (q === '') {
      filteredEvents = EVENTS
      return
    }
    filteredEvents = EVENTS.filter(
      (x) =>
        String(x.id).includes(_search) ||
        x.event.includes(_search) ||
        (x.postevent || '').includes(_search)
    )
  }

  function showAnalysis(_item: string) {
    if (_item === '') return
    const item = Number(_item)
    const event = vendor.getEventById(item)
    laterEvents = event?.branch || []
    if (event === null) {
      alert('No such event')
      return
    }

    prerequisite = event.include ?? null
    conflict = event.exclude ?? null
    factors = vendor.checkEventFactor(event)

    const hierarchyCacheHit = hierarchyCache.filter((x) => x.id === event.id)
    let hierarchyList
    if (hierarchyCacheHit.length === 1) {
      hierarchyList = hierarchyCache[0].item
    } else {
      hierarchyList = vendor.checkEventHierarchy(event)
      hierarchyCache.push({
        id: event.id,
        item: hierarchyList,
      })
      if (hierarchyCache.length > 20) {
        hierarchyCache.splice(0, 1)
      }
    }
    hierarchy = hierarchyList.events
    hierarchyRoot = dedup(hierarchyList.parents)
  }

  afterUpdate(() => {
    const evt = Number(params.event)
    if (Number.isNaN(evt)) return
    if (lastEvent === evt) return

    _selected = evt
    showAnalysis(evt)
    lastEvent = evt
  })
</script>

<div class="App">
  <h1>
    LifeRestart God
    <sup>
      <small>(<a href="https://uau.li/~god">uau.li/~god</a>)</small>
    </sup>
  </h1>

  <input
    type="text"
    placeholder="搜索事件或编号..."
    bind:value={_search}
    on:keydown={(e) => {
      if (e.key === 'Enter') filterList(_search)
    }}
  />
  <button on:click={() => filterList(_search)}>搜索</button>
  <br />
  <br />
  <select
    id="selector"
    bind:value={_selected}
    on:change={() => showAnalysis(_selected)}
  >
    <option value="" />
    {#each filteredEvents as evt}
      <option value={evt.id}>
        {evt.event} (#{evt.id})
      </option>
    {/each}
  </select>

  {#if _selected}
    <hr />
    <h3>这个事件...</h3>
    <ul>
      {#if prerequisite}
        <li>发生的前置条件：<Cond expr={prerequisite} /></li>
      {/if}
      {#if conflict}
        <li>不会在满足下列条件时发生：<Cond expr={conflict} /></li>
      {/if}
    </ul>
    <ul></ul>
    <ul>
      {#if factors.length > 0}
        {#each factors.filter((x) => x.event) as factor}
          <li>
            若满足<Cond expr={factor.condition}
            />，将于 「{vendor.EVENTS[factor.event].event}」 (<a
              href={`/e/${factor.event}`}
              use:link>#{factor.event}</a
            >) 之后发生。
          </li>
        {/each}
        {#if factors.filter((x) => x.age != undefined).length > 0}
          <li>
            可能在以下年龄自然发生：{numRangeToStr(
              dedup(factors.filter((x) => x.age != undefined).map((x) => x.age))
            )}
          </li>
        {/if}
      {:else}
        <li>似乎不会发生。</li>
      {/if}
    </ul>
  {/if}

  {#if hierarchy.length > 0}
    <hr />
    <h3>来自世界之神的引导...</h3>
    <ul>
      {#each hierarchy as evt}
        <li>
          [前 {evt.level} 个事件] 「{vendor.EVENTS[evt.event.event].event}」 (<a
            href={`/e/${evt.event.event}`}
            use:link>#{evt.event.event}</a
          >)
        </li>
      {/each}
    </ul>
  {/if}

  {#if hierarchyRoot.length > 0}
    最久远的引导可能在这些年龄发生： {numRangeToStr(hierarchyRoot)}
  {/if}

  {#if laterEvents.length}
    <hr />
    <h3>这个事件之后可能会...</h3>
    <ul>
      {#each laterEvents as [evtCond, evtId]}
        <li>
          若满足<Cond expr={evtCond} />，将发生「{vendor.EVENTS[evtId].event}」 (<a
            href={`/e/${evtId}`}
            use:link>#{evtId}</a
          >)。
        </li>
      {/each}
    </ul>
  {/if}
</div>
<hr />
<div class="center">
  <a href="https://github.com/outloudvi/liferestart-godmode">本页源码</a> |
  <a href="https://github.com/VickScarlet/lifeRestart">原作</a>
  | <a href="https://liferestart.syaro.io/">游玩</a>
</div>

<style>
  :global(body) {
    margin: 0;
    font-family: Arial, Helvetica, sans-serif;
  }

  .App {
    text-align: center;
  }

  #selector {
    width: 65vw;
  }

  .App p {
    margin: 0.4rem;
  }

  .center {
    text-align: center;
  }

  .App-header {
    background-color: #f9f6f6;
    color: #333;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-size: calc(10px + 2vmin);
  }

  .App-link {
    color: #ff3e00;
  }

  .App-logo {
    height: 36vmin;
    pointer-events: none;
    margin-bottom: 3rem;
    animation: App-logo-spin infinite 1.6s ease-in-out alternate;
  }

  @keyframes App-logo-spin {
    from {
      transform: scale(1);
    }
    to {
      transform: scale(1.06);
    }
  }
</style>
