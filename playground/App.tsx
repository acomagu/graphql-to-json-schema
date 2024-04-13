import { jsonSchemaFromGraphQlType } from "@acomagu/graphql-to-json-schema";
import { CodeHighlight } from '@mantine/code-highlight';
import '@mantine/code-highlight/styles.css';
import {
  ActionIcon,
  AppShell,
  Code,
  Divider,
  Flex,
  Group,
  Input,
  ScrollArea,
  Select,
  Stack,
  Textarea,
  Title,
  useComputedColorScheme,
  useMantineColorScheme
} from '@mantine/core';
import '@mantine/core/styles.css';
import { IconBrandGithub, IconMoon, IconSun } from '@tabler/icons-react';
import * as graphql from 'graphql';
import { useState } from "react";

const sampleGqlSchema = `
type Query {
  campaign: Campaign
}

type Campaign {
  created_at: DateTime!
  description: String
  end: DateTime
  id: ID!
  locale: String
  localizations(
    sort: String
    limit: Int
    start: Int
    where: JSON
  ): [Campaign]
  name: String
  start: DateTime
  updated_at: DateTime!
}

scalar DateTime
scalar JSON
`.trim();

function TypeNameSelect(props: {
  gqlSchemaInput: string;
  value: string | undefined;
  onChange: (v: string | undefined) => void;
}) {
  let schema: graphql.GraphQLSchema;
  try {
    schema = graphql.buildSchema(props.gqlSchemaInput);
  } catch (e) {
    return;
  }
  const types = Object.values(schema.getTypeMap());
  const objectTypes = types.filter(t => graphql.isObjectType(t));
  const typeNameCandidates = objectTypes.map(t => t.name).filter(name => !name.startsWith('__'));
  return <Select label="Converted Type" data={typeNameCandidates} value={props.value ?? null} onChange={v => props.onChange(v ?? undefined)} />;
}

function Playground() {
  const [gqlSchemaStr, setGqlSchemaStr] = useState<string>(sampleGqlSchema);
  const [typeName, setTypeName] = useState<string | undefined>('Query');

  return <Flex h="100%">
    <Stack h="100%" flex={1}>
      <Textarea
        flex={1}
        label="GraphQL Schema"
        placeholder="Input complete GraphQL Schema"
        spellCheck={false}
        styles={{
          root: {
            flexDirection: 'column',
            display: 'flex',
          },
          wrapper: {
            flex: 1,
          },
          input: {
            height: '100%',
          },
        }}
        value={gqlSchemaStr}
        onChange={ev => setGqlSchemaStr(ev.target.value)}
      ></Textarea>
      <TypeNameSelect gqlSchemaInput={gqlSchemaStr} value={typeName} onChange={setTypeName} />
    </Stack>
    <Divider orientation="vertical" ml="lg" mr="lg" />
    <ScrollArea flex={1}>
      <Result gqlSchemaInput={gqlSchemaStr} convertedTypeName={typeName} />
    </ScrollArea>
  </Flex>;
}

function Result(props: { gqlSchemaInput: string, convertedTypeName: string | undefined }) {
  let gqlSchema: graphql.GraphQLSchema;
  try {
    gqlSchema = graphql.buildSchema(props.gqlSchemaInput);
  } catch (e) {
    const error = (e as Error).message;
    return <Code block c="var(--mantine-color-red-9)">
      {error}
    </Code>;
  }
  if (!props.convertedTypeName) return <>Please select type name.</>;

  const type = gqlSchema.getType(props.convertedTypeName);
  if (!graphql.isObjectType(type)) return <>This type is not Object type.</>;

  const jsonSchema = jsonSchemaFromGraphQlType(type);

  return <Input.Wrapper label="JSON Schema">
    <CodeHighlight code={JSON.stringify(jsonSchema, null, 1)} language="json" withCopyButton={false} />
  </Input.Wrapper>;
}

function ColorSchemeToggleSwitch() {
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
  const Icon = computedColorScheme === 'light' ? IconMoon : IconSun;

  return (
    <ActionIcon
      onClick={() => setColorScheme(computedColorScheme === 'light' ? 'dark' : 'light')}
      variant="default"
      size="lg"
      aria-label="Toggle color scheme"
    >
      <Icon />
    </ActionIcon>
  );
}

export function App() {
  return <AppShell
    header={{ height: 60 }}
    padding="lg"
  >
    <AppShell.Header ps="lg" pe="lg">
      <Group justify="space-between">
        <Title order={1} lh="60px" fw="normal">GraphQL to JSON Schema Playground</Title>
        <Group>
          <ActionIcon
            component="a"
            href="https://github.com/acomagu/graphql-to-json-schema"
            variant="default"
            size="lg"
            aria-label="GitHub Link"
          >
            <IconBrandGithub />
          </ActionIcon>
          <ColorSchemeToggleSwitch />
        </Group>
      </Group>
    </AppShell.Header>
    <AppShell.Main h="1px">{/* https://stackoverflow.com/a/21836870/8182174 */}
      <Playground />
    </AppShell.Main>
  </AppShell>;
}
