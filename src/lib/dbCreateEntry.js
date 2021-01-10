import AWS from 'aws-sdk';
import generateId from './base64id';

const dynamodb = new AWS.DynamoDB.DocumentClient();

export default async function dbCreateEntry(text, seriesId) {
  const now = new Date();

  const entry = {
    primary_key: seriesId,
    sort_key: `ENTRY~${generateId(10)}`,
    text,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString()
  }

  const params = {
    TableName: process.env.NO_SPOILERS_TABLE_NAME,
    Item: entry
  };

  await dynamodb.put(params).promise();

  return entry;
}