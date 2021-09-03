<script lang="ts">
  import * as vendor from './utils/vendor'

  const EVENTS = Object.values(vendor.EVENTS)

  let _selected: number

  let factors: vendor.EventFactor[] = []
  let hierarchy: vendor.EventHierarchyReply[] = []
  let hierarchyRoot: number[] = []

  // @ts-ignore
  window.vendor = vendor

  function dedup(x: any[]): any[] {
    return [...new Set(x)]
  }

  function showAnalysis(item: number) {
    const event = vendor.getEventById(item)
    if (event === null) {
      alert('No such event')
      return
    }
    factors = vendor.checkEventFactor(event)
    const hierarchyList = vendor.checkEventHierarchy(event)
    hierarchy = hierarchyList.events
    hierarchyRoot = dedup(hierarchyList.parents)
  }
</script>

<div class="App">
  <h1>LifeRestart Helpers</h1>
  <select
    id="selector"
    bind:value={_selected}
    on:change={() => showAnalysis(_selected)}
  >
    {#each EVENTS as evt}
      <option value={evt.id}>
        {evt.event} - #{evt.id}
      </option>
    {/each}
  </select>
  <hr />

  {#if factors.length > 0}
    <h3>这个事件...</h3>
    <!-- <ul> -->
    <!-- {#each factors.filter((x) => x.event) as factor}
        <li>
          可能于 「{vendor.EVENTS[factor.event].event}」 (#{factor.event})
          之后发生。
        </li>
      {/each} -->
    {#if factors.filter((x) => x.age).length > 0}
      <!-- <li> -->
      可能在以下年龄自然发生：{dedup(
        factors.filter((x) => x.age).map((x) => x.age)
      ).join(', ')}
      <!-- </li> -->
    {/if}
    <!-- </ul> -->
  {/if}
  <hr />

  {#if hierarchy.length > 0}
    <h3>来自世界之神的引导...</h3>
    <ul>
      {#each hierarchy as evt}
        <li>
          [前 {evt.level} 个事件] 「{vendor.EVENTS[evt.event.event].event}」 (#{evt
            .event.event})
        </li>
      {/each}
    </ul>
  {/if}
  {#if hierarchyRoot.length > 0}
    最久远的事件可能在这些年龄发生： {hierarchyRoot.join(', ')}
  {/if}
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
