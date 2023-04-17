import { atom } from "jotai";
import { FetchedEventData } from "../types";
import { atomWithHash } from "jotai-location";

const hashAtom = atomWithHash("event", "不忍の心", {
  serialize: (v) => v,
  deserialize: (v) => v,
  setHash: "replaceState",
});

export const eventDataAtom = atom<Promise<FetchedEventData>>(async (get) => {
  const event = get(hashAtom);
  // TODO: check status code
  const resp = await fetch(`/data/${event}.json`);
  try {
    return { ...(await resp.json()), ok: true };
  } catch (e) {
    return { error: `${e}`, ok: false };
  }
});

export const eventNameAtom = atom<Promise<string | null>>(async (get) => {
  const ev = await get(eventDataAtom);
  return ev.ok ? ev.name : null;
});
