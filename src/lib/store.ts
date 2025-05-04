import type { Character } from "$lib";
import { writable, type Writable } from "svelte/store";

export const colorblindEnabled = writable(false);
export const characters: Writable<Character[] | null> = writable([]);
export const picURI = "https://media.valorant-api.com/agents/{characterID}/displayicon.png";

const flags = import.meta.glob("$lib/assets/flags/*.svg", {
  eager: true
});

export const flagsList = Object.entries(flags).map(([path, mod]: [string, any]) => ({
  // path,
  url: mod.default,
  name: path.split("/").pop()?.split(".")[0]
}));
