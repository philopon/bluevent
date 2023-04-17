import {
  ActionIcon,
  ActionIconProps,
  Card,
  Collapse,
  Flex,
  Group,
  Sx,
  Text,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconChevronDown } from "@tabler/icons-react";
import { PolymorphicComponentProps } from "@mantine/utils";

const ChevronIcon = (
  props: PolymorphicComponentProps<"button", ActionIconProps> & {
    opened: boolean;
  }
) => {
  const { opened, ...others } = props;

  return (
    <ActionIcon
      size="xs"
      variant="transparent"
      tabIndex={-1}
      sx={{
        transform: `rotate(${opened ? "180deg" : "0deg"})`,
        transitionProperty: "transform",
        transitionDuration: "100ms",
      }}
      {...others}
    >
      <IconChevronDown />
    </ActionIcon>
  );
};
export const ItemCard = ({
  header,
  children,
  sx,
}: {
  header: string | JSX.Element | JSX.Element[];
  children: JSX.Element | JSX.Element[] | null;
  sx?: Sx | (Sx | undefined)[];
}) => {
  return (
    <Card withBorder padding="xs" sx={sx}>
      <Group sx={{ width: "100%" }} spacing={5} position="apart">
        {header}
      </Group>
      {children}
    </Card>
  );
};

export const CollapseItemCard = ({
  name,
  collapse,
  children,
  count,
  sx,
  width,
}: {
  name: string | JSX.Element | JSX.Element[];
  collapse?: string | JSX.Element | JSX.Element[] | null;
  children: JSX.Element | JSX.Element[] | null;
  count?: number;
  sx?: Sx | (Sx | undefined)[];
  width?: string;
}) => {
  const [opened, { toggle }] = useDisclosure(false);

  return (
    <Card withBorder padding="xs" sx={sx}>
      <Group sx={{ width: "100%" }} spacing={5}>
        <Group sx={{ width: "100%" }} position="apart">
          <Flex gap="xs" align="flex-end" sx={{ width: "100%" }}>
            <Title order={2} onClick={toggle} sx={{ width }}>
              {name}
            </Title>
            <Text fz="sm" color="gray">
              {count}
            </Text>
            {collapse ? (
              <ChevronIcon
                onClick={toggle}
                opened={opened}
                sx={{ marginLeft: "auto" }}
              />
            ) : null}
          </Flex>
        </Group>
        {collapse ? <Collapse in={opened}>{collapse}</Collapse> : null}
      </Group>
      {children}
    </Card>
  );
};
