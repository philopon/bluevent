import { useAtomValue, atom } from "jotai";
import highsLoader from "highs";

const highsAtom = atom(async () => {
  return highsLoader({
    locateFile(file) {
      return "https://lovasoa.github.io/highs-js/" + file;
    },
  });
});

export const useHighs = () => useAtomValue(highsAtom);
