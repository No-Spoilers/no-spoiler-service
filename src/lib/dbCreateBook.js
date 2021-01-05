import { v4 as uuid } from 'uuid';
import AWS from 'aws-sdk';

const dynamodb = new AWS.DynamoDB.DocumentClient();

export default async function dbCreateBook(name, seriesId) {
  const now = new Date();

  const book = {
    name,
    seriesId,
    id: uuid(),
    createdAt: now.toISOString(),
    updatedAt: now.toISOString()
  }

  const entry = {
    TableName: process.env.BOOK_TABLE_NAME,
    Item: book
  };

  await dynamodb.put(entry).promise();

  return book;
}