<script lang="ts">
  // import { getFlagURL } from "$lib";
  import { setLocale, getLocale, locales } from "$lib/paraglide/runtime";
  import { flagsList } from "$lib/store";
  import { Popover } from "@skeletonlabs/skeleton-svelte";

  let { heigthClass = "h-4" } = $props();

  let openState = $state(false);
  $effect(() => {
    console.log(openState);
  });
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
    <div class="card !z-[100] !m-0 !bg-transparent">
      <div class="!z-50 mr-2 flex flex-row gap-2 rounded-md bg-cyan-700 p-2">
        {#each locales as loc}
          <button
            type="button"
            onclick={() => {
              setLocale(loc);
            }}
            class={heigthClass}
          >
            <img
              src={flagsList.find((img) => img.name == loc)?.url}
              alt="flag"
              class="{loc == getLocale() ? 'border-2 border-yellow-300' : ''} {heigthClass} box-border"
            />
          </button>
        {/each}
      </div>
    </div>
  {/snippet}
</Popover>
