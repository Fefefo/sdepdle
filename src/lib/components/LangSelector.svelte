<script lang="ts">
  // import { getFlagURL } from "$lib";
  import { setLocale, getLocale, locales } from "$lib/paraglide/runtime";
  import { Popover } from "@skeletonlabs/skeleton-svelte";
  const flags = import.meta.glob("$lib/assets/flags/*.svg", {
    eager: true
  });
  const flagsList = Object.entries(flags).map(([path, mod]: [string, any]) => ({
    // path,
    url: mod.default,
    name: path.split("/").pop()?.split(".")[0]
  }));

  let { heigthClass = "h-4" } = $props();

  let openState = $state(false);
</script>

<Popover
  open={openState}
  onOpenChange={(e) => (openState = e.open)}
  positioning={{ placement: "bottom" }}
  triggerBase="btn"
  contentBase=""
  arrow
  arrowBackground="!bg-cyan-700"
>
  {#snippet trigger()}
    <img alt="flag" src={flagsList.find((img) => img.name == getLocale())?.url} class={heigthClass} />
  {/snippet}
  {#snippet content()}
    <div class="card z-20 !m-0 !bg-transparent">
      <div class="mr-2 flex flex-row gap-2 rounded-md bg-cyan-700 p-2">
        {#each locales as loc}
          <button
            type="button"
            onclick={() => {
              setLocale(loc);
            }}
            class={heigthClass}
          >
            <img src={flagsList.find((img) => img.name == loc)?.url} alt="flag" class={heigthClass} />
          </button>
        {/each}
      </div>
    </div>
  {/snippet}
</Popover>
