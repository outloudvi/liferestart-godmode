import autoPreprocess from 'svelte-preprocess'

export default {
  preprocess: autoPreprocess(),
  packageOptions: {
    knownEntrypoints: ['svelte', 'svelte/store'],
  },
}
