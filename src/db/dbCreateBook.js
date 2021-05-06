import AWS from 'aws-sdk';
import generateId from '../lib/base64id';

const dynamodb = new AWS.DynamoDB.DocumentClient();

export default async function dbCreateBook({pubDate, seriesId, name, text}, token) {
  const now = new Date();
  const formattedDate = new Date(pubDate).toISOString();

  const book = {
    primary_key: seriesId,
    sort_key: `b${generateId(10)}`,
    name,
    text,
    pubDate: formattedDate,
    createdBy: token.sub,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString()
  }

  const params = {
    TableName: process.env.NO_SPOILERS_TABLE_NAME,
    Item: book
  };

  await dynamodb.put(params).promise();

  book.seriesId = book.primary_key;
  book.bookId = book.sort_key;
  delete book.primary_key;
  delete book.sort_key;

  return book;
}