import { useAtom, useAtomValue } from "jotai";
import {
  QuestSolution,
  apAtom,
  disabledQuestsAtom,
  questItemsAtom,
  solutionQuestsAtom,
} from "../atoms/state";
import { Button, Flex, Switch, Text } from "@mantine/core";
import { ItemCard } from "./card";
import { eventDataAtom } from "../atoms/event";

export const Results = () => {
  const quests = useAtomValue(solutionQuestsAtom);
  const [questItems, setQuestItems] = useAtom(questItemsAtom);
  const [disabledQuests, setDisabledQuests] = useAtom(disabledQuestsAtom);
  const [ap, setAp] = useAtom(apAtom);
  const eventData = useAtomValue(eventDataAtom);
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

  const commonProps = {
    variant: "outline",
    size: "xs",
  };
  const doEvent = (diff: number, { items, ap: questAp }: QuestSolution) => {
    const newObj = Object.fromEntries(
      Object.keys(questItems).map((k) => {
        const i = questItems[k];
        const c = i.current;
        const newCurrent = (c || 0) - diff * (items[k] || 0);
        if (newCurrent >= 0) {
          return [k, { ...i, current: newCurrent }] as const;
        } else {
          return [k, i] as const;
        }
      })
    );
    setQuestItems(newObj);
    if (ap !== null) {
      setAp(ap + diff * questAp);
    }
  };

  return (
    <Flex gap="xs" sx={{ padding: 5, width: "100%" }} wrap="wrap">
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
            <Button.Group sx={{ paddingTop: 10 }}>
              <Button
                {...commonProps}
                onClick={() => doEvent(-1, quests[q.name])}
              >
                -
              </Button>
              <Text
                inline
                sx={(theme) => ({
                  width: "100%",
                  height: "1.875rem",
                  lineHeight: "1.875rem",
                  borderStyle: "solid",
                  borderWidth: 1,
                  borderColor: theme.fn.variant({
                    color: "blue",
                    variant: commonProps.variant,
                  }).border,
                })}
                align="center"
              >
                {quests[q.name]?.count}
              </Text>
              <Button
                {...commonProps}
                onClick={() => doEvent(1, quests[q.name])}
              >
                +
              </Button>
            </Button.Group>
          }
        </ItemCard>
      ))}
    </Flex>
  );
};
