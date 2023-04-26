import React, { Suspense, useEffect } from "react";

import { useHighs } from "./atoms/highs";
import { eventDataAtom, eventsAtom, hashAtom } from "./atoms/event";
import Items from "./components/item";
import { Shell } from "./components/container";
import { Alert, Anchor, Divider, Drawer, MantineProvider } from "@mantine/core";
import { useAtomValue, useSetAtom } from "jotai";
import {
  apAtom,
  disabledQuestsAtom,
  maximizeAtom,
  questItemsAtom,
  solutionAtom,
} from "./atoms/state";
import { EventData } from "./types";
import { IconAlertCircle } from "@tabler/icons-react";
import { Solver } from "./solver";
import { Results } from "./components/results";
import { useDisclosure } from "@mantine/hooks";

const useSolution = (data: EventData) => {
  const highs = useHighs();
  const state = useAtomValue(questItemsAtom);
  const maximize = useAtomValue(maximizeAtom);
  const setSolution = useSetAtom(solutionAtom);
  const ap = useAtomValue(apAtom);
  const disabled = useAtomValue(disabledQuestsAtom);

  useEffect(() => {
    const pb = new Solver({ data, state, highs, disabledQuests: disabled });
    try {
      const solved = pb.solve({ maximize, ap });
      setSolution(solved);
    } catch (e) {
      setSolution({ status: "Presolve error" });
    }
  }, [ap, data, highs, maximize, setSolution, state, disabled]);
};

const MainApp = ({ data }: { data: EventData }) => {
  const solved = useAtomValue(solutionAtom);
  useSolution(data);

  return (
    <div>
      <Items shop={data.shop} />

      <Divider label="results" labelPosition="center" />

      {solved.status === "Optimal" || solved.status === "Pending" ? null : (
        <Alert
          color="red"
          title="solver error"
          sx={{ margin: 5 }}
          icon={<IconAlertCircle />}
          variant="outline"
        >
          {solved.status}
        </Alert>
      )}

      <Results />
    </div>
  );
};

const FetchData = () => {
  const data = useAtomValue(eventDataAtom);
  if (!data.ok) {
    return (
      <Alert
        title={data.title}
        color="red"
        variant="outline"
        sx={{ margin: 5 }}
      >
        {data.body}
      </Alert>
    );
  }
  return <MainApp data={data} />;
};

const EventsDrawer = ({
  opened,
  close,
}: {
  opened: boolean;
  close: () => void;
}) => {
  const setHash = useSetAtom(hashAtom);
  const events = useAtomValue(eventsAtom);
  if (!events.ok) {
    return <></>;
  }

  const changeEvent = (name: string) => {
    setHash(name);
    close();
  };

  return (
    <Drawer opened={opened} onClose={close} title="events">
      {events.body.map((n, i) => {
        const now = new Date();
        const start = new Date(n.start);
        const end = new Date(n.end);

        return (
          <div key={i}>
            <Anchor
              onClick={() => changeEvent(n.path)}
              sx={{ color: start < now && now < end ? undefined : "grey" }}
            >
              {n.path}
            </Anchor>
          </div>
        );
      })}
    </Drawer>
  );
};

const App = () => {
  const [opened, { open, close }] = useDisclosure();

  return (
    <MantineProvider
      withGlobalStyles
      withNormalizeCSS
      theme={{
        colorScheme: "light",
        headings: {
          fontWeight: 500,
          sizes: {
            h1: { fontSize: "1.25rem" },
            h2: { fontSize: "1rem" },
          },
        },
      }}
    >
      <Shell onClickMenu={open}>
        <Suspense>
          <EventsDrawer opened={opened} close={close} />
        </Suspense>
        <Suspense>
          <FetchData />
        </Suspense>
      </Shell>
    </MantineProvider>
  );
};

export default App;
