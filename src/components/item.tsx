import { Checkbox, Collapse, Flex, TextInput } from "@mantine/core";
import React, { useRef } from "react";
import { EventData, Item } from "../types";
import { useAtom, useAtomValue } from "jotai";
import {
  apAtom,
  maximizeAtom,
  questItemAtom,
  solutionItemsAtom,
} from "../atoms/state";
import { CollapseItemCard } from "./card";

const parseCallback = <V,>(setter: (v: V) => void, def: V) => {
  return (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number.parseInt(e.target.value);
    setter(Number.isNaN(v) ? def : (v as V));
  };
};

const QuestItem = ({
  name,
  itemKey,
  keys,
  items,
  appendInputRef,
  onKeyDown,
}: {
  name: string;
  itemKey: string;
  keys: string[];
  items: Item[] | null;
  appendInputRef: (ref: HTMLInputElement) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
}) => {
  const [questItem, setQuestItem] = useAtom(
    questItemAtom({ key: itemKey, keys })
  );
  const [maximize, setMaximize] = useAtom(maximizeAtom);
  const solutionItem = useAtomValue(solutionItemsAtom);

  const setBonus = parseCallback(
    (bonus) => setQuestItem({ ...questItem, bonus }),
    undefined
  );
  const setCurrent = parseCallback(
    (current) => setQuestItem({ ...questItem, current }),
    undefined
  );
  const setRequired = parseCallback(
    (required) => setQuestItem({ ...questItem, required }),
    undefined
  );

  const commonProps = {
    type: "number",
    sx: { width: "100%" },
    enterKeyHint: "next" as const,
    ref: appendInputRef,
    onKeyDown,
  };
  const bonus = questItem?.bonus || "";
  const current = questItem?.current || "";
  const required =
    typeof questItem?.required === "number" ? questItem?.required : "";

  return (
    <CollapseItemCard
      name={name}
      count={solutionItem[itemKey] + (questItem?.current || 0) || undefined}
    >
      <Flex gap={5} align="center" sx={{ marginTop: 10 }}>
        <TextInput
          placeholder="ボーナス"
          rightSection="%"
          {...commonProps}
          value={bonus}
          onChange={setBonus}
        />
        <TextInput
          placeholder="現在量"
          {...commonProps}
          value={current}
          onChange={setCurrent}
        />
        <TextInput
          placeholder="必要量"
          {...commonProps}
          value={required}
          onChange={setRequired}
        />
        <Checkbox
          checked={maximize === itemKey}
          onChange={(event) =>
            setMaximize(event.target.checked ? itemKey : null)
          }
        />
      </Flex>
    </CollapseItemCard>
  );
};

const ItemsAndAP = ({ shop }: { shop: EventData["shop"] }) => {
  const [ap, setAp] = useAtom(apAtom);
  const keys = shop.map((s) => s.key);
  const solutionItem = useAtomValue(solutionItemsAtom);
  const maximize = useAtomValue(maximizeAtom);

  const inputsRef = useRef<HTMLInputElement[]>([]);
  const appendInputRef = (ref: HTMLInputElement) => inputsRef.current.push(ref);
  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing || event.key !== "Enter") return;

    const target: HTMLInputElement = event.target as any;
    const i = inputsRef.current.findIndex((v) => v === target);
    const next = inputsRef.current[i + 1];
    next?.focus();
  };

  return (
    <Flex direction="column" gap="xs" sx={{ padding: 5 }}>
      {shop.map((s, i) => (
        <QuestItem
          key={i}
          name={s.name}
          itemKey={s.key}
          keys={keys}
          items={s.items || null}
          appendInputRef={appendInputRef}
          onKeyDown={onKeyDown}
        />
      ))}
      <CollapseItemCard name="AP" count={solutionItem["ap"]}>
        <Collapse in={maximize !== null} sx={{ marginTop: 10 }}>
          <TextInput
            placeholder="上限"
            ref={appendInputRef}
            onKeyDown={onKeyDown}
            value={ap || ""}
            type="number"
            onChange={parseCallback<number | null>(setAp, null)}
          />
        </Collapse>
      </CollapseItemCard>
    </Flex>
  );
};

export default ItemsAndAP;
