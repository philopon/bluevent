import { Button, Modal, TextInput } from "@mantine/core";
import { useRef } from "react";

export const InputModal = ({
  opened,
  title,
  close,
  onSubmit,
  placeholder,
  children,
}: {
  opened: boolean;
  title: string;
  onSubmit: (title: string, count: number) => void;
  close: () => void;
  placeholder?: string;
  children: JSX.Element;
}) => {
  const ref = useRef<HTMLInputElement>(null);

  return (
    <Modal opened={opened} onClose={close} centered title={title}>
      <form
        onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
          e.preventDefault();
          const v = ref.current?.value;
          onSubmit(title, v ? Number.parseInt(v) : 0);
          close();
        }}
      >
        <Button.Group>
          <TextInput
            data-autofocus
            type="number"
            styles={{
              input: { borderTopRightRadius: 0, borderBottomRightRadius: 0 },
            }}
            placeholder={placeholder}
            sx={{ width: "100%" }}
            ref={ref}
          />
          <Button
            type="submit"
            sx={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
          >
            {children}
          </Button>
        </Button.Group>
      </form>
    </Modal>
  );
};
