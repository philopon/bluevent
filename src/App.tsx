import React, { Suspense, useEffect } from "react";

import { useHighs } from "./atoms/highs";
import { eventDataAtom } from "./atoms/event";
import Items from "./components/item";
import { Shell } from "./components/container";
import { Alert, Divider, MantineProvider } from "@mantine/core";
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

const useSolution = (data: EventData) => {
  const highs = useHighs();
  const state = useAtomValue(questItemsAtom);
  const maximize = useAtomValue(maximizeAtom);
  const setSolution = useSetAtom(solutionAtom);
  const ap = useAtomValue(apAtom);
  const disabled = useAtomValue(disabledQuestsAtom);

  useEffect(() => {
    const pb = new Solver({ data, state, highs, disabledQuests: disabled });
    const solved = pb.solve({ maximize, ap });
    setSolution(solved);
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
        title="invalid data"
        color="red"
        variant="outline"
        sx={{ margin: 5 }}
      >
        {data.error}
      </Alert>
    );
  }
  return <MainApp data={data} />;
};

const App = () => {
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
            h2: { fontSize: "1.1rem" },
          },
        },
      }}
    >
      <Shell>
        <Suspense>
          <FetchData />
        </Suspense>
      </Shell>
    </MantineProvider>
  );
};

export default App;
