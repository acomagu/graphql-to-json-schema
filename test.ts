import { buildSchema } from 'graphql';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { jsonSchemaFromGraphQlType } from './mod.js';

test('test1', () => {
  const schema = buildSchema(`
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
  `);

  const expected = {
    type: 'object',
    properties: {
      campaign: {
        type: 'string',
        title: 'campaign',
      },
      __typename: {
        const: 'Query',
        title: '__typename',
      },
    },
    required: [],
    $defs: {
      Campaign: {
        type: 'object',
        properties: {
          created_at: {
            title: 'created_at',
          },
          description: {
            type: 'string',
            title: 'description',
          },
          end: {
            title: 'end',
          },
          id: {
            type: 'string',
            title: 'id',
          },
          locale: {
            type: 'string',
            title: 'locale',
          },
          localizations: {
            type: 'array',
            items: {
              oneOf: [
                {
                  type: 'null',
                  title: 'Null',
                },
                {
                  type: 'string',
                  title: 'Campaign_id',
                },
              ],
            },
            title: 'localizations',
          },
          name: {
            type: 'string',
            title: 'name',
          },
          start: {
            title: 'start',
          },
          updated_at: {
            title: 'updated_at',
          },
          __typename: {
            const: 'Campaign',
            title: '__typename',
          },
        },
        required: [
          'created_at',
          'id',
          'updated_at',
        ],
      },
    },
  };

  assert.deepEqual(jsonSchemaFromGraphQlType(schema.getQueryType()!), expected);
});
