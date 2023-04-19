import { atom } from "jotai";
import { FetchedEventData } from "../types";
import { atomWithHash } from "jotai-location";

const PUBLIC_URL = process.env.PUBLIC_URL || "";

export const hashAtom = atomWithHash<string>("event", "", {
  serialize: (v) => v,
  deserialize: (v) => v,
  setHash: "replaceState",
});

export const eventsAtom = atom<
  Promise<
    | { ok: true; body: { path: string; start: string; end: string }[] }
    | { ok: false; title: string; body: string }
  >
>(async (_get) => {
  const url = `${PUBLIC_URL}/events.json`;
  const resp = await fetch(url);

  if (resp.status !== 200) {
    return { title: `${resp.status} ${resp.statusText}`, body: url, ok: false };
  }
  try {
    return { ok: true, body: await resp.json() };
  } catch (e) {
    return { title: `invalid JSON: ${url}`, body: `${e}`, ok: false };
  }
});

export const eventDataAtom = atom<Promise<FetchedEventData>>(async (get) => {
  let event = get(hashAtom);
  if (!event) {
    const evresp = await get(eventsAtom);
    if (evresp.ok) {
      event = evresp.body[0]?.path;
    } else {
      return evresp;
    }
  }

  const url = `${PUBLIC_URL}/data/${event}.json`;
  const resp = await fetch(url);
  if (resp.status !== 200) {
    return { title: `${resp.status} ${resp.statusText}`, body: url, ok: false };
  }
  try {
    const json = await resp.json();
    return { ...json, ok: true };
  } catch (e) {
    return { title: `invalid JSON: ${url}`, body: `${e}`, ok: false };
  }
});

export const eventNameAtom = atom<Promise<string | null>>(async (get) => {
  const ev = await get(eventDataAtom);
  return ev.ok ? ev.name : null;
});
