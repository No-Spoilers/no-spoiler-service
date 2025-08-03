import {
  DynamoDBClient,
  PutItemCommand,
  DeleteItemCommand,
  GetItemCommand,
  QueryCommand,
} from '@aws-sdk/client-dynamodb';

const TableName = process.env.NO_SPOILERS_TABLE_NAME;
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
  const Item = Object.entries(item).map(([key, value]) => {
    if (typeof value === 'string') {
      const result = {};
      result[key] = { S: value };
      return result;
    }
    if (typeof value === 'number') {
      const result = {};
      result[key] = { N: value.toString() }; // DynamoDB expects numbers as strings
      return result;
    }
    if (typeof value === 'object') {
      if (Array.isArray(value)) {
        const result = {};
        result[key] = { L: value.map(v => ({ S: v })) };
        return result;
      }
      const result = {};
      result[key] = { M: {} };
      Object.entries(value).forEach(([subKey, subValue]) => {
        if (typeof subValue === 'string') {
          result[key].M[subKey] = { S: subValue };
        } else if (typeof subValue === 'number') {
          result[key].M[subKey] = { N: subValue.toString() };
        } else if (typeof subValue === 'object') {
          result[key].M[subKey] = { M: subValue };
        } else {
          result[key].M[subKey] = { S: String(subValue) }; // Fallback for other types
        }
      });
      return result;
    }
    const result = {};
    result[key] = { S: String(value) }; // Fallback for other types
    return result;
  });
  const input = {
    TableName,
    Item,
    ReturnValues
  };
  const command = new PutItemCommand(input);
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
