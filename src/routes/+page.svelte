<script lang="ts">
  import { onMount, tick } from "svelte";

  import { ReplacePlaceholders, setBgColorAndPath, setBorderColor, type Character } from "$lib";
  import { characters as storedCharacters, colorblindEnabled, picURI } from "$lib/store";
  import { m } from "$lib/paraglide/messages.js";
  import type { ActionResult } from "@sveltejs/kit";
  import { deserialize } from "$app/forms";
  import { Dialog } from "bits-ui";

  const boxes: HTMLDivElement[] = $state([]);

  let allCharacters: Character[] = $state([]);
  let done = $state(0); // 0 no, 1 win, 2 lose
  let solution: string;

  let fullRow = false;
  let counter = 0;
  let rowsConfirmed = 0;

  let resultArray: string[][] = $state([]);

  onMount(async () => {
    allCharacters = JSON.parse(localStorage.getItem("characters") || "[]");
    solution = localStorage.getItem("solution") || "";

    const colorblind = localStorage.getItem("colorblind") == "true" ? true : false;
    $colorblindEnabled = colorblind || false;

    if ($colorblindEnabled) {
      document.documentElement.style.setProperty("--correct-color", "rgb(59 130 246)");
      document.documentElement.style.setProperty("--missplace-color", "rgb(253 224 71)");
    }

    if (solution == "" || allCharacters.length == 0) await fetchData();
    storedCharacters.set(allCharacters);

    const answers: string[][] = JSON.parse(localStorage.getItem("answers") || "[]");
    const answers012: number[][] = JSON.parse(localStorage.getItem("answers012") || "[]");

    await tick();

    for (let i = 0; i < answers.length; i++) {
      for (let j = 0; j < answers[i].length; j++) {
        const characterBtn = document.getElementById(`btn-${answers[i][j]}`)!;
        const characterDiv = boxes[counter++];

        setBorderColor(characterBtn, answers012[i][j]);
        setBgColorAndPath(characterDiv, answers012[i][j], ReplacePlaceholders(picURI, { characterID: answers[i][j] }));
      }
      rowsConfirmed++;
    }

    if (answers012.at(-1)?.every((val) => val === 1)) {
      resultArray = calcResult(answers012);
      done = 1;
    } else if (rowsConfirmed == 6) {
      resultArray = calcResult(answers012);
      done = 2;
    }
  });

  async function fetchData() {
    const response = await fetch("?/initGame", {
      method: "POST",
      body: JSON.stringify({ a: 0 })
    });
    const result: ActionResult = deserialize(await response.text());
    if (result.type === "success") {
      const data = result.data as { solution: string; characters: Character[] };

      localStorage.setItem("characters", JSON.stringify(data.characters));
      localStorage.setItem("solution", data.solution);
      localStorage.setItem("answers", "[]");
      localStorage.setItem("answers012", "[]");
      allCharacters = data.characters;
      solution = data.solution;
      done = 0;
    }
  }

  async function fetchAnswer(answer: string[]): Promise<number[]> {
    const response = await fetch("?/validateAnswer", {
      method: "POST",
      body: JSON.stringify({
        solution,
        answer
      })
    });
    const result: ActionResult = deserialize(await response.text());
    if (result.type === "success") {
      return result.data as number[];
    }
    return [];
  }

  function characterClick(event: MouseEvent) {
    const el = <HTMLElement>event.currentTarget;
    insertCharacter(el.dataset.id!);
  }

  function insertCharacter(id: string) {
    if (
      counter >= 30 ||
      fullRow ||
      boxes
        .slice(rowsConfirmed * 5, rowsConfirmed * 5 + 5)
        .map((div) => div.dataset.id)
        .includes(id)
    )
      return;
    (<HTMLImageElement>boxes[counter].firstChild!).src = ReplacePlaceholders(picURI, { characterID: id });
    boxes[counter++].dataset.id = id;
    if (counter % 5 == 0) fullRow = true;
  }

  function removeCharacter() {
    if (counter <= rowsConfirmed * 5) return;
    boxes[--counter].dataset.id = "";
    (<HTMLImageElement>boxes[counter].firstChild!).src = "";

    fullRow = false;
  }

  async function enterRow() {
    if (counter % 5 != 0 || counter / 5 == rowsConfirmed) return;

    const answer: string[] = [];

    for (let i = 0; i < 5; i++) {
      const characterDiv = boxes[rowsConfirmed * 5 + i];
      answer.push(characterDiv.dataset.id!);
    }

    const result = await fetchAnswer(answer);

    const answersToSet: string[][] = JSON.parse(localStorage.getItem("answers") || "[]");
    const answers012ToSet: number[][] = JSON.parse(localStorage.getItem("answers012") || "[]");
    answersToSet.push(answer);
    answers012ToSet.push(result);
    localStorage.setItem("answers", JSON.stringify(answersToSet));
    localStorage.setItem("answers012", JSON.stringify(answers012ToSet));

    for (let i = 0; i < 5; i++) {
      const el = boxes[rowsConfirmed * 5 + i];
      const value = result[i];
      el.classList.add(value == 0 ? "bg-black" : value == 1 ? "bg-correct" : "bg-missplace");
      el.classList.remove("bg-opacity-15", "bg-white");

      const characterBtn = document.getElementById(`btn-${boxes[rowsConfirmed * 5 + i].dataset.id!}`)!;
      setBorderColor(characterBtn, result[i]);
    }
    rowsConfirmed++;

    // WIN
    if (result.every((val) => val === 1)) {
      resultArray = calcResult(answers012ToSet);
      done = 1;
      return;
    }

    // LOSE
    if (counter == 30) {
      resultArray = calcResult(answers012ToSet);
      done = 2;
      return;
    }
    fullRow = false;
  }

  function playAgain() {
    localStorage.setItem("characters", "[]");
    localStorage.setItem("solution", "");
    localStorage.setItem("answers", "[]");
    localStorage.setItem("answers012", "[]");
    location.reload();
  }

  function calcResult(res: number[][]): string[][] {
    const resultArray: string[][] = [];
    for (let row of res) {
      let resultRow: string[] = [];
      for (let el of row) {
        resultRow.push(
          (el as unknown as number)
            .toString()
            .replace("0", "⬛️")
            .replace("1", $colorblindEnabled ? "🟦" : "🟩")
            .replace("2", $colorblindEnabled ? "🟨" : "🟧")
        );
      }
      resultArray.push(resultRow);
    }
    return resultArray;
  }
</script>

<Dialog.Root open={done == 1 || done == 2}>
  <Dialog.Portal>
    <Dialog.Overlay class="fixed inset-0 z-50 bg-black/80" />
    <Dialog.Content
      class="motion-preset-fade-md {done == 1
        ? 'bg-violet-800'
        : 'bg-error-500'}  fixed top-[50%] left-[50%] z-50 flex w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] flex-col items-center gap-6 rounded-md p-12 align-middle outline-hidden sm:max-w-lg md:w-full"
    >
      <Dialog.Title class="flex w-full items-center justify-center text-xl font-bold tracking-tight">
        {done == 1 ? m.winTitle() : m.loseTitle()}
      </Dialog.Title>
      <div>
        {#each resultArray as row}
          {#each row as el}
            {el}
          {/each}
          <br />
        {/each}
      </div>
      <button
        class="btn preset-filled-tertiary-500 btn-lg rounded-md font-bold text-white focus:!outline-none"
        onclick={playAgain}>{m.playAgain()}</button
      >
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>

<div class="container mx-auto flex h-full flex-col items-center justify-center gap-6">
  <div>
    <div class="guess-container grid grid-cols-5 grid-rows-6 border border-black">
      {#each { length: 30 } as _, i}
        <div
          bind:this={boxes[i]}
          id="box_{i}"
          class={`bg-opacity-15 relative h-10 w-10 border border-black bg-white md:h-16 md:w-16`}
        >
          <img src="" alt="" />
        </div>
      {/each}
    </div>
  </div>
  <div class="flex flex-col gap-2">
    {#if allCharacters && allCharacters.length == 15}
      {#each { length: 3 } as _, i}
        <div class="flex flex-nowrap items-center justify-center gap-2">
          {#each allCharacters.slice(5 * i, 5 * (i + 1)) as el}
            <button
              id="btn-{el.id}"
              data-id={el.id}
              data-name={el.name}
              onclick={characterClick}
              class="btn bg-tertiary-800 rounded-md border-4 p-1"
            >
              <img
                src={ReplacePlaceholders(picURI, { characterID: el.id })}
                alt=""
                class="relative h-10 w-10 md:h-16 md:w-16"
              />
            </button>
          {/each}
        </div>
      {/each}
    {/if}
    <div class="flex flex-nowrap items-center justify-center gap-2 pt-2">
      <button class="btn preset-filled-tertiary-500 btn-lg rounded-lg font-bold text-white" onclick={removeCharacter}>
        {m.delete()}
      </button>
      <button class="btn preset-filled-tertiary-500 btn-lg rounded-lg font-bold text-white" onclick={enterRow}>
        {m.enter()}
      </button>
      {#if done}
        <button class="btn preset-filled-tertiary-500 btn-lg rounded-lg font-bold text-white" onclick={playAgain}>
          {m.playAgain()}
        </button>
      {/if}
    </div>
  </div>
  <div class="mb grid grid-cols-3 gap-2 px-2 font-bold">
    <div class="bg-correct flex h-14 items-center justify-center p-2 text-center">{m.correct()}</div>
    <div
      class={`bg-missplace flex h-14 items-center justify-center p-2 text-center ${$colorblindEnabled ? "text-black" : ""}`}
    >
      {m.wrongPosition()}
    </div>
    <div class="flex h-14 items-center justify-center bg-black p-2 text-center">{m.incorrect()}</div>
  </div>
</div>

<!-- <style type="postcss">
</style> -->
