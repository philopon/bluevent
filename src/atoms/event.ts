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
  const public_url = process.env.PUBLIC_URL || "";
  const url = `${public_url}/data/${event}.json`;
  const resp = await fetch(url);
  if (resp.status !== 200) {
    return { title: `${resp.status} ${resp.statusText}`, body: url, ok: false };
  }
  try {
    return { ...(await resp.json()), ok: true };
  } catch (e) {
    return { title: "invalid JSON", body: `${e}`, ok: false };
  }
});

export const eventNameAtom = atom<Promise<string | null>>(async (get) => {
  const ev = await get(eventDataAtom);
  return ev.ok ? ev.name : null;
});
