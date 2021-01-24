import AWS from 'aws-sdk';
import generateId from '../lib/base64id';

const dynamodb = new AWS.DynamoDB.DocumentClient();

export default async function dbCreateEntry({seriesId, bookId, name, text}, token) {
  const now = new Date();

  const entry = {
    primary_key: seriesId,
    sort_key: `e${generateId(10)}`,
    bookId,
    name,
    text,
    createdBy: token.sub,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString()
  }

  const params = {
    TableName: process.env.NO_SPOILERS_TABLE_NAME,
    Item: entry
  };

  await dynamodb.put(params).promise();

  entry.seriesId = entry.primary_key;
  entry.entryId = entry.sort_key;
  delete entry.primary_key;
  delete entry.sort_key;

  return entry;
}