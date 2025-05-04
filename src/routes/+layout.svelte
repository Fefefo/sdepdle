<script lang="ts">
  import "../app.css";
  import "iconify-icon";

  import { Dialog, Label } from "bits-ui";

  let { children } = $props();
  import { AppBar, Switch } from "@skeletonlabs/skeleton-svelte";
  import { m } from "$lib/paraglide/messages";
  import LangSelector from "$lib/components/LangSelector.svelte";
  import { characters, colorblindEnabled, flagsList, picURI } from "$lib/store";
  import { ReplacePlaceholders } from "$lib";
  import { getLocale, locales, setLocale } from "$lib/paraglide/runtime";
  let innerWidth = $state(0);

  function changeColors() {
    localStorage.setItem("colorblind", $colorblindEnabled + "");
    const correctColor = $colorblindEnabled ? "rgb(59 130 246)" : "rgb(22 163 74)";
    const missplaceColor = $colorblindEnabled ? "rgb(253 224 71)" : "rgb(234 88 12)";
    document.documentElement.style.setProperty("--correct-color", correctColor);
    document.documentElement.style.setProperty("--missplace-color", missplaceColor);
  }

  let openSettingsModal = $state(false);
  let openInfoModal = $state(false);
  let openLang = $state(false);
  $effect(() => {
    if (openLang && !openSettingsModal) {
      openLang = false;
    }
  });
</script>

<svelte:window bind:innerWidth />

<Dialog.Root bind:open={openSettingsModal}>
  <Dialog.Portal>
    <Dialog.Overlay class="fixed inset-0 z-40 bg-black/80" />
    <Dialog.Content
      class="motion-preset-fade-md bg-tertiary-500 fixed top-[50%] left-[50%] z-40 flex w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] flex-col items-center gap-4 rounded-md p-7 outline-hidden sm:max-w-lg md:w-full"
    >
      <Dialog.Title class="flex w-full items-center justify-center text-xl font-bold tracking-tight">
        {m.settingsTitle()}
      </Dialog.Title>
      <div class="flex w-full flex-col items-center gap-4 p-12">
        {#if openLang}
          <div class="flex flex-col gap-2">
            <Label.Root class="text-md text-center font-bold">{m.language()}</Label.Root>
            <div class="flex flex-wrap justify-center gap-2">
              {#each locales as loc}
                <button
                  type="button"
                  onclick={() => {
                    setLocale(loc);
                    openLang = false;
                  }}
                  class="h-8"
                >
                  <img
                    src={flagsList.find((img) => img.name == loc)?.url}
                    alt="flag"
                    class="{loc == getLocale() ? 'border-2 border-yellow-300' : ''} box-border h-8"
                  />
                </button>
              {/each}
            </div>
            <Label.Root class="text-center text-sm text-[#ccc]">{m.languageDisclaimer()}</Label.Root>
          </div>
        {:else}
          <div class="flex w-full items-center justify-between gap-4">
            <Label.Root class="text-sm font-semibold">{m.colorblind()}</Label.Root>
            <Switch
              checked={$colorblindEnabled}
              controlInactive="bg-gray-200"
              onCheckedChange={(e) => {
                $colorblindEnabled = e.checked;
                changeColors();
              }}
            ></Switch>
          </div>
          <div class="flex w-full items-center justify-between gap-4 md:hidden">
            <Label.Root class="text-sm font-semibold">{m.language()}</Label.Root>
            <button
              class="btn h-8 items-center justify-center p-0"
              onclick={() => {
                openLang = true;
              }}
            >
              <img alt="flag" src={flagsList.find((img) => img.name == getLocale())?.url} class="h-full w-full" />
            </button>
          </div>
        {/if}
      </div>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>

<Dialog.Root bind:open={openInfoModal}>
  <Dialog.Portal>
    <Dialog.Overlay class="fixed inset-0 z-50 bg-black/80" />
    <Dialog.Content
      class="motion-preset-fade-md bg-tertiary-500 fixed top-[50%] left-[50%] z-50 flex w-full max-w-[calc(100%-1rem)] translate-x-[-50%] translate-y-[-50%] flex-col items-center gap-4 rounded-md p-7 outline-hidden sm:max-w-lg md:w-full"
    >
      <Dialog.Title class="flex w-full items-center justify-center text-xl font-bold tracking-tight">
        {m.infoTitle()}
      </Dialog.Title>
      <hr class="border-secondary-900 w-full !border-t border-solid" />
      <div class="guess-container grid grid-cols-5 grid-rows-1">
        {#each { length: 5 } as _, i}
          <div class={`relative h-10 w-10 border border-black md:h-16 md:w-16 ${i === 1 ? "bg-correct" : "bg-black"}`}>
            <img src={ReplacePlaceholders(picURI, { characterID: $characters![i].id })} alt={$characters![i].name} />
          </div>
        {/each}
      </div>
      <p>
        {m.infoRow1({ character: $characters![1].name })}
      </p>
      <hr class="border-secondary-900 w-full !border-t border-solid" />
      <div class="guess-container grid grid-cols-5 grid-rows-1">
        {#each { length: 5 } as _, i}
          <div class={`relative h-10 w-10 border border-black md:h-16 md:w-16 ${i === 2 ? "bg-missplace" : "bg-black"}`}>
            <img src={ReplacePlaceholders(picURI, { characterID: $characters![i + 5].id })} alt={$characters![i + 5].name} />
          </div>
        {/each}
      </div>
      <hr class="border-secondary-900 w-full !border-t border-solid" />
      <p>
        {m.infoRow2({ character: $characters![7].name })}
      </p>
      <Dialog.Description class="text-sm whitespace-pre-wrap">
        {m.infoIntro()}
      </Dialog.Description>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>

<!-- svelte-ignore a11y_consider_explicit_label -->
<AppBar
  toolbarBase="m-2 md:mx-12 lg:mx-auto md:gap-20 bg-tertiary-800 rounded-md py-1 grid grid-cols-2 md:grid-cols-3"
  background="bg-transparent"
  centerClasses="md:justify-center md:justify-self-center justify-start md:px-8 px-2"
  leadClasses="hidden md:flex h-full px-6"
  trailClasses="h-full flex md:justify-start justify-end md:px-6 px-2 items-center"
>
  {#snippet lead()}
    <div class="relative flex w-full items-center justify-end gap-2">
      <button
        class="flex items-center"
        onclick={() => {
          openSettingsModal = true;
        }}
      >
        <iconify-icon icon="uil:setting" noobserver></iconify-icon>
      </button>

      <button
        class="flex items-center"
        onclick={() => {
          openInfoModal = true;
        }}
      >
        <iconify-icon icon="uil:question-circle" noobeserver></iconify-icon>
      </button>
    </div>
  {/snippet}
  <h1 class="h1">
    <span class="bg-gradient-to-br from-blue-500 to-cyan-300 box-decoration-clone bg-clip-text text-transparent">
      {m.title()}</span
    >
  </h1>
  {#snippet trail()}
    {#if innerWidth > 768}
      <LangSelector heigthClass="h-8"></LangSelector>
    {:else}
      <div class="flex flex-nowrap justify-end gap-2">
        <!-- <LangSelector heigthClass="h-8"></LangSelector> -->
        <button
          class="settings flex items-center justify-center"
          onclick={() => {
            openSettingsModal = true;
          }}
        >
          <iconify-icon icon="uil:setting"></iconify-icon>
        </button>
        <button
          class="info flex items-center justify-center"
          onclick={() => {
            openInfoModal = true;
          }}
        >
          <iconify-icon icon="uil:question-circle"></iconify-icon>
        </button>
      </div>
    {/if}
  {/snippet}
</AppBar>

{@render children()}
