import { getLocale } from "$lib/paraglide/runtime";

export interface Character {
  id: string;
  name: string;
}

export class Catalog {
  // version: string;
  characters: Character[];

  constructor(obj: any) {
    // this.version = obj.version;
    if (obj == null) {
      this.characters = [];
      return;
    }
    this.characters = obj.data.map((character: any) => {
      if (character.isPlayableCharacter == false) return;
      return {
        id: character.uuid,
        name: character.displayName
      };
    });
  }
}

export function ReplacePlaceholders(template: string, replacements: { [key: string]: string }) {
  return template.replace(/{(\w+)}/g, (match, key) => replacements[key] || match);
}

export function setBorderColor(el: HTMLElement, value: number) {
  if (!el.classList.contains("border-black") && !el.classList.contains("border-correct")) {
    el.classList.remove("border-missplace");
    el.classList.add(value == 0 ? "border-black" : value == 1 ? "border-correct" : "border-missplace"); //"#69b024" : "#ed7014");
  }
}

export function setBgColorAndPath(el: HTMLElement, value: number, uri: string) {
  (el.firstChild as HTMLImageElement).src = uri;
  el.dataset.id = value.toString();
  el.classList.add(value == 0 ? "bg-black" : value == 1 ? "bg-correct" : "bg-missplace");
  el.classList.remove("bg-opacity-15", "bg-white");
}

export function getFlagURL(locale: string | null | undefined): string {
  const myLoc = locale || getLocale();
  const flagName = myLoc.split("-")[0].replace("en", "gb");
  return `https://raw.githubusercontent.com/lipis/flag-icons/main/flags/4x3/${flagName}.svg`;
}
