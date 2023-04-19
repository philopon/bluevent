import { WritableAtom, useAtom } from "jotai";
import { useCallback } from "react";

export const useDisclosureAtom = (
  atom: WritableAtom<boolean, boolean[], void>,
  callbacks?: { onOpen?(): void; onClose?(): void }
) => {
  const { onOpen, onClose } = callbacks || {};
  const [opened, setOpened] = useAtom(atom);

  const open = useCallback(() => {
    if (!opened) {
      onOpen?.();
      setOpened(true);
    }
  }, [onOpen, opened, setOpened]);

  const close = useCallback(() => {
    if (opened) {
      onClose?.();
      setOpened(false);
    }
  }, [onClose, opened, setOpened]);

  const toggle = useCallback(() => {
    opened ? close() : open();
  }, [close, open, opened]);

  return [opened, { open, close, toggle }] as const;
};
