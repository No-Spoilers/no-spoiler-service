import AWS from 'aws-sdk';
import createError from 'http-errors';

const dynamodb = new AWS.DynamoDB.DocumentClient();

export default async function dbGetEntryBySeriesIdAndEntryId(seriesId, entryId) {
  try {
    const result = await dynamodb.get({
      TableName: process.env.NO_SPOILERS_TABLE_NAME,
      Key: {
        primary_key: seriesId,
        sort_key: entryId
      }
    }).promise();

    const book = result.Item;

    if (!book) return null;

    book.seriesId = book.primary_key,
    book.entryId = book.sort_key,
    delete book.primary_key,
    delete book.sort_key

    return book;

  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }
}