import {
  Box,
  Button,
  Checkbox,
  Collapse,
  Flex,
  Text,
  TextInput,
  px,
} from "@mantine/core";
import React, { useRef } from "react";
import { EventData, Item } from "../types";
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  apAtom,
  maximizeAtom,
  questItemAtom,
  solutionItemsAtom,
} from "../atoms/state";
import { CollapseItemCard } from "./card";
import { IconMathMax, IconShoppingCart } from "@tabler/icons-react";
import { InputModal } from "./modal";
import { useDisclosureAtom } from "../atoms/util";

const modalOpendAtom = atom(false);
const modalItemAtom = atom({ key: "", item: "" });

const parseCallback = <V,>(setter: (v: V) => void, def: V) => {
  return (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number.parseInt(e.target.value);
    setter(Number.isNaN(v) ? def : (v as V));
  };
};

const ItemListItem = ({
  item,
  keys,
  itemKey,
}: {
  item: Item;
  keys: string[];
  itemKey: string;
}) => {
  const [questItem, setQuestItem] = useAtom(
    questItemAtom({ key: itemKey, keys })
  );
  const [_, { open }] = useDisclosureAtom(modalOpendAtom);
  const setModalItem = useSetAtom(modalItemAtom);
  const rawReq = questItem.required;
  const req = rawReq === undefined || typeof rawReq === "number" ? {} : rawReq;

  const checked = req[item.name] !== undefined;

  const toggleCheck = () => {
    setQuestItem({
      ...questItem,
      required: {
        ...req,
        [item.name]: checked
          ? undefined
          : { price: item.price, required: item.count },
      },
    });
  };

  const openModal = () => {
    setModalItem({ key: itemKey, item: item.name });
    open();
  };

  const stock = req[item.name]?.required;

  return (
    <Flex
      sx={{
        marginTop: 4,
        justifyContent: "space-between",
      }}
      align="center"
    >
      <Checkbox checked={checked} onChange={toggleCheck} />
      <Flex
        sx={{
          width: "calc(100% - 9rem)",
          justifyContent: "start",
        }}
        align="center"
      >
        <Text
          sx={{
            textOverflow: "ellipsis",
            overflow: "hidden",
            whiteSpace: "nowrap",
            cursor: "pointer",
          }}
          onClick={toggleCheck}
        >
          {item.name}
        </Text>
        <Text
          sx={{
            color: "grey",
            fontSize: "0.8rem",
            cursor: "pointer",
          }}
          onClick={toggleCheck}
        >
          @{item.price}
        </Text>
      </Flex>
      <Button
        size="xs"
        variant="outline"
        rightIcon={<IconShoppingCart size={px("1.2rem")} stroke={1.5} />}
        disabled={!checked}
        onClick={openModal}
        sx={{ width: "6.5rem" }}
        styles={{
          label: {
            flexGrow: 1,
            justifyContent: "center",
          },
        }}
      >
        <Text fz="md" weight={500} align="center">
          {stock === undefined ? item.count : stock}
        </Text>
      </Button>
    </Flex>
  );
};

const ItemList = ({
  items,
  keys,
  itemKey,
}: {
  items: Item[];
  keys: string[];
  itemKey: string;
}) => {
  return (
    <Box>
      {items.map((item, i) => (
        <ItemListItem key={i} itemKey={itemKey} keys={keys} item={item} />
      ))}
    </Box>
  );
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
  const req = questItem?.required || 0;
  const required =
    typeof req === "number"
      ? req
      : Object.keys(req).reduce(
          (a, k) => a + (req[k]?.required || 0) * (req[k]?.price || 0),
          0
        );

  return (
    <CollapseItemCard
      name={name}
      count={solutionItem[itemKey] + (questItem?.current || 0) || undefined}
      collapse={
        items ? <ItemList itemKey={itemKey} keys={keys} items={items} /> : null
      }
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
          value={required || ""}
          onChange={setRequired}
        />
        <Checkbox
          checked={maximize === itemKey}
          indeterminate
          icon={({ className }) => (
            <IconMathMax
              className={className}
              color={maximize === itemKey ? "white" : "lightgray"}
            />
          )}
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
  const [opened, { close }] = useDisclosureAtom(modalOpendAtom);
  const modalItem = useAtomValue(modalItemAtom);
  const [questItem, setQuestItem] = useAtom(
    questItemAtom({ key: modalItem.key, keys })
  );

  const inputsRef = useRef<HTMLInputElement[]>([]);
  const appendInputRef = (ref: HTMLInputElement) => inputsRef.current.push(ref);
  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing || event.key !== "Enter") return;

    const target: HTMLInputElement = event.target as any;
    const i = inputsRef.current.findIndex((v) => v === target);
    const next = inputsRef.current[i + 1];
    next?.focus();
  };

  const buy = (_: string, count: number) => {
    const req = questItem.required;
    if (typeof req === "number" || req === undefined) {
      return;
    }
    const item = req[modalItem.item];
    if (item === undefined) {
      return;
    }

    const n = Math.min(count, item.required);

    setQuestItem({
      ...questItem,
      current: (questItem.current || 0) - item.price * n,
      required: {
        ...req,
        [modalItem.item]: {
          price: item.price,
          required: item.required - n,
        },
      },
    });
  };

  return (
    <Flex direction="column" gap="xs" sx={{ padding: 5 }}>
      <InputModal
        opened={opened}
        title={modalItem.item}
        close={close}
        onSubmit={buy}
        placeholder="購入数"
      >
        <IconShoppingCart size={px("1.2rem")} stroke={1.5} />
      </InputModal>

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
