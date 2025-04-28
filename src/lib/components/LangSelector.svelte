<script lang="ts">
  import { getFlagURL } from "$lib";
  import { setLocale, getLocale, locales } from "$lib/paraglide/runtime";
  import { Popover } from "@skeletonlabs/skeleton-svelte";

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
    <img alt="flag" src={getFlagURL(getLocale())} class={heigthClass} />
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
            <img src={getFlagURL(loc)} alt="flag" class={heigthClass} />
          </button>
        {/each}
      </div>
    </div>
  {/snippet}
</Popover>
