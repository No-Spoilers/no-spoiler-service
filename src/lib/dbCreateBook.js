import AWS from 'aws-sdk';
import generateId from './base64id';

const dynamodb = new AWS.DynamoDB.DocumentClient();

export default async function dbCreateBook(name, seriesId) {
  const now = new Date();

  const book = {
    primary_key: seriesId,
    sort_key: `BOOK~${generateId(10)}`,
    name,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString()
  }

  const entry = {
    TableName: process.env.NO_SPOILERS_TABLE_NAME,
    Item: book
  };

  await dynamodb.put(entry).promise();

  return book;
}