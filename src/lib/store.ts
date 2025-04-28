import type { Character } from "$lib";
import { writable, type Writable } from "svelte/store";

export const colorblindEnabled = writable(false);
export const characters: Writable<Character[] | null> = writable([]);
export const picURI = "https://media.valorant-api.com/agents/{characterID}/displayicon.png";
