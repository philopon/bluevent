import { QuestItemState, Solution } from "./atoms/state";
import { EventData } from "./types";
import {
  GenericHighsSolution,
  Highs,
  HighsMixedIntegerLinearSolutionColumn,
  HighsMixedIntegerLinearSolutionRow,
} from "highs";

export class Solver {
  highs: Highs;
  data: EventData;
  state: { [name: string]: QuestItemState };
  disabledQuests: string[];

  constructor({
    highs,
    data,
    state,
    disabledQuests,
  }: {
    highs: Highs;
    data: EventData;
    state: { [name: string]: QuestItemState };
    disabledQuests: string[];
  }) {
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
    return this.data.shop.map(({ name, key }, i) => {
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
      const req = (this.state[key]?.required || 0) as number;
      const cur = this.state[key]?.current || 0;
      const lb = Math.max(req - cur, 0);

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

  problem2(key: string, ap: number) {
    const sts = this.stElements();
    const max = sts.find(([n]) => n === key);
    if (max === undefined) {
      throw Error(`ProblemSolver.problem2: unknown key: ${key}`);
    }
    const [maxKey, maxEq] = max;

    return `Maximize
  ${maxKey}: ${maxEq}
Subject to
${this.st()}
  ap: ${this.ap()} <= ${ap}
General
  ${this.ints()}
    `;
  }

  solve({
    maximize,
    ap,
  }: {
    maximize: string | null;
    ap: number | null;
  }): Solution {
    type HSolution = GenericHighsSolution<
      false,
      HighsMixedIntegerLinearSolutionColumn,
      HighsMixedIntegerLinearSolutionRow
    >;

    let solvedAp: number | undefined = undefined;
    let solved: HSolution;

    if (maximize === null) {
      solved = this.highs.solve(this.problem1()) as HSolution;
      if (solved.Status !== "Optimal") return { status: solved.Status };

      solvedAp = Math.round(solved["ObjectiveValue"]);
    } else {
      if (ap === null) {
        const s1 = this.highs.solve(this.problem1());
        if (s1.Status !== "Optimal") return { status: s1.Status };

        solved = this.highs.solve(
          this.problem2(maximize, s1["ObjectiveValue"])
        ) as HSolution;
        if (solved.Status !== "Optimal") return { status: solved.Status };
      } else {
        solved = this.highs.solve(this.problem2(maximize, ap)) as HSolution;
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
