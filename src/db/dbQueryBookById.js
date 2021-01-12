import AWS from 'aws-sdk';
import createError from 'http-errors';

const dynamodb = new AWS.DynamoDB.DocumentClient();

export default async function dbQueryBookById(seriesId, bookId) {
  let series;

  try {
    const result = await dynamodb.get({
      TableName: process.env.NO_SPOILERS_TABLE_NAME,
      Key: {
        primary_key: seriesId,
        sort_key: bookId
      }
    }).promise();

    series = result.Item;
  } catch (error) {
      console.error(error);
      throw new createError.InternalServerError(error);
  }

  return series;
}