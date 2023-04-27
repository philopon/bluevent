import React, { Suspense } from "react";
import {
  AppShell,
  Header,
  Title,
  Flex,
  ActionIcon,
  Group,
  Anchor,
} from "@mantine/core";
import { IconMenu2 } from "@tabler/icons-react";
import { eventNameAtom } from "../atoms/event";
import { useAtomValue } from "jotai";
import { IconBrandGithub } from "@tabler/icons-react";

const appTitle = "bluevent";

const TitleText = () => {
  const name = useAtomValue(eventNameAtom);

  return <>{`${appTitle} - ${name}`}</>;
};

export const Shell = ({
  children,
  onClickMenu,
}: {
  children: JSX.Element | JSX.Element[];
  onClickMenu?: () => void;
}) => {
  return (
    <AppShell
      padding={0}
      header={
        <Header
          height={56}
          withBorder
          sx={(theme) => ({
            backgroundColor: theme.fn.variant({
              variant: "filled",
              color: theme.primaryColor,
            }).background,
          })}
        >
          <Flex
            align="center"
            direction="row"
            mih="100%"
            gap="md"
            sx={(theme) => ({
              paddingLeft: theme.spacing.md,
              paddingRight: theme.spacing.md,
            })}
          >
            <ActionIcon size="lg" variant="transparent" onClick={onClickMenu}>
              <IconMenu2 color="white" />
            </ActionIcon>
            <Title
              order={1}
              sx={{ lineHeight: 1.6, color: "white", flexGrow: 1 }}
            >
              <Suspense fallback={appTitle}>
                <TitleText />
              </Suspense>
            </Title>
            <Anchor
              sx={{ display: "flex" }}
              href="https://github.com/philopon/bluevent"
            >
              <IconBrandGithub color="white" />
            </Anchor>
          </Flex>
        </Header>
      }
    >
      {children}
    </AppShell>
  );
};
