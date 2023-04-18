export type Item = { name: string; price: number; count: number };

export type Quest = {
  name: string;
  ap: number;
  items: { [key: string]: number };
};

export type EventData = {
  name: string;
  shop: {
    name: string;
    key: string;
    items?: Item[];
  }[];
  quests: Quest[];
};

export type FetchedEventData =
  | (EventData & { ok: true })
  | { title: string; body: string; ok: false };
