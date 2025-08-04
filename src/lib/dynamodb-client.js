import {
  DynamoDBClient,
  PutItemCommand,
  DeleteItemCommand,
  GetItemCommand,
  QueryCommand,
  UpdateItemCommand,
  TransactWriteItemsCommand,
} from '@aws-sdk/client-dynamodb';

const TableName = process.env.NO_SPOILERS_TABLE_NAME || 'NoSpoilersTable-dev';
const ReturnValues = 'ALL_OLD';
const dynamoClientConfig = {};

const client = new DynamoDBClient(dynamoClientConfig);

export async function getDbItem(primary_key, sort_key) {
  const params = {
    TableName,
    Key: {
      primary_key,
      sort_key
    }
  };
  const command = new GetItemCommand(params);

  const result = await client.send(command);

  return result.Item;
}

export async function searchDbItems(params) {
  const command = new QueryCommand({
    TableName,
    ...params
  });

  const result = await client.send(command);

  return result.Items;
}

export async function putDbItem(item) {
  const Item = Object.entries(item).reduce((acc, [key, value]) => {
    if (typeof value === 'string') {
      acc[key] = { S: value };
      return acc;
    }
    if (typeof value === 'number') {
      acc[key] = { N: value.toString() }; // DynamoDB expects numbers as strings
      return acc;
    }
    if (typeof value === 'object') {
      if (Array.isArray(value)) {
        acc[key] = { L: value.map(v => ({ S: v })) };
        return acc;
      }
      acc[key] = { M: {} };
      Object.entries(value).forEach(([subKey, subValue]) => {
        if (typeof subValue === 'string') {
          acc[key].M[subKey] = { S: subValue };
        } else if (typeof subValue === 'number') {
          acc[key].M[subKey] = { N: subValue.toString() };
        } else if (typeof subValue === 'object') {
          acc[key].M[subKey] = { M: subValue };
        } else {
          acc[key].M[subKey] = { S: String(subValue) }; // Fallback for other types
        }
      });
      return acc;
    }
    const result = {};
    result[key] = { S: String(value) }; // Fallback for other types
    return result;
  }, {});
  const input = {
    TableName,
    Item,
    ReturnValues
  };
  const command = new PutItemCommand(input);
  return client.send(command);
}

export async function updateDbItem(item) {
  const input = {
    TableName,
    ReturnValues: 'ALL_NEW',
    ...item
  };

  const command = new UpdateItemCommand(input);

  const { Attributes } = await client.send(command);

  return Attributes;
}

export async function updateMultipleDbItems(items) {
  const input = {
    TransactItems: items.map(item => {
      return {
        Update: {
          TableName,
          ...item,
        }
      };
    })
  };

  const command = new TransactWriteItemsCommand(input);

  return client.send(command);
}

export async function deleteDbItem(primary_key, sort_key) {
  const params = {
    TableName,
    Key: {
      primary_key,
      sort_key
    },
    ConditionExpression: 'attribute_exists(sort_key)',
    ReturnValues: 'ALL_OLD'
  };
  const command = new DeleteItemCommand(params);
  return client.send(command);
}
