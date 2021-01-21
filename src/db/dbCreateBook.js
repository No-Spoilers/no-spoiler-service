import AWS from 'aws-sdk';
import generateId from '../lib/base64id';

const dynamodb = new AWS.DynamoDB.DocumentClient();

export default async function dbCreateBook(seriesId, name, pubDate) {
  const now = new Date();

  const book = {
    primary_key: seriesId,
    sort_key: `b${generateId(10)}`,
    name,
    pubDate,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString()
  }

  const params = {
    TableName: process.env.NO_SPOILERS_TABLE_NAME,
    Item: book
  };

  await dynamodb.put(params).promise();

  return book;
}