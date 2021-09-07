<script lang="ts">
  import Router from 'svelte-spa-router'
  import App from './App.svelte'

  const routes = {
    '/': App,
    '/e/:event': App,
  }
</script>

<body>
  <Router {routes} />
</body>
