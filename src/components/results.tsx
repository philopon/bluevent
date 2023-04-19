import { useAtom, useAtomValue } from "jotai";
import {
  apAtom,
  disabledQuestsAtom,
  questItemsAtom,
  solutionQuestsAtom,
} from "../atoms/state";
import { Button, Flex, Switch, Text, px } from "@mantine/core";
import { ItemCard } from "./card";
import { eventDataAtom } from "../atoms/event";
import { IconPlayerPlay } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import React, { useState } from "react";
import { InputModal } from "./modal";

export const Results = () => {
  const solutionQuests = useAtomValue(solutionQuestsAtom);
  const [questItems, setQuestItems] = useAtom(questItemsAtom);
  const [disabledQuests, setDisabledQuests] = useAtom(disabledQuestsAtom);
  const [ap, setAp] = useAtom(apAtom);
  const eventData = useAtomValue(eventDataAtom);
  const [selectedQuest, setSelectedQuest] = useState<{
    name: string;
    ap: number;
    items: { [key: string]: number };
  } | null>(null);
  const [opened, { open, close }] = useDisclosure(false);
  if (!eventData.ok) {
    return <></>;
  }

  const toggleDisabledQuests = (q: string) => {
    if (disabledQuests.includes(q)) {
      setDisabledQuests(disabledQuests.filter((p) => q !== p));
    } else {
      setDisabledQuests([...disabledQuests, q]);
    }
  };

  const runEvent = (name: string, diff: number) => {
    if (selectedQuest === null) return;

    const newObj = Object.fromEntries(
      Object.keys(questItems).map((k) => {
        const i = questItems[k];
        const c = i.current;
        const newCurrent =
          (c || 0) + diff * (solutionQuests[name].items[k] || 0);
        if (newCurrent >= 0) {
          return [k, { ...i, current: newCurrent }] as const;
        } else {
          return [k, i] as const;
        }
      })
    );
    setQuestItems(newObj);
    if (ap !== null) {
      setAp(ap - diff * selectedQuest.ap);
    }
  };

  return (
    <Flex gap="xs" sx={{ padding: 5, width: "100%" }} wrap="wrap">
      <InputModal
        opened={opened}
        title={selectedQuest?.name || ""}
        close={close}
        onSubmit={runEvent}
        placeholder="周回数"
      >
        <IconPlayerPlay size={px("1.2rem")} stroke={1.5} />
      </InputModal>
      {eventData.quests.map((q, i) => (
        <ItemCard
          key={i}
          sx={{ maxWidth: "31%", width: "9rem" }}
          header={
            <Flex sx={{ width: "100%" }} align="center">
              <Text truncate>{q.name}</Text>
              <Switch
                checked={!disabledQuests.includes(q.name)}
                onClick={() => toggleDisabledQuests(q.name)}
                sx={{ marginLeft: "auto" }}
              />
            </Flex>
          }
        >
          {
            <Button
              size="xs"
              fullWidth
              variant="outline"
              rightIcon={<IconPlayerPlay size={px("1.2rem")} stroke={1.5} />}
              onClick={() => {
                setSelectedQuest(q);
                open();
              }}
              sx={{ marginTop: 5 }}
              styles={{
                label: {
                  flexGrow: 1,
                  justifyContent: "center",
                },
              }}
            >
              <Text fz="md" weight={500} align="center">
                {solutionQuests[q.name]?.count}
              </Text>
            </Button>
          }
        </ItemCard>
      ))}
    </Flex>
  );
};
