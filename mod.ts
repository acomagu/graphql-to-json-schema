import {
  type GraphQLField,
  type GraphQLObjectType,
  type GraphQLType,
  isEnumType,
  isListType,
  isNonNullType,
  isObjectType,
  isScalarType,
  isUnionType
} from 'graphql';
import type { JSONSchema7 } from 'json-schema';

export function defsFromGraphQLTypeMap(typeMap: Record<string, GraphQLType>, isCollectionModel: (type: GraphQLType) => boolean = isCollectionModelGraphQLType): JSONSchema7 & { $defs: Record<string, JSONSchema7> } {
  return {
    $defs: Object.fromEntries(Object.entries(typeMap).flatMap(([name, type]) => {
      if (!isObjectType(type)) return [];
      return [[name, visitObjectType(new Set([type]), type, isCollectionModel)]];
    })),
  };
}

export function jsonSchemaFromGraphQlType(type: GraphQLObjectType, isCollectionModel: (type: GraphQLType) => boolean = isCollectionModelGraphQLType): JSONSchema7 {
  const refs = new Set<GraphQLObjectType>([type]);
  const defs = new Map<GraphQLObjectType, JSONSchema7>();
  while (true) {
    const type = [...refs.values()].find(type => ![...defs.keys()].includes(type));
    if (!type) break;

    const schema = visitObjectType(refs, type, isCollectionModel);
    defs.set(type, schema);
  }

  return {
    ...defs.get(type),
    $defs: Object.fromEntries([...defs.entries()]
      .filter(([_type]) => _type !== type)
      .map(([type, def]) => [type.name, def])
    ),
  };
}

function visitObjectType(refs: Set<GraphQLObjectType>, type: GraphQLObjectType, isCollectionModel: (type: GraphQLType) => boolean): JSONSchema7 {
  const properties = Object.fromEntries(Object.entries(type.getFields()).map(([key, field]: [string, GraphQLField<any, any>]) => {
    const type = isNonNullType(field.type) ? field.type.ofType : field.type;
    return [key, { ...visitType(refs, type, isCollectionModel), title: key }];
  }));
  properties.__typename = { const: type.name, title: '__typename' };
  const required = Object.entries(type.getFields()).filter(([, field]: [string, GraphQLField<any, any>]) => {
    return isNonNullType(field.type);
  }).map(([key]) => key);
  return { type: 'object', properties, required };
}

function visitType(refs: Set<GraphQLObjectType>, type: GraphQLType, isCollectionModel: (type: GraphQLType) => boolean): JSONSchema7 {
  if (isObjectType(type)) {
    if (isCollectionModel(type)) {
      refs.add(type);
      return { type: 'string', title: `${type.name}_id` };
    } else { // component
      refs.add(type);
      return { $ref: `#/$defs/${type.name}` };
    }
  }
  if (isUnionType(type)) return {
    oneOf: type.getTypes().map(type => visitType(refs, type, isCollectionModel)),
  };
  if (isScalarType(type)) {
    if (type.name in SCALAR_TO_JSON) return {
      type: SCALAR_TO_JSON[type.name as keyof typeof SCALAR_TO_JSON],
    };
    return {}; // means any
  }
  if (isEnumType(type)) return {
    type: 'string',
    enum: type.getValues().map(value => value.value),
    title: type.name,
  };
  if (isListType(type)) {
    if (isNonNullType(type.ofType)) {
      return {
        type: 'array',
        items: visitType(refs, type.ofType.ofType, isCollectionModel),
      };
    }
    return {
      type: 'array',
      items: {
        oneOf: [
          { type: 'null', title: 'Null' },
          visitType(refs, type.ofType, isCollectionModel),
        ],
      },
    };
  }

  throw new Error(`Unexpected: ${type}`);
}

function isCollectionModelGraphQLType(type: GraphQLType): boolean {
  return isObjectType(type) && 'id' in type.getFields();
}

const SCALAR_TO_JSON = Object.freeze({
  Boolean: 'boolean',
  Float: 'number',
  ID: 'string',
  Int: 'number',
  String: 'string',
});
