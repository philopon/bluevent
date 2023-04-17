import { atomFamily, atomWithStorage } from "jotai/utils";
import deepEqual from "fast-deep-equal";
import { atom } from "jotai";
import { HighsModelStatus } from "highs";

export type QuestItemState = {
  bonus?: number;
  current?: number;
  required?: number | { [item: string]: number };
};

export const apAtom = atomWithStorage<number | null>("ap", null);
export const maximizeAtom = atomWithStorage<string | null>("maximize", null);

export const questItemsAtom = atomWithStorage<{
  [name: string]: QuestItemState;
}>("event", {});

export const questItemAtom = atomFamily(
  ({ key, keys }: { key: string; keys?: string[] }) =>
    atom(
      (get) => {
        const v = get(questItemsAtom);
        return v[key];
      },
      (get, set, value: QuestItemState) => {
        const v = get(questItemsAtom);
        const oldObj =
          keys === undefined
            ? v
            : Object.fromEntries(
                keys.map((k) => [k, v[k]]).filter(([_, v]) => v !== undefined)
              );

        set(questItemsAtom, { ...oldObj, [key]: value });
      }
    ),
  deepEqual
);

export type QuestSolution = {
  count: number;
  ap: number;
  items: { [key: string]: number };
};

type SolutionBody = {
  quests: { [key: string]: QuestSolution };
  items: { [key: string]: number };
};

export type Solution =
  | { status: "Optimal"; body: SolutionBody }
  | { status: Exclude<HighsModelStatus, "Optimal"> | "Pending" };

export const solutionAtom = atom<Solution>({
  status: "Pending",
});

export const solutionItemsAtom = atom<{ [key: string]: number }>((get) => {
  const s = get(solutionAtom);
  return s.status === "Optimal" ? s.body.items : {};
});

export const solutionQuestsAtom = atom<{ [key: string]: QuestSolution }>(
  (get) => {
    const s = get(solutionAtom);
    return s.status === "Optimal" ? s.body.quests : {};
  }
);

export const disabledQuestsAtom = atomWithStorage<string[]>("disabled", []);
