import { QuestItemState, Solution } from "./atoms/state";
import { EventData } from "./types";
import {
  GenericHighsSolution,
  Highs,
  HighsMixedIntegerLinearSolutionColumn,
  HighsMixedIntegerLinearSolutionRow,
} from "highs";

export class Solver {
  limit: number;
  highs: Highs;
  data: EventData;
  state: { [name: string]: QuestItemState };
  disabledQuests: string[];

  constructor({
    limit = 100000,
    highs,
    data,
    state,
    disabledQuests,
  }: {
    limit?: number;
    highs: Highs;
    data: EventData;
    state: { [name: string]: QuestItemState };
    disabledQuests: string[];
  }) {
    this.limit = limit;
    this.highs = highs;
    this.data = data;
    this.state = state;
    this.disabledQuests = disabledQuests;
  }

  ap() {
    return this.data.quests
      .map((q, i) => [q.name, `${q.ap}q${i}`] as const)
      .filter(([n, _]) => !this.disabledQuests.includes(n))
      .map(([_, s]) => s)
      .join(" + ");
  }

  stElements() {
    return this.data.shop.map(({ name: _, key }) => {
      const eq = this.data.quests
        .map(({ items, name }, j) => {
          const item = items[key];
          const income = Math.ceil(
            (1 + (this.state[key]?.bonus || 0) / 100) * item
          );

          if (item === undefined) {
            return ["", null];
          } else {
            return [name, `${income}q${j}`] as const;
          }
        })
        .filter(
          ([n, v]) => v !== null && !this.disabledQuests.includes(n || "")
        )
        .map(([_, v]) => v)
        .join(" + ");
      const rawReq = this.state[key]?.required || {};
      const req =
        typeof rawReq === "number"
          ? rawReq
          : Object.keys(rawReq).reduce(
              (a, k) =>
                a + (rawReq[k]?.required || 0) * (rawReq[k]?.price || 0),
              0
            );
      const cur = this.state[key]?.current || 0;
      const lb = Math.min(Math.max(req - cur, 0), this.limit);

      return [key, eq, lb] as const;
    });
  }

  st() {
    return this.stElements()
      .map(([key, eq, lb]) => `  ${key}: ${eq} >= ${lb}`)
      .join("\n");
  }

  ints() {
    return this.data.quests.map((_, i) => `q${i}`).join(" ");
  }

  problem1() {
    return `Minimize
  ap: ${this.ap()}
Subject to
${this.st()}
General
  ${this.ints()}
`;
  }

  getMax(key: string): readonly [string, string, number] | undefined {
    const sts = this.stElements();
    return sts.find(([n]) => n === key);
  }

  problem2(max: readonly [string, string, number], ap: number) {
    const [maxKey, maxEq] = max;

    return `Maximize
  ${maxKey}: ${maxEq}
Subject to
${this.st()}
  ap: ${this.ap()} <= ${Math.min(ap, this.limit)}
General
  ${this.ints()}
    `;
  }

  solve({
    maximize,
    ap,
    debug = false,
  }: {
    maximize: string | null;
    ap: number | null;
    debug?: boolean;
  }): Solution {
    type HSolution = GenericHighsSolution<
      false,
      HighsMixedIntegerLinearSolutionColumn,
      HighsMixedIntegerLinearSolutionRow
    >;

    let solvedAp: number | undefined = undefined;
    let solved: HSolution;
    const max = maximize === null ? undefined : this.getMax(maximize);

    if (debug) console.debug(`maximize === ${maximize}, ap === ${ap}`);
    if (max === undefined) {
      const p1 = this.problem1();
      if (debug) console.debug(p1);
      solved = this.highs.solve(p1) as HSolution;
      if (solved.Status !== "Optimal") return { status: solved.Status };

      solvedAp = Math.round(solved["ObjectiveValue"]);
    } else {
      if (ap === null) {
        const p1 = this.problem1();
        if (debug) console.debug(p1);
        const s1 = this.highs.solve(p1);
        if (s1.Status !== "Optimal") return { status: s1.Status };

        const p2 = this.problem2(max, s1["ObjectiveValue"]);
        if (debug) console.debug(p2);
        solved = this.highs.solve(p2) as HSolution;
        if (solved.Status !== "Optimal") return { status: solved.Status };
      } else {
        const p2 = this.problem2(max, ap);
        if (debug) console.debug(p2);
        solved = this.highs.solve(p2) as HSolution;
        if (solved.Status !== "Optimal") return { status: solved.Status };
      }
    }

    const solvedItems = Object.fromEntries(
      solved.Rows.map((r) => [(r as any).Name, r.Primal])
    );

    const quests = Object.fromEntries(
      this.data.quests.map(({ name, ap }, i) => {
        const items =
          this.data.quests.find((v) => v.name === name)?.items || {};
        const incomes = Object.fromEntries(
          Object.keys(items).map((k) => [
            k,
            Math.ceil((1 + (this.state[k]?.bonus || 0) / 100) * items[k]),
          ])
        );

        return [
          name,
          {
            ap,
            count: Math.round(solved.Columns[`q${i}`]?.Primal || 0),
            items: incomes,
          },
        ];
      })
    );

    solvedItems["ap"] = solvedAp || solvedItems["ap"] || 0;

    return {
      body: {
        items: solvedItems,
        quests,
      },
      status: solved.Status,
    };
  }
}
