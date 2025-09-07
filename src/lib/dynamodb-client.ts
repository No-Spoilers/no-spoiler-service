import {
  DynamoDBClient,
  PutItemCommand,
  DeleteItemCommand,
  GetItemCommand,
  QueryCommand,
  UpdateItemCommand,
  TransactWriteItemsCommand,
  AttributeValue,
  QueryCommandInput,
  UpdateItemCommandInput,
  TransactWriteItem,
  ReturnValue,
} from '@aws-sdk/client-dynamodb';

const TableName = process.env.NO_SPOILERS_TABLE_NAME || 'NoSpoilersTable-dev';
const ReturnValues: ReturnValue = 'ALL_OLD';
const dynamoClientConfig = { region: 'us-east-1' };

const client = new DynamoDBClient(dynamoClientConfig);

export async function getDbItem(
  primary_key: AttributeValue,
  sort_key: AttributeValue,
): Promise<Record<string, AttributeValue> | undefined> {
  const params = {
    TableName,
    Key: {
      primary_key,
      sort_key,
    },
  };
  const command = new GetItemCommand(params);

  const result = await client.send(command);

  return result.Item;
}

export async function searchDbItems(
  params: Partial<QueryCommandInput>,
): Promise<Record<string, AttributeValue>[] | Error> {
  try {
    const command = new QueryCommand({
      TableName,
      ...params,
    });

    const result = await client.send(command);

    return result.Items || [];
  } catch (error) {
    console.error('Error searching DB items:', error);
    return error as Error;
  }
}

export function putDbItem(item: Record<string, unknown>): Promise<unknown> {
  const Item: Record<string, AttributeValue> = {};

  Object.entries(item).forEach(([key, value]) => {
    if (typeof value === 'string') {
      Item[key] = { S: value };
    } else if (typeof value === 'number') {
      Item[key] = { N: value.toString() }; // DynamoDB expects numbers as strings
    } else if (typeof value === 'object') {
      if (Array.isArray(value)) {
        Item[key] = { L: value.map((v) => ({ S: String(v) })) };
      } else if (value === null) {
        Item[key] = { NULL: true };
      } else if (value !== undefined) {
        const nestedMap: Record<string, AttributeValue> = {};
        Object.entries(value as Record<string, unknown>).forEach(
          ([subKey, subValue]) => {
            if (typeof subValue === 'string') {
              nestedMap[subKey] = { S: subValue };
            } else if (typeof subValue === 'number') {
              nestedMap[subKey] = { N: subValue.toString() };
            } else if (typeof subValue === 'object' && subValue !== null) {
              nestedMap[subKey] = {
                M: subValue as Record<string, AttributeValue>,
              };
            } else {
              nestedMap[subKey] = { S: String(subValue) }; // Fallback for other types
            }
          },
        );
        Item[key] = { M: nestedMap };
      }
    } else {
      Item[key] = { S: String(value) }; // Fallback for other types
    }
  });

  const input = {
    TableName,
    Item,
    ReturnValues,
  };
  const command = new PutItemCommand(input);
  return client.send(command);
}

export async function updateDbItem(
  item: UpdateItemCommandInput,
): Promise<Record<string, AttributeValue> | undefined> {
  const input = {
    ReturnValues: 'ALL_NEW' as ReturnValue,
    ...item,
  };

  const command = new UpdateItemCommand(input);

  const { Attributes } = await client.send(command);

  return Attributes;
}

export function updateMultipleDbItems(
  items: Partial<UpdateItemCommandInput>[],
): Promise<unknown> {
  const input = {
    TransactItems: items.map((item) => {
      return {
        Update: {
          TableName,
          ...item,
        },
      } as TransactWriteItem;
    }),
  };

  const command = new TransactWriteItemsCommand(input);

  return client.send(command);
}

export function deleteDbItem(
  primary_key: AttributeValue,
  sort_key: AttributeValue,
): Promise<unknown> {
  const params = {
    TableName,
    Key: {
      primary_key,
      sort_key,
    },
    ConditionExpression: 'attribute_exists(sort_key)',
    ReturnValues: 'ALL_OLD' as ReturnValue,
  };
  const command = new DeleteItemCommand(params);
  return client.send(command);
}
