<script lang="ts">
  import type { CondExpr } from "./utils/vendor.types";
  import * as vendor from "./utils/vendor"
import App from "./App.svelte";

  export let expr: CondExpr
  export let depth = 0

  function formatProp(prop: string) {
    switch(prop) {
      case 'AGE': return '年龄'
      case 'CHR': return '颜值'
      case 'INT': return '智力'
      case 'STR': return '体质'
      case 'MNY': return '家境'
      case 'SPR': return '快乐'
      case 'LIF': return '生命'
      case 'TMS': return '重开次数'
      default:    return '???'
    }
  }

  function showIsNegate(val: string) {
    return val === '!' ? '未' : ''
  }

  function lookupRefCond(prop: string, id: number): string {
    switch(prop) {
      case 'TLT':  return vendor.TALENTS[id].name

      case 'EVT':
      case 'AEVT': return vendor.EVENTS[id].event
    }
  }
</script>

{#if expr.tag === "Cmp"}
  <span class='nested-cond-{depth}'>
    {formatProp(expr.val[0])}{expr.val[1]}{expr.val[2]}
  </span>
{:else if expr.tag === 'Ref'}
  <span class='nested-cond-{depth}'>

    {showIsNegate(expr.val[1])
    }{#if expr.val[0] === 'TLT'}
      {expr.val[2].length > 1 ? '拥有下列任一天赋' : '拥有天赋'}
    {:else if expr.val[0] === 'EVT'}
      {expr.val[2].length > 1 ? '曾发生下列任一事件' : `曾发生事件`}
    {:else if expr.val[0] === 'AEVT'}
      {expr.val[2].length > 1 ? '此生或此生前曾发生下列任一事件'
                              : `此生或此生前曾发生事件`}
    {/if}

    {#each expr.val[2] as refId, index}
      {#if index != 0},{/if}
      <span class='tooltip'>
        #{refId}
        <span class='tooltiptext'>「{lookupRefCond(expr.val[0], refId)}」</span>
      </span>
    {/each}

  </span>
{:else if expr.tag === 'Or'}
  <span class='nested-cond-{depth}'>
    满足下列条件任一：
    {#each expr.val as subExpr, index}
      {#if index != 0}，{/if}
      <svelte:self expr={subExpr} depth={depth+1}></svelte:self>
    {/each}
  </span>
{:else if expr.tag === 'And'}
  <span class='nested-cond-{depth}'>
    {#each expr.val as subExpr, index}
      {#if index != 0}
      {' '}且{/if}
      <svelte:self expr={subExpr} depth={depth+1}></svelte:self>
    {/each}
  </span>
{/if}




<style>
  .nested-cond-1 {
    /* text-decoration-line: underline;
    text-decoration-style: solid; */
  }

  .nested-cond-2 {
    /* text-decoration-line: underline;
    text-decoration-style: double; */
  }

  .tooltip {
    position: relative;
    display: inline-block;
    border-bottom: 1px dotted black;
  }

  .tooltip .tooltiptext {
    visibility: hidden;
    width: max-content;
    background-color: black;
    color: #fff;
    text-align: center;
    border-radius: 6px;
    padding: 6px;
    position: absolute;
    z-index: 1;
    bottom: 100%;
    left: 20%;
  }

  .tooltip:hover .tooltiptext {
    visibility: visible;
  }
</style>
