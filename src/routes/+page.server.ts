import type { Actions } from "./$types";
import { Catalog, type Character } from "$lib/index";
import { DecryptAES, EncryptAES } from "$lib/server";
import { redis } from "$lib/redis/redis";

const valorantCatalogURI = "https://valorant-api.com/v1/agents";

const charactersPoolSize = 15;
const selectedCharactersPoolSize = 5;

export const actions: Actions = {
  initGame: async () => {
    let catalog: Catalog = new Catalog(null);
    const cached = await redis.get("valorant-characters");
    console.log(cached);
    if (cached) catalog.characters = JSON.parse(cached);
    else {
      const result = await fetch(valorantCatalogURI);
      catalog = new Catalog(await result.json());
      redis.set("valorant-characters", JSON.stringify(catalog.characters), "EX", 7200);
    }

    // catalog.characters = catalog.characters.reduce((acc, current) => {
    //   const x = acc.find((item) => item.name === current.name);
    //   if (!x) {
    //     acc.push(current);
    //   }
    //   return acc;
    // }, [] as Character[]);

    let characters = catalog.characters.sort(() => Math.random() - 0.5).slice(0, charactersPoolSize);
    const selectedCharacters = characters.slice(0, selectedCharactersPoolSize);
    const solution: string[] = selectedCharacters.map((el) => {
      return el.id;
    });
    const encryptedSolution = EncryptAES(JSON.stringify(solution));
    characters = characters.sort(() => Math.random() - 0.5);
    return { characters, solution: encryptedSolution.ciphertextBase64 };
  },

  validateAnswer: async (event) => {
    const body: { solution: string; answer: string[] } = await event.request.json();
    const answer = body.answer;
    const solutionEncRaw = body.solution;
    const solutionDecRaw = DecryptAES(solutionEncRaw);
    const solution: string[] = JSON.parse(solutionDecRaw);
    const validation: number[] = [];
    answer.forEach((el, i) => {
      if (el == solution[i]) validation.push(1);
      else if (solution.includes(el)) validation.push(2);
      else validation.push(0);
    });
    return validation;
  }
};
