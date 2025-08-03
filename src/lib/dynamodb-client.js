import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';

const dynamoClientConfig = {};

const client = new DynamoDBClient(dynamoClientConfig);

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
    TableName: process.env.NO_SPOILERS_TABLE_NAME,
    Item,
  };
  const command = new PutItemCommand(input);
  return client.send(command);
}