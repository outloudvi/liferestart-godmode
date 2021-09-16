<script lang="ts">
  import type { CondExpr } from "./utils/vendor.types";
  import * as vendor from "./utils/vendor"

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
    return val === '!' ? '无' : ''
  }
</script>

{#if expr.tag === "Cmp"}
  <span class='nested-cond-{depth}'>
    {formatProp(expr.val[0])}{expr.val[1]}{expr.val[2]}
  </span>
{:else if expr.tag === 'Ref'}
  <span class='nested-cond-{depth}'>
    {#if expr.val[0] === 'TLT'}
      {showIsNegate(expr.val[0])}天赋{expr.val[2].map(x => "#"+x)}
    {:else if expr.val[0] === 'EVT'}
      {showIsNegate(expr.val[0])}事件{expr.val[2].map(x => "#"+x)}
    {:else if expr.val[0] === 'AEVT'}
      {showIsNegate(expr.val[0])}继承事件{expr.val[2].map(x => "#"+x)}
    {/if}
  </span>
{:else if expr.tag === 'Or'}
  <span class='nested-cond-{depth}'>
    下列条件任一：
    {#each expr.val as subExpr, index}
      {#if index != 0}，{/if}
      <svelte:self expr={subExpr} depth={depth+1}></svelte:self>
    {/each}
  </span>
{:else if expr.tag === 'And'}
  <span class='nested-cond-{depth}'>
    下列所有条件：
    {#each expr.val as subExpr, index}
      {#if index != 0}，{/if}
      <svelte:self expr={subExpr} depth={depth+1}></svelte:self>
    {/each}
  </span>
{/if}




<style>
  .nested-cond-1 {
    text-decoration-line: underline;
    text-decoration-style: solid;
  }

  .nested-cond-2 {
    text-decoration-line: underline;
    text-decoration-style: double;
  }
</style>
