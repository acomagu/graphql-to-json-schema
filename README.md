# GraphQL Schema to JSON Schema converter

## Installation

```
npm i @acomagu/graphql-to-json-schema
```

## Usage

```typescript
import * as graphql from 'graphql';
import { jsonSchemaFromGraphQlType } from '@acomagu/graphql-to-json-schema';

// Get type object to be converted to JSON Schema.
const graphqlSchema = graphql.buildSchema('...');
const type = graphqlSchema.getType('Query');
if (!graphql.isObjectType(type)) throw new Error('The type is not object type.');

// Convert it.
const jsonSchema = jsonSchemaFromGraphQlType(type);
```
