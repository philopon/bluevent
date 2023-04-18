import { atom } from "jotai";
import { FetchedEventData } from "../types";
import { atomWithHash } from "jotai-location";

const PUBLIC_URL = process.env.PUBLIC_URL || "";

const hashAtom = atomWithHash<string | null>("event", null, {
  serialize: (v) => JSON.stringify(v),
  deserialize: (v) => JSON.parse(v),
  setHash: "replaceState",
});

export const eventNamesAtom = atom<
  Promise<
    { ok: true; body: string[] } | { ok: false; title: string; body: string }
  >
>(async (get) => {
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
  if (event === null) {
    const evresp = await get(eventNamesAtom);
    if (evresp.ok) {
      event = evresp.body[0];
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
    return { ...(await resp.json()), ok: true };
  } catch (e) {
    return { title: `invalid JSON: ${url}`, body: `${e}`, ok: false };
  }
});

export const eventNameAtom = atom<Promise<string | null>>(async (get) => {
  const ev = await get(eventDataAtom);
  return ev.ok ? ev.name : null;
});
